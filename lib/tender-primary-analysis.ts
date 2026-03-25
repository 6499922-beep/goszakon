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

  const { model, result, dossier } = await runTenderAiAnalysis({
    title: procurement.title,
    customerName: procurement.customerName,
    customerInn: procurement.customerInn,
    procurementNumber: procurement.procurementNumber,
    platform: procurement.platform,
    itemsCount: procurement.itemsCount,
    nmckWithoutVat: procurement.nmckWithoutVat?.toString() ?? null,
    sourceText,
  });

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

  const { result: fasResult } = await runTenderFasAiAnalysis({
    title: procurement.title,
    customerName: procurement.customerName,
    customerInn: procurement.customerInn,
    procurementNumber: procurement.procurementNumber,
    platform: procurement.platform,
    sourceText,
    promptBody: fasPromptBody,
  });

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

  await prisma.tenderProcurement.update({
    where: { id: procurementId },
    data: {
      sourceText,
      aiAnalysis: {
        ...result,
        nmck_without_vat: result.nmck_without_vat?.trim() || priceFallback.withoutVat || "",
        nmck_with_vat: result.nmck_with_vat?.trim() || priceFallback.withVat || "",
        price_tax_note: result.price_tax_note?.trim() || priceFallback.note || "",
        bid_security: result.bid_security?.trim() || bidSecurityFallback || "",
        contract_security: result.contract_security?.trim() || contractSecurityFallback || "",
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
      nmckWithoutVat:
        result.nmck_without_vat?.trim() || priceFallback.withoutVat
          ? String(result.nmck_without_vat?.trim() || priceFallback.withoutVat)
              .replace(/\s+/g, "")
              .replace(",", ".")
          : procurement.nmckWithoutVat,
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
    },
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

  await evaluateTenderStopRules(procurementId);

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
