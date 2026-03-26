import {
  Prisma,
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
    /за каждый день/i,
    /убытк/i,
    /санкц/i,
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
  const matches = text.match(
    /-?\d{1,3}(?:[ \u00A0]\d{3})+(?:[.,]\d{1,2})?|-?\d{4,}(?:[.,]\d{1,2})?|-?\d+(?:[.,]\d{2})/g
  );
  if (!matches || matches.length === 0) return null;

  const candidate = matches
    .map((item) => normalizeDecimalForDb(item))
    .find(Boolean);

  return candidate || null;
}

function normalizeDecimalForDb(value: string | null | undefined) {
  const text = String(value ?? "").trim();
  if (!text) return null;

  const compact = text.replace(/[^\d,.\- ]/g, "").replace(/\s+/g, "").trim();
  const sanitized = compact.replace(/[.,]+$/g, "");
  if (!sanitized) return null;

  const decimalMatch = sanitized.match(/([.,])(\d{1,2})$/);
  let normalized = sanitized;

  if (decimalMatch && decimalMatch.index != null) {
    const decimalIndex = decimalMatch.index;
    const integerPart = sanitized.slice(0, decimalIndex).replace(/[.,]/g, "");
    const fractionalPart = decimalMatch[2].replace(/[^\d]/g, "");
    normalized = fractionalPart.length > 0 ? `${integerPart}.${fractionalPart}` : integerPart;
  } else {
    normalized = sanitized.replace(/[.,]/g, "");
  }

  normalized = normalized.replace(/(?!^)-/g, "");
  return /^-?\d+(?:\.\d{1,2})?$/.test(normalized) ? normalized : null;
}

function extractMoneyCandidates(value: string | null | undefined) {
  const text = String(value ?? "");
  if (!text) return [];

  const matches =
    text.match(
      /-?\d{1,3}(?:[ \u00A0]\d{3})+(?:[.,]\d{1,2})?|-?\d{4,}(?:[.,]\d{1,2})?|-?\d+(?:[.,]\d{2})/g
    ) ?? [];

  const unique = new Map<string, number>();
  for (const match of matches) {
    const normalized = normalizeDecimalForDb(match);
    if (!normalized) continue;
    const numeric = Number(normalized);
    if (!Number.isFinite(numeric) || numeric <= 0) continue;
    unique.set(normalized, numeric);
  }

  return [...unique.entries()]
    .sort((left, right) => right[1] - left[1])
    .map(([normalized]) => normalized);
}

function choosePreferablePriceValue(aiValue: string | null | undefined, fallbackValue: string | null) {
  const normalizedAi = normalizeDecimalForDb(aiValue);
  const normalizedFallback = normalizeDecimalForDb(fallbackValue);

  if (!normalizedAi) return normalizedFallback;
  if (!normalizedFallback) return normalizedAi;

  const aiNumeric = Number(normalizedAi);
  const fallbackNumeric = Number(normalizedFallback);
  if (!Number.isFinite(aiNumeric)) return normalizedFallback;
  if (!Number.isFinite(fallbackNumeric)) return normalizedAi;

  if (aiNumeric < 100 && fallbackNumeric > aiNumeric * 10) {
    return normalizedFallback;
  }

  if (aiNumeric < 1000 && fallbackNumeric > aiNumeric * 100) {
    return normalizedFallback;
  }

  return normalizedAi;
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
      nmckWithoutVat: null,
    };

    await prisma.tenderProcurement.update({
      where: { id: procurementId },
      data: fallbackData,
    });
  }
}

async function persistQuickFallbackCompletion(input: {
  prisma: ReturnType<typeof getPrisma>;
  procurementId: number;
  sourceText: string;
}) {
  const procurement = await input.prisma.tenderProcurement.findUnique({
    where: { id: input.procurementId },
  });

  if (!procurement) {
    return;
  }

  const fallback = buildQuickTenderFallback({
    procurement: {
      procurementNumber: procurement.procurementNumber,
      customerName: procurement.customerName,
      customerInn: procurement.customerInn,
      platform: procurement.platform,
      itemsCount: procurement.itemsCount,
      nmckWithoutVat: procurement.nmckWithoutVat,
      title: procurement.title,
    },
    sourceText: input.sourceText,
  });

  const nmckWithoutVatValue = normalizeDecimalForDb(
    fallback.result.nmck_without_vat?.trim() || null
  );

  await updateProcurementAnalysisSafely(input.prisma, input.procurementId, {
    sourceText: input.sourceText,
    aiAnalysis: fallback.result,
    aiAnalysisStatus: "completed",
    aiAnalysisError: null,
    aiAnalyzedAt: new Date(),
    aiModel: "quick-fallback",
    procurementNumber:
      fallback.result.procurement_number?.trim() || procurement.procurementNumber || null,
    customerName: fallback.result.customer_name?.trim() || procurement.customerName || null,
    customerInn: fallback.result.customer_inn?.trim() || procurement.customerInn || null,
    platform: fallback.result.platform?.trim() || procurement.platform || null,
    itemsCount:
      Number.isFinite(fallback.result.items_count) && fallback.result.items_count > 0
        ? fallback.result.items_count
        : procurement.itemsCount,
    nmckWithoutVat: nmckWithoutVatValue ?? procurement.nmckWithoutVat,
    purchaseType: fallback.result.procurement_type?.trim() || procurement.purchaseType || null,
    title:
      procurement.title.startsWith("Закупка по файлам:") &&
      (fallback.result.procurement_number?.trim() || fallback.result.summary?.trim())
        ? (fallback.result.procurement_number?.trim()
            ? `Закупка ${fallback.result.procurement_number.trim()}`
            : fallback.result.summary.trim().slice(0, 140))
        : procurement.title,
    summary: fallback.result.summary || null,
    selectionCriteria: fallback.result.selection_criteria || null,
    deliveryTerms: fallback.result.delivery_terms || null,
    paymentTerms: fallback.result.payment_terms || null,
    contractTerm: fallback.result.contract_term || null,
    penaltyTerms: fallback.result.penalty_terms || null,
    terminationTerms: fallback.result.termination_reasons.length
      ? fallback.result.termination_reasons
      : undefined,
    stopFactorsSummary: "Быстрый анализ завершён без явных стоп-факторов",
  });

  await logTenderEvent({
    procurementId: input.procurementId,
    actionType: TenderActionType.NOTE_ADDED,
    title: "Сохранён быстрый анализ",
    description:
      "Глубокий проход занял слишком много времени. Система автоматически сохранила быстрый результат по ключевым данным без перевода на ручную проверку.",
    actorName: "AI",
  });
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
    const amounts = extractMoneyCandidates(mention);
    if (amounts.length === 0) continue;
    const primaryAmount = amounts[0] ?? null;
    const secondaryAmount = amounts[1] ?? null;
    if (!primaryAmount) continue;

    if (!withoutVat && /без ндс|ндс не облага/i.test(normalized)) {
      withoutVat = primaryAmount;
      note = note ?? mention.trim();
      if (!withVat && secondaryAmount && /с ндс|включая ндс|с учетом ндс/i.test(normalized)) {
        withVat = secondaryAmount;
      }
      continue;
    }

    if (!withVat && /с ндс|включая ндс|с учетом ндс/i.test(normalized)) {
      withVat = primaryAmount;
      note = note ?? mention.trim();
      if (!withoutVat && secondaryAmount && /без ндс|ндс не облага/i.test(normalized)) {
        withoutVat = secondaryAmount;
      }
      continue;
    }

    if (
      /нмцк|нмцд|нмц|начальн.*максимальн.*цен|начальн.*цен.*договор|цена договора|цена лота|итого|всего/i.test(
        normalized
      )
    ) {
      if (!withVat) {
        withVat = primaryAmount;
        note = note ?? mention.trim();
      }
      continue;
    }

    if (!withVat) {
      withVat = primaryAmount;
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

function buildCustomerInnFallback(sourceText: string) {
  const normalizedText = sourceText.replace(/\u00A0/g, " ");
  const candidateScores = new Map<string, number>();

  const addCandidate = (value: string | null | undefined, score: number) => {
    const inn = String(value ?? "").replace(/\D+/g, "");
    if (!/^\d{10}(\d{2})?$/.test(inn)) return;
    candidateScores.set(inn, Math.max(candidateScores.get(inn) ?? 0, score));
  };

  const contextualPatterns: Array<[RegExp, number]> = [
    [/(?:заказчик|сведения о заказчике|информация о заказчике)[\s\S]{0,160}?\bинн\b[^\d]{0,12}(\d{10,12})/gi, 100],
    [/(?:организатор(?: закупки)?|покупатель)[\s\S]{0,160}?\bинн\b[^\d]{0,12}(\d{10,12})/gi, 90],
    [/\bинн\b[^\d]{0,12}(\d{10,12})[\s\S]{0,80}?(?:заказчик|организатор(?: закупки)?|покупатель)/gi, 85],
  ];

  for (const [pattern, score] of contextualPatterns) {
    for (const match of normalizedText.matchAll(pattern)) {
      addCandidate(match[1], score);
    }
  }

  const lines = normalizedText
    .split(/\n+/)
    .map((item) => item.replace(/\s+/g, " ").trim())
    .filter(Boolean);

  for (const line of lines) {
    if (!/\bинн\b/i.test(line)) continue;
    const innMatch = line.match(/\bинн\b[^\d]{0,12}(\d{10,12})/i);
    if (!innMatch?.[1]) continue;

    if (/(заказчик|организатор(?: закупки)?|покупатель)/i.test(line)) {
      addCandidate(innMatch[1], 80);
      continue;
    }

    if (/(поставщик|участник|исполнитель|подрядчик)/i.test(line)) {
      addCandidate(innMatch[1], 10);
      continue;
    }

    addCandidate(innMatch[1], 40);
  }

  for (const match of normalizedText.matchAll(/\bинн\b[^\d]{0,12}(\d{10,12})/gi)) {
    addCandidate(match[1], 20);
  }

  const best = [...candidateScores.entries()].sort((left, right) => right[1] - left[1])[0];
  return best?.[0] ?? null;
}

function buildPlatformFallback(sourceText: string) {
  const match = sourceText.match(/\b(?:https?:\/\/)?([a-z0-9.-]+\.[a-z]{2,})(?:\/[^\s]*)?/i);
  return match?.[1]?.trim() ?? null;
}

function buildCustomerNameFallback(sourceText: string) {
  const lines = sourceText
    .split(/\n+/)
    .map((item) => item.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .slice(0, 80);

  for (const line of lines) {
    if (/^(АО|ООО|ПАО|МУП|ГУП|ФГБУ|ФГУП|ГБУ|ОГАУ|ИП)\b/i.test(line)) {
      return line.slice(0, 240);
    }
  }

  const explicit = sourceText.match(/(?:заказчик|организатор закупки)\s*[:\-]?\s*([^\n]{4,240})/i);
  return explicit?.[1]?.trim() ?? null;
}

function buildItemsCountFallback(sourceText: string) {
  const matches = [...sourceText.matchAll(/(\d+)\s*(?:позиц|наименован|товар|лотов?|шт\.)/gi)];
  const values = matches
    .map((match) => Number(match[1]))
    .filter((value) => Number.isInteger(value) && value > 0 && value < 10000);

  if (values.length === 0) return 0;
  return Math.max(...values);
}

function buildSummaryFallback(sourceText: string) {
  const paragraphs = sourceText
    .split(/\n{2,}/)
    .map((item) => item.replace(/\s+/g, " ").trim())
    .filter((item) => item.length >= 20)
    .slice(0, 4);

  return paragraphs.join("\n\n").slice(0, 900).trim();
}

function buildSelectionCriteriaFallback(sourceText: string) {
  const matches = extractRelevantParagraphs(sourceText, [/критер/i, /победител/i, /оценк/i], 4);
  return matches.join("\n\n").trim() || null;
}

function buildDeliveryFallback(sourceText: string) {
  const matches = extractRelevantParagraphs(sourceText, [/поставк/i, /место поставк/i, /срок поставк/i], 4);
  return matches.join("\n\n").trim() || null;
}

function buildPaymentFallback(sourceText: string) {
  const matches = extractRelevantParagraphs(sourceText, [/оплат/i, /аванс/i, /рабочих дн/i], 4);
  return matches.join("\n\n").trim() || null;
}

function buildContractTermFallback(sourceText: string) {
  const matches = extractRelevantParagraphs(sourceText, [/срок действия/i, /действует до/i, /срок договор/i], 3);
  return matches.join("\n\n").trim() || null;
}

function buildQuickTenderFallback(input: {
  procurement: {
    procurementNumber: string | null;
    customerName: string | null;
    customerInn: string | null;
    platform: string | null;
    itemsCount: number | null;
    nmckWithoutVat: { toString(): string } | null;
    title: string;
  };
  sourceText: string;
}) {
  const procurementNumber =
    input.procurement.procurementNumber ||
    buildProcurementNumberFallback(input.sourceText) ||
    "";
  const customerName =
    input.procurement.customerName ||
    buildCustomerNameFallback(input.sourceText) ||
    "";
  const customerInn =
    input.procurement.customerInn ||
    buildCustomerInnFallback(input.sourceText) ||
    "";
  const platform = input.procurement.platform || buildPlatformFallback(input.sourceText) || "";
  const itemsCount =
    input.procurement.itemsCount ||
    buildItemsCountFallback(input.sourceText) ||
    0;
  const summary = buildSummaryFallback(input.sourceText);
  const selectionCriteria = buildSelectionCriteriaFallback(input.sourceText) || "";
  const deliveryTerms = buildDeliveryFallback(input.sourceText) || "";
  const paymentTerms = buildPaymentFallback(input.sourceText) || "";
  const contractTerm = buildContractTermFallback(input.sourceText) || "";
  const penaltyTerms = buildPenaltyFallback(input.sourceText) || "";
  const terminationReasons = buildTerminationFallback(input.sourceText);
  const nmckMentions = extractRelevantParagraphs(
    input.sourceText,
    [
      /нмцк/i,
      /нмцд/i,
      /нмц/i,
      /максимальн.*цен/i,
      /начальн.*цен/i,
      /цена договор/i,
      /цена лота/i,
      /с учетом ндс/i,
      /без ндс/i,
      /ндс/i,
    ],
    10
  );
  const securityMentions = extractRelevantParagraphs(
    input.sourceText,
    [/обеспеч/i, /заявк/i, /исполнен/i],
    6
  );
  const priceFallback = buildPriceFallbackFromMentions(
    nmckMentions,
    input.procurement.nmckWithoutVat?.toString() ?? null,
    null
  );
  const bidSecurity = buildSecurityFallback(securityMentions, "заявк") || "";
  const contractSecurity = buildSecurityFallback(securityMentions, "исполн") || "";

  return {
    dossier: {
      procurement_number: procurementNumber,
      customer_name: customerName,
      customer_inn: customerInn,
      platform,
      items_count: itemsCount,
      procurement_type: "",
      nmck_mentions: nmckMentions,
      security_mentions: securityMentions,
      criteria_points: selectionCriteria ? [selectionCriteria] : [],
      required_documents: [],
      nonstandard_requirements: [],
      rrep_rpp_requirements: "",
      decree_1875_ban: "",
      requires_commissioning: "",
      lot_structure: "",
      military_acceptance: "",
      equipment_items: [],
      delivery_terms: deliveryTerms,
      payment_terms: paymentTerms,
      contract_term: contractTerm,
      responsibility_terms: penaltyTerms,
      penalty_terms: penaltyTerms,
      termination_reasons: terminationReasons,
      stop_factor_findings: [],
      unresolved_questions: [],
    },
    result: {
      procurement_number: procurementNumber,
      customer_name: customerName,
      customer_inn: customerInn,
      platform,
      items_count: itemsCount,
      procurement_type: "",
      nmck_without_vat: priceFallback.withoutVat || "",
      nmck_with_vat: priceFallback.withVat || "",
      price_tax_note: priceFallback.note || "",
      bid_security: bidSecurity,
      contract_security: contractSecurity,
      summary,
      selection_criteria: selectionCriteria,
      required_documents: [],
      nonstandard_requirements: [],
      rrep_rpp_requirements: "",
      decree_1875_ban: "",
      requires_commissioning: "",
      lot_structure: "",
      military_acceptance: "",
      equipment_items: [],
      delivery_terms: deliveryTerms,
      payment_terms: paymentTerms,
      contract_term: contractTerm,
      responsibility_terms: penaltyTerms,
      penalty_terms: penaltyTerms,
      termination_reasons: terminationReasons,
      stop_factor_findings: [],
    },
  };
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

  let model = "gpt-5";
  let result;
  let dossier;
  let documentCoverage: unknown[] = [];
  let usedFallbackAnalysis = false;

  try {
    const analysisResponse = await withAnalysisRetry("основной AI-анализ", () =>
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

    model = analysisResponse.model;
    result = analysisResponse.result;
    dossier = analysisResponse.dossier;
    documentCoverage = analysisResponse.documentCoverage ?? [];
  } catch (error) {
    const fallback = buildQuickTenderFallback({
      procurement: {
        procurementNumber: procurement.procurementNumber,
        customerName: procurement.customerName,
        customerInn: procurement.customerInn,
        platform: procurement.platform,
        itemsCount: procurement.itemsCount,
        nmckWithoutVat: procurement.nmckWithoutVat,
        title: procurement.title,
      },
      sourceText,
    });

    model = "quick-fallback";
    result = fallback.result;
    dossier = fallback.dossier;
    documentCoverage = [];
    usedFallbackAnalysis = true;

    await logTenderEvent({
      procurementId,
      actionType: TenderActionType.NOTE_ADDED,
      title: "Глубокий анализ не успел завершиться",
      description:
        "Система автоматически сохранила быстрый результат по ключевым данным закупки и продолжит работать без ручного вмешательства.",
      actorName: "AI",
    });
  }

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
    if (usedFallbackAnalysis) {
      throw new Error("skip_fas_for_quick_fallback");
    }
    const fasResponse = await withAnalysisRetry("ФАС-аналитика", () =>
      runTenderFasAiAnalysis({
        title: procurement.title,
        customerName: procurement.customerName,
        customerInn: procurement.customerInn,
        procurementNumber: procurement.procurementNumber,
        platform: procurement.platform,
        sourceText: sourceText.slice(0, 45000),
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
  const nmckWithVatRaw = choosePreferablePriceValue(
    result.nmck_with_vat?.trim(),
    priceFallback.withVat
  );
  const nmckWithoutVatRaw = choosePreferablePriceValue(
    result.nmck_without_vat?.trim(),
    priceFallback.withoutVat
  );
  const nmckWithVatValue = normalizeDecimalForDb(nmckWithVatRaw);
  const nmckWithoutVatValue = normalizeDecimalForDb(
    nmckWithoutVatRaw
  );

  await updateProcurementAnalysisSafely(prisma, procurementId, {
      sourceText,
      aiAnalysis: {
        ...result,
        nmck_without_vat: nmckWithoutVatRaw || "",
        nmck_with_vat: nmckWithVatRaw || "",
        price_tax_note: result.price_tax_note?.trim() || priceFallback.note || "",
        bid_security: result.bid_security?.trim() || bidSecurityFallback || "",
        contract_security: result.contract_security?.trim() || contractSecurityFallback || "",
        responsibility_terms:
          result.responsibility_terms?.trim() ||
          result.penalty_terms?.trim() ||
          penaltyFallback ||
          "",
        analysis_document_coverage: documentCoverage as any,
        analysis_document_summary: {
          total_documents: Array.isArray(documentCoverage) ? documentCoverage.length : 0,
          included_documents: Array.isArray(documentCoverage)
            ? documentCoverage.filter((item) => {
                if (!item || typeof item !== "object") return false;
                const record = item as Record<string, unknown>;
                return Boolean(
                  record.included_in_primary_pack ||
                    record.included_in_meta_pack ||
                    record.included_in_pricing_pack ||
                    record.included_in_requirements_pack ||
                    record.included_in_contract_pack ||
                    record.included_in_equipment_pack
                );
              }).length
            : 0,
        } as any,
      } as Prisma.InputJsonValue,
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
      nmck: nmckWithVatRaw
        ? nmckWithVatValue ?? null
        : procurement.nmck,
      itemsCount:
        Number.isFinite(result.items_count) && result.items_count > 0
          ? result.items_count
          : procurement.itemsCount,
      nmckWithoutVat: nmckWithoutVatRaw
        ? nmckWithoutVatValue ?? null
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
    const nextStatus = isTimeoutError ? "completed" : "failed";
    const nextError = isTimeoutError ? null : message;

    if (isTimeoutError) {
      await persistQuickFallbackCompletion({
        prisma,
        procurementId,
        sourceText: input.sourceText,
      });
      return { ok: true, fallback: true };
    }

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
