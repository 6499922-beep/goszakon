import { TenderDecision, TenderProcurementStatus } from "@prisma/client";

export function formatTenderCurrency(value: string | number | null | undefined) {
  if (value == null) return "—";

  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(Number(value));
}

export function formatTenderNumber(value: string | number | null | undefined) {
  if (value == null) return "—";

  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return "—";

  return new Intl.NumberFormat("ru-RU", {
    maximumFractionDigits: 2,
  }).format(numeric);
}

export function formatTenderDate(value: Date | string | null | undefined) {
  if (!value) return "—";

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("ru-RU", {
    timeZone: "Europe/Moscow",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function formatMoscowDateParts(
  value: Date | string | null | undefined,
  options: Intl.DateTimeFormatOptions
) {
  if (!value) return null;

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  const parts = new Intl.DateTimeFormat("ru-RU", {
    timeZone: "Europe/Moscow",
    ...options,
  }).formatToParts(date);

  return parts.reduce<Record<string, string>>((acc, part) => {
    if (part.type !== "literal") {
      acc[part.type] = part.value;
    }
    return acc;
  }, {});
}

export function formatTenderMoscowShortDateTime(value: Date | string | null | undefined) {
  const parts = formatMoscowDateParts(value, {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

  if (!parts) return "—";
  return `${parts.day}.${parts.month}, ${parts.hour}:${parts.minute}`;
}

export function formatTenderMoscowFullDateTime(value: Date | string | null | undefined) {
  const parts = formatMoscowDateParts(value, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  if (!parts) return "Не удалось определить";
  return `${parts.day}.${parts.month}.${parts.year}, ${parts.hour}:${parts.minute}`;
}

export const tenderStatusLabels: Record<TenderProcurementStatus, string> = {
  NEW: "Новая",
  ANALYSIS: "На анализе",
  STOPPED: "Стоп",
  PRICING: "На просчёте",
  APPROVED: "Согласовано",
  IN_PREPARATION: "Подготовка",
  READY: "Пакет готов",
  SUBMITTED: "Подано",
  ARCHIVED: "Архив",
};

export const tenderStatusTone: Record<TenderProcurementStatus, string> = {
  NEW: "bg-slate-100 text-slate-700",
  ANALYSIS: "bg-amber-50 text-amber-700",
  STOPPED: "bg-rose-50 text-rose-700",
  PRICING: "bg-slate-100 text-slate-700",
  APPROVED: "bg-emerald-50 text-emerald-700",
  IN_PREPARATION: "bg-indigo-50 text-indigo-700",
  READY: "bg-emerald-50 text-emerald-700",
  SUBMITTED: "bg-emerald-100 text-emerald-800",
  ARCHIVED: "bg-slate-100 text-slate-500",
};

export const tenderDecisionTone: Record<TenderDecision, string> = {
  SUBMIT: "bg-emerald-50 text-emerald-700",
  DECLINE: "bg-rose-50 text-rose-700",
  FAS_COMPLAINT: "bg-amber-50 text-amber-700",
  REWORK: "bg-sky-50 text-sky-700",
};
