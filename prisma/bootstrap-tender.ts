import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

function getEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is not set`);
  }

  return value;
}

const adapter = new PrismaPg({ connectionString: getEnv("DATABASE_URL") });
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = getEnv("ADMIN_EMAIL").trim().toLowerCase();
  const password = getEnv("ADMIN_PASSWORD");
  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.admin.upsert({
    where: { email },
    update: {
      passwordHash,
      role: "ADMIN",
      name: "Тендерный администратор",
    },
    create: {
      email,
      passwordHash,
      role: "ADMIN",
      name: "Тендерный администратор",
    },
  });

  const starterRules = [
    {
      code: "LESS_THAN_TWO_POSITIONS",
      name: "Менее 2 позиций",
      description: "Если в закупке меньше двух позиций, это стоп-фактор.",
      kind: "PROCUREMENT",
      sortOrder: 10,
      isActive: true,
      isToggleable: true,
      requiresManualReview: false,
    },
    {
      code: "PAPER_APPLICATION",
      name: "Заявка на бумажных носителях",
      description: "Если закупка требует бумажную подачу заявки, она не идет в работу.",
      kind: "PROCUREMENT",
      keyword: "бумаж",
      sortOrder: 20,
      isActive: true,
      isToggleable: true,
      requiresManualReview: false,
    },
    {
      code: "CLOSED_PROCUREMENT",
      name: "Закрытая закупка",
      description: "Закрытая закупка или предквалификационный отбор.",
      kind: "PROCUREMENT",
      keyword: "закрыт",
      sortOrder: 30,
      isActive: true,
      isToggleable: true,
      requiresManualReview: false,
    },
    {
      code: "PREQUALIFICATION",
      name: "Предквалификационный отбор",
      description: "Наличие предквалификационного отбора.",
      kind: "PROCUREMENT",
      keyword: "предквалификац",
      sortOrder: 40,
      isActive: true,
      isToggleable: true,
      requiresManualReview: false,
    },
    {
      code: "FSB_LICENSE",
      name: "Лицензия ФСБ",
      description: "Требование лицензии ФСБ.",
      kind: "REGULATORY",
      keyword: "лицензия фсб",
      sortOrder: 50,
      isActive: true,
      isToggleable: true,
      requiresManualReview: false,
    },
    {
      code: "FSTEK_LICENSE",
      name: "Лицензия на перепродажу от ФСТЭК",
      description: "Требование лицензии или разрешения ФСТЭК.",
      kind: "REGULATORY",
      keyword: "фстэк",
      sortOrder: 60,
      isActive: true,
      isToggleable: true,
      requiresManualReview: false,
    },
    {
      code: "KSO_EQUIPMENT",
      name: "КСО (ячейки)",
      description: "Закупка по КСО относится к стоп-факторам.",
      kind: "CATEGORY",
      keyword: "ксо",
      sortOrder: 70,
      isActive: true,
      isToggleable: true,
      requiresManualReview: false,
    },
    {
      code: "COMMISSIONING_WORKS",
      name: "Монтаж / пуско-наладка",
      description: "Если закупка требует монтаж или пуско-наладку, она не идет в работу.",
      kind: "CATEGORY",
      keyword: "пуско-налад",
      sortOrder: 80,
      isActive: true,
      isToggleable: true,
      requiresManualReview: false,
    },
    {
      code: "MULTIPLE_WINNERS",
      name: "Несколько победителей / делимый лот",
      description: "Если заказчик предусматривает несколько победителей или делимый лот.",
      kind: "PROCUREMENT",
      keyword: "несколько победител",
      sortOrder: 90,
      isActive: true,
      isToggleable: true,
      requiresManualReview: false,
    },
    {
      code: "MILITARY_ACCEPTANCE",
      name: "Военная приемка",
      description: "Военная приемка или РТ-Техприемка.",
      kind: "REGULATORY",
      keyword: "военная приемк",
      sortOrder: 100,
      isActive: true,
      isToggleable: true,
      requiresManualReview: false,
    },
  ] as const;

  for (const rule of starterRules) {
    await prisma.tenderStopRule.upsert({
      where: { code: rule.code },
      update: rule,
      create: rule,
    });
  }

  await prisma.tenderPromptConfig.upsert({
    where: { key: "FAS_POTENTIAL_COMPLAINT" },
    update: {
      title: "Потенциальная жалоба в ФАС",
      body: [
        "Если явных нарушений с высокой вероятностью обоснования не выявлено — прямо укажи это и не выдумывай основания.",
        "Запрещено:",
        "придумывать нарушения при отсутствии прямых оснований;",
        "включать спорные/оценочные доводы без формальной доказуемости;",
        "рассуждать о целесообразности участия или коммерческих рисках;",
        "давать теорию без привязки к конкретному пункту документации.",
      ].join("\n"),
    },
    create: {
      key: "FAS_POTENTIAL_COMPLAINT",
      title: "Потенциальная жалоба в ФАС",
      body: [
        "Если явных нарушений с высокой вероятностью обоснования не выявлено — прямо укажи это и не выдумывай основания.",
        "Запрещено:",
        "придумывать нарушения при отсутствии прямых оснований;",
        "включать спорные/оценочные доводы без формальной доказуемости;",
        "рассуждать о целесообразности участия или коммерческих рисках;",
        "давать теорию без привязки к конкретному пункту документации.",
      ].join("\n"),
    },
  });
}

main()
  .catch((error) => {
    console.error("Failed to bootstrap tender admin:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
