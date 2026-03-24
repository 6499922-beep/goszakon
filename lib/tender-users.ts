import { TenderUserRole } from "@prisma/client";

export const tenderUserRoleLabels: Record<TenderUserRole, string> = {
  ADMIN: "Администратор",
  OPERATOR: "Оператор",
  ANALYST: "Аналитик",
  MANAGER: "Руководитель",
  SUBMITTER: "Подающий",
  FAS_SPECIALIST: "Специалист по жалобам ФАС",
  FAS_MANAGER: "Руководитель ФАС",
};

export const tenderUserRoleDescriptions: Record<TenderUserRole, string> = {
  ADMIN: "Управляет пользователями, настройками, правилами и всеми разделами системы.",
  OPERATOR: "Загружает закупки, документацию и ведёт карточку на первых этапах.",
  ANALYST: "Проверяет спорные места, ТЗ, стоп-факторы и предпросчёт.",
  MANAGER: "Принимает решение по закупке и утверждает сумму участия.",
  SUBMITTER: "Проверяет финальный комплект и подаёт заявку на площадке.",
  FAS_SPECIALIST:
    "Проверяет потенциальные нарушения и ведёт ветку жалобы в ФАС по спорным закупкам.",
  FAS_MANAGER:
    "Настраивает ФАС-промт, принимает решение по запуску жалобы и контролирует ФАС-контур.",
};
