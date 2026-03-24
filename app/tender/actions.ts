"use server";

import {
  TenderRuleKind,
  TenderActionType,
  TenderCompanyDocumentType,
  TenderDecision,
  TenderProcurementDocumentStatus,
  TenderSourceDocumentAutofillStatus,
  TenderSourceDocumentFormType,
  TenderSourceDocumentStatus,
  TenderProcurementStatus,
  TenderUserRole,
} from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getPrisma } from "@/lib/prisma";
import { getCurrentTenderUser } from "@/lib/admin-auth";
import {
  evaluateTenderStopRules,
  runTenderAiAnalysis,
} from "@/lib/tender-analysis";
import {
  getDecisionStatus,
  logTenderEvent,
} from "@/lib/tender-workflow";

function normalizeString(value: FormDataEntryValue | null) {
  const normalized = String(value ?? "").trim();
  return normalized.length ? normalized : null;
}

function normalizeNumber(value: FormDataEntryValue | null) {
  const normalized = String(value ?? "")
    .trim()
    .replace(/\s+/g, "")
    .replace(",", ".");

  if (!normalized) return null;

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeDate(value: FormDataEntryValue | null) {
  const raw = String(value ?? "").trim();
  return raw ? new Date(raw) : null;
}

function splitLines(value: FormDataEntryValue | null) {
  const raw = String(value ?? "").trim();
  if (!raw) return undefined;

  return raw
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

async function getTenderActorContext() {
  const user = await getCurrentTenderUser();

  return {
    authorId: user?.id ?? null,
    authorRole: user?.role ?? null,
    actorName: user?.name?.trim() || user?.email?.trim() || "Сотрудник",
  };
}

const tenderTechnicalItemStatuses = [
  "EXPLICIT",
  "IDENTIFIED",
  "REVIEW",
  "REJECTED",
] as const;

type TenderTechnicalItemStatusValue = (typeof tenderTechnicalItemStatuses)[number];

function normalizeTenderTechnicalItemStatus(
  value: FormDataEntryValue | null
): TenderTechnicalItemStatusValue {
  const normalized = String(value ?? "REVIEW").trim().toUpperCase();

  return tenderTechnicalItemStatuses.includes(
    normalized as TenderTechnicalItemStatusValue
  )
    ? (normalized as TenderTechnicalItemStatusValue)
    : "REVIEW";
}

function looksLikeExplicitModel(value: string) {
  const normalized = value.toUpperCase();

  return [
    /\bWAGO\b/,
    /\bIEK\b/,
    /\bLD\b/,
    /\bREXANT\b/,
    /\bKZ-\d+/,
    /\bTA\s?\d+-\d+-[\d,]+/,
    /\bTML?\s?\d+-\d+-[\d,]+/,
    /\bTAM-\d+-\d+-[\d,]+/,
    /\bНШВИ/,
    /\bНКИ/,
    /\bСШР\d+/,
    /\bPG\s?\d+/,
    /\bCV-\d+/,
    /\bЗНИ-\d+/,
    /\b4СБ\b/,
    /\b2НБ\b/,
    /\b\d{1,2}[А-ЯA-Z]{1,2}\d{1,2}[А-ЯA-Z]{1,4}\b/,
    /\bКШ\.[А-ЯA-Z.0-9-]+\b/,
  ].some((pattern) => pattern.test(normalized));
}

const knownUnitPattern =
  /^(шт|штука|уп|упаковка|м|м\.п\.|кг|км|л|пара|пар|компл|комплект|набор|рул|рулон|секции?|ед\.?|тонн?[аы]?|т)$/i;

function isQuantityToken(value: string) {
  return /^\d+(?:[.,]\d+)?$/.test(value.trim());
}

function isUnitToken(value: string) {
  return knownUnitPattern.test(value.trim());
}

function isLikelyHeaderLine(value: string) {
  const normalized = value.trim().toLowerCase();
  return [
    "№",
    "п/п",
    "наименование",
    "наименование товара",
    "ед. изм.",
    "ед изм",
    "единица измерения",
    "кол-во",
    "количество",
    "технические характеристики",
    "характеристики",
  ].includes(normalized);
}

function cleanTechnicalText(value: string) {
  return value
    .replace(/\s+/g, " ")
    .replace(/\s+([,.;:])/g, "$1")
    .trim();
}

function normalizeSearchText(value: string) {
  return value
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/["'«»()№.,:;/-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function inferProcurementDocumentCategory(title: string) {
  const normalized = normalizeSearchText(title);

  if (
    normalized.includes("устав") ||
    normalized.includes("инн") ||
    normalized.includes("огрн") ||
    normalized.includes("егрюл") ||
    normalized.includes("приказ") ||
    normalized.includes("доверенн")
  ) {
    return "Документы компании";
  }

  if (
    normalized.includes("анкета") ||
    normalized.includes("заявка") ||
    normalized.includes("согласие") ||
    normalized.includes("ценов")
  ) {
    return "Форма заказчика";
  }

  if (
    normalized.includes("декларац") ||
    normalized.includes("письмо") ||
    normalized.includes("сведения")
  ) {
    return "Декларации и сведения";
  }

  return "Прочее";
}

function getDocumentKeywords(title: string) {
  const normalized = normalizeSearchText(title);
  const keywordMap: Array<[string, string[]]> = [
    ["устав", ["устав"]],
    ["инн", ["инн", "кпп", "налог"]],
    ["огрн", ["огрн", "лист записи"]],
    ["егрюл", ["егрюл", "выписк"]],
    ["директор", ["директор", "назначени", "приказ", "решени"]],
    ["доверенность", ["доверен"]],
    ["реквизиты", ["реквизит", "банк", "расчетный счет", "карточка"]],
    ["анкета", ["анкета"]],
    ["заявка", ["заявка", "согласие"]],
    ["цена", ["ценов", "коммерческ", "предложени", "стоимост"]],
    ["декларация", ["декларац"]],
  ];

  const matched = keywordMap
    .filter(([, variants]) => variants.some((variant) => normalized.includes(variant)))
    .flatMap(([, variants]) => variants);

  return matched.length > 0 ? matched : normalized.split(" ").filter((part) => part.length > 3);
}

function inferSourceDocumentFormAnalysis(input: {
  title: string;
  documentKind?: string | null;
  contentSnippet?: string | null;
  note?: string | null;
}) {
  const haystack = normalizeSearchText(
    `${input.title} ${input.documentKind ?? ""} ${input.contentSnippet ?? ""} ${input.note ?? ""}`
  );

  let formType: TenderSourceDocumentFormType =
    TenderSourceDocumentFormType.UNKNOWN;
  let autofillStatus: TenderSourceDocumentAutofillStatus =
    TenderSourceDocumentAutofillStatus.NOT_ANALYZED;
  let extractedSummary =
    "Файл пока не разобран. После решения «Подаём» нужно определить, есть ли внутри поля для автозаполнения.";
  let reviewQuestion: string | null =
    "Нужно открыть файл и проверить, есть ли в нём форма для заполнения.";

  if (haystack.includes("техническ") && haystack.includes("задан")) {
    formType = TenderSourceDocumentFormType.TECHNICAL_SPEC;
    autofillStatus = TenderSourceDocumentAutofillStatus.MANUAL_ONLY;
    extractedSummary =
      "Похоже на техническое задание или спецификацию. Этот файл нужен для понимания требований и подбора товара, а не для прямого автозаполнения.";
    reviewQuestion =
      "Проверь, нужно ли извлекать из этого файла позиции ТЗ или дополнительные характеристики.";
  } else if (haystack.includes("проект договора") || haystack.includes("договор")) {
    formType = TenderSourceDocumentFormType.CONTRACT_DRAFT;
    autofillStatus = TenderSourceDocumentAutofillStatus.MANUAL_ONLY;
    extractedSummary =
      "Похоже на проект договора. Его не нужно заполнять как заявку, но нужно использовать для проверки условий и рисков.";
    reviewQuestion =
      "Проверь, есть ли в проекте договора приложения или таблицы, которые нужно отдельно вынести в формы.";
  } else if (haystack.includes("ценов") || haystack.includes("стоимост") || haystack.includes("коммерческ")) {
    formType = TenderSourceDocumentFormType.PRICE_FORM;
    autofillStatus = TenderSourceDocumentAutofillStatus.PARTIALLY_READY;
    extractedSummary =
      "Похоже на ценовую форму. Обычно сюда можно подтянуть реквизиты, номенклатуру и найденные цены, но итог нужно проверить вручную.";
    reviewQuestion =
      "Проверь, совпадает ли структура строк с позицями ТЗ и можно ли переносить цену автоматически.";
  } else if (haystack.includes("анкет")) {
    formType = TenderSourceDocumentFormType.QUESTIONNAIRE;
    autofillStatus = TenderSourceDocumentAutofillStatus.READY_TO_FILL;
    extractedSummary =
      "Похоже на анкету участника. Обычно в ней много стандартных реквизитов компании, которые можно автозаполнить.";
    reviewQuestion =
      "Проверь, нет ли в анкете нестандартных полей, которых нет в карточке компании.";
  } else if (haystack.includes("соглас") || haystack.includes("заявк")) {
    formType = TenderSourceDocumentFormType.APPLICATION_FORM;
    autofillStatus = TenderSourceDocumentAutofillStatus.PARTIALLY_READY;
    extractedSummary =
      "Похоже на форму заявки или согласия. Реквизиты и часть типовых формулировок можно подтянуть автоматически, но техническую часть нужно проверять.";
    reviewQuestion =
      "Проверь, есть ли в форме отдельные таблицы по товару, которые нужно заполнять из ТЗ.";
  } else if (haystack.includes("техническ") && haystack.includes("предлож")) {
    formType = TenderSourceDocumentFormType.TECHNICAL_PROPOSAL;
    autofillStatus = TenderSourceDocumentAutofillStatus.PARTIALLY_READY;
    extractedSummary =
      "Похоже на техническое предложение. Название товара и часть характеристик можно подготовить автоматически, но эквивалентность нужно проверять вручную.";
    reviewQuestion =
      "Проверь, достаточно ли система поняла характеристики для заполнения этой формы.";
  } else if (haystack.includes("декларац") || haystack.includes("сведения")) {
    formType = TenderSourceDocumentFormType.DECLARATION;
    autofillStatus = TenderSourceDocumentAutofillStatus.READY_TO_FILL;
    extractedSummary =
      "Похоже на декларацию или сведения участника. Обычно такие формы хорошо подходят для автозаполнения из базы компании.";
    reviewQuestion =
      "Проверь, нет ли в декларации условий именно под этого заказчика или эту закупку.";
  } else if (haystack.includes("приложени")) {
    formType = TenderSourceDocumentFormType.OTHER_APPENDIX;
    autofillStatus = TenderSourceDocumentAutofillStatus.MANUAL_ONLY;
    extractedSummary =
      "Похоже на приложение к документации. Его нужно открыть и понять, есть ли внутри самостоятельная форма для заполнения.";
    reviewQuestion =
      "Проверь, является ли это приложение формой заказчика или просто справочной частью.";
  }

  return { formType, autofillStatus, extractedSummary, reviewQuestion };
}

function buildSourceDocumentExtractedFields(input: {
  sourceDocument: {
    title: string;
    documentKind: string | null;
    formType: TenderSourceDocumentFormType;
    contentSnippet: string | null;
  };
  procurement: {
    customerName: string | null;
    customerInn: string | null;
    procurementNumber: string | null;
    approvedBidAmount: { toString(): string } | number | null;
  };
  technicalItems: Array<{
    requestedName: string;
    quantity: string | null;
    unit: string | null;
    identifiedProduct: string | null;
    identifiedBrand: string | null;
    identifiedModel: string | null;
    rawCharacteristics: string | null;
    approximateUnitPrice: { toString(): string } | number | null;
    sourceSummary: string | null;
    pricingReady: boolean;
    status: TenderTechnicalItemStatusValue;
  }>;
  companyProfile: {
    legalName: string | null;
    name: string;
    inn: string | null;
    kpp: string | null;
    ogrn: string | null;
    legalAddress: string | null;
    directorName: string | null;
    phone: string | null;
    email: string | null;
    bankName: string | null;
    bankBik: string | null;
    bankAccount: string | null;
    correspondentAccount: string | null;
  } | null;
}) {
  const snippet = normalizeSearchText(input.sourceDocument.contentSnippet ?? "");
  const fields: Array<{
    label: string;
    value: string;
    source: string;
    status: "auto" | "review" | "manual";
  }> = [];
  const reviewFields: string[] = [];

  const company = input.companyProfile;
  if (company) {
    const addCompanyField = (
      matchers: string[],
      label: string,
      value: string | null | undefined,
      source = "карточка компании"
    ) => {
      if (!value) return;
      if (matchers.some((matcher) => snippet.includes(matcher))) {
        fields.push({ label, value, source, status: "auto" });
      }
    };

    addCompanyField(["полное наименование", "наименование участника", "участник закупки"], "Наименование компании", company.legalName ?? company.name);
    addCompanyField(["инн"], "ИНН", company.inn);
    addCompanyField(["кпп"], "КПП", company.kpp);
    addCompanyField(["огрн"], "ОГРН", company.ogrn);
    addCompanyField(["адрес"], "Юридический адрес", company.legalAddress);
    addCompanyField(["директор", "руководител", "подписант"], "Руководитель", company.directorName);
    addCompanyField(["телефон"], "Телефон", company.phone);
    addCompanyField(["email", "электронн"], "Email", company.email);
    addCompanyField(["банк"], "Банк", company.bankName);
    addCompanyField(["бик"], "БИК", company.bankBik);
    addCompanyField(["расчетный счет", "расчётный счет", "р/с"], "Расчётный счёт", company.bankAccount);
    addCompanyField(["корреспондентский счет", "корр. счет", "к/с"], "Корр. счёт", company.correspondentAccount);
  }

  if (
    input.sourceDocument.formType === TenderSourceDocumentFormType.PRICE_FORM &&
    input.procurement.approvedBidAmount != null
  ) {
    fields.push({
      label: "Сумма участия",
      value: String(input.procurement.approvedBidAmount),
      source: "решение руководителя",
      status: "auto",
    });
  }

  if (
    input.sourceDocument.formType === TenderSourceDocumentFormType.APPLICATION_FORM ||
    input.sourceDocument.formType === TenderSourceDocumentFormType.QUESTIONNAIRE
  ) {
    if (input.procurement.procurementNumber) {
      fields.push({
        label: "Номер закупки",
        value: input.procurement.procurementNumber,
        source: "карточка закупки",
        status: "auto",
      });
    }
    if (input.procurement.customerName) {
      fields.push({
        label: "Заказчик",
        value: input.procurement.customerName,
        source: "карточка закупки",
        status: "auto",
      });
    }
  }

  const activeTechnicalItems = input.technicalItems.filter(
    (item) => item.status !== "REJECTED"
  );

  if (
    input.sourceDocument.formType === TenderSourceDocumentFormType.PRICE_FORM &&
    activeTechnicalItems.length > 0
  ) {
    activeTechnicalItems.forEach((item, index) => {
      const quantity = item.quantity ?? "—";
      const unit = item.unit ?? "";
      const unitPrice =
        item.approximateUnitPrice != null ? String(item.approximateUnitPrice) : null;

      fields.push({
        label: `Позиция ${index + 1}: наименование`,
        value:
          item.identifiedProduct ??
          item.identifiedModel ??
          item.requestedName,
        source: "разбор ТЗ",
        status: "auto",
      });

      fields.push({
        label: `Позиция ${index + 1}: количество`,
        value: `${quantity}${unit ? ` ${unit}` : ""}`.trim(),
        source: "разбор ТЗ",
        status: "auto",
      });

      if (unitPrice) {
        fields.push({
          label: `Позиция ${index + 1}: цена за единицу`,
          value: `${unitPrice} руб.`,
          source: item.sourceSummary ?? "предпросчёт",
          status: "review",
        });

        const numericQuantity = Number(String(quantity).replace(",", "."));
        const numericUnitPrice = Number(unitPrice);
        if (Number.isFinite(numericQuantity) && Number.isFinite(numericUnitPrice)) {
          fields.push({
            label: `Позиция ${index + 1}: сумма`,
            value: `${(numericQuantity * numericUnitPrice).toFixed(2)} руб.`,
            source: "расчёт по позиции",
            status: "review",
          });
        }
      } else if (item.pricingReady) {
        reviewFields.push(
          `По позиции "${item.requestedName}" ещё не сохранён ценовой ориентир, хотя её уже можно считать.`
        );
      }
    });
  }

  if (
    (input.sourceDocument.formType === TenderSourceDocumentFormType.TECHNICAL_PROPOSAL ||
      input.sourceDocument.formType === TenderSourceDocumentFormType.APPLICATION_FORM) &&
    activeTechnicalItems.length > 0
  ) {
    activeTechnicalItems.forEach((item, index) => {
      fields.push({
        label: `Позиция ${index + 1}: что считаем заложенным`,
        value:
          [item.identifiedProduct, item.identifiedBrand, item.identifiedModel]
            .filter(Boolean)
            .join(" / ") || item.requestedName,
        source: "разбор ТЗ",
        status: item.status === "EXPLICIT" ? "auto" : "review",
      });

      if (item.rawCharacteristics) {
        fields.push({
          label: `Позиция ${index + 1}: характеристики`,
          value: item.rawCharacteristics,
          source: "ТЗ заказчика",
          status: "review",
        });
      }
    });
  }

  const reviewMatcherMap: Array<[string[], string]> = [
    [["страна происхождения", "страна"], "Нужно проверить страну происхождения товара."],
    [["реестровый номер"], "Нужно проверить реестровые номера по товарам."],
    [["производител"], "Нужно проверить производителя товара."],
    [["товарный знак", "бренд", "модель"], "Нужно проверить бренд, модель или товарный знак в форме."],
    [["технические характеристики", "характеристик"], "Нужно проверить технические характеристики и эквивалентность."],
    [["гарантийн"], "Нужно проверить гарантийные условия."],
    [["срок поставки"], "Нужно проверить срок поставки в форме."],
  ];

  for (const [matchers, message] of reviewMatcherMap) {
    if (matchers.some((matcher) => snippet.includes(matcher))) {
      reviewFields.push(message);
    }
  }

  return {
    fields,
    reviewFields,
  };
}

function buildSourceDocumentDraftContent(input: {
  title: string;
  formType: TenderSourceDocumentFormType;
  extractedFields: Array<{
    label: string;
    value: string;
    source: string;
    status: "auto" | "review" | "manual";
  }>;
  reviewQuestion?: string | null;
}) {
  const typeLabelMap: Record<TenderSourceDocumentFormType, string> = {
    UNKNOWN: "Форма пока не распознана",
    APPLICATION_FORM: "Форма заявки / согласия",
    PRICE_FORM: "Ценовая форма",
    TECHNICAL_PROPOSAL: "Техническое предложение",
    QUESTIONNAIRE: "Анкета участника",
    DECLARATION: "Декларация / сведения",
    CONTRACT_DRAFT: "Проект договора",
    TECHNICAL_SPEC: "Техническое задание",
    OTHER_APPENDIX: "Приложение",
  };

  const lines = [
    `Черновик заполнения: ${input.title}`,
    `Тип формы: ${typeLabelMap[input.formType]}`,
    "",
  ];

  if (input.extractedFields.length > 0) {
    lines.push("Что можно подставить автоматически:");
    for (const field of input.extractedFields) {
      lines.push(`- ${field.label}: ${field.value} (${field.source})`);
    }
    lines.push("");
  } else {
    lines.push(
      "Система пока не увидела достаточного количества полей для уверенной автоподстановки."
    );
    lines.push("");
  }

  lines.push("Что сотруднику нужно проверить:");
  lines.push(
    input.reviewQuestion?.trim() ||
      "Проверь структуру формы, нестандартные поля и корректность переноса значений."
  );

  return lines.join("\n").trim();
}

function buildSourceDocumentStructuredFields(
  extractedFields: Array<{
    label: string;
    value: string;
    source: string;
    status: "auto" | "review" | "manual";
  }>,
  reviewQuestion?: string | null
) {
  const rows = extractedFields.map((field) => ({
    fieldName: field.label,
    suggestedValue: field.value,
    source: field.source,
    fillMode: field.status === "auto" ? "Авто" : field.status === "review" ? "Проверить" : "Вручную",
    comment:
      field.status === "auto"
        ? "Можно подставить автоматически."
        : field.status === "review"
          ? "Нужно проверить перед переносом в форму."
          : "Поле лучше заполнить вручную.",
  }));

  if (reviewQuestion?.trim()) {
    rows.push({
      fieldName: "Вопрос к проверке",
      suggestedValue: reviewQuestion.trim(),
      source: "система",
      fillMode: "Проверить",
      comment: "Это не поле формы, а подсказка сотруднику, что нужно проверить.",
    });
  }

  return rows;
}

function findBestCompanyDocumentMatch(
  requirement: string,
  companyDocuments: Array<{
    id: number;
    title: string;
    fileName: string | null;
    notes: string | null;
  }>
) {
  const keywords = getDocumentKeywords(requirement);

  let bestScore = 0;
  let bestMatch: (typeof companyDocuments)[number] | null = null;

  for (const document of companyDocuments) {
    const haystack = normalizeSearchText(
      `${document.title} ${document.fileName ?? ""} ${document.notes ?? ""}`
    );
    let score = 0;

    for (const keyword of keywords) {
      if (haystack.includes(keyword)) score += 1;
    }

    if (score > bestScore) {
      bestScore = score;
      bestMatch = document;
    }
  }

  return bestScore > 0 ? bestMatch : null;
}

function parseTechnicalItemDetails(detailLines: string[]) {
  const characteristics: string[] = [];
  let quantity: string | null = null;
  let unit: string | null = null;

  for (const rawLine of detailLines) {
    const line = cleanTechnicalText(rawLine);
    if (!line || isLikelyHeaderLine(line)) continue;

    if (!quantity && isQuantityToken(line)) {
      quantity = line;
      continue;
    }

    if (!unit && isUnitToken(line)) {
      unit = line;
      continue;
    }

    const inlineMatch = line.match(
      /^(.*?)(?:\s+|,)(шт|штука|уп|упаковка|м|м\.п\.|кг|км|л|пара|пар|компл|комплект|набор|рул|рулон|секции?|ед\.?|тонн?[аы]?|т)\s+(\d+(?:[.,]\d+)?)$/i
    );
    if (inlineMatch) {
      const titlePart = cleanTechnicalText(inlineMatch[1]);
      if (titlePart) characteristics.push(titlePart);
      unit ??= inlineMatch[2];
      quantity ??= inlineMatch[3];
      continue;
    }

    characteristics.push(line);
  }

  return {
    quantity,
    unit,
    rawCharacteristics: characteristics.length ? characteristics.join("; ") : null,
  };
}

function inferTechnicalItemMetadata(
  requestedName: string,
  rawCharacteristics?: string | null
) {
  const joined = `${requestedName}\n${rawCharacteristics ?? ""}`.trim();
  const normalized = joined.toUpperCase();
  const explicit = looksLikeExplicitModel(requestedName);

  let identifiedProduct: string | null = null;
  let identifiedBrand: string | null = null;
  let identifiedModel: string | null = null;
  let identificationBasis: string;
  let confidence = explicit ? 90 : 45;
  let reviewQuestion: string | null = explicit
    ? null
    : "Нужно проверить характеристики позиции и понять, что именно заложил заказчик.";
  let pricingReady = explicit;
  let status: TenderTechnicalItemStatusValue = explicit ? "EXPLICIT" : "REVIEW";

  if (/\bWAGO\b/.test(normalized)) {
    identifiedBrand = "WAGO";
    identifiedProduct = "клемма";
    confidence = Math.max(confidence, 92);
  } else if (/\bIEK\b/.test(normalized)) {
    identifiedBrand = "IEK";
  } else if (/\bLD\b/.test(normalized)) {
    identifiedBrand = "LD";
    identifiedProduct = "кран шаровой";
  } else if (/\bREXANT\b/.test(normalized)) {
    identifiedBrand = "REXANT";
  }

  if (/КЛЕММ/.test(normalized)) identifiedProduct ??= "клемма";
  if (/СТЯЖК/.test(normalized)) identifiedProduct ??= "стяжка кабельная";
  if (/КОЛПАЧОК ЗАЩИТН/.test(normalized)) identifiedProduct ??= "колпачок защитный";
  if (/САЛЬНИК/.test(normalized)) identifiedProduct ??= "сальник кабельный";
  if (/ВИЛКА|РОЗЕТКА|СШР/.test(normalized)) identifiedProduct ??= "разъем";
  if (/НАКОНЕЧНИК/.test(normalized)) identifiedProduct ??= "кабельный наконечник";
  if (/ГИЛЬЗ/.test(normalized)) identifiedProduct ??= "кабельная гильза";
  if (/СОЕДИНИТЕЛ/.test(normalized)) identifiedProduct ??= "соединитель";
  if (/ЗАЖИМ/.test(normalized)) identifiedProduct ??= "зажим";
  if (/КЛАПАН/.test(normalized)) identifiedProduct ??= "клапан";
  if (/ЗАДВИЖК/.test(normalized)) identifiedProduct ??= "задвижка";
  if (/КРАН ШАРОВ/.test(normalized)) identifiedProduct ??= "кран шаровой";
  if (/ВЕНТИЛ/.test(normalized)) identifiedProduct ??= "вентиль";
  if (/АРМАТУР/.test(normalized)) identifiedProduct ??= "трубопроводная арматура";

  const modelMatch =
    normalized.match(/\b(WAGO\s?\d{2,4}-\d{2,4}|KZ-\d+-\d+|PG\s?\d+|CV-\d+|ЗНИ-\d+(?:,\d+)?|ТА\s?\d+-\d+-[\d,]+|ТАМ-\d+-\d+-[\d,]+|ТМЛ?\s?\d+-\d+-[\d,]+|СШР\d+[A-ZА-Я0-9]+|4СБ\s?\d+\/\d+|2НБ[-\s]?\d+(?:\/\d+)?|\d{1,2}[А-ЯA-Z]{1,2}\d{1,2}[А-ЯA-Z]{1,4}|КШ\.[А-ЯA-Z.0-9-]+)\b/i) ??
    normalized.match(/\b[А-ЯA-Z0-9.-]{3,}\b/);

  identifiedModel = modelMatch?.[1] ?? modelMatch?.[0] ?? null;

  if (!explicit && identifiedProduct && identifiedModel) {
    status = "IDENTIFIED";
    confidence = 72;
    pricingReady = true;
    reviewQuestion = null;
    identificationBasis =
      "По названию позиции и характеристикам удалось выделить тип товара и вероятную модель, поэтому позицию можно передавать в просчёт после быстрой проверки.";
  } else if (explicit) {
    identificationBasis =
      "В названии позиции есть явная модель, артикул или бренд, поэтому её можно сразу передавать в просчёт.";
  } else if (identifiedProduct) {
    confidence = 58;
    identificationBasis =
      "По названию и характеристикам удалось понять тип товара, но модель или производитель ещё нужно подтвердить.";
  } else {
    identificationBasis =
      "В позиции нет достаточно явной модели. Сначала нужно определить товар по характеристикам.";
  }

  return {
    status,
    identifiedProduct: identifiedProduct ?? (explicit ? requestedName.replace(/\s+или\s+эквивалент/gi, "") : null),
    identifiedBrand,
    identifiedModel,
    identificationBasis,
    confidence,
    reviewQuestion,
    pricingReady,
  };
}

function buildTechnicalItemDraft(
  requestedName: string,
  lineNumber?: number,
  rawCharacteristics?: string | null,
  quantity?: string | null,
  unit?: string | null
) {
  const inferred = inferTechnicalItemMetadata(requestedName, rawCharacteristics);

  return {
    lineNumber: typeof lineNumber === "number" && Number.isFinite(lineNumber) ? lineNumber : null,
    requestedName,
    quantity: quantity ?? null,
    unit: unit ?? null,
    rawCharacteristics: rawCharacteristics ?? null,
    ...inferred,
  };
}

function extractTechnicalItemsFromText(sourceText: string) {
  const lines = sourceText
    .split("\n")
    .map((line) => line.replace(/\t+/g, " ").trim())
    .filter(Boolean);

  const result: Array<{
    lineNumber: number | null;
    requestedName: string;
    quantity?: string | null;
    unit?: string | null;
    rawCharacteristics?: string | null;
    status: TenderTechnicalItemStatusValue;
    identifiedProduct?: string | null;
    identifiedBrand?: string | null;
    identifiedModel?: string | null;
    identificationBasis?: string | null;
    confidence?: number | null;
    reviewQuestion?: string | null;
    pricingReady: boolean;
  }> = [];

  function collectDetailLines(startIndex: number) {
    const details: string[] = [];
    let cursor = startIndex;

    while (cursor < lines.length) {
      const next = lines[cursor];
      if (/^(\d{1,3})[.)]?\s+.+$/.test(next) || /^\d{1,3}$/.test(next)) break;
      details.push(next);
      cursor += 1;
    }

    return { details, nextIndex: cursor - 1 };
  }

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const directMatch = line.match(/^(\d{1,3})[.)]?\s+(.+)$/);
    if (directMatch) {
      const lineNumber = Number(directMatch[1]);
      const requestedName = cleanTechnicalText(directMatch[2]);
      if (requestedName.length > 2) {
        const { details, nextIndex } = collectDetailLines(index + 1);
        const parsedDetails = parseTechnicalItemDetails(details);
        result.push({
          ...buildTechnicalItemDraft(
            requestedName,
            lineNumber,
            parsedDetails.rawCharacteristics,
            parsedDetails.quantity,
            parsedDetails.unit
          ),
        });
        index = nextIndex;
      }
      continue;
    }

    if (/^\d{1,3}$/.test(line)) {
      const lineNumber = Number(line);
      const requestedName = cleanTechnicalText(lines[index + 1] ?? "");

      if (
        requestedName &&
        requestedName.length > 2 &&
        !/^(№|Ед\.?\s?изм\.?|Кол-во|Количество)$/i.test(requestedName)
      ) {
        const { details, nextIndex } = collectDetailLines(index + 2);
        const parsedDetails = parseTechnicalItemDetails(details);
        result.push({
          ...buildTechnicalItemDraft(
            requestedName,
            lineNumber,
            parsedDetails.rawCharacteristics,
            parsedDetails.quantity,
            parsedDetails.unit
          ),
        });
        index = nextIndex;
      }
    }
  }

  const unique = new Map<string, (typeof result)[number]>();
  for (const item of result) {
    const key = `${item.lineNumber ?? "x"}::${item.requestedName.toLowerCase()}`;
    if (!unique.has(key)) unique.set(key, item);
  }

  return [...unique.values()];
}

export async function createTenderProcurementAction(formData: FormData) {
  const prisma = getPrisma();

  const record = await prisma.tenderProcurement.create({
    data: {
      title: String(formData.get("title") ?? "").trim(),
      sourceUrl: normalizeString(formData.get("sourceUrl")),
      customerName: normalizeString(formData.get("customerName")),
      customerInn: normalizeString(formData.get("customerInn")),
      procurementNumber: normalizeString(formData.get("procurementNumber")),
      platform: normalizeString(formData.get("platform")),
      deadline: normalizeDate(formData.get("deadline")),
      nmck: normalizeNumber(formData.get("nmck")),
      nmckWithoutVat: normalizeNumber(formData.get("nmckWithoutVat")),
      itemsCount: normalizeNumber(formData.get("itemsCount")),
      purchaseType: normalizeString(formData.get("purchaseType")),
      summary: normalizeString(formData.get("summary")),
      selectionCriteria: normalizeString(formData.get("selectionCriteria")),
      requiredDocuments: splitLines(formData.get("requiredDocuments")),
      nonstandardRequirements: splitLines(formData.get("nonstandardRequirements")),
      deliveryTerms: normalizeString(formData.get("deliveryTerms")),
      paymentTerms: normalizeString(formData.get("paymentTerms")),
      contractTerm: normalizeString(formData.get("contractTerm")),
      penaltyTerms: normalizeString(formData.get("penaltyTerms")),
      stopFactorsSummary: normalizeString(formData.get("stopFactorsSummary")),
      assignedTo: normalizeString(formData.get("assignedTo")),
      status: TenderProcurementStatus.NEW,
    },
  });

  await logTenderEvent({
    procurementId: record.id,
    actionType: TenderActionType.CREATED,
    title: "Закупка создана",
    description: "Создана первичная карточка закупки.",
    actorName: normalizeString(formData.get("actorName")) ?? "Сотрудник",
  });

  revalidatePath("/");
  revalidatePath("/procurements");
  redirect(`/procurements/${record.id}`);
}

export async function analyzeTenderProcurementAction(formData: FormData) {
  const prisma = getPrisma();
  const procurementId = Number(formData.get("procurementId"));
  const sourceText = String(formData.get("sourceText") ?? "").trim();

  if (!Number.isInteger(procurementId) || procurementId <= 0) {
    throw new Error("Invalid procurement id");
  }

  await prisma.tenderProcurement.update({
    where: { id: procurementId },
    data: {
      sourceText,
      aiAnalysisStatus: "running",
      aiAnalysisError: null,
      status: TenderProcurementStatus.ANALYSIS,
    },
  });

  try {
    const procurement = await prisma.tenderProcurement.findUnique({
      where: { id: procurementId },
    });

    if (!procurement) {
      throw new Error("Procurement not found");
    }

    const { model, result } = await runTenderAiAnalysis({
      title: procurement.title,
      customerName: procurement.customerName,
      customerInn: procurement.customerInn,
      procurementNumber: procurement.procurementNumber,
      platform: procurement.platform,
      itemsCount: procurement.itemsCount,
      nmckWithoutVat: procurement.nmckWithoutVat?.toString() ?? null,
      sourceText,
    });

    await prisma.tenderProcurement.update({
      where: { id: procurementId },
      data: {
        sourceText,
        aiAnalysis: result,
        aiAnalysisStatus: "completed",
        aiAnalysisError: null,
        aiAnalyzedAt: new Date(),
        aiModel: model,
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
        penaltyTerms: result.penalty_terms || null,
        stopFactorsSummary: result.stop_factor_findings.length
          ? result.stop_factor_findings
              .map((item) => `${item.name}: ${item.reason}`)
              .join("\n")
          : "Стоп-факторы в тексте не обнаружены",
      },
    });

    await evaluateTenderStopRules(procurementId);

    await logTenderEvent({
      procurementId,
      actionType: TenderActionType.AI_ANALYZED,
      title: "AI-анализ выполнен",
      description: "Структурная выжимка сформирована и применена к карточке закупки.",
      actorName: "AI",
      metadata: {
        model,
        stopFactorFindings: result.stop_factor_findings.length,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Не удалось выполнить AI-анализ";

    await prisma.tenderProcurement.update({
      where: { id: procurementId },
      data: {
        sourceText,
        aiAnalysisStatus: "failed",
        aiAnalysisError: message,
      },
    });
  }

  revalidatePath(`/procurements/${procurementId}`);
  redirect(`/procurements/${procurementId}`);
}

export async function saveTenderPricingReviewAction(formData: FormData) {
  const prisma = getPrisma();
  const procurementId = Number(formData.get("procurementId"));
  const actorName = normalizeString(formData.get("actorName")) ?? "AI/Сотрудник";
  const pricingStatus = String(formData.get("pricingStatus") ?? "").trim() || null;
  const approximatePurchasePrice = normalizeNumber(
    formData.get("approximatePurchasePrice")
  );
  const sourceSummary = normalizeString(formData.get("sourceSummary"));
  const aiComment = normalizeString(formData.get("aiComment"));
  const sourceLinks = splitLines(formData.get("sourceLinks")) ?? [];

  await prisma.tenderPricingReview.create({
    data: {
      procurementId,
      approximatePurchasePrice,
      pricingStatus,
      sourceSummary,
      aiComment,
      sourceLinks,
      createdBy: actorName,
    },
  });

  await prisma.tenderProcurement.update({
    where: { id: procurementId },
    data: {
      approximatePurchasePrice,
      pricingComment: aiComment ?? sourceSummary,
      pricingStatus,
      pricingReviewedAt: new Date(),
      status:
        pricingStatus === "profitable"
          ? TenderProcurementStatus.PRICING
          : pricingStatus === "low_margin"
            ? TenderProcurementStatus.PRICING
            : TenderProcurementStatus.PRICING,
    },
  });

  await logTenderEvent({
    procurementId,
    actionType: TenderActionType.PRICING_UPDATED,
    title: "Предпросчёт обновлён",
    description:
      pricingStatus === "not_found"
        ? "Цены не найдены, закупка требует ручной проверки."
        : pricingStatus === "low_margin"
          ? "Найденные цены дают низкую рентабельность."
          : "Добавлен результат предпросчёта по закупке.",
    actorName,
    metadata: {
      pricingStatus,
      approximatePurchasePrice,
      sourceLinksCount: sourceLinks.length,
    },
  });

  revalidatePath(`/procurements/${procurementId}`);
}

export async function saveTenderDecisionAction(formData: FormData) {
  const prisma = getPrisma();
  const procurementId = Number(formData.get("procurementId"));
  const companyProfileId = Number(formData.get("companyProfileId"));
  const actorName = normalizeString(formData.get("actorName")) ?? "Руководитель";
  const decision = String(formData.get("decision") ?? "").trim() as TenderDecision;
  const approvedBidAmount = normalizeNumber(formData.get("approvedBidAmount"));
  const comment = normalizeString(formData.get("comment"));

  await prisma.tenderDecisionRecord.create({
    data: {
      procurementId,
      companyProfileId:
        Number.isInteger(companyProfileId) && companyProfileId > 0
          ? companyProfileId
          : null,
      decision,
      approvedBidAmount,
      comment,
      decidedBy: actorName,
    },
  });

  await prisma.tenderProcurement.update({
    where: { id: procurementId },
    data: {
      decision,
      companyProfileId:
        Number.isInteger(companyProfileId) && companyProfileId > 0
          ? companyProfileId
          : null,
      approvedBidAmount,
      decisionComment: comment,
      decisionMadeAt: new Date(),
      status: getDecisionStatus(decision),
      bidPrice: decision === TenderDecision.SUBMIT ? approvedBidAmount : undefined,
    },
  });

  await logTenderEvent({
    procurementId,
    actionType: TenderActionType.DECISION_MADE,
    title: "Решение руководителя зафиксировано",
    description: comment ?? null,
    actorName,
    metadata: {
      decision,
      companyProfileId:
        Number.isInteger(companyProfileId) && companyProfileId > 0
          ? companyProfileId
          : null,
      approvedBidAmount,
    },
  });

  revalidatePath(`/procurements/${procurementId}`);
}

export async function markTenderDocumentsPreparedAction(formData: FormData) {
  const prisma = getPrisma();
  const procurementId = Number(formData.get("procurementId"));
  const actorName = normalizeString(formData.get("actorName")) ?? "Ответственный сотрудник";
  const note = normalizeString(formData.get("note"));

  await prisma.tenderProcurement.update({
    where: { id: procurementId },
    data: {
      status: TenderProcurementStatus.READY,
    },
  });

  await logTenderEvent({
    procurementId,
    actionType: TenderActionType.DOCUMENTS_PREPARED,
    title: "Документы подготовлены",
    description: note ?? "Пакет документов готов к проверке и выгрузке на площадку.",
    actorName,
  });

  revalidatePath(`/procurements/${procurementId}`);
}

export async function markTenderSubmittedAction(formData: FormData) {
  const prisma = getPrisma();
  const procurementId = Number(formData.get("procurementId"));
  const actorName = normalizeString(formData.get("actorName")) ?? "Ответственный сотрудник";
  const note = normalizeString(formData.get("note"));

  await prisma.tenderProcurement.update({
    where: { id: procurementId },
    data: {
      status: TenderProcurementStatus.SUBMITTED,
    },
  });

  await logTenderEvent({
    procurementId,
    actionType: TenderActionType.SUBMITTED,
    title: "Заявка подана",
    description: note ?? "Сотрудник выгрузил документы на площадку и подтвердил подачу.",
    actorName,
  });

  revalidatePath(`/procurements/${procurementId}`);
}

export async function updateTenderSubmissionDeskAction(formData: FormData) {
  const prisma = getPrisma();
  const procurementId = Number(formData.get("procurementId"));
  const actorName = normalizeString(formData.get("actorName")) ?? "Сотрудник";
  const assignedTo = normalizeString(formData.get("assignedTo"));
  const note = normalizeString(formData.get("note"));

  await prisma.tenderProcurement.update({
    where: { id: procurementId },
    data: {
      assignedTo,
    },
  });

  await logTenderEvent({
    procurementId,
    actionType: TenderActionType.NOTE_ADDED,
    title: "Обновлено рабочее место подающего",
    description:
      note ??
      (assignedTo
        ? `Ответственный за подачу: ${assignedTo}.`
        : "Ответственный за подачу очищен."),
    actorName,
    metadata: {
      assignedTo,
    },
  });

  revalidatePath(`/procurements/${procurementId}`);
}

export async function updateTenderProcurementStatusAction(formData: FormData) {
  const prisma = getPrisma();
  const procurementId = Number(formData.get("procurementId"));
  const actorName = normalizeString(formData.get("actorName")) ?? "Сотрудник";
  const status = String(formData.get("status") ?? "").trim() as TenderProcurementStatus;
  const note = normalizeString(formData.get("note"));

  await prisma.tenderProcurement.update({
    where: { id: procurementId },
    data: { status },
  });

  await logTenderEvent({
    procurementId,
    actionType: TenderActionType.STATUS_UPDATED,
    title: "Статус изменён вручную",
    description: note ?? `Статус переведён в "${status}".`,
    actorName,
    metadata: { status },
  });

  revalidatePath(`/procurements/${procurementId}`);
}

export async function createTenderRuleAction(formData: FormData) {
  const prisma = getPrisma();
  const name = String(formData.get("name") ?? "").trim();

  if (!name) {
    throw new Error("Rule name is required");
  }

  const code =
    String(formData.get("code") ?? "")
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9_]+/g, "_") || `RULE_${Date.now()}`;

  await prisma.tenderStopRule.create({
    data: {
      code,
      name,
      description: normalizeString(formData.get("description")),
      kind: (String(formData.get("kind") ?? "OTHER").trim() as TenderRuleKind) || "OTHER",
      sortOrder: normalizeNumber(formData.get("sortOrder")) ?? 100,
      isActive: String(formData.get("isActive") ?? "on") === "on",
      isToggleable: String(formData.get("isToggleable") ?? "on") === "on",
      requiresManualReview:
        String(formData.get("requiresManualReview") ?? "") === "on",
      customerInn: normalizeString(formData.get("customerInn")),
      manufacturerName: normalizeString(formData.get("manufacturerName")),
      brandName: normalizeString(formData.get("brandName")),
      keyword: normalizeString(formData.get("keyword")),
      thresholdPercent: normalizeNumber(formData.get("thresholdPercent")),
    },
  });

  revalidatePath("/rules");
}

export async function toggleTenderRuleAction(formData: FormData) {
  const prisma = getPrisma();
  const ruleId = Number(formData.get("ruleId"));
  const nextValue = String(formData.get("nextValue") ?? "") === "true";

  await prisma.tenderStopRule.update({
    where: { id: ruleId },
    data: { isActive: nextValue },
  });

  revalidatePath("/rules");
}

export async function saveTenderCompanyProfileAction(formData: FormData) {
  const prisma = getPrisma();
  const companyId = Number(formData.get("companyId"));

  const payload = {
    name: String(formData.get("name") ?? "").trim(),
    legalName: normalizeString(formData.get("legalName")),
    inn: normalizeString(formData.get("inn")),
    kpp: normalizeString(formData.get("kpp")),
    ogrn: normalizeString(formData.get("ogrn")),
    registrationDate: normalizeDate(formData.get("registrationDate")),
    directorName: normalizeString(formData.get("directorName")),
    email: normalizeString(formData.get("email")),
    phone: normalizeString(formData.get("phone")),
    legalAddress: normalizeString(formData.get("legalAddress")),
    postalAddress: normalizeString(formData.get("postalAddress")),
    okpo: normalizeString(formData.get("okpo")),
    oktmo: normalizeString(formData.get("oktmo")),
    activityCode: normalizeString(formData.get("activityCode")),
    activityDescription: normalizeString(formData.get("activityDescription")),
    bankName: normalizeString(formData.get("bankName")),
    bankBik: normalizeString(formData.get("bankBik")),
    bankAccount: normalizeString(formData.get("bankAccount")),
    correspondentAccount: normalizeString(formData.get("correspondentAccount")),
    notes: normalizeString(formData.get("notes")),
    isPrimary: String(formData.get("isPrimary") ?? "") === "on",
  };

  if (!payload.name) {
    throw new Error("Company name is required");
  }

  if (Number.isInteger(companyId) && companyId > 0) {
    await prisma.tenderCompanyProfile.update({
      where: { id: companyId },
      data: payload,
    });
  } else {
    await prisma.tenderCompanyProfile.upsert({
      where: {
        inn: payload.inn ?? `missing-inn-${Date.now()}`,
      },
      update: payload,
      create: payload,
    });
  }

  revalidatePath("/companies");
}

export async function saveTenderCompanyDocumentAction(formData: FormData) {
  const prisma = getPrisma();
  const companyId = Number(formData.get("companyId"));
  const title = String(formData.get("title") ?? "").trim();

  if (!Number.isInteger(companyId) || companyId <= 0) {
    throw new Error("Company is required");
  }

  if (!title) {
    throw new Error("Document title is required");
  }

  await prisma.tenderCompanyDocument.create({
    data: {
      companyId,
      title,
      documentType:
        (String(formData.get("documentType") ?? "OTHER").trim() as TenderCompanyDocumentType) ||
        TenderCompanyDocumentType.OTHER,
      fileName: normalizeString(formData.get("fileName")),
      notes: normalizeString(formData.get("notes")),
      storagePath: normalizeString(formData.get("storagePath")),
    },
  });

  revalidatePath("/companies");
}

export async function saveTenderProcurementDocumentAction(formData: FormData) {
  const prisma = getPrisma();
  const procurementId = Number(formData.get("procurementId"));
  const companyDocumentId = Number(formData.get("companyDocumentId"));
  const title = String(formData.get("title") ?? "").trim();
  const actorName = normalizeString(formData.get("actorName")) ?? "Сотрудник";

  if (!Number.isInteger(procurementId) || procurementId <= 0) {
    throw new Error("Procurement is required");
  }

  if (!title) {
    throw new Error("Document title is required");
  }

  await prisma.tenderProcurementDocument.create({
    data: {
      procurementId,
      companyDocumentId:
        Number.isInteger(companyDocumentId) && companyDocumentId > 0
          ? companyDocumentId
          : null,
      title,
      category: normalizeString(formData.get("category")),
      fileName: normalizeString(formData.get("fileName")),
      note: normalizeString(formData.get("note")),
      status:
        (String(formData.get("status") ?? "REQUIRED").trim() as TenderProcurementDocumentStatus) ||
        TenderProcurementDocumentStatus.REQUIRED,
    },
  });

  await logTenderEvent({
    procurementId,
    actionType: TenderActionType.NOTE_ADDED,
    title: "Документ добавлен в комплект заявки",
    description: `В чек-лист комплекта добавлен документ: ${title}.`,
    actorName,
    metadata: { title },
  });

  revalidatePath(`/procurements/${procurementId}`);
}

export async function buildTenderProcurementChecklistAction(formData: FormData) {
  const prisma = getPrisma();
  const procurementId = Number(formData.get("procurementId"));
  const actorName = normalizeString(formData.get("actorName")) ?? "Сотрудник";

  if (!Number.isInteger(procurementId) || procurementId <= 0) {
    throw new Error("Procurement is required");
  }

  const procurement = await prisma.tenderProcurement.findUnique({
    where: { id: procurementId },
    include: {
      companyProfile: {
        include: {
          documents: true,
        },
      },
      procurementDocuments: true,
    },
  });

  if (!procurement) {
    throw new Error("Procurement not found");
  }

  const requiredDocuments = Array.isArray(procurement.requiredDocuments)
    ? procurement.requiredDocuments.map(String).map((item) => item.trim()).filter(Boolean)
    : [];

  if (requiredDocuments.length === 0) {
    await logTenderEvent({
      procurementId,
      actionType: TenderActionType.NOTE_ADDED,
      title: "Черновой чек-лист не собран",
      description:
        "В выжимке закупки пока нет списка обязательных документов, поэтому система не смогла собрать черновой комплект.",
      actorName,
    });
    revalidatePath(`/procurements/${procurementId}`);
    return;
  }

  const existingTitles = new Set(
    procurement.procurementDocuments.map((document) => normalizeSearchText(document.title))
  );
  const companyDocuments = procurement.companyProfile?.documents ?? [];

  const toCreate = requiredDocuments
    .filter((title) => !existingTitles.has(normalizeSearchText(title)))
    .map((title) => {
      const companyDocument = findBestCompanyDocumentMatch(title, companyDocuments);

      return {
        procurementId,
        companyDocumentId: companyDocument?.id ?? null,
        title,
        category: inferProcurementDocumentCategory(title),
        fileName: companyDocument?.fileName ?? null,
        note: companyDocument
          ? `Система нашла похожий документ в библиотеке компании: ${companyDocument.title}.`
          : "Похожего документа в библиотеке компании пока не найдено.",
        status: companyDocument
          ? TenderProcurementDocumentStatus.REVIEW
          : TenderProcurementDocumentStatus.MISSING,
      };
    });

  if (toCreate.length > 0) {
    await prisma.tenderProcurementDocument.createMany({
      data: toCreate,
    });
  }

  await logTenderEvent({
    procurementId,
    actionType: TenderActionType.NOTE_ADDED,
    title: "Собран черновой чек-лист комплекта",
    description:
      toCreate.length > 0
        ? `Система добавила ${toCreate.length} документов в комплект на основе выжимки закупки и библиотеки компании.`
        : "Новых документов не добавлено: чек-лист уже был собран ранее.",
    actorName,
    metadata: {
      suggestedCount: toCreate.length,
      requiredDocumentsCount: requiredDocuments.length,
    },
  });

  revalidatePath(`/procurements/${procurementId}`);
}

export async function updateTenderProcurementDocumentStatusAction(formData: FormData) {
  const prisma = getPrisma();
  const procurementDocumentId = Number(formData.get("procurementDocumentId"));
  const procurementId = Number(formData.get("procurementId"));
  const actorName = normalizeString(formData.get("actorName")) ?? "Сотрудник";
  const status =
    (String(formData.get("status") ?? "REQUIRED").trim() as TenderProcurementDocumentStatus) ||
    TenderProcurementDocumentStatus.REQUIRED;
  const note = normalizeString(formData.get("note"));

  if (!Number.isInteger(procurementDocumentId) || procurementDocumentId <= 0) {
    throw new Error("Procurement document is required");
  }

  await prisma.tenderProcurementDocument.update({
    where: { id: procurementDocumentId },
    data: {
      status,
      note: note ?? undefined,
    },
  });

  await logTenderEvent({
    procurementId,
    actionType: TenderActionType.NOTE_ADDED,
    title: "Статус документа обновлён",
    description: note ?? `Документ переведён в статус "${status}".`,
    actorName,
    metadata: { procurementDocumentId, status },
  });

  revalidatePath(`/procurements/${procurementId}`);
}

export async function saveTenderSourceDocumentAction(formData: FormData) {
  const prisma = getPrisma();
  const procurementId = Number(formData.get("procurementId"));
  const title = String(formData.get("title") ?? "").trim();
  const actorName = normalizeString(formData.get("actorName")) ?? "Сотрудник";

  if (!Number.isInteger(procurementId) || procurementId <= 0) {
    throw new Error("Procurement is required");
  }

  if (!title) {
    throw new Error("Document title is required");
  }

  const documentKind = normalizeString(formData.get("documentKind"));
  const contentSnippet = normalizeString(formData.get("contentSnippet"));
  const note = normalizeString(formData.get("note"));
  const analysis = inferSourceDocumentFormAnalysis({
    title,
    documentKind,
    contentSnippet,
    note,
  });

  await prisma.tenderSourceDocument.create({
    data: {
      procurementId,
      title,
      fileName: normalizeString(formData.get("fileName")),
      documentKind,
      contentSnippet,
      status:
        (String(formData.get("status") ?? "UPLOADED").trim() as TenderSourceDocumentStatus) ||
        TenderSourceDocumentStatus.UPLOADED,
      formType: analysis.formType,
      autofillStatus: analysis.autofillStatus,
      extractedSummary: analysis.extractedSummary,
      reviewQuestion: analysis.reviewQuestion,
      note,
    },
  });

  await logTenderEvent({
    procurementId,
    actionType: TenderActionType.NOTE_ADDED,
    title: "Исходный файл закупки добавлен",
    description: `В документацию закупки добавлен файл: ${title}.`,
    actorName,
  });

  revalidatePath(`/procurements/${procurementId}`);
}

export async function updateTenderSourceDocumentStatusAction(formData: FormData) {
  const prisma = getPrisma();
  const sourceDocumentId = Number(formData.get("sourceDocumentId"));
  const procurementId = Number(formData.get("procurementId"));
  const actorName = normalizeString(formData.get("actorName")) ?? "Сотрудник";
  const status =
    (String(formData.get("status") ?? "UPLOADED").trim() as TenderSourceDocumentStatus) ||
    TenderSourceDocumentStatus.UPLOADED;
  const note = normalizeString(formData.get("note"));

  if (!Number.isInteger(sourceDocumentId) || sourceDocumentId <= 0) {
    throw new Error("Source document is required");
  }

  await prisma.tenderSourceDocument.update({
    where: { id: sourceDocumentId },
    data: {
      status,
      note: note ?? undefined,
    },
  });

  await logTenderEvent({
    procurementId,
    actionType: TenderActionType.NOTE_ADDED,
    title: "Статус исходного файла обновлён",
    description: note ?? `Файл переведён в статус "${status}".`,
    actorName,
  });

  revalidatePath(`/procurements/${procurementId}`);
}

export async function prepareTenderSourceDocumentsForFillingAction(
  formData: FormData
) {
  const prisma = getPrisma();
  const procurementId = Number(formData.get("procurementId"));
  const actorName = normalizeString(formData.get("actorName")) ?? "Система";

  if (!Number.isInteger(procurementId) || procurementId <= 0) {
    throw new Error("Procurement is required");
  }

  const procurement = await prisma.tenderProcurement.findUnique({
    where: { id: procurementId },
    select: {
      decision: true,
    },
  });

  if (!procurement) {
    throw new Error("Procurement not found");
  }

  if (procurement.decision !== TenderDecision.SUBMIT) {
    await logTenderEvent({
      procurementId,
      actionType: TenderActionType.NOTE_ADDED,
      title: "Формы пока не переведены в разбор",
      description:
        "Сначала нужно зафиксировать решение «Подаём», а уже потом переводить формы заказчика в режим разбора.",
      actorName,
    });
    revalidatePath(`/procurements/${procurementId}`);
    return;
  }

  const updateResult = await prisma.tenderSourceDocument.updateMany({
    where: {
      procurementId,
      status: {
        in: [
          TenderSourceDocumentStatus.UPLOADED,
          TenderSourceDocumentStatus.WAIT_DECISION,
        ],
      },
    },
    data: {
      status: TenderSourceDocumentStatus.READY_FOR_ANALYSIS,
    },
  });

  await logTenderEvent({
    procurementId,
    actionType: TenderActionType.NOTE_ADDED,
    title: "Формы переведены в режим разбора",
    description:
      updateResult.count > 0
        ? `В режим разбора переведено ${updateResult.count} исходных файлов закупки.`
        : "Все исходные файлы уже были готовы к разбору.",
    actorName,
  });

  revalidatePath(`/procurements/${procurementId}`);
}

export async function analyzeTenderSourceDocumentAction(formData: FormData) {
  const prisma = getPrisma();
  const sourceDocumentId = Number(formData.get("sourceDocumentId"));
  const procurementId = Number(formData.get("procurementId"));
  const actorName = normalizeString(formData.get("actorName")) ?? "Система";

  if (!Number.isInteger(sourceDocumentId) || sourceDocumentId <= 0) {
    throw new Error("Source document is required");
  }

  const sourceDocument = await prisma.tenderSourceDocument.findUnique({
    where: { id: sourceDocumentId },
    include: {
      procurement: {
        include: {
          companyProfile: true,
          technicalItems: {
            orderBy: [{ lineNumber: "asc" }, { createdAt: "asc" }],
          },
        },
      },
    },
  });

  if (!sourceDocument) {
    throw new Error("Source document not found");
  }

  const analysis = inferSourceDocumentFormAnalysis({
    title: sourceDocument.title,
    documentKind: sourceDocument.documentKind,
    contentSnippet: sourceDocument.contentSnippet,
    note: sourceDocument.note,
  });
  const extracted = buildSourceDocumentExtractedFields({
    sourceDocument: {
      title: sourceDocument.title,
      documentKind: sourceDocument.documentKind,
      formType: analysis.formType,
      contentSnippet: sourceDocument.contentSnippet,
    },
    procurement: {
      customerName: sourceDocument.procurement.customerName,
      customerInn: sourceDocument.procurement.customerInn,
      procurementNumber: sourceDocument.procurement.procurementNumber,
      approvedBidAmount: sourceDocument.procurement.approvedBidAmount,
    },
    technicalItems: sourceDocument.procurement.technicalItems,
    companyProfile: sourceDocument.procurement.companyProfile,
  });
  const draftContent = buildSourceDocumentDraftContent({
    title: sourceDocument.title,
    formType: analysis.formType,
    extractedFields: extracted.fields,
    reviewQuestion:
      extracted.reviewFields.length > 0
        ? extracted.reviewFields.join(" ")
        : analysis.reviewQuestion,
  });
  const structuredFields = buildSourceDocumentStructuredFields(
    extracted.fields,
    extracted.reviewFields.length > 0
      ? extracted.reviewFields.join(" ")
      : analysis.reviewQuestion
  );

  await prisma.tenderSourceDocument.update({
    where: { id: sourceDocumentId },
    data: {
      formType: analysis.formType,
      autofillStatus: analysis.autofillStatus,
      extractedSummary: analysis.extractedSummary,
      extractedFields: extracted.fields,
      structuredFields,
      draftContent,
      reviewQuestion:
        extracted.reviewFields.length > 0
          ? extracted.reviewFields.join(" ")
          : analysis.reviewQuestion,
      status:
        sourceDocument.status === TenderSourceDocumentStatus.UPLOADED
          ? TenderSourceDocumentStatus.READY_FOR_ANALYSIS
          : sourceDocument.status,
    },
  });

  await logTenderEvent({
    procurementId,
    actionType: TenderActionType.NOTE_ADDED,
    title: "Форма заказчика предварительно распознана",
    description: `Система проанализировала файл "${sourceDocument.title}" и определила его как ${analysis.formType}.`,
    actorName,
    metadata: {
      sourceDocumentId,
      formType: analysis.formType,
      autofillStatus: analysis.autofillStatus,
      extractedFields: extracted.fields.length,
    },
  });

  revalidatePath(`/procurements/${procurementId}`);
}

export async function buildTenderSourceDocumentFieldsAction(formData: FormData) {
  const prisma = getPrisma();
  const sourceDocumentId = Number(formData.get("sourceDocumentId"));
  const procurementId = Number(formData.get("procurementId"));
  const actorName = normalizeString(formData.get("actorName")) ?? "Система";

  if (!Number.isInteger(sourceDocumentId) || sourceDocumentId <= 0) {
    throw new Error("Source document is required");
  }

  const sourceDocument = await prisma.tenderSourceDocument.findUnique({
    where: { id: sourceDocumentId },
  });

  if (!sourceDocument) {
    throw new Error("Source document not found");
  }

  const extractedFields = Array.isArray(sourceDocument.extractedFields)
    ? sourceDocument.extractedFields
        .map((item) => {
          if (!item || typeof item !== "object") return null;
          return item as {
            label: string;
            value: string;
            source: string;
            status: "auto" | "review" | "manual";
          };
        })
        .filter(Boolean) as Array<{
        label: string;
        value: string;
        source: string;
        status: "auto" | "review" | "manual";
      }>
    : [];

  const structuredFields = buildSourceDocumentStructuredFields(
    extractedFields,
    sourceDocument.reviewQuestion
  );

  await prisma.tenderSourceDocument.update({
    where: { id: sourceDocumentId },
    data: {
      structuredFields,
    },
  });

  await logTenderEvent({
    procurementId,
    actionType: TenderActionType.NOTE_ADDED,
    title: "Собрана таблица полей формы",
    description: `Для файла "${sourceDocument.title}" подготовлена структурированная таблица полей.`,
    actorName,
    metadata: { sourceDocumentId, structuredFields: structuredFields.length },
  });

  revalidatePath(`/procurements/${procurementId}`);
}

export async function buildTenderSourceDocumentDraftAction(formData: FormData) {
  const prisma = getPrisma();
  const sourceDocumentId = Number(formData.get("sourceDocumentId"));
  const procurementId = Number(formData.get("procurementId"));
  const actorName = normalizeString(formData.get("actorName")) ?? "Система";

  if (!Number.isInteger(sourceDocumentId) || sourceDocumentId <= 0) {
    throw new Error("Source document is required");
  }

  const sourceDocument = await prisma.tenderSourceDocument.findUnique({
    where: { id: sourceDocumentId },
  });

  if (!sourceDocument) {
    throw new Error("Source document not found");
  }

  const extractedFields = Array.isArray(sourceDocument.extractedFields)
    ? sourceDocument.extractedFields
        .map((item) => {
          if (!item || typeof item !== "object") return null;
          return item as {
            label: string;
            value: string;
            source: string;
            status: "auto" | "review" | "manual";
          };
        })
        .filter(Boolean) as Array<{
        label: string;
        value: string;
        source: string;
        status: "auto" | "review" | "manual";
      }>
    : [];

  const draftContent = buildSourceDocumentDraftContent({
    title: sourceDocument.title,
    formType: sourceDocument.formType,
    extractedFields,
    reviewQuestion: sourceDocument.reviewQuestion,
  });

  await prisma.tenderSourceDocument.update({
    where: { id: sourceDocumentId },
    data: {
      draftContent,
    },
  });

  await logTenderEvent({
    procurementId,
    actionType: TenderActionType.NOTE_ADDED,
    title: "Собран черновик заполнения формы",
    description: `Для файла "${sourceDocument.title}" подготовлен черновик заполнения.`,
    actorName,
    metadata: { sourceDocumentId },
  });

  revalidatePath(`/procurements/${procurementId}`);
}

export async function saveTenderTechnicalItemAction(formData: FormData) {
  const prisma = getPrisma();
  const procurementId = Number(formData.get("procurementId"));
  const requestedName = String(formData.get("requestedName") ?? "").trim();

  if (!Number.isInteger(procurementId) || procurementId <= 0) {
    throw new Error("Procurement is required");
  }

  if (!requestedName) {
    throw new Error("Requested item name is required");
  }

  const status = normalizeTenderTechnicalItemStatus(formData.get("status"));

  const confidence = normalizeNumber(formData.get("confidence"));
  const sourceLinks = splitLines(formData.get("sourceLinks")) ?? [];

  await prisma.tenderTechnicalItem.create({
    data: {
      procurementId,
      lineNumber: normalizeNumber(formData.get("lineNumber")),
      requestedName,
      quantity: normalizeString(formData.get("quantity")),
      unit: normalizeString(formData.get("unit")),
      rawCharacteristics: normalizeString(formData.get("rawCharacteristics")),
      identifiedProduct: normalizeString(formData.get("identifiedProduct")),
      identifiedBrand: normalizeString(formData.get("identifiedBrand")),
      identifiedModel: normalizeString(formData.get("identifiedModel")),
      identificationBasis: normalizeString(formData.get("identificationBasis")),
      approximateUnitPrice: normalizeNumber(formData.get("approximateUnitPrice")),
      sourceSummary: normalizeString(formData.get("sourceSummary")),
      sourceLinks,
      status,
      confidence,
      reviewQuestion: normalizeString(formData.get("reviewQuestion")),
      pricingReady: String(formData.get("pricingReady") ?? "") === "on",
    },
  });

  await logTenderEvent({
    procurementId,
    actionType: TenderActionType.NOTE_ADDED,
    title: "Добавлена позиция ТЗ",
    description: `В технический разбор добавлена позиция: ${requestedName}.`,
    actorName: normalizeString(formData.get("actorName")) ?? "Сотрудник",
    metadata: {
      requestedName,
      status,
      confidence,
    },
  });

  revalidatePath(`/procurements/${procurementId}`);
}

export async function importTenderTechnicalItemsAction(formData: FormData) {
  const prisma = getPrisma();
  const procurementId = Number(formData.get("procurementId"));
  const actorName = normalizeString(formData.get("actorName")) ?? "Сотрудник";
  const sourceText = String(formData.get("sourceText") ?? "").trim();

  if (!Number.isInteger(procurementId) || procurementId <= 0) {
    throw new Error("Procurement is required");
  }

  if (!sourceText) {
    throw new Error("Source text is required");
  }

  const drafts = extractTechnicalItemsFromText(sourceText);

  if (drafts.length === 0) {
    await logTenderEvent({
      procurementId,
      actionType: TenderActionType.NOTE_ADDED,
      title: "Автоимпорт позиций ТЗ не сработал",
      description:
        "В тексте не удалось автоматически выделить позиции. Возможно, нужен другой формат вставки или ручной разбор.",
      actorName,
    });
    revalidatePath(`/procurements/${procurementId}`);
    return;
  }

  const existing = await prisma.tenderTechnicalItem.findMany({
    where: { procurementId },
    select: {
      lineNumber: true,
      requestedName: true,
    },
  });

  const existingKeys = new Set(
    existing.map(
      (item) => `${item.lineNumber ?? "x"}::${item.requestedName.toLowerCase()}`
    )
  );

  const toCreate = drafts.filter((item) => {
    const key = `${item.lineNumber ?? "x"}::${item.requestedName.toLowerCase()}`;
    return !existingKeys.has(key);
  });

  if (toCreate.length > 0) {
    await prisma.tenderTechnicalItem.createMany({
      data: toCreate.map((item) => ({
        procurementId,
        lineNumber: item.lineNumber,
        requestedName: item.requestedName,
        quantity: item.quantity ?? null,
        unit: item.unit ?? null,
        rawCharacteristics: item.rawCharacteristics ?? null,
        identifiedProduct: item.identifiedProduct ?? null,
        identifiedBrand: item.identifiedBrand ?? null,
        identifiedModel: item.identifiedModel ?? null,
        identificationBasis: item.identificationBasis ?? null,
        status: item.status,
        confidence: item.confidence ?? null,
        reviewQuestion: item.reviewQuestion ?? null,
        pricingReady: item.pricingReady,
      })),
    });
  }

  await logTenderEvent({
    procurementId,
    actionType: TenderActionType.NOTE_ADDED,
    title: "Выполнен автоимпорт позиций ТЗ",
    description:
      toCreate.length > 0
        ? `Добавлено ${toCreate.length} позиций в черновой разбор ТЗ.`
        : "Новых позиций не добавлено: все найденные строки уже были в карточке.",
    actorName,
    metadata: {
      importedCount: toCreate.length,
      totalDetected: drafts.length,
    },
  });

  revalidatePath(`/procurements/${procurementId}`);
}

export async function saveTenderStageCommentAction(formData: FormData) {
  const prisma = getPrisma();
  const procurementId = Number(formData.get("procurementId"));
  const stageKey = String(formData.get("stageKey") ?? "").trim();
  const stageTitle = normalizeString(formData.get("stageTitle"));
  const body = String(formData.get("body") ?? "").trim();

  if (!Number.isInteger(procurementId) || procurementId <= 0) {
    throw new Error("Procurement is required");
  }

  if (!stageKey) {
    throw new Error("Stage key is required");
  }

  if (!body) {
    throw new Error("Comment is required");
  }

  const actor = await getTenderActorContext();

  await prisma.tenderStageComment.create({
    data: {
      procurementId,
      stageKey,
      stageTitle,
      body,
      authorId: actor.authorId,
      authorName: actor.actorName,
      authorRole: actor.authorRole,
    },
  });

  await logTenderEvent({
    procurementId,
    actionType: TenderActionType.NOTE_ADDED,
    title: `Добавлен комментарий к этапу «${stageTitle ?? stageKey}»`,
    description: body,
    actorName: actor.actorName,
    metadata: {
      stageKey,
      authorRole: actor.authorRole,
    },
  });

  revalidatePath(`/procurements/${procurementId}`);
}

export async function saveTenderUserAction(formData: FormData) {
  const prisma = getPrisma();
  const currentUser = await getCurrentTenderUser();

  if (!currentUser || currentUser.role !== TenderUserRole.ADMIN) {
    throw new Error("Только администратор может управлять пользователями");
  }

  const userId = normalizeNumber(formData.get("userId"));
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const name = normalizeString(formData.get("name"));
  const password = String(formData.get("password") ?? "").trim();
  const roleRaw = String(formData.get("role") ?? "").trim().toUpperCase();
  const role = Object.values(TenderUserRole).includes(roleRaw as TenderUserRole)
    ? (roleRaw as TenderUserRole)
    : TenderUserRole.OPERATOR;

  if (!email) {
    throw new Error("Email is required");
  }

  if (!userId && !password) {
    throw new Error("Для нового пользователя нужен пароль");
  }

  const bcrypt = await import("bcryptjs");
  const passwordHash = password ? await bcrypt.hash(password, 10) : null;

  if (userId) {
    await prisma.admin.update({
      where: { id: userId },
      data: {
        email,
        name,
        role,
        ...(passwordHash ? { passwordHash } : {}),
      },
    });
  } else {
    await prisma.admin.create({
      data: {
        email,
        name,
        role,
        passwordHash: passwordHash!,
      },
    });
  }

  revalidatePath("/users");
}
