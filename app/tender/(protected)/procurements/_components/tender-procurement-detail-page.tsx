import Link from "next/link";
import { redirect } from "next/navigation";
import { TenderProcurementChat } from "@/app/tender/_components/tender-procurement-chat";
import { TenderRecognitionTabs } from "@/app/tender/_components/tender-recognition-tabs";
import { TenderSourceDocumentRerunButton } from "@/app/tender/_components/tender-source-document-rerun-button";
import {
  archiveTenderFromAnalysisAction,
  archiveTenderAfterApprovalAction,
  declineTenderFromPricingAction,
  markTenderDocumentsPreparedAction,
  markTenderSubmittedAction,
  rerunTenderSourceDocumentDeepAnalysisAction,
  sendTenderToApprovalAction,
  sendTenderToSubmissionAction,
  sendTenderToPricingAction,
} from "@/app/tender/actions";
import { getCurrentTenderUser } from "@/lib/admin-auth";
import { getPrisma } from "@/lib/prisma";
import { tenderHasCapability } from "@/lib/tender-permissions";
import { formatTenderMoscowFullDateTime } from "@/lib/tender-format";
import { buildTenderCustomerHref } from "@/lib/tender-customers";

function formatDateTime(value: Date | null | undefined) {
  return formatTenderMoscowFullDateTime(value);
}

function formatCurrency(value: { toString(): string } | null | undefined) {
  if (value == null) return "Не удалось определить";
  const parsed = Number(String(value).replace(",", "."));
  if (!Number.isFinite(parsed)) return String(value);
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 2,
  }).format(parsed);
}

function jsonListToStrings(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.map(String).map((item) => item.trim()).filter(Boolean);
}

function getAiAnalysisObject(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
}

function getAiAnalysisString(value: Record<string, unknown> | null, key: string) {
  const raw = value?.[key];
  return typeof raw === "string" ? raw.trim() : "";
}

function getAiAnalysisList(value: Record<string, unknown> | null, key: string) {
  const raw = value?.[key];
  return jsonListToStrings(raw);
}

function getAiAnalysisCoverageList(value: Record<string, unknown> | null) {
  const raw = value?.analysis_document_coverage;
  return Array.isArray(raw) ? raw : [];
}

function extractStoredDocumentPath(note: string | null | undefined) {
  const match = note?.match(/Файл сохранён:\s*(.+)$/m);
  return match?.[1]?.trim() ?? null;
}

function buildSourceDocumentHref(
  documentId: number | null | undefined,
  storedPath?: string | null
) {
  if (storedPath) return encodeURI(storedPath);
  if (!documentId) return null;
  return `/api/tender/source-document/${documentId}`;
}

function extractLastPathSegment(value: string | null | undefined) {
  const normalized = String(value ?? "").trim();
  if (!normalized) return "";
  const parts = normalized.split("/").filter(Boolean);
  return parts[parts.length - 1] ?? normalized;
}

function cleanDocumentDisplayName(value: string | null | undefined) {
  const normalized = extractLastPathSegment(value)
    .replace(/^[^/]+\.zip\s*\/\s*/i, "")
    .replace(/^[^/]+\.rar\s*\/\s*/i, "")
    .replace(/^\d{8,}(?:[-_]\d+)+[-_]?/i, "")
    .replace(/^\d{6,}[-_]/i, "")
    .replace(/\s+/g, " ")
    .trim();

  return normalized || "Документ";
}

function buildCompactDocumentName(
  title: string | null | undefined,
  fileLabel: string | null | undefined,
  note: string | null | undefined
) {
  const storedPath = extractStoredDocumentPath(note);
  const storedName = cleanDocumentDisplayName(storedPath);
  const label = cleanDocumentDisplayName(fileLabel);
  const titleLabel = cleanDocumentDisplayName(title);
  const display =
    (titleLabel && titleLabel !== "Документ" ? titleLabel : null) ||
    (label && label !== "Документ" ? label : null) ||
    (storedName && storedName !== "Документ" ? storedName : null) ||
    "Документ";

  return display
    .replace(/\.(docx|doc|xlsx|xls|pdf|txt)$/i, (match) => match.toLowerCase())
    .trim();
}

function inferDocumentKind(
  title: string | null | undefined,
  fileLabel: string | null | undefined,
  note: string | null | undefined,
  contentSnippet?: string | null | undefined,
  documentKind?: string | null | undefined,
  formType?: string | null | undefined
) {
  const titleHaystack = normalizeSearchText(
    `${title ?? ""} ${fileLabel ?? ""} ${extractStoredDocumentPath(note) ?? ""} ${documentKind ?? ""} ${formType ?? ""}`
  );
  const contentHaystack = normalizeSearchText(contentSnippet ?? "");
  const haystack = `${titleHaystack} ${contentHaystack}`.trim();

  if (formType === "PRICE_FORM") return "Ценовая таблица";
  if (formType === "TECHNICAL_SPEC") return "Товарная таблица";
  if (formType === "CONTRACT_DRAFT") return "Договор";
  if (formType === "APPLICATION_FORM") return "Форма заявки";
  if (formType === "TECHNICAL_PROPOSAL") return "Техническое предложение";
  if (formType === "QUESTIONNAIRE") return "Анкета";
  if (formType === "DECLARATION") return "Декларация";

  if (
    /проект договора|договор/i.test(titleHaystack) ||
    /проект договора/i.test(String(documentKind ?? ""))
  ) {
    return "Договор";
  }

  if (
    /нмц|обоснован|ценов|калькул|стоим|price/i.test(titleHaystack) &&
    /\.xls|\.xlsx|\.doc|\.docx|\.pdf/i.test(titleHaystack)
  ) {
    return titleHaystack.includes("нмц") || titleHaystack.includes("обоснован")
      ? "НМЦК"
      : "Ценовая таблица";
  }

  if (
    /техническ.*задан|тз|проектно-техническ|техническ.*част/i.test(titleHaystack) ||
    /техническое задание/i.test(String(documentKind ?? ""))
  ) {
    return "ТЗ";
  }

  if (
    /извещ/i.test(titleHaystack) ||
    /документац.*закупк/i.test(titleHaystack) ||
    /документ закупки/i.test(String(documentKind ?? ""))
  ) {
    return "Извещение";
  }

  if (/коммерческ/i.test(titleHaystack)) {
    return "Коммерческая часть";
  }

  if (
    /компактная таблица позиций|позиции для анализа|наименован|ед\.? ?изм|колич|цена|сумм/i.test(
      contentHaystack
    )
  ) {
    if (/нмц|цена|стоим|итого|ндс|обеспеч|обоснован/i.test(contentHaystack)) {
      return "Ценовая таблица";
    }

    return "Товарная таблица";
  }

  if (titleHaystack.includes("ценов")) return "Ценовая форма";
  if (titleHaystack.includes("заявк")) return "Форма заявки";
  if (titleHaystack.includes("нмц") || titleHaystack.includes("обоснован")) return "НМЦК";
  if (titleHaystack.includes("специфик")) return "Спецификация";
  if (titleHaystack.includes("приложен")) return "Приложение";
  if (haystack.includes(".xlsx") || haystack.includes(".xls")) return "Таблица";
  if (haystack.includes(".pdf")) return "PDF";
  if (haystack.includes(".docx") || haystack.includes(".doc")) return "Документ";
  return "Файл";
}

function getDocumentKindOrder(kindLabel: string) {
  switch (kindLabel) {
    case "Извещение":
      return 1;
    case "ТЗ":
      return 2;
    case "Товарная таблица":
      return 3;
    case "Договор":
      return 4;
    case "Коммерческая часть":
      return 5;
    case "Ценовая таблица":
      return 6;
    case "Ценовая форма":
      return 7;
    case "НМЦК":
      return 8;
    case "Форма заявки":
      return 9;
    case "Спецификация":
      return 10;
    case "Приложение":
      return 11;
    default:
      return 20;
  }
}

function getDocumentSectionMeta(kindLabel: string) {
  switch (kindLabel) {
    case "Извещение":
    case "Документ":
    case "PDF":
      return { key: "notice", title: "Извещение и документация", order: 1 };
    case "ТЗ":
    case "Товарная таблица":
    case "Спецификация":
      return { key: "technical", title: "Техническое задание", order: 2 };
    case "Договор":
      return { key: "contract", title: "Договор", order: 3 };
    case "НМЦК":
    case "Ценовая таблица":
    case "Ценовая форма":
    case "Коммерческая часть":
      return { key: "pricing", title: "НМЦК и цены", order: 4 };
    case "Форма заявки":
    case "Техническое предложение":
    case "Анкета":
    case "Декларация":
      return { key: "forms", title: "Формы заказчика", order: 5 };
    default:
      return { key: "other", title: "Приложения и прочее", order: 6 };
  }
}

function getPrimaryDocumentScore(
  sectionKey: string,
  item: {
    kindLabel: string;
    title: string;
    coverage: { included: boolean };
  }
) {
  const title = normalizeSearchText(item.title);
  let score = item.coverage.included ? 30 : 0;

  switch (sectionKey) {
    case "notice":
      if (item.kindLabel === "Извещение") score += 120;
      if (title.includes("извещ")) score += 60;
      if (title.includes("документац")) score += 40;
      break;
    case "technical":
      if (item.kindLabel === "ТЗ") score += 120;
      if (title.includes("техническ") || title.includes("тз")) score += 60;
      if (item.kindLabel === "Товарная таблица") score += 20;
      break;
    case "contract":
      if (item.kindLabel === "Договор") score += 120;
      if (title.includes("договор")) score += 60;
      break;
    case "pricing":
      if (item.kindLabel === "НМЦК") score += 120;
      if (item.kindLabel === "Ценовая таблица") score += 90;
      if (item.kindLabel === "Ценовая форма") score += 80;
      if (title.includes("нмц")) score += 60;
      if (title.includes("обоснован")) score += 40;
      if (title.includes("цен")) score += 30;
      break;
    case "forms":
      if (item.kindLabel === "Форма заявки") score += 120;
      if (title.includes("форма")) score += 40;
      if (title.includes("заявк")) score += 30;
      break;
    default:
      if (item.kindLabel === "Приложение") score += 20;
      break;
  }

  return score;
}

function findMatchingSourceDocumentForRequirement(
  requirement: string,
  documents: Array<{
    id: number;
    title: string;
    fileLabel: string;
    kindLabel: string;
    href: string | null;
  }>
) {
  const normalizedRequirement = normalizeSearchText(requirement);
  if (!normalizedRequirement) return null;

  const requirementTokens = normalizedRequirement
    .split(/[^a-zа-я0-9]+/i)
    .map((item) => item.trim())
    .filter((item) => item.length >= 4);

  let bestMatch: (typeof documents)[number] | null = null;
  let bestScore = 0;

  for (const document of documents) {
    const haystack = normalizeSearchText(
      `${document.title} ${document.fileLabel} ${document.kindLabel}`
    );

    let score = 0;
    for (const token of requirementTokens) {
      if (haystack.includes(token)) {
        score += 1;
      }
    }

    if (normalizedRequirement.includes("заявк") && haystack.includes("заяв")) score += 2;
    if (normalizedRequirement.includes("договор") && haystack.includes("договор")) score += 2;
    if (normalizedRequirement.includes("цен") && haystack.includes("цен")) score += 2;
    if (normalizedRequirement.includes("техничес") && haystack.includes("тз")) score += 2;
    if (normalizedRequirement.includes("стран") && haystack.includes("заяв")) score += 1;

    if (score > bestScore) {
      bestScore = score;
      bestMatch = document;
    }
  }

  return bestScore > 0 ? bestMatch : null;
}

function isArchiveFileName(value: string | null | undefined) {
  const normalized = String(value ?? "").toLowerCase().trim();
  return normalized.endsWith(".zip") || normalized.endsWith(".rar") || normalized.endsWith(".7z");
}

function extractHumanIssue(note: string | null | undefined) {
  const value = String(note ?? "").trim();
  if (!value) return null;

  const withoutPath = value.replace(/\s*Файл сохранён:\s*\/[^\s]+/g, "").trim();

  if (withoutPath.includes("не удалось разобрать автоматически")) {
    return "Формат пока не удалось разобрать автоматически. Нужна ручная проверка файла.";
  }

  if (withoutPath.includes("Текст из PDF не удалось извлечь автоматически")) {
    return "Не удалось извлечь текст из PDF. Нужно открыть файл и проверить его вручную.";
  }

  if (withoutPath.includes("Текст из DOCX не удалось извлечь автоматически")) {
    return "Не удалось извлечь текст из DOCX. Нужно открыть файл и проверить его вручную.";
  }

  if (withoutPath.includes("Текст из Excel не удалось извлечь автоматически")) {
    return "Не удалось извлечь текст из таблицы Excel. Нужно открыть файл и проверить данные вручную.";
  }

  if (withoutPath.includes("Текст из DOCX удалось извлечь автоматически")) {
    return null;
  }

  if (withoutPath.includes("Текст из PDF удалось извлечь автоматически")) {
    return null;
  }

  if (withoutPath.includes("Текст из Excel удалось извлечь автоматически")) {
    return null;
  }

  return withoutPath;
}

function describeSourceDocument(note: string | null | undefined) {
  const value = String(note ?? "").trim();
  if (!value) {
    return {
      tone: "neutral" as const,
      label: "Текст не извлечён",
      description: "Документ сохранён и доступен для открытия.",
    };
  }

  if (value.includes("Доп. анализ запущен")) {
    return {
      tone: "warning" as const,
      label: "Доп. анализ",
      description: "Файл повторно отправлен на более тщательное распознавание.",
    };
  }

  if (value.includes("не удалось разобрать автоматически")) {
    return {
      tone: "warning" as const,
      label: "Текст не извлечён",
      description: "Формат не удалось разобрать автоматически. Документ сохранён и доступен для открытия.",
    };
  }

  if (value.includes("Текст из PDF не удалось извлечь автоматически")) {
    return {
      tone: "warning" as const,
      label: "Текст не извлечён",
      description: "PDF сохранён, но текст из него не удалось извлечь автоматически.",
    };
  }

  if (value.includes("Текст из DOCX не удалось извлечь автоматически")) {
    return {
      tone: "warning" as const,
      label: "Текст не извлечён",
      description: "DOCX сохранён, но текст из него не удалось извлечь автоматически.",
    };
  }

  if (value.includes("Текст из Excel не удалось извлечь автоматически")) {
    return {
      tone: "warning" as const,
      label: "Текст не извлечён",
      description: "Таблица Excel сохранена, но текст/данные не удалось извлечь автоматически.",
    };
  }

  if (value.includes("Текст из DOCX удалось извлечь автоматически")) {
    return {
      tone: "success" as const,
      label: "Текст извлечён",
      description: "Текст из DOCX извлечён, файл сохранён в закупке.",
    };
  }

  if (value.includes("Текст из DOC удалось извлечь автоматически")) {
    return {
      tone: "success" as const,
      label: "Текст извлечён",
      description: "Текст из DOC извлечён, файл сохранён в закупке.",
    };
  }

  if (value.includes("Текст из PDF удалось извлечь автоматически")) {
    return {
      tone: "success" as const,
      label: "Текст извлечён",
      description: "Текст из PDF извлечён, файл сохранён в закупке.",
    };
  }

  if (value.includes("Текст из Excel удалось извлечь автоматически")) {
    return {
      tone: "success" as const,
      label: "Текст извлечён",
      description: "Текст из Excel извлечён, файл сохранён в закупке.",
    };
  }

  return {
    tone: "neutral" as const,
    label: "Текст не извлечён",
    description: value.replace(/\s*Файл сохранён:\s*\/[^\s]+/g, "").trim() || "Документ сохранён в закупке.",
  };
}

function normalizeSearchText(value: string | null | undefined) {
  return String(value ?? "").toLowerCase().replace(/\s+/g, " ").trim();
}

function normalizeDocumentIdentity(value: string | null | undefined) {
  return normalizeSearchText(value)
    .replace(/^[^/]+\.zip\s*\/\s*/i, "")
    .replace(/^[^/]+\.rar\s*\/\s*/i, "")
    .replace(/\.(docx|doc|xlsx|xls|pdf|txt)$/i, "")
    .trim();
}

function findMatchingDocumentsForRule(
  match: {
    rule: {
      name: string;
      keyword?: string | null;
      brandName?: string | null;
      manufacturerName?: string | null;
      customerInn?: string | null;
    };
  },
  sourceDocuments: Array<{
    id: number;
    title: string;
    fileName: string | null;
    note: string | null;
    contentSnippet: string | null;
  }>
) {
  const terms = [
    match.rule.keyword,
    match.rule.brandName,
    match.rule.manufacturerName,
    match.rule.customerInn,
    match.rule.name,
  ]
    .filter(Boolean)
    .map((item) => String(item).toLowerCase().trim())
    .filter((item) => item.length >= 3);

  if (terms.length === 0) {
    return sourceDocuments.slice(0, 3);
  }

  const ranked = sourceDocuments.filter((document) => {
    const haystack = normalizeSearchText(
      `${document.title} ${document.fileName ?? ""} ${document.contentSnippet ?? ""} ${document.note ?? ""}`
    );
    return terms.some((term) => haystack.includes(term));
  });

  return ranked.length > 0 ? ranked.slice(0, 3) : sourceDocuments.slice(0, 3);
}

function buildRuleDocumentExcerpt(
  match: {
    rule: {
      name: string;
      keyword?: string | null;
      brandName?: string | null;
      manufacturerName?: string | null;
      customerInn?: string | null;
    };
  },
  document: {
    contentSnippet: string | null;
    note: string | null;
  }
) {
  const source = String(document.contentSnippet ?? document.note ?? "").replace(/\s+/g, " ").trim();
  if (!source) return null;

  const terms = [
    match.rule.keyword,
    match.rule.brandName,
    match.rule.manufacturerName,
    match.rule.customerInn,
    match.rule.name,
  ]
    .filter(Boolean)
    .map((item) => String(item).toLowerCase().trim())
    .filter((item) => item.length >= 3);

  const lowered = source.toLowerCase();

  for (const term of terms) {
    const index = lowered.indexOf(term);
    if (index >= 0) {
      const start = Math.max(0, index - 120);
      const end = Math.min(source.length, index + term.length + 180);
      const excerpt = source.slice(start, end).trim();
      return `${start > 0 ? "..." : ""}${excerpt}${end < source.length ? "..." : ""}`;
    }
  }

  return source.length > 240 ? `${source.slice(0, 240).trim()}...` : source;
}

function splitReadableText(value: string | null | undefined) {
  const normalized = String(value ?? "")
    .replace(/\r/g, "")
    .trim();

  if (!normalized) return [];

  const byLines = normalized
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);

  if (byLines.length > 1) {
    return byLines;
  }

  return normalized
    .split(/(?<=[.!?])\s+(?=[А-ЯA-Z0-9])/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function renderReadableText(
  value: string | null | undefined,
  fallback: string,
  maxItems = 4
) {
  const blocks = splitReadableText(value);

  if (blocks.length === 0) {
    return <div className="mt-3 text-sm leading-6 text-slate-600">{fallback}</div>;
  }

  return (
    <div className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
      {blocks.slice(0, maxItems).map((item, index) => (
        <div
          key={`${item}-${index}`}
          className="flex items-start gap-3 rounded-2xl bg-white px-4 py-3"
        >
          <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-[#081a4b]">
            {index + 1}
          </div>
          <div className="min-w-0 flex-1">{item}</div>
        </div>
      ))}
    </div>
  );
}

function renderCompactList(
  items: string[],
  emptyFallback: string
) {
  if (items.length === 0) {
    return (
      <div className="mt-3 text-sm leading-6 text-slate-600">
        {emptyFallback}
      </div>
    );
  }

  return (
    <div className="mt-3 grid gap-2 lg:grid-cols-2">
      {items.map((item, index) => (
        <div
          key={`${item}-${index}`}
          className="flex items-start gap-3 rounded-2xl bg-white px-4 py-3 text-sm leading-6 text-slate-700"
        >
          <div className="mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full bg-[#081a4b]/70" />
          <div className="min-w-0 flex-1">{item}</div>
        </div>
      ))}
    </div>
  );
}

function buildMissingFields(procurement: {
  procurementNumber: string | null;
  customerName: string | null;
  customerInn: string | null;
  nmck: { toString(): string } | null;
  nmckWithoutVat: { toString(): string } | null;
  sourceDocuments: Array<{
    id: number;
    title: string;
    fileName: string | null;
    note: string | null;
  }>;
}) {
  const missing: Array<{
    title: string;
    description: string;
    storagePath?: string | null;
    documentId?: number | null;
    fileLabel?: string | null;
    status: "error" | "ok";
  }> = [];

  if (!procurement.procurementNumber) {
    missing.push({
      title: "Номер закупки не определён",
      description: "Система не смогла уверенно вытащить номер закупки из загруженной документации.",
      status: "error",
    });
  }

  if (!procurement.customerName) {
    missing.push({
      title: "Заказчик не определён",
      description: "Не удалось автоматически определить наименование заказчика.",
      status: "error",
    });
  }

  if (!procurement.customerInn && !procurement.customerName) {
    missing.push({
      title: "ИНН заказчика не определён",
      description: "Не удалось автоматически определить ИНН заказчика.",
      status: "error",
    });
  }

  if (!procurement.nmck && !procurement.nmckWithoutVat) {
    missing.push({
      title: "НМЦ без НДС не определена",
      description: "В документации не нашлось уверенного значения НМЦ без НДС.",
      status: "error",
    });
  }

  for (const item of procurement.sourceDocuments) {
    const issue = extractHumanIssue(item.note);
    if (!issue) continue;

    const storagePath = extractStoredDocumentPath(item.note);
    const isError =
      issue.includes("не удалось") ||
      issue.includes("Нужна ручная проверка") ||
      issue.includes("нужно открыть файл");

    if (isError) {
    missing.push({
      title: item.title || item.fileName || "Документ",
      description: issue,
      storagePath,
      documentId: item.id,
      fileLabel: item.fileName || item.title,
      status: "error",
    });
  }
  }

  return missing.slice(0, 12);
}

type TenderProcurementDetailViewMode = "analysis" | "pricing" | "approval" | "submission";

export async function renderTenderRecognitionDetailPage({
  params,
  viewMode = "analysis",
}: {
  params: Promise<{ id: string }>;
  viewMode?: TenderProcurementDetailViewMode;
}) {
  const currentUser = await getCurrentTenderUser();
  const isPricingView = viewMode === "pricing";
  const isApprovalView = viewMode === "approval";
  const isSubmissionView = viewMode === "submission";
  const requiredCapability = isSubmissionView
    ? "procurement_submission"
    : isApprovalView
    ? "procurement_decision"
    : isPricingView
      ? "procurement_pricing"
      : "procurement_create";

  if (!currentUser || !tenderHasCapability(currentUser.role, requiredCapability)) {
    redirect("/procurements/new");
  }

  const { id } = await params;
  const procurementId = Number(id);

  if (!Number.isInteger(procurementId) || procurementId <= 0) {
    redirect("/procurements/new");
  }

  const prisma = getPrisma();
  const procurement = await prisma.tenderProcurement.findUnique({
    where: { id: procurementId },
    include: {
      sourceDocuments: {
        orderBy: { id: "asc" },
        select: {
          id: true,
          title: true,
          fileName: true,
          documentKind: true,
          formType: true,
          note: true,
          contentSnippet: true,
        },
      },
      stageComments: {
        where: { stageKey: "gpt_chat" },
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          body: true,
          authorName: true,
          createdAt: true,
        },
      },
      ruleMatches: {
        include: {
          rule: {
            select: {
              name: true,
              keyword: true,
              brandName: true,
              manufacturerName: true,
              customerInn: true,
            },
          },
        },
      },
      technicalItems: {
        orderBy: [{ lineNumber: "asc" }, { id: "asc" }],
        select: {
          id: true,
          lineNumber: true,
          requestedName: true,
          quantity: true,
          unit: true,
          identifiedProduct: true,
          identifiedBrand: true,
          identifiedModel: true,
          approximateUnitPrice: true,
        },
      },
    },
  });

  if (!procurement) {
    redirect("/procurements/new");
  }
  const normalizedCustomerInn = procurement.customerInn?.replace(/\D+/g, "").trim() ?? "";
  const innRegistryRecord = normalizedCustomerInn
    ? await prisma.tenderInnRegistry.findFirst({
        where: { isActive: true, inn: normalizedCustomerInn },
        select: {
          id: true,
          inn: true,
          label: true,
          description: true,
        },
      })
    : null;

  const requiredDocuments = jsonListToStrings(procurement.requiredDocuments);
  const nonstandardRequirements = jsonListToStrings(procurement.nonstandardRequirements);
  const aiAnalysis = getAiAnalysisObject(procurement.aiAnalysis);
  const equipmentItems = getAiAnalysisList(aiAnalysis, "equipment_items");
  const rrepRppRequirements = getAiAnalysisString(aiAnalysis, "rrep_rpp_requirements");
  const decree1875Ban = getAiAnalysisString(aiAnalysis, "decree_1875_ban");
  const requiresCommissioning = getAiAnalysisString(aiAnalysis, "requires_commissioning");
  const lotStructure = getAiAnalysisString(aiAnalysis, "lot_structure");
  const militaryAcceptance = getAiAnalysisString(aiAnalysis, "military_acceptance");
  const responsibilityTerms = getAiAnalysisString(aiAnalysis, "responsibility_terms");
  const terminationReasons = getAiAnalysisList(aiAnalysis, "termination_reasons");
  const missingFields = buildMissingFields(procurement);
  const analysisCoverage = getAiAnalysisCoverageList(aiAnalysis);
  const sourceDocuments = procurement.sourceDocuments.map((item) => {
    const storagePath = extractStoredDocumentPath(item.note);
    const compactTitle = buildCompactDocumentName(item.title, item.fileName, item.note);
    const isDeepAnalysisQueued = String(item.note ?? "").includes("Доп. анализ запущен");
    const coverageMatch = analysisCoverage.find((entry) => {
      if (!entry || typeof entry !== "object" || Array.isArray(entry)) return false;
      const record = entry as Record<string, unknown>;
      const title = typeof record.title === "string" ? record.title : "";
      return normalizeDocumentIdentity(title) === normalizeDocumentIdentity(compactTitle);
    }) as Record<string, unknown> | undefined;
    const coverageIncluded = Boolean(
      coverageMatch?.included_in_primary_pack ||
        coverageMatch?.included_in_meta_pack ||
        coverageMatch?.included_in_pricing_pack ||
        coverageMatch?.included_in_requirements_pack ||
        coverageMatch?.included_in_contract_pack ||
        coverageMatch?.included_in_equipment_pack
    );
    const coverageLabel = coverageMatch
      ? coverageIncluded
        ? "Вошёл в AI-анализ"
        : "Не вошёл в AI-анализ"
      : isDeepAnalysisQueued
        ? "Идёт доп. анализ"
      : item.contentSnippet
        ? "Ожидает включения в анализ"
        : "Нет текста для AI";
    const coverageDescription =
      coverageMatch && typeof coverageMatch.note === "string" && coverageMatch.note.trim()
        ? coverageMatch.note.trim()
      : isDeepAnalysisQueued
        ? "Файл уже повторно отправлен на более тщательное распознавание и будет включён в ближайший пересчёт закупки."
      : item.contentSnippet
          ? "Документ сохранён и будет повторно учтён при ближайшем анализе закупки."
          : "По документу не удалось получить достаточно текста для AI-разбора.";
    return {
      id: item.id,
      title: compactTitle,
      fileLabel: item.fileName || item.title || "Документ",
      kindLabel: inferDocumentKind(
        item.title,
        item.fileName,
        item.note,
        item.contentSnippet,
        item.documentKind,
        item.formType
      ),
      href: buildSourceDocumentHref(item.id, storagePath),
      excerpt: item.contentSnippet ? buildRuleDocumentExcerpt(
        {
          rule: {
            name: item.title || item.fileName || "Документ",
          },
        },
        {
          contentSnippet: item.contentSnippet,
          note: item.note,
        }
      ) : null,
      status: describeSourceDocument(item.note),
      coverage: {
        included: coverageIncluded,
        label: coverageLabel,
        description: coverageDescription,
      },
    };
  });
  const finalSourceDocuments = sourceDocuments
    .filter((item) => !isArchiveFileName(item.fileLabel) && !isArchiveFileName(item.title))
    .sort((left, right) => {
      const orderDiff = getDocumentKindOrder(left.kindLabel) - getDocumentKindOrder(right.kindLabel);
      if (orderDiff !== 0) return orderDiff;
      return left.title.localeCompare(right.title, "ru");
    });
  const sourceDocumentSections = Array.from(
    finalSourceDocuments.reduce((accumulator, item) => {
      const section = getDocumentSectionMeta(item.kindLabel);
      const existing = accumulator.get(section.key);

      if (existing) {
        existing.items.push(item);
        return accumulator;
      }

      accumulator.set(section.key, {
        key: section.key,
        title: section.title,
        order: section.order,
        items: [item],
      });
      return accumulator;
    }, new Map<string, { key: string; title: string; order: number; items: typeof finalSourceDocuments }>())
  )
    .map(([, value]) => value)
    .sort((left, right) => left.order - right.order);
  const procurementChatMessages = procurement.stageComments.map((item) => ({
    id: item.id,
    role: item.authorName === "GPT" ? ("assistant" as const) : ("user" as const),
    authorName: item.authorName?.trim() || "Сотрудник",
    body: item.body,
    createdAt: item.createdAt.toISOString(),
  }));
  const equipmentCount = Math.max(
    procurement.itemsCount ?? 0,
    equipmentItems.length
  );
  const positionRows =
    procurement.technicalItems.length > 0
      ? procurement.technicalItems.map((item, index) => {
          const name =
            item.identifiedProduct?.trim() ||
            item.requestedName?.trim() ||
            "Не определено";
          const quantityLabel = item.quantity
            ? `${item.quantity}${item.unit ? ` ${item.unit}` : ""}`
            : "Не указано";
          const details = [
            item.identifiedBrand ? `Бренд: ${item.identifiedBrand}` : null,
            item.identifiedModel ? `Модель: ${item.identifiedModel}` : null,
          ]
            .filter(Boolean)
            .join(" • ");
          const amountLabel = item.approximateUnitPrice
            ? formatCurrency(item.approximateUnitPrice)
            : equipmentCount <= 1 && (procurement.nmck ?? procurement.nmckWithoutVat)
              ? formatCurrency(procurement.nmck ?? procurement.nmckWithoutVat)
              : "Не выделено из НМЦК";

          return {
            key: `tech-${item.id}`,
            index: item.lineNumber ?? index + 1,
            name,
            quantityLabel,
            details,
            amountLabel,
          };
        })
      : equipmentItems.map((item, index) => ({
          key: `ai-${index}`,
          index: index + 1,
          name: item,
          quantityLabel: "Не указано",
          details: "",
          amountLabel:
            equipmentItems.length <= 1 && (procurement.nmck ?? procurement.nmckWithoutVat)
              ? formatCurrency(procurement.nmck ?? procurement.nmckWithoutVat)
              : "Не выделено из НМЦК",
        }));
  const stopFactorState = procurement.ruleMatches.length > 0 ? "stop" : "ok";
  const stopFactorTitle =
    stopFactorState === "stop"
      ? "Выявлены стоп-факторы"
      : "Стоп-факторы не выявлены";
  const stopFactorTone =
    stopFactorState === "stop"
      ? "border-rose-200 bg-rose-50 text-rose-800"
      : "border-emerald-200 bg-emerald-50 text-emerald-800";
  const backHref = isSubmissionView
    ? "/procurements/submission"
    : isApprovalView
    ? "/procurements/approval"
    : isPricingView
      ? "/procurements/pricing"
      : "/procurements/new";
  const backLabel = isSubmissionView
    ? "Назад к заявкам на подачу"
    : isApprovalView
    ? "Назад к заявкам на согласование"
    : isPricingView
      ? "Назад к заявкам на просчёт"
      : "Назад к заявкам";
  const equipmentHref = isSubmissionView
    ? `/procurements/submission/${procurement.id}/equipment`
    : isApprovalView
    ? `/procurements/approval/${procurement.id}/equipment`
    : isPricingView
      ? `/procurements/pricing/${procurement.id}/equipment`
      : `/procurements/recognition/${procurement.id}/equipment`;
  const canSendToPricing =
    !isPricingView &&
    !isApprovalView &&
    !isSubmissionView &&
    tenderHasCapability(currentUser.role, "procurement_initial") &&
    procurement.status !== "PRICING";
  const canSendToApproval =
    isPricingView &&
    tenderHasCapability(currentUser.role, "procurement_pricing") &&
    procurement.status === "PRICING";
  const canSendToSubmission =
    isApprovalView &&
    tenderHasCapability(currentUser.role, "procurement_decision") &&
    procurement.status === "APPROVED";
  const canHandleSubmission =
    isSubmissionView &&
    tenderHasCapability(currentUser.role, "procurement_submission");
  const actorName =
    currentUser.name?.trim() || currentUser.email?.trim() || "Сотрудник";

  return (
    <main className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href={backHref}
            className="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
          >
            {backLabel}
          </Link>
          <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            {isApprovalView
              ? "Этап 3. Согласование"
              : isSubmissionView
                ? "Этап 4. Подача"
              : isPricingView
                ? "Этап 2. Просчёт"
                : "Этап 1. Анализ"}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {canSendToPricing ? (
            <>
              <form action={sendTenderToPricingAction}>
                <input type="hidden" name="procurementId" value={procurement.id} />
                <input type="hidden" name="actorName" value={actorName} />
                <button
                  type="submit"
                  className="inline-flex items-center rounded-full bg-[#081a4b] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#0d2568]"
                >
                  Передать на просчёт
                </button>
              </form>
              <form action={archiveTenderFromAnalysisAction}>
                <input type="hidden" name="procurementId" value={procurement.id} />
                <input type="hidden" name="actorName" value={actorName} />
                <button
                  type="submit"
                  className="inline-flex items-center rounded-full border border-rose-200 bg-white px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-50"
                >
                  Отправить в архив
                </button>
              </form>
            </>
          ) : null}
          {canSendToApproval ? (
            <>
              <form action={sendTenderToApprovalAction}>
                <input type="hidden" name="procurementId" value={procurement.id} />
                <input type="hidden" name="actorName" value={actorName} />
                <button
                  type="submit"
                  className="inline-flex items-center rounded-full bg-[#081a4b] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#0d2568]"
                >
                  Передать на согласование подачи
                </button>
              </form>
              <form action={declineTenderFromPricingAction}>
                <input type="hidden" name="procurementId" value={procurement.id} />
                <input type="hidden" name="actorName" value={actorName} />
                <input type="hidden" name="comment" value="Нерентабельно, отказ." />
                <button
                  type="submit"
                  className="inline-flex items-center rounded-full border border-rose-200 bg-white px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-50"
                >
                  Нерентабельно, отказ
                </button>
              </form>
            </>
          ) : null}
          {canSendToSubmission ? (
            <>
              <form action={sendTenderToSubmissionAction}>
                <input type="hidden" name="procurementId" value={procurement.id} />
                <input type="hidden" name="actorName" value={actorName} />
                <button
                  type="submit"
                  className="inline-flex items-center rounded-full bg-[#081a4b] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#0d2568]"
                >
                  На подачу
                </button>
              </form>
              <form action={archiveTenderAfterApprovalAction}>
                <input type="hidden" name="procurementId" value={procurement.id} />
                <input type="hidden" name="actorName" value={actorName} />
                <input
                  type="hidden"
                  name="comment"
                  value="Нерентабельно, заявка переведена в архив."
                />
                <button
                  type="submit"
                  className="inline-flex items-center rounded-full border border-rose-200 bg-white px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-50"
                >
                  Нерентабельно, в архив
                </button>
              </form>
            </>
          ) : null}
          {canHandleSubmission ? (
            <>
              {procurement.status !== "READY" ? (
                <form action={markTenderDocumentsPreparedAction}>
                  <input type="hidden" name="procurementId" value={procurement.id} />
                  <input type="hidden" name="actorName" value={actorName} />
                  <button
                    type="submit"
                    className="inline-flex items-center rounded-full bg-[#081a4b] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#0d2568]"
                  >
                    Пакет готов
                  </button>
                </form>
              ) : null}
              {procurement.status !== "SUBMITTED" ? (
                <form action={markTenderSubmittedAction}>
                  <input type="hidden" name="procurementId" value={procurement.id} />
                  <input type="hidden" name="actorName" value={actorName} />
                  <button
                    type="submit"
                    className="inline-flex items-center rounded-full border border-emerald-200 bg-white px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50"
                  >
                    Подано
                  </button>
                </form>
              ) : null}
            </>
          ) : null}
          <div className="text-sm text-slate-500">
            Добавлена: {formatDateTime(procurement.createdAt)}
          </div>
        </div>
      </div>

      <section id="recognition-result" className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-2xl font-bold tracking-tight text-[#081a4b]">
              {procurement.procurementNumber
                ? `Закупка № ${procurement.procurementNumber}`
                : "Закупка без определённого номера"}
            </div>
          </div>
        </div>

        <div className="mt-5 space-y-4">
          <TenderRecognitionTabs
            about={
              <div className="space-y-4">
                <div
                  id="stop-factors-result"
                  className={`rounded-3xl border p-4 ${stopFactorTone}`}
                >
                  <div className="text-sm font-semibold uppercase tracking-[0.12em]">
                    Стоп-факторы
                  </div>
                  <div className="mt-2 text-lg font-bold">{stopFactorTitle}</div>
                  {stopFactorState === "stop" ? (
                    <div className="mt-3 space-y-2 text-sm leading-6">
                      {procurement.ruleMatches.map((match) => {
                        const matchingDocuments = findMatchingDocumentsForRule(
                          match,
                          procurement.sourceDocuments
                        );

                        return (
                          <div key={match.id} className="rounded-2xl border border-rose-200/70 bg-white/70 p-3">
                            <div className="font-semibold">Найдено: {match.rule.name}</div>
                            {matchingDocuments.length > 0 ? (
                              <div className="mt-3 space-y-3 text-sm">
                                {matchingDocuments.map((document) => {
                                  const href = buildSourceDocumentHref(
                                    document.id,
                                    extractStoredDocumentPath(document.note)
                                  );
                                  const excerpt = buildRuleDocumentExcerpt(match, document);
                                  return (
                                    <div
                                      key={`${match.id}-${document.title}`}
                                      className="rounded-2xl border border-rose-100 bg-rose-50/40 px-4 py-3"
                                    >
                                      <div className="text-xs font-semibold uppercase tracking-[0.12em] text-rose-600">
                                        Где найдено
                                      </div>
                                      <div className="mt-1 font-medium text-rose-900">
                                        {href ? (
                                          <a
                                            href={href}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-[#9f1239] underline decoration-rose-300 underline-offset-2 hover:text-[#881337]"
                                          >
                                            {document.title}
                                          </a>
                                        ) : (
                                          <span>{document.title}</span>
                                        )}
                                      </div>
                                      {excerpt ? (
                                        <div className="mt-2 rounded-xl bg-white px-3 py-2 text-sm leading-6 text-rose-900">
                                          {excerpt}
                                        </div>
                                      ) : (
                                        <div className="mt-2 text-sm text-rose-700">
                                          Не удалось показать точный фрагмент текста, но документ сохранён и доступен по ссылке выше.
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            ) : null}
                          </div>
                        );
                      })}
                      {procurement.stopFactorsSummary ? <div>{procurement.stopFactorsSummary}</div> : null}
                    </div>
                  ) : (
                    <div className="mt-3 text-sm leading-6">
                      Система не увидела явных стоп-факторов в загруженной документации.
                    </div>
                  )}
                </div>

                {innRegistryRecord ? (
                  <div className="rounded-3xl border border-rose-200 bg-rose-50 p-4 text-rose-900">
                    <div className="text-sm font-semibold uppercase tracking-[0.12em] text-rose-700">
                      ТВАРИ!
                    </div>
                    <div className="mt-2 text-lg font-bold">
                      Компания найдена в реестре
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <Link
                        href={`/registry/${innRegistryRecord.id}`}
                        className="inline-flex rounded-full bg-white px-3 py-1 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
                      >
                        {innRegistryRecord.label}
                      </Link>
                      <span className="inline-flex rounded-full bg-white px-3 py-1 text-sm text-rose-700">
                        ИНН: {innRegistryRecord.inn}
                      </span>
                    </div>
                    {innRegistryRecord.description ? (
                      <div className="mt-3 rounded-2xl bg-white px-4 py-3 text-sm leading-6 text-rose-900">
                        {innRegistryRecord.description}
                      </div>
                    ) : null}
                  </div>
                ) : null}

                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">
                        Номер закупки
                      </div>
                      <div className="mt-2 text-3xl font-bold tracking-tight text-[#081a4b]">
                        {procurement.procurementNumber ?? "Не удалось определить"}
                      </div>
                    </div>
                    <div className="text-right text-sm text-slate-500">
                      <div>Площадка: {procurement.platform ?? "не определена"}</div>
                      <div className="mt-2">
                        {equipmentCount > 0 ? (
                          <Link
                            href={equipmentHref}
                            target="_blank"
                            className="inline-flex items-center gap-1 font-semibold text-[#081a4b] underline decoration-slate-300 underline-offset-2 hover:text-[#0b2a72]"
                          >
                            <span>Позиций:</span>
                            <span>{equipmentCount}</span>
                          </Link>
                        ) : (
                          <span>Позиций: {procurement.itemsCount ?? "не определено"}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-base font-bold text-[#081a4b]">Краткая выжимка</div>
                  <div className="mt-3 grid gap-3 xl:grid-cols-3">
                    <div className="rounded-2xl border border-[#0d5bd7]/15 bg-white px-4 py-4 shadow-sm">
                      <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[#0d5bd7]">
                        Пункт 1
                      </div>
                      <div className="mt-2 text-sm font-semibold text-slate-500">Заказчик</div>
                      {procurement.customerName ? (
                        <Link
                          href={buildTenderCustomerHref(
                            procurement.customerName,
                            procurement.customerInn
                          )}
                          className="mt-1 block text-lg font-bold leading-7 text-[#081a4b] underline decoration-slate-300 underline-offset-4 transition hover:text-[#0d5bd7]"
                        >
                          {procurement.customerName}
                        </Link>
                      ) : (
                        <div className="mt-1 text-lg font-bold leading-7 text-[#081a4b]">
                          Не удалось определить
                        </div>
                      )}
                    </div>
                    <div className="rounded-2xl border border-[#0d5bd7]/15 bg-white px-4 py-4 shadow-sm">
                      <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[#0d5bd7]">
                        Пункт 2
                      </div>
                      <div className="mt-2 text-sm font-semibold text-slate-500">Вид закупки</div>
                      <div className="mt-1 text-lg font-bold leading-7 text-[#081a4b]">
                        {procurement.purchaseType ?? "Не удалось определить"}
                      </div>
                    </div>
                    <div className="rounded-2xl border border-[#0d5bd7]/15 bg-white px-4 py-4 shadow-sm">
                      <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[#0d5bd7]">
                        Пункт 3
                      </div>
                      <div className="mt-2 text-sm font-semibold text-slate-500">Срок подачи</div>
                      <div className="mt-1 text-lg font-bold leading-7 text-[#081a4b]">
                        {formatDateTime(procurement.deadline)}
                      </div>
                    </div>
                  </div>
                  {renderReadableText(
                    [
                      procurement.summary?.trim(),
                      procurement.deliveryTerms?.trim()
                        ? `Место и условия поставки: ${procurement.deliveryTerms.trim()}`
                        : null,
                      procurement.penaltyTerms?.trim()
                        ? `Неустойка: ${procurement.penaltyTerms.trim()}`
                        : null,
                      terminationReasons.length > 0
                        ? `Основания расторжения: ${terminationReasons.join("; ")}`
                        : null,
                    ]
                      .filter(Boolean)
                      .join("\n\n"),
                    "Не удалось определить автоматически",
                    6
                  )}
                </div>
              </div>
            }
            contract={
              <div className="space-y-4">
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-base font-bold text-[#081a4b]">Условия договора</div>
                  <div className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
                    <div className="rounded-2xl bg-white px-4 py-3">
                      <span className="font-medium text-[#081a4b]">Поставка:</span>{" "}
                      {procurement.deliveryTerms ?? "не определено"}
                    </div>
                    <div className="rounded-2xl bg-white px-4 py-3">
                      <span className="font-medium text-[#081a4b]">Оплата:</span>{" "}
                      {procurement.paymentTerms ?? "не определено"}
                    </div>
                    <div className="rounded-2xl bg-white px-4 py-3">
                      <span className="font-medium text-[#081a4b]">Срок договора:</span>{" "}
                      {procurement.contractTerm ?? "не определено"}
                    </div>
                    <div className="rounded-2xl bg-white px-4 py-3">
                      <span className="font-medium text-[#081a4b]">Ответственность по договору:</span>{" "}
                      {responsibilityTerms || procurement.penaltyTerms || "не определено"}
                    </div>
                    <div className="rounded-2xl bg-white px-4 py-3">
                      <span className="font-medium text-[#081a4b]">Неустойка:</span>{" "}
                      {procurement.penaltyTerms ?? "не определено"}
                    </div>
                    <div className="rounded-2xl bg-white px-4 py-3">
                      <span className="font-medium text-[#081a4b]">Основания расторжения:</span>{" "}
                      {terminationReasons.length > 0 ? terminationReasons.join("; ") : "не определено"}
                    </div>
                  </div>
                </div>
              </div>
            }
            requirements={
              <div className="space-y-4">

                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-base font-bold text-[#081a4b]">Нестандартные требования</div>
                  {renderCompactList(
                    nonstandardRequirements,
                    "Явных нестандартных требований автоматически не найдено."
                  )}
                </div>

                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-base font-bold text-[#081a4b]">Требования РРЭП / РПП (2013)</div>
                  <div className="mt-3 rounded-2xl bg-white px-4 py-3 text-sm leading-6 text-slate-700">
                    {rrepRppRequirements || "не указано или не определено"}
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-base font-bold text-[#081a4b]">Запрет по постановлению 1875</div>
                  <div className="mt-3 rounded-2xl bg-white px-4 py-3 text-sm leading-6 text-slate-700">
                    {decree1875Ban || "не указано или не определено"}
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-base font-bold text-[#081a4b]">Пуско-наладочные работы</div>
                  <div className="mt-3 rounded-2xl bg-white px-4 py-3 text-sm leading-6 text-slate-700">
                    {requiresCommissioning || "не указано или не определено"}
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-base font-bold text-[#081a4b]">Делимый лот / несколько победителей</div>
                  <div className="mt-3 rounded-2xl bg-white px-4 py-3 text-sm leading-6 text-slate-700">
                    {lotStructure || "не указано или не определено"}
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-base font-bold text-[#081a4b]">Военная приемка / РТ-Техприемка</div>
                  <div className="mt-3 rounded-2xl bg-white px-4 py-3 text-sm leading-6 text-slate-700">
                    {militaryAcceptance || "не указано или не определено"}
                  </div>
                </div>
              </div>
            }
            sourceDocuments={
              <div className="space-y-4">
                <div id="documents-list" className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="text-base font-bold text-[#081a4b]">Файлы закупки</div>
                      <div className="mt-1 text-sm text-slate-500">
                        Документы сгруппированы по разделам закупки и всегда доступны для открытия.
                      </div>
                    </div>
                    <div className="text-sm text-slate-500">
                      {finalSourceDocuments.length > 0
                        ? `Файлов: ${finalSourceDocuments.length}`
                        : "Файлы пока не определены"}
                    </div>
                  </div>
                  {finalSourceDocuments.length > 0 ? (
                    <div className="mt-4 space-y-4">
                      {sourceDocumentSections.map((section) => (
                        (() => {
                          const rankedItems = [...section.items].sort((left, right) => {
                            const scoreDiff =
                              getPrimaryDocumentScore(section.key, right) -
                              getPrimaryDocumentScore(section.key, left);
                            if (scoreDiff !== 0) return scoreDiff;
                            return left.title.localeCompare(right.title, "ru");
                          });
                          const primaryItem = rankedItems[0];
                          const additionalItems = rankedItems.slice(1);

                          const renderStatusChip = (item: (typeof section.items)[number]) => (
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                item.status.tone === "success"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : item.status.tone === "warning"
                                    ? "bg-amber-100 text-amber-700"
                                    : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {item.status.label}
                            </span>
                          );

                          const renderCoverageChip = (item: (typeof section.items)[number]) => (
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                item.coverage.included
                                  ? "bg-[#0d5bd7]/10 text-[#0d5bd7]"
                                  : item.coverage.label === "Идёт доп. анализ"
                                    ? "bg-amber-100 text-amber-700"
                                    : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {item.coverage.label}
                            </span>
                          );

                          return (
                            <div
                              key={section.key}
                              className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
                            >
                              <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3">
                                <div className="text-sm font-semibold text-[#081a4b]">{section.title}</div>
                                <div className="text-xs font-medium text-slate-500">
                                  {section.items.length} {section.items.length === 1 ? "файл" : section.items.length < 5 ? "файла" : "файлов"}
                                </div>
                              </div>

                              <div className="px-4 py-4">
                                <div className="overflow-hidden rounded-2xl border border-slate-200">
                                  <table className="min-w-full divide-y divide-slate-200 text-sm">
                                    <thead className="bg-white text-left text-slate-500">
                                      <tr>
                                        <th className="px-4 py-3 font-medium">Роль</th>
                                        <th className="px-4 py-3 font-medium">Документ</th>
                                        <th className="px-4 py-3 font-medium">Статус</th>
                                        <th className="px-4 py-3 font-medium">Участие в анализе</th>
                                        <th className="px-4 py-3 text-right font-medium">Открыть</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200 bg-white">
                                      {[primaryItem, ...additionalItems].map((item, index) => {
                                        const isPrimary = item.id === primaryItem.id;
                                        return (
                                          <tr key={`${section.key}-${item.title}-${index}`} className="align-top">
                                            <td className="px-4 py-4">
                                              <div className="flex flex-col gap-2">
                                                <span
                                                  className={`inline-flex w-fit rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] ${
                                                    isPrimary
                                                      ? "bg-emerald-100 text-emerald-700"
                                                      : "bg-slate-100 text-slate-600"
                                                  }`}
                                                >
                                                  {isPrimary ? "Основной" : "Доп."}
                                                </span>
                                                <span className="rounded-full bg-[#081a4b]/8 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#081a4b]">
                                                  {item.kindLabel}
                                                </span>
                                              </div>
                                            </td>
                                            <td className="px-4 py-4">
                                              {item.href ? (
                                                <a
                                                  href={item.href}
                                                  target="_blank"
                                                  rel="noreferrer"
                                                  className="text-sm font-semibold text-[#081a4b] underline-offset-2 hover:text-[#0b2a72] hover:underline"
                                                  title={item.title}
                                                >
                                                  {item.title}
                                                </a>
                                              ) : (
                                                <span className="text-sm font-semibold text-[#081a4b]" title={item.title}>
                                                  {item.title}
                                                </span>
                                              )}
                                            </td>
                                            <td className="px-4 py-4">
                                              <div className="flex flex-col gap-2">
                                                {renderStatusChip(item)}
                                                <div className="text-xs leading-5 text-slate-500">
                                                  {item.status.description}
                                                </div>
                                              </div>
                                            </td>
                                            <td className="px-4 py-4">
                                              <div className="flex flex-col gap-2">
                                                {renderCoverageChip(item)}
                                                <div className="text-xs leading-5 text-slate-500">
                                                  {item.coverage.description}
                                                </div>
                                              </div>
                                            </td>
                                            <td className="px-4 py-4 text-right">
                                              <div className="flex flex-col items-end gap-2">
                                                {item.href ? (
                                                  <a
                                                    href={item.href}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-[#081a4b] transition hover:border-slate-300 hover:bg-slate-50 hover:text-[#0b2a72]"
                                                  >
                                                    Открыть
                                                  </a>
                                                ) : (
                                                  <span className="text-xs text-slate-400">Нет ссылки</span>
                                                )}
                                                {item.status.label !== "Текст извлечён" ? (
                                                  <TenderSourceDocumentRerunButton
                                                    sourceDocumentId={item.id}
                                                    procurementId={procurement.id}
                                                    actorName={actorName}
                                                  />
                                                ) : null}
                                              </div>
                                            </td>
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            </div>
                          );
                        })()
                      ))}
                    </div>
                  ) : (
                    <div className="mt-3 text-sm leading-6 text-slate-600">
                      Документы, которые участвовали в распознавании, пока не сохранены.
                    </div>
                  )}
                </div>
              </div>
            }
            submissionDocuments={
              <div className="space-y-4">
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-base font-bold text-[#081a4b]">Требуемая документация до подачи</div>
                  <div className="mt-2 text-sm leading-6 text-slate-500">
                    Здесь только тот комплект, который система увидела как обязательный для участия в закупке.
                  </div>
                  {requiredDocuments.length > 0 ? (
                    <div className="mt-3 grid gap-2 lg:grid-cols-2">
                      {requiredDocuments.map((item, index) => {
                        const matchedDocument = findMatchingSourceDocumentForRequirement(
                          item,
                          finalSourceDocuments
                        );
                        const content = (
                          <div className="flex items-start gap-3 rounded-2xl bg-white px-4 py-3 text-sm leading-6 text-slate-700">
                            <div className="mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full bg-[#081a4b]/70" />
                            <div className="min-w-0 flex-1">
                              <div>{item}</div>
                              {matchedDocument ? (
                                <div className="mt-2 text-xs font-medium text-slate-500">
                                  Открыть файл: {matchedDocument.title}
                                </div>
                              ) : null}
                            </div>
                          </div>
                        );

                        if (matchedDocument?.href) {
                          return (
                            <a
                              key={`${item}-${index}`}
                              href={matchedDocument.href}
                              target="_blank"
                              rel="noreferrer"
                              className="block transition hover:opacity-90"
                            >
                              {content}
                            </a>
                          );
                        }

                        return <div key={`${item}-${index}`}>{content}</div>;
                      })}
                    </div>
                  ) : (
                    <div className="mt-3 text-sm leading-6 text-slate-600">
                      Не удалось определить автоматически.
                    </div>
                  )}
                </div>
              </div>
            }
            goods={
              <div className="space-y-4">
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="text-base font-bold text-[#081a4b]">Позиции и оборудование</div>
                      <div className="mt-1 text-sm text-slate-500">
                        Всего позиций: {equipmentCount > 0 ? equipmentCount : "не определено"}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="rounded-full bg-white px-3 py-1.5 text-slate-600">
                        НМЦК: {formatCurrency(procurement.nmck ?? procurement.nmckWithoutVat)}
                      </div>
                      <Link
                        href={equipmentHref}
                        target="_blank"
                        className="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-[#081a4b] hover:border-slate-300 hover:bg-slate-100"
                      >
                        Открыть таблицу товаров
                      </Link>
                    </div>
                  </div>
                  {positionRows.length > 0 ? (
                    <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200 bg-white">
                      <table className="min-w-full divide-y divide-slate-200 text-sm">
                        <thead className="bg-slate-50 text-slate-600">
                          <tr className="text-left">
                            <th className="px-4 py-3 font-semibold">№</th>
                            <th className="px-4 py-3 font-semibold">Позиция</th>
                            <th className="px-4 py-3 font-semibold">Кол-во</th>
                            <th className="px-4 py-3 font-semibold">Цена</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {positionRows.map((item) => (
                            <tr key={item.key} className="align-top">
                              <td className="px-4 py-3 font-semibold text-[#081a4b]">{item.index}</td>
                              <td className="px-4 py-3">
                                <div className="font-medium text-slate-800">{item.name}</div>
                                {item.details ? (
                                  <div className="mt-1 text-xs leading-5 text-slate-500">
                                    {item.details}
                                  </div>
                                ) : null}
                              </td>
                              <td className="px-4 py-3 text-slate-700">{item.quantityLabel}</td>
                              <td className="px-4 py-3 text-slate-800">{item.amountLabel}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="mt-3 rounded-2xl bg-white px-4 py-3 text-sm leading-6 text-slate-600">
                      Система пока не смогла уверенно определить перечень оборудования.
                    </div>
                  )}
                </div>

                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-base font-bold text-[#081a4b]">
                    Что не удалось определить автоматически
                  </div>
                  {missingFields.length > 0 ? (
                    <div className="mt-3 grid gap-3 text-sm leading-6 text-slate-700">
                      {missingFields.map((item, index) => (
                        <div
                          key={`${item.title}-${index}`}
                          className={`rounded-2xl border px-4 py-3 ${
                            item.status === "error"
                              ? "border-rose-200 bg-white"
                              : "border-emerald-200 bg-white"
                          }`}
                        >
                          <div className="font-semibold text-[#081a4b]">{item.title}</div>
                          <div className="mt-1 text-sm text-slate-600">{item.description}</div>
                          {item.documentId ? (
                            <div className="mt-2">
                              <a
                                href={
                                  buildSourceDocumentHref(item.documentId, item.storagePath) ?? "#"
                                }
                                target="_blank"
                                rel="noreferrer"
                                className="font-medium text-[#081a4b] underline decoration-slate-300 underline-offset-2 hover:text-[#0b2a72]"
                              >
                                Открыть файл: {item.fileLabel ?? "документ"}
                              </a>
                            </div>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-3 text-sm leading-6 text-slate-600">
                      По базовым полям система сработала уверенно.
                    </div>
                  )}
                </div>
              </div>
            }
            chat={
              <TenderProcurementChat
                procurementId={procurement.id}
                initialMessages={procurementChatMessages}
                sourceDocuments={finalSourceDocuments.map((item) => ({
                  title: item.title,
                  href: item.href,
                }))}
              />
            }
          />
        </div>
      </section>
    </main>
  );
}
