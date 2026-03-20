import { MaterialType } from "@prisma/client";

export const materialTypeOptions: Array<{ value: MaterialType; label: string }> = [
  { value: "ANALYTICS", label: "Аналитика" },
  { value: "FAS_PRACTICE", label: "Практика ФАС" },
  { value: "VIOLATIONS", label: "Нарушения" },
  { value: "CONTROVERSIAL", label: "Спорные практики" },
  { value: "NONPAYMENT", label: "Неоплата по контракту" },
  { value: "RNP", label: "РНП" },
  { value: "CUSTOMERS", label: "Заказчикам" },
  { value: "COMPLAINT", label: "Жалобы в ФАС" },
  { value: "COURT", label: "Судебная защита" },
];

export const materialTypeLabels: Record<MaterialType, string> = {
  ANALYTICS: "Аналитика",
  FAS_PRACTICE: "Практика ФАС",
  VIOLATIONS: "Нарушения",
  CONTROVERSIAL: "Спорные практики",
  NONPAYMENT: "Неоплата по контракту",
  RNP: "РНП",
  CUSTOMERS: "Заказчикам",
  COMPLAINT: "Жалобы в ФАС",
  COURT: "Судебная защита",
};