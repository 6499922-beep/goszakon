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

type TenderSourceSection = {
  title: string;
  body: string;
};

function parseTenderSourceSections(sourceText: string) {
  const chunks = sourceText
    .split(/\n{2,}(?=Файл:\s*)/)
    .map((item) => item.trim())
    .filter(Boolean);

  const sections: TenderSourceSection[] = [];

  for (const chunk of chunks) {
    const match = chunk.match(/^Файл:\s*(.+?)\n([\s\S]*)$/);
    if (match) {
      sections.push({
        title: match[1].trim(),
        body: match[2].trim(),
      });
      continue;
    }

    sections.push({
      title: "Документация",
      body: chunk,
    });
  }

  return sections;
}

function isLikelyContractSection(section: TenderSourceSection) {
  const titleHaystack = section.title.toLowerCase();
  const bodyHaystack = section.body.slice(0, 2000).toLowerCase();
  const openingBody = section.body.slice(0, 600).toLowerCase();

  return (
    /договор|контракт|проект договора|условия договора/i.test(titleHaystack) ||
    /(?:^|\n)\s*(?:договор|контракт|проект договора)\b/i.test(openingBody) ||
    /стороны договора|покупатель[,:\s]|поставщик[,:\s]|именуем[а-я\s]+в дальнейшем\s+["«]?(?:покупатель|заказчик|поставщик)/i.test(
      bodyHaystack
    )
  );
}

function buildContractSectionsText(sourceText: string) {
  const sections = parseTenderSourceSections(sourceText).filter(isLikelyContractSection);
  if (sections.length === 0) return "";
  return sections
    .map((section) => `Файл: ${section.title}\n${section.body}`)
    .join("\n\n")
    .trim();
}

function extractContractPartyBlock(
  contractText: string,
  labels: string[],
  maxLength = 900
) {
  const labelPattern = labels.join("|");
  const directMatch = contractText.match(
    new RegExp(
      `(?:^|\\n)\\s*(?:${labelPattern})\\s*[:\\-]?\\s*([\\s\\S]{30,${maxLength}}?)(?=\\n\\s*(?:${labelPattern}|поставщик|исполнитель|подрядчик|участник|реквизиты|адреса\\s+и\\s+реквизиты|юридические\\s+адреса|банковские\\s+реквизиты|\\d+(?:\\.\\d+)*[.)]?\\s*[А-Яа-я]|$))`,
      "i"
    )
  );

  const directValue = directMatch?.[1]
    ?.replace(/\n{3,}/g, "\n\n")
    .replace(/\s+\n/g, "\n")
    .trim();
  if (directValue) {
    return directValue.slice(0, maxLength);
  }

  return null;
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

function buildResponsibilitySectionFallback(sourceText: string) {
  const contractText = buildContractSectionsText(sourceText);
  if (!contractText) return null;

  const normalizedText = contractText.replace(/\r/g, "");
  const sectionMatch = normalizedText.match(
    /(?:^|\n)\s*(?:\d+(?:\.\d+)*[.)]?\s*)?(?:ответственность\s+сторон|ответственность)\s*(?:[:\-]\s*|\n+)([\s\S]{80,2600}?)(?=\n\s*(?:\d+(?:\.\d+)*[.)]?\s*)(?:предмет|цена|стоимость|срок|оплата|поставка|приемка|качество|гарант|обеспечение|расторж|односторон|форс|права|обязанности|разрешение|прочие|заключитель)|$)/i
  );

  const sectionBody = sectionMatch?.[1]
    ?.replace(/\n{3,}/g, "\n\n")
    .replace(/\s+\n/g, "\n")
    .trim();

  if (sectionBody && sectionBody.length >= 40) {
    return sectionBody.slice(0, 1600);
  }

  const paragraphMatches = extractRelevantParagraphs(
    contractText,
    [/ответственность\s+сторон/i, /ответственность/i],
    2
  );

  return paragraphMatches.length > 0 ? paragraphMatches.join("\n\n") : null;
}

function buildContractPenaltyFallback(sourceText: string) {
  const contractText = buildContractSectionsText(sourceText);
  if (!contractText) return null;
  return buildPenaltyFallback(contractText);
}

function extractPricingLines(body: string) {
  return body
    .split(/\n+/)
    .map((item) => item.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .filter((line) =>
      /нмцк|нмцд|нмц|начальн.*максимальн.*цен|начальн.*цен.*договор|цена договора|цена лота|итого|всего|общ(?:ая|ей).*сумм|стоим|руб|ндс|без ндс|с ндс|включая ндс|налог|обеспеч/i.test(
        line
      )
    )
    .slice(0, 40);
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

  const moneyPattern =
    /-?\d{1,3}(?:[ \u00A0.,]\d{3})+(?:[.,]\d{1,2})?|-?\d{4,}(?:[.,]\d{1,2})?|-?\d+(?:[.,]\d{2})/g;
  const unique = new Map<string, { numeric: number; score: number }>();

  for (const match of text.matchAll(moneyPattern)) {
    const raw = match[0];
    if (!raw) continue;
    if (/^\d{1,2}[./]\d{1,2}[./]\d{2,4}$/.test(raw)) continue;

    const normalized = normalizeDecimalForDb(raw);
    if (!normalized) continue;
    const numeric = Number(normalized);
    if (!Number.isFinite(numeric) || numeric <= 0) continue;

    const index = match.index ?? 0;
    const context = text.slice(Math.max(0, index - 40), index + raw.length + 40).toLowerCase();
    let score = 0;

    if (/нмцк|нмцд|нмц|начальн.*максимальн.*цен|начальн.*цен.*договор/.test(context)) {
      score += 120;
    }
    if (/итого|всего|общ(?:ая|ей).*сумм/.test(context)) {
      score += 100;
    }
    if (/цена|стоимост|руб|р\./.test(context)) {
      score += 60;
    }
    if (/от\s+\d{1,2}[./]\d{1,2}[./]\d{2,4}/.test(context)) {
      score -= 120;
    }
    if (/вк\/|исх\./.test(context)) {
      score -= 60;
    }
    if (numeric < 100 && score < 100) {
      score -= 80;
    }

    const existing = unique.get(normalized);
    if (!existing || score > existing.score || (score === existing.score && numeric > existing.numeric)) {
      unique.set(normalized, { numeric, score });
    }
  }

  return [...unique.entries()]
    .sort((left, right) => {
      if (right[1].score !== left[1].score) return right[1].score - left[1].score;
      return right[1].numeric - left[1].numeric;
    })
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

function deriveWithoutVatFromWithVat(withVatValue: string | null | undefined) {
  const normalized = normalizeDecimalForDb(withVatValue);
  if (!normalized) return null;
  const numeric = Number(normalized);
  if (!Number.isFinite(numeric) || numeric <= 0) return null;
  return (numeric / 1.22).toFixed(2);
}

function getAnalysisExtraString(value: unknown, key: string) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return "";
  const record = value as Record<string, unknown>;
  const raw = record[key];
  return typeof raw === "string" ? raw.trim() : "";
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
      (
        fallback.result.procurement_number?.trim() ||
        (fallback.result.summary?.trim() && !looksLikeRawWorkbookDump(fallback.result.summary))
      )
        ? (fallback.result.procurement_number?.trim()
            ? `Закупка ${fallback.result.procurement_number.trim()}`
            : fallback.result.summary.trim().slice(0, 140))
        : procurement.title,
    summary:
      fallback.result.summary && !looksLikeRawWorkbookDump(fallback.result.summary)
        ? fallback.result.summary
        : null,
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

function buildPriceFallbackFromSourceSections(
  sourceText: string,
  currentWithoutVat: string | null,
  currentWithVat: string | null
) {
  const withVatVotes = new Map<string, { count: number; note: string; numeric: number }>();
  const withoutVatVotes = new Map<string, { count: number; note: string; numeric: number }>();

  const addVote = (
    bucket: Map<string, { count: number; note: string; numeric: number }>,
    value: string | null | undefined,
    note: string
  ) => {
    const normalized = normalizeDecimalForDb(value);
    if (!normalized) return;
    const numeric = Number(normalized);
    if (!Number.isFinite(numeric) || numeric <= 0) return;
    const existing = bucket.get(normalized);
    if (existing) {
      existing.count += 1;
      return;
    }
    bucket.set(normalized, { count: 1, note, numeric });
  };

  for (const section of parseTenderSourceSections(sourceText)) {
    const titleHaystack = section.title.toLowerCase();
    const bodyHaystack = section.body.toLowerCase();
    const isLikelyPriceSource =
      /нмц|цена|стоим|коммерч|обоснован|калькул|итого|xlsx|xls/i.test(titleHaystack) ||
      /нмцк|нмцд|начальн.*цен|цена договора|цена лота|итого|всего/i.test(bodyHaystack);

    if (!isLikelyPriceSource) continue;

    const sectionMentions = extractPricingLines(section.body);
    if (sectionMentions.length === 0) continue;

    const sectionFallback = buildPriceFallbackFromMentions(sectionMentions, null, null);
    const note =
      sectionMentions.find((item) =>
        /нмцк|нмцд|начальн.*цен|цена договора|цена лота|итого|всего/i.test(item.toLowerCase())
      ) ||
      sectionMentions[0] ||
      section.title;

    addVote(withVatVotes, sectionFallback.withVat, `${section.title}: ${note}`);
    addVote(withoutVatVotes, sectionFallback.withoutVat, `${section.title}: ${note}`);
  }

  const pickBestVote = (
    bucket: Map<string, { count: number; note: string; numeric: number }>
  ) =>
    [...bucket.entries()]
      .sort((left, right) => {
        if (right[1].count !== left[1].count) return right[1].count - left[1].count;
        return right[1].numeric - left[1].numeric;
      })
      .at(0);

  const bestWithVat = pickBestVote(withVatVotes);
  const bestWithoutVat = pickBestVote(withoutVatVotes);

  const withoutVat = choosePreferablePriceValue(
    bestWithoutVat?.[0] ?? currentWithoutVat,
    currentWithoutVat
  );
  const withVat = choosePreferablePriceValue(
    bestWithVat?.[0] ?? currentWithVat,
    currentWithVat
  );

  return {
    withoutVat,
    withVat,
    note:
      bestWithVat?.[1].note ||
      bestWithoutVat?.[1].note ||
      null,
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

function buildContractCustomerInnFallback(sourceText: string) {
  const contractText = buildContractSectionsText(sourceText);
  if (!contractText) return null;

  const partyBlock = extractContractPartyBlock(contractText, [
    "покупател(?:я|ь)",
    "заказчик",
  ]);
  if (partyBlock) {
    const partyInn = partyBlock.match(/\bинн\b[^\d]{0,12}(\d{10,12})/i);
    if (partyInn?.[1]) {
      return partyInn[1];
    }
  }

  const requisitesPatterns = [
    /(?:реквизиты|адреса\s+и\s+реквизиты\s+сторон|юридические\s+адреса\s+и\s+банковские\s+реквизиты)[\s\S]{0,1400}?(?:покупател(?:я|ь)|заказчик)[\s\S]{0,260}?\bинн\b[^\d]{0,12}(\d{10,12})/i,
    /(?:покупател(?:я|ь)|заказчик)[\s\S]{0,260}?\bинн\b[^\d]{0,12}(\d{10,12})/i,
    /\bинн\b[^\d]{0,12}(\d{10,12})[\s\S]{0,120}?(?:покупател(?:я|ь)|заказчик)/i,
  ];

  for (const pattern of requisitesPatterns) {
    const match = contractText.match(pattern);
    if (match?.[1]) {
      return match[1];
    }
  }

  return buildCustomerInnFallback(contractText);
}

function buildCustomerKppFallback(sourceText: string) {
  const normalizedText = sourceText.replace(/\u00A0/g, " ");
  const patterns = [
    /(?:заказчик|сведения о заказчике|информация о заказчике)[\s\S]{0,180}?\bкпп\b[^\d]{0,12}(\d{9})/i,
    /\bкпп\b[^\d]{0,12}(\d{9})[\s\S]{0,80}?(?:заказчик|покупатель|организатор)/i,
    /\bкпп\b[^\d]{0,12}(\d{9})/i,
  ];

  for (const pattern of patterns) {
    const match = normalizedText.match(pattern);
    if (match?.[1]) return match[1];
  }

  return null;
}

function buildCustomerOgrnFallback(sourceText: string) {
  const normalizedText = sourceText.replace(/\u00A0/g, " ");
  const patterns = [
    /(?:заказчик|сведения о заказчике|информация о заказчике)[\s\S]{0,220}?\bогрн\b[^\d]{0,12}(\d{13}|\d{15})/i,
    /\bогрн\b[^\d]{0,12}(\d{13}|\d{15})[\s\S]{0,80}?(?:заказчик|покупатель|организатор)/i,
    /\bогрн\b[^\d]{0,12}(\d{13}|\d{15})/i,
  ];

  for (const pattern of patterns) {
    const match = normalizedText.match(pattern);
    if (match?.[1]) return match[1];
  }

  return null;
}

function buildCustomerAddressFallback(sourceText: string) {
  const normalizedText = sourceText.replace(/\u00A0/g, " ");
  const patterns = [
    /(?:заказчик|сведения о заказчике|информация о заказчике)[\s\S]{0,260}?(?:адрес|местонахождени[ея]|юридическ(?:ий|ого) адрес)\s*[:\-]?\s*([^\n]{10,240})/i,
    /(?:адрес|местонахождени[ея]|юридическ(?:ий|ого) адрес)\s*[:\-]?\s*([^\n]{10,240})/i,
  ];

  for (const pattern of patterns) {
    const match = normalizedText.match(pattern);
    const value = match?.[1]?.replace(/\s+/g, " ").trim();
    if (value) return value.slice(0, 240);
  }

  return null;
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

function buildContractCustomerNameFallback(sourceText: string) {
  const contractText = buildContractSectionsText(sourceText);
  if (!contractText) return null;

  const partyBlock = extractContractPartyBlock(contractText, [
    "покупател(?:я|ь)",
    "заказчик",
  ]);
  if (partyBlock) {
    const firstLine = partyBlock
      .split(/\n+/)
      .map((line) => line.replace(/\s+/g, " ").trim())
      .find(Boolean);
    if (firstLine && firstLine.length >= 4) {
      return firstLine.slice(0, 240);
    }
  }

  const explicitPatterns = [
    /(?:заказчик|покупатель)\s*[:\-]?\s*([^\n]{4,240})/i,
    /(?:именуем[а-я\s]+в дальнейшем\s+["«]?(?:заказчик|покупатель)["»]?)[,:\s-]*([^\n]{4,240})/i,
  ];

  for (const pattern of explicitPatterns) {
    const match = contractText.match(pattern);
    const value = match?.[1]?.replace(/\s+/g, " ").trim();
    if (value) return value.slice(0, 240);
  }

  return buildCustomerNameFallback(contractText);
}

function buildItemsCountFallback(sourceText: string) {
  const matches = [...sourceText.matchAll(/(\d+)\s*(?:позиц|наименован|товар|лотов?|шт\.)/gi)];
  const values = matches
    .map((match) => Number(match[1]))
    .filter((value) => Number.isInteger(value) && value > 0 && value < 10000);

  if (values.length === 0) return 0;
  return Math.max(...values);
}

function buildTechnicalEquipmentFallback(sourceText: string) {
  const sections = parseTenderSourceSections(sourceText).filter((section) => {
    const title = section.title.toLowerCase();
    const body = section.body.slice(0, 2000).toLowerCase();
    return /технич|тз|специфик|описан.*товар|характерист|техническое задание/i.test(
      `${title}\n${body}`
    );
  });

  if (sections.length === 0) return [];

  const candidates = new Map<string, number>();
  const addCandidate = (value: string, score: number) => {
    const normalized = value.replace(/\s+/g, " ").trim();
    if (!normalized || normalized.length < 12) return;
    if (/^(окпд|оквэд|код|характеристик|требован|параметр|комплектность)\b/i.test(normalized)) {
      return;
    }
    if (/^\d+(?:[.,]\d+)?\s*(мм|см|м|кг|квт|в|а|шт)\.?$/i.test(normalized)) {
      return;
    }
    if (/^(вертикальн|горизонтальн|мощност|снаряженн|грузоподъемност|объем|давление|скорость)\b/i.test(normalized)) {
      score -= 20;
    }

    const current = candidates.get(normalized) ?? 0;
    if (score > current) {
      candidates.set(normalized, score);
    }
  };

  for (const section of sections) {
    const lines = section.body
      .split(/\n+/)
      .map((line) => line.replace(/\s+/g, " ").trim())
      .filter(Boolean);

    for (const line of lines) {
      if (/^(техническое задание|спецификация|наименование|кол-?во|ед\.?\s*изм|итого|всего)$/i.test(line)) {
        continue;
      }

      if (/^\d+[.)]\s+/.test(line) || /^[\-•]\s+/.test(line)) {
        addCandidate(line.replace(/^(?:\d+[.)]|[\-•])\s+/, ""), 120);
        continue;
      }

      if (/(поставка|закупка|товар|оборудован|издели|насос|шкаф|кабель|материал|автомобил|мебел|прибор|система|станц|комплект)/i.test(line)) {
        addCandidate(line, 90);
      }
    }
  }

  return [...candidates.entries()]
    .sort((left, right) => right[1] - left[1])
    .map(([value]) => value)
    .slice(0, 25);
}

function buildSummaryFallback(sourceText: string) {
  const paragraphs = sourceText
    .split(/\n{2,}/)
    .map((item) => item.replace(/\s+/g, " ").trim())
    .filter((item) => item.length >= 20)
    .slice(0, 4);

  return paragraphs.join("\n\n").slice(0, 900).trim();
}

function looksLikeRawWorkbookDump(value: string | null | undefined) {
  const normalized = String(value ?? "").toLowerCase().replace(/\s+/g, " ").trim();
  if (!normalized) return false;

  return (
    normalized.startsWith("файл: ") &&
    normalized.includes("лист:") &&
    normalized.includes("тип таблицы:") &&
    normalized.includes("колонки:")
  );
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
    buildContractCustomerNameFallback(input.sourceText) ||
    buildCustomerNameFallback(input.sourceText) ||
    "";
  const customerInn =
    input.procurement.customerInn ||
    buildContractCustomerInnFallback(input.sourceText) ||
    buildCustomerInnFallback(input.sourceText) ||
    "";
  const customerKpp = buildCustomerKppFallback(input.sourceText) || "";
  const customerOgrn = buildCustomerOgrnFallback(input.sourceText) || "";
  const customerAddress = buildCustomerAddressFallback(input.sourceText) || "";
  const platform = input.procurement.platform || buildPlatformFallback(input.sourceText) || "";
  const itemsCount =
    input.procurement.itemsCount ||
    buildItemsCountFallback(input.sourceText) ||
    0;
  const equipmentItems = buildTechnicalEquipmentFallback(input.sourceText);
  const summary = buildSummaryFallback(input.sourceText);
  const selectionCriteria = buildSelectionCriteriaFallback(input.sourceText) || "";
  const deliveryTerms = buildDeliveryFallback(input.sourceText) || "";
  const paymentTerms = buildPaymentFallback(input.sourceText) || "";
  const contractTerm = buildContractTermFallback(input.sourceText) || "";
  const responsibilityTerms =
    buildResponsibilitySectionFallback(input.sourceText) ||
    "";
  const penaltyTerms =
    buildContractPenaltyFallback(input.sourceText) ||
    buildPenaltyFallback(input.sourceText) ||
    "";
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
  const sectionPriceFallback = buildPriceFallbackFromSourceSections(
    input.sourceText,
    priceFallback.withoutVat,
    priceFallback.withVat
  );
  const bidSecurity = buildSecurityFallback(securityMentions, "заявк") || "";
  const contractSecurity = buildSecurityFallback(securityMentions, "исполн") || "";

  return {
    dossier: {
      procurement_number: procurementNumber,
      customer_name: customerName,
      customer_inn: customerInn,
      customer_kpp: customerKpp,
      customer_ogrn: customerOgrn,
      customer_address: customerAddress,
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
      equipment_items: equipmentItems,
      delivery_terms: deliveryTerms,
      payment_terms: paymentTerms,
      contract_term: contractTerm,
      responsibility_terms: responsibilityTerms,
      penalty_terms: penaltyTerms,
      termination_reasons: terminationReasons,
      stop_factor_findings: [],
      unresolved_questions: [],
    },
    result: {
      procurement_number: procurementNumber,
      customer_name: customerName,
      customer_inn: customerInn,
      customer_kpp: customerKpp,
      customer_ogrn: customerOgrn,
      customer_address: customerAddress,
      platform,
      items_count: itemsCount,
      procurement_type: "",
      nmck_without_vat:
        choosePreferablePriceValue(sectionPriceFallback.withoutVat, priceFallback.withoutVat) || "",
      nmck_with_vat:
        choosePreferablePriceValue(sectionPriceFallback.withVat, priceFallback.withVat) || "",
      price_tax_note: sectionPriceFallback.note || priceFallback.note || "",
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
      equipment_items: equipmentItems,
      delivery_terms: deliveryTerms,
      payment_terms: paymentTerms,
      contract_term: contractTerm,
      responsibility_terms: responsibilityTerms,
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

  const penaltyFallback =
    buildContractPenaltyFallback(sourceText) ||
    buildPenaltyFallback(sourceText);
  const responsibilityFallback = buildResponsibilitySectionFallback(sourceText);
  const terminationFallback = buildTerminationFallback(sourceText);
  const priceFallback = buildPriceFallbackFromMentions(
    dossier.nmck_mentions,
    result.nmck_without_vat,
    result.nmck_with_vat
  );
  const sectionPriceFallback = buildPriceFallbackFromSourceSections(
    sourceText,
    priceFallback.withoutVat,
    priceFallback.withVat
  );
  const bidSecurityFallback = buildSecurityFallback(dossier.security_mentions, "заявк");
  const contractSecurityFallback = buildSecurityFallback(dossier.security_mentions, "исполн");
  const procurementNumberFallback = buildProcurementNumberFallback(sourceText);
  const nmckWithVatRaw = choosePreferablePriceValue(
    choosePreferablePriceValue(result.nmck_with_vat?.trim(), sectionPriceFallback.withVat),
    priceFallback.withVat
  );
  let nmckWithoutVatRaw = choosePreferablePriceValue(
    choosePreferablePriceValue(result.nmck_without_vat?.trim(), sectionPriceFallback.withoutVat),
    priceFallback.withoutVat
  );
  const nmckWithVatNormalized = normalizeDecimalForDb(nmckWithVatRaw);
  const nmckWithoutVatNormalized = normalizeDecimalForDb(nmckWithoutVatRaw);
  if (nmckWithVatNormalized) {
    const withVatNumeric = Number(nmckWithVatNormalized);
    const withoutVatNumeric = Number(nmckWithoutVatNormalized);
    if (
      !nmckWithoutVatNormalized ||
      !Number.isFinite(withoutVatNumeric) ||
      withoutVatNumeric <= 0 ||
      withoutVatNumeric < withVatNumeric / 10
    ) {
      nmckWithoutVatRaw = deriveWithoutVatFromWithVat(nmckWithVatNormalized);
    }
  }
  const nmckWithVatValue = normalizeDecimalForDb(nmckWithVatRaw);
  const nmckWithoutVatValue = normalizeDecimalForDb(
    nmckWithoutVatRaw
  );

  await updateProcurementAnalysisSafely(prisma, procurementId, {
      sourceText,
      aiAnalysis: {
        ...result,
        customer_kpp:
          getAnalysisExtraString(result, "customer_kpp") ||
          getAnalysisExtraString(dossier, "customer_kpp") ||
          buildCustomerKppFallback(sourceText) ||
          "",
        customer_ogrn:
          getAnalysisExtraString(result, "customer_ogrn") ||
          getAnalysisExtraString(dossier, "customer_ogrn") ||
          buildCustomerOgrnFallback(sourceText) ||
          "",
        customer_address:
          getAnalysisExtraString(result, "customer_address") ||
          getAnalysisExtraString(dossier, "customer_address") ||
          buildCustomerAddressFallback(sourceText) ||
          "",
        nmck_without_vat: nmckWithoutVatRaw || "",
        nmck_with_vat: nmckWithVatRaw || "",
        price_tax_note:
          result.price_tax_note?.trim() ||
          sectionPriceFallback.note ||
          priceFallback.note ||
          "",
        bid_security: result.bid_security?.trim() || bidSecurityFallback || "",
        contract_security: result.contract_security?.trim() || contractSecurityFallback || "",
        responsibility_terms:
          result.responsibility_terms?.trim() ||
          responsibilityFallback ||
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
      customerName:
        result.customer_name?.trim() ||
        buildContractCustomerNameFallback(sourceText) ||
        procurement.customerName ||
        null,
      customerInn:
        result.customer_inn?.trim() ||
        buildContractCustomerInnFallback(sourceText) ||
        procurement.customerInn ||
        null,
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
        (
          result.procurement_number?.trim() ||
          (result.summary?.trim() && !looksLikeRawWorkbookDump(result.summary))
        )
          ? (result.procurement_number?.trim()
              ? `Закупка ${result.procurement_number.trim()}`
              : result.summary.trim().slice(0, 140))
          : procurement.title,
      summary:
        result.summary && !looksLikeRawWorkbookDump(result.summary)
          ? result.summary
          : procurement.summary,
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

    const isRetryableAiError = /OpenAI API error: (429|500|502|503|504)|server_error|fetch failed/i.test(
      message ?? ""
    );
    const isTimeoutError = /слишком много времени|aborted due to timeout|timeout/i.test(
      message ?? ""
    );
    const shouldRetry = isTimeoutError || isRetryableAiError;
    const nextStatus = shouldRetry ? "retrying" : "failed";
    const nextError = isTimeoutError
      ? PRIMARY_ANALYSIS_TIMEOUT_TEXT
      : isRetryableAiError
        ? "Внешний AI-сервис временно ответил нестабильно. Система автоматически повторяет глубокий анализ."
        : message;

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
        ? "Глубокий анализ переведён на повторный запуск"
        : isRetryableAiError
          ? "Глубокий анализ отправлен на повторный запуск"
        : "Первичный анализ не завершён",
      description:
        nextError ||
        (isTimeoutError
          ? PRIMARY_ANALYSIS_TIMEOUT_TEXT
          : "Не удалось выполнить первичный AI-анализ"),
      actorName: "AI",
    });

    if (shouldRetry) {
      return { ok: true, retrying: true };
    }

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
