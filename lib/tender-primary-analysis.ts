import {
  TenderActionType,
  TenderFasReviewStatus,
  TenderProcurementStatus,
  TenderPromptConfigKey,
} from "@prisma/client";
import { getPrisma } from "@/lib/prisma";
import {
  evaluateTenderStopRules,
  runTenderAiAnalysis,
  runTenderFasAiAnalysis,
} from "@/lib/tender-analysis";
import { logTenderEvent } from "@/lib/tender-workflow";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function truncateErrorMessage(value: string | null | undefined, limit = 1200) {
  const normalized = String(value ?? "").replace(/\s+/g, " ").trim();
  if (!normalized) return null;
  if (normalized.length <= limit) return normalized;
  return `${normalized.slice(0, limit - 3).trim()}...`;
}

async function withAnalysisRetry<T>(
  taskName: string,
  factory: () => Promise<T>,
  attempts = 3
) {
  let lastError: unknown = null;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await factory();
    } catch (error) {
      lastError = error;
      if (attempt >= attempts) {
        break;
      }

      await delay(attempt * 1500);
    }
  }

  const message =
    lastError instanceof Error ? lastError.message : `Не удалось выполнить ${taskName}`;
  throw new Error(truncateErrorMessage(message, 400) || `Не удалось выполнить ${taskName}`);
}

const PRIMARY_ANALYSIS_TIMEOUT_MS = 5 * 60 * 1000;
const PRIMARY_ANALYSIS_TIMEOUT_TEXT =
  "Первичный анализ занял больше обычного. Система автоматически ставит закупку на повторный углублённый запуск.";

function extractRelevantParagraphs(sourceText: string, patterns: RegExp[], limit = 3) {
  const blocks = sourceText
    .split(/\n{2,}/)
    .map((item) => item.replace(/\s+/g, " ").trim())
    .filter(Boolean);

  const matches = blocks.filter((block) => patterns.some((pattern) => pattern.test(block)));
  return matches.slice(0, limit);
}

function buildPenaltyFallback(sourceText: string) {
  const matches = extractRelevantParagraphs(sourceText, [
    /штраф/i,
    /пен/i,
    /неустой/i,
    /ответственност/i,
    /просрочк/i,
  ]);

  return matches.length > 0 ? matches.join("\n\n") : null;
}

function buildTerminationFallback(sourceText: string) {
  const matches = extractRelevantParagraphs(sourceText, [
    /односторон/i,
    /расторж/i,
    /отказ.*исполн/i,
    /отказ.*догов/i,
  ]);

  return matches.length > 0 ? matches : [];
}

function extractFirstMoneyValue(value: string | null | undefined) {
  const text = String(value ?? "");
  const matches = text.match(/\d[\d\s]{0,30}(?:[.,]\d{1,2})?/g);
  if (!matches || matches.length === 0) return null;

  const candidate = matches
    .map((item) => item.replace(/\s+/g, "").replace(",", ".").trim())
    .find((item) => /^\d+(?:\.\d{1,2})?$/.test(item));

  return candidate ?? null;
}

function normalizeDecimalForDb(value: string | null | undefined) {
  const text = String(value ?? "").trim();
  if (!text) return null;

  const directCandidate = text
    .replace(/[^\d.,-]/g, "")
    .replace(/\s+/g, "")
    .trim();

  const candidate = extractFirstMoneyValue(directCandidate || text);
  if (!candidate) return null;

  const normalized = candidate.replace(/\s+/g, "").replace(",", ".").trim();
  return /^\d+(?:\.\d{1,2})?$/.test(normalized) ? normalized : null;
}

async function updateProcurementAnalysisSafely(
  prisma: ReturnType<typeof getPrisma>,
  procurementId: number,
  data: Parameters<typeof prisma.tenderProcurement.update>[0]["data"]
) {
  try {
    await prisma.tenderProcurement.update({
      where: { id: procurementId },
      data,
    });
    return;
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (!/nmckWithoutVat/i.test(message)) {
      throw error;
    }

    const fallbackData = {
      ...data,
      nmckWithoutVat: undefined,
    };

    await prisma.tenderProcurement.update({
      where: { id: procurementId },
      data: fallbackData,
    });
  }
}

function buildPriceFallbackFromMentions(
  mentions: string[],
  currentWithoutVat: string | null,
  currentWithVat: string | null
) {
  let withoutVat = currentWithoutVat?.trim() || null;
  let withVat = currentWithVat?.trim() || null;
  let note: string | null = null;

  for (const mention of mentions) {
    const normalized = mention.toLowerCase();
    const amount = extractFirstMoneyValue(mention);
    if (!amount) continue;

    if (!withoutVat && /без ндс|ндс не облага/i.test(normalized)) {
      withoutVat = amount;
      note = note ?? mention.trim();
      continue;
    }

    if (!withVat && /с ндс|включая ндс|с учетом ндс/i.test(normalized)) {
      withVat = amount;
      note = note ?? mention.trim();
      continue;
    }

    if (!withVat) {
      withVat = amount;
      note = note ?? mention.trim();
    }
  }

  if (!withoutVat && withVat) {
    const parsedWithVat = Number(withVat);
    if (Number.isFinite(parsedWithVat) && parsedWithVat > 0) {
      withoutVat = (parsedWithVat / 1.22).toFixed(2);
      note = note ?? "Сумма без НДС рассчитана из цены с НДС по ставке 22%.";
    }
  }

  return {
    withoutVat,
    withVat,
    note,
  };
}

function buildSecurityFallback(mentions: string[], keyword: "заявк" | "исполн") {
  const relevant = mentions.find((item) => item.toLowerCase().includes(keyword));
  if (!relevant) return null;
  return relevant.trim();
}

function buildProcurementNumberFallback(sourceText: string) {
  const patterns = [
    /(?:номер\s+закупки|№\s*закупки|извещение\s*№|закупка\s*№)\s*[:\-]?\s*([A-Za-zА-Яа-я0-9\-\/]+)/i,
    /\b№\s*([0-9][0-9\-\/]{2,})\b/i,
  ];

  for (const pattern of patterns) {
    const match = sourceText.match(pattern);
    if (match?.[1]) {
      return match[1].trim();
    }
  }

  return null;
}

export async function runTenderPrimaryAnalysis(input: {
  procurementId: number;
  sourceText: string;
}) {
  const prisma = getPrisma();
  const procurementId = input.procurementId;
  const sourceText = input.sourceText.trim();

  await prisma.tenderProcurement.update({
    where: { id: procurementId },
    data: {
      sourceText,
      aiAnalysisStatus: "running",
      aiAnalysisError: null,
      status: TenderProcurementStatus.ANALYSIS,
    },
  });

  const procurement = await prisma.tenderProcurement.findUnique({
    where: { id: procurementId },
  });

  if (!procurement) {
    throw new Error("Procurement not found");
  }

  const { model, result, dossier } = await withAnalysisRetry("основной AI-анализ", () =>
    runTenderAiAnalysis({
      title: procurement.title,
      customerName: procurement.customerName,
      customerInn: procurement.customerInn,
      procurementNumber: procurement.procurementNumber,
      platform: procurement.platform,
      itemsCount: procurement.itemsCount,
      nmckWithoutVat: procurement.nmckWithoutVat?.toString() ?? null,
      sourceText,
    })
  );

  const fasPromptConfig = await prisma.tenderPromptConfig.findUnique({
    where: { key: TenderPromptConfigKey.FAS_POTENTIAL_COMPLAINT },
  });

  const fasPromptBody =
    fasPromptConfig?.body?.trim() ||
    [
      "Если явных нарушений с высокой вероятностью обоснования не выявлено — прямо укажи это и не выдумывай основания.",
      "Запрещено:",
      "придумывать нарушения при отсутствии прямых оснований;",
      "включать спорные/оценочные доводы без формальной доказуемости;",
      "рассуждать о целесообразности участия или коммерческих рисках;",
      "давать теорию без привязки к конкретному пункту документации.",
    ].join("\n");

  let fasResult:
    | {
        status: "NO_VIOLATION" | "POTENTIAL_COMPLAINT" | "MANUAL_REVIEW";
        finding_title: string;
        finding_basis: string;
        confidence_note: string;
      }
    | null = null;

  try {
    const fasResponse = await withAnalysisRetry("ФАС-аналитика", () =>
      runTenderFasAiAnalysis({
        title: procurement.title,
        customerName: procurement.customerName,
        customerInn: procurement.customerInn,
        procurementNumber: procurement.procurementNumber,
        platform: procurement.platform,
        sourceText,
        promptBody: fasPromptBody,
      })
    );

    fasResult = fasResponse.result;
  } catch (error) {
    fasResult = {
      status: "MANUAL_REVIEW",
      finding_title: "",
      finding_basis: "",
      confidence_note:
        truncateErrorMessage(
          error instanceof Error ? error.message : "Не удалось автоматически проверить ФАС-ветку.",
          300
        ) || "Не удалось автоматически проверить ФАС-ветку.",
    };
  }

  const penaltyFallback = buildPenaltyFallback(sourceText);
  const terminationFallback = buildTerminationFallback(sourceText);
  const priceFallback = buildPriceFallbackFromMentions(
    dossier.nmck_mentions,
    result.nmck_without_vat,
    result.nmck_with_vat
  );
  const bidSecurityFallback = buildSecurityFallback(dossier.security_mentions, "заявк");
  const contractSecurityFallback = buildSecurityFallback(dossier.security_mentions, "исполн");
  const procurementNumberFallback = buildProcurementNumberFallback(sourceText);
  const nmckWithoutVatValue = normalizeDecimalForDb(
    result.nmck_without_vat?.trim() || priceFallback.withoutVat
  );

  await updateProcurementAnalysisSafely(prisma, procurementId, {
      sourceText,
      aiAnalysis: {
        ...result,
        nmck_without_vat: result.nmck_without_vat?.trim() || priceFallback.withoutVat || "",
        nmck_with_vat: result.nmck_with_vat?.trim() || priceFallback.withVat || "",
        price_tax_note: result.price_tax_note?.trim() || priceFallback.note || "",
        bid_security: result.bid_security?.trim() || bidSecurityFallback || "",
        contract_security: result.contract_security?.trim() || contractSecurityFallback || "",
        responsibility_terms:
          result.responsibility_terms?.trim() ||
          result.penalty_terms?.trim() ||
          penaltyFallback ||
          "",
      },
      aiAnalysisStatus: "completed",
      aiAnalysisError: null,
      aiAnalyzedAt: new Date(),
      aiModel: model,
      procurementNumber:
        result.procurement_number?.trim() ||
        procurement.procurementNumber ||
        procurementNumberFallback ||
        null,
      customerName: result.customer_name?.trim() || procurement.customerName || null,
      customerInn: result.customer_inn?.trim() || procurement.customerInn || null,
      platform: result.platform?.trim() || procurement.platform || null,
      itemsCount:
        Number.isFinite(result.items_count) && result.items_count > 0
          ? result.items_count
          : procurement.itemsCount,
      nmckWithoutVat: nmckWithoutVatValue ?? procurement.nmckWithoutVat,
      purchaseType: result.procurement_type?.trim() || procurement.purchaseType || null,
      title:
        procurement.title.startsWith("Закупка по файлам:") &&
        (result.procurement_number?.trim() || result.summary?.trim())
          ? (result.procurement_number?.trim()
              ? `Закупка ${result.procurement_number.trim()}`
              : result.summary.trim().slice(0, 140))
          : procurement.title,
      summary: result.summary || null,
      selectionCriteria: result.selection_criteria || null,
      requiredDocuments: result.required_documents.length
        ? result.required_documents
        : undefined,
      nonstandardRequirements: result.nonstandard_requirements.length
        ? result.nonstandard_requirements
        : undefined,
      deliveryTerms: result.delivery_terms || null,
      paymentTerms: result.payment_terms || null,
      contractTerm: result.contract_term || null,
      penaltyTerms: result.penalty_terms?.trim() || penaltyFallback || null,
      terminationTerms: result.termination_reasons.length
        ? result.termination_reasons
        : terminationFallback.length > 0
          ? terminationFallback
          : undefined,
      regulatoryRequirements:
        [
          result.rrep_rpp_requirements?.trim(),
          result.decree_1875_ban?.trim(),
          result.military_acceptance?.trim(),
        ].filter(Boolean).length > 0
          ? [
              result.rrep_rpp_requirements?.trim(),
              result.decree_1875_ban?.trim(),
              result.military_acceptance?.trim(),
            ].filter(Boolean)
          : undefined,
      requiresCommissioning: /^да\b/i.test(result.requires_commissioning?.trim() || ""),
      stopFactorsSummary: result.stop_factor_findings.length
        ? result.stop_factor_findings.map((item) => `${item.name}: ${item.reason}`).join("\n")
        : "Стоп-факторы в тексте не обнаружены",
  });

  await prisma.tenderFasReview.upsert({
    where: { procurementId },
    update: {
      status: fasResult.status as TenderFasReviewStatus,
      findingTitle:
        fasResult.finding_title ||
        (fasResult.status === "NO_VIOLATION"
          ? "Нарушений для жалобы в ФАС не выявлено"
          : null),
      findingBasis: fasResult.finding_basis || null,
      confidenceNote: fasResult.confidence_note || null,
      promptSnapshot: fasPromptBody,
      lastAnalyzedAt: new Date(),
    },
    create: {
      procurementId,
      status: fasResult.status as TenderFasReviewStatus,
      findingTitle:
        fasResult.finding_title ||
        (fasResult.status === "NO_VIOLATION"
          ? "Нарушений для жалобы в ФАС не выявлено"
          : null),
      findingBasis: fasResult.finding_basis || null,
      confidenceNote: fasResult.confidence_note || null,
      promptSnapshot: fasPromptBody,
      lastAnalyzedAt: new Date(),
    },
  });

  try {
    await evaluateTenderStopRules(procurementId);
  } catch (error) {
    await logTenderEvent({
      procurementId,
      actionType: TenderActionType.NOTE_ADDED,
      title: "Проверка стоп-факторов не завершена",
      description:
        truncateErrorMessage(
          error instanceof Error ? error.message : "Не удалось автоматически проверить стоп-факторы.",
          300
        ) || "Не удалось автоматически проверить стоп-факторы.",
      actorName: "AI",
    });
  }

  await logTenderEvent({
    procurementId,
    actionType: TenderActionType.AI_ANALYZED,
    title: "AI-анализ выполнен",
    description: "Система автоматически разобрала документацию и заполнила карточку закупки.",
    actorName: "AI",
    metadata: {
      model,
      stopFactorFindings: result.stop_factor_findings.length,
      fasStatus: fasResult.status,
    },
  });

  await logTenderEvent({
    procurementId,
    actionType: TenderActionType.NOTE_ADDED,
    title: "ФАС-ветка проверена автоматически",
    description:
      fasResult.status === "POTENTIAL_COMPLAINT"
        ? `AI нашёл потенциальное нарушение: ${fasResult.finding_title || "см. карточку ФАС-ветки"}.`
        : fasResult.status === "MANUAL_REVIEW"
          ? "AI не уверен по ФАС-ветке и отправил её на ручную проверку."
          : "AI не нашёл явных нарушений для жалобы в ФАС.",
    actorName: "AI",
    metadata: {
      model,
      fasStatus: fasResult.status,
    },
  });

  return { model, result, fasResult };
}

export async function executeTenderPrimaryAnalysisJob(input: {
  procurementId: number;
  sourceText: string;
}) {
  const prisma = getPrisma();
  const procurementId = input.procurementId;

  try {
    return await Promise.race([
      runTenderPrimaryAnalysis(input),
      delay(PRIMARY_ANALYSIS_TIMEOUT_MS).then(() => {
        throw new Error(PRIMARY_ANALYSIS_TIMEOUT_TEXT);
      }),
    ]);
  } catch (error) {
    const message = truncateErrorMessage(
      error instanceof Error ? error.message : "Не удалось выполнить первичный AI-анализ"
    );

    const isTimeoutError = /слишком много времени|aborted due to timeout|timeout/i.test(
      message ?? ""
    );
    const nextStatus = isTimeoutError ? "queued" : "failed";
    const nextError = isTimeoutError ? PRIMARY_ANALYSIS_TIMEOUT_TEXT : message;

    try {
      await prisma.tenderProcurement.update({
        where: { id: procurementId },
        data: {
          aiAnalysisStatus: nextStatus,
          aiAnalysisError: nextError,
        },
      });
    } catch (updateError) {
      const updateMessage = updateError instanceof Error ? updateError.message : "";
      if (!/No record was found|P2025/i.test(updateMessage)) {
        throw updateError;
      }
    }

    await logTenderEvent({
      procurementId,
      actionType: TenderActionType.NOTE_ADDED,
      title: isTimeoutError
        ? "Первичный анализ поставлен на повторный запуск"
        : "Первичный анализ не завершён",
      description:
        nextError ||
        (isTimeoutError
          ? PRIMARY_ANALYSIS_TIMEOUT_TEXT
          : "Не удалось выполнить первичный AI-анализ"),
      actorName: "AI",
    });

    throw error;
  }
}

export function enqueueTenderPrimaryAnalysisJob(input: {
  procurementId: number;
  sourceText: string;
}) {
  void executeTenderPrimaryAnalysisJob(input).catch((error) => {
    console.error("[tender-primary-analysis] background job failed", error);
  });
}
