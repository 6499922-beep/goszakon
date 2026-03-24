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
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export const tenderStatusLabels: Record<TenderProcurementStatus, string> = {
  NEW: "Новая",
  ANALYSIS: "На анализе",
  STOPPED: "Стоп",
  PRICING: "Предпросчет",
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
  PRICING: "bg-sky-50 text-sky-700",
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
