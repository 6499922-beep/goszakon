import { TenderUserRole } from "@prisma/client";

export const tenderUserRoleLabels: Record<TenderUserRole, string> = {
  ADMIN: "Администратор",
  OPERATOR: "Оператор",
  ANALYST: "Аналитик",
  MANAGER: "Руководитель",
  SUBMITTER: "Подающий",
};

export const tenderUserRoleDescriptions: Record<TenderUserRole, string> = {
  ADMIN: "Управляет пользователями, настройками, правилами и всеми разделами системы.",
  OPERATOR: "Загружает закупки, документацию и ведёт карточку на первых этапах.",
  ANALYST: "Проверяет спорные места, ТЗ, стоп-факторы и предпросчёт.",
  MANAGER: "Принимает решение по закупке и утверждает сумму участия.",
  SUBMITTER: "Проверяет финальный комплект и подаёт заявку на площадке.",
};
