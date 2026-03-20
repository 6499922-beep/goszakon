import { PrismaClient, MaterialType } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

function getDatabaseUrl() {
  const value = process.env.DATABASE_URL;

  if (!value) {
    throw new Error("DATABASE_URL is not set");
  }

  return value;
}

const adapter = new PrismaPg({ connectionString: getDatabaseUrl() });
const prisma = new PrismaClient({ adapter });

async function main() {
  const adminPasswordHash = await bcrypt.hash("admin123", 10);

  await prisma.admin.upsert({
    where: { email: "admin@goszakon.ru" },
    update: {
      name: "Главный администратор",
      passwordHash: adminPasswordHash,
      role: "admin",
    },
    create: {
      email: "admin@goszakon.ru",
      name: "Главный администратор",
      passwordHash: adminPasswordHash,
      role: "admin",
    },
  });

  const categories = [
    {
      name: "Практика ФАС",
      slug: "praktika-fas",
      description: "Решения ФАС и УФАС по жалобам и закупочным спорам.",
    },
    {
      name: "РНП",
      slug: "rnp",
      description: "Практика по включению и отказу во включении в РНП.",
    },
    {
      name: "Нарушения",
      slug: "narusheniya",
      description: "Типовые нарушения в закупках и практика их оценки.",
    },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {
        name: category.name,
        description: category.description,
      },
      create: category,
    });
  }

  const practiceCategory = await prisma.category.findUnique({
    where: { slug: "praktika-fas" },
  });

  const rnpCategory = await prisma.category.findUnique({
    where: { slug: "rnp" },
  });

  const violationsCategory = await prisma.category.findUnique({
    where: { slug: "narusheniya" },
  });

  const cases = [
    {
      slug: "fas-priznala-zhalobu-obosnovannoy-iz-za-tovarnogo-znaka",
      title: "ФАС признала жалобу обоснованной из-за товарного знака",
      summary:
        "Заказчик указал в документации требование, фактически ориентированное на конкретный товарный знак. Антимонопольный орган пришёл к выводу, что такое условие ограничивает конкуренцию и нарушает правила описания объекта закупки.",
      procurementNumber: "32410000001",
      region: "Москва",
      subject: "Документация закупки",
      violation: "Товарный знак",
      applicantPosition:
        "Требование к товару ориентирует закупку на конкретного производителя и ограничивает конкуренцию.",
      decision: "Московское УФАС",
      result: "Жалоба признана обоснованной",
      pdfUrl: null,
      customerName: "ГБУЗ «Городская клиническая больница № 1»",
      customerInn: "7701234567",
      customerKpp: "770101001",
      isFeatured: true,
      published: true,
      categoryId: practiceCategory?.id ?? null,
    },
    {
      slug: "ufas-vyyavilo-ogranichenie-konkurencii-v-dokumentacii-zakupki",
      title: "УФАС выявило ограничение конкуренции в документации закупки",
      summary:
        "Заявитель указал на избыточные требования к участникам закупки. УФАС установило, что часть условий документации не связана с предметом закупки и приводит к необоснованному ограничению числа участников.",
      procurementNumber: "32410000002",
      region: "Санкт-Петербург",
      subject: "Документация закупки",
      violation: "Ограничение конкуренции",
      applicantPosition:
        "Установленные требования к участникам не соответствуют предмету закупки и исключают часть поставщиков.",
      decision: "Санкт-Петербургское УФАС",
      result: "Жалоба признана обоснованной частично",
      pdfUrl: null,
      customerName: "СПб ГУП «АТС Смольного»",
      customerInn: "7801000001",
      customerKpp: "780101001",
      isFeatured: true,
      published: true,
      categoryId: violationsCategory?.id ?? null,
    },
    {
      slug: "ufas-otkazalo-vo-vklyuchenii-postavshchika-v-rnp",
      title: "УФАС отказало во включении поставщика в РНП",
      summary:
        "Заказчик обратился с заявлением о включении поставщика в реестр недобросовестных поставщиков. Антимонопольный орган не нашёл достаточных оснований для включения, поскольку не была подтверждена вина поставщика.",
      procurementNumber: "32410000003",
      region: "Московская область",
      subject: "Включение в РНП",
      violation: "РНП",
      applicantPosition:
        "Поставщик указал на отсутствие своей вины и наличие объективных причин, повлиявших на исполнение обязательств.",
      decision: "Московское областное УФАС",
      result: "Отказ во включении в РНП",
      pdfUrl: null,
      customerName: "ГКУ Московской области «Центр закупок»",
      customerInn: "5001234567",
      customerKpp: "500101001",
      isFeatured: true,
      published: true,
      categoryId: rnpCategory?.id ?? null,
    },
  ];

  for (const item of cases) {
    await prisma.case.upsert({
      where: { slug: item.slug },
      update: {
        title: item.title,
        summary: item.summary,
        procurementNumber: item.procurementNumber,
        region: item.region,
        subject: item.subject,
        violation: item.violation,
        applicantPosition: item.applicantPosition,
        decision: item.decision,
        result: item.result,
        pdfUrl: item.pdfUrl,
        customerName: item.customerName,
        customerInn: item.customerInn,
        customerKpp: item.customerKpp,
        isFeatured: item.isFeatured,
        published: item.published,
        categoryId: item.categoryId,
      },
      create: item,
    });
  }

  const materials = [
    {
      slug: "kak-fas-ocenivaet-tovarnyj-znak-v-zakupkah",
      title: "Как ФАС оценивает товарный знак в закупках",
      type: MaterialType.ANALYTICS,
      topic: "Товарный знак",
      authority: "ФАС России",
      outcome: "Практический обзор",
      caseNumber: null,
      decisionDate: null,
      excerpt:
        "Разбираем, когда упоминание товарного знака в документации допустимо, а когда приводит к признанию жалобы обоснованной.",
      body: `Требования к объекту закупки не должны создавать преимущество конкретному производителю. Если заказчик указывает товарный знак без достаточного правового обоснования и без возможности эквивалента, ФАС часто рассматривает это как ограничение конкуренции.

На практике важно анализировать не только формальное наличие товарного знака, но и весь контекст документации: характеристики товара, ссылки на каталожные позиции, описания совместимости и фактическую возможность поставить эквивалент.

При подготовке жалобы стоит отдельно показать:
1. почему спорное условие сужает круг участников;
2. почему эквивалентная поставка становится невозможной;
3. как именно это влияет на конкурентную среду.`,
      seoTitle: "Как ФАС оценивает товарный знак в закупках",
      seoDescription:
        "Практический разбор подхода ФАС к товарному знаку в закупочной документации.",
      pdfUrl: null,
      sourceName: "Редакция GOSZAKON",
      isPublished: true,
      isFeatured: true,
      sortOrder: 10,
      publishedAt: new Date(),
    },
    {
      slug: "kogda-zhaloba-v-fas-priznaetsya-obosnovannoy",
      title: "Когда жалоба в ФАС признаётся обоснованной",
      type: MaterialType.COMPLAINT,
      topic: "Жалобы в ФАС",
      authority: "ФАС России",
      outcome: "Обзор практики",
      caseNumber: null,
      decisionDate: null,
      excerpt:
        "Краткий разбор признаков, которые чаще всего приводят к признанию жалобы обоснованной.",
      body: `Жалоба чаще признаётся обоснованной, когда нарушение можно показать через конкретное несоответствие документации или действий заказчика требованиям закона и когда это нарушение затрагивает права участника закупки.

Наиболее сильные жалобы обычно строятся вокруг:
1. неправомерного описания объекта закупки;
2. ограничения конкуренции;
3. необоснованного отклонения заявки;
4. нарушения порядка оценки заявок.

Недостаточно просто указать на несправедливость. Важно показать правовую норму, фактическое нарушение и последствия для участника.`,
      seoTitle: "Когда жалоба в ФАС признаётся обоснованной",
      seoDescription:
        "Объясняем, какие аргументы и нарушения чаще всего приводят к признанию жалобы обоснованной.",
      pdfUrl: null,
      sourceName: "Редакция GOSZAKON",
      isPublished: true,
      isFeatured: false,
      sortOrder: 9,
      publishedAt: new Date(),
    },
    {
      slug: "kak-izbezhat-vklyucheniya-v-rnp",
      title: "Как избежать включения в РНП",
      type: MaterialType.RNP,
      topic: "РНП",
      authority: "ФАС России",
      outcome: "Практическая инструкция",
      caseNumber: null,
      decisionDate: null,
      excerpt:
        "Что важно доказать поставщику, чтобы антимонопольный орган отказал во включении в РНП.",
      body: `При рассмотрении вопроса о включении в РНП ключевое значение имеет наличие или отсутствие вины поставщика. Если поставщик может показать объективные обстоятельства, добросовестное поведение и попытки исполнить обязательства, шансы на отказ во включении возрастают.

Обычно следует подготовить:
1. переписку с заказчиком;
2. документы, подтверждающие объективные препятствия;
3. доказательства попыток исполнить контракт;
4. правовую позицию о непропорциональности включения в РНП.

Чем раньше поставщик начинает собирать доказательства, тем выше вероятность благоприятного исхода.`,
      seoTitle: "Как избежать включения в РНП",
      seoDescription:
        "Инструкция для поставщика: как выстроить позицию и избежать включения в реестр недобросовестных поставщиков.",
      pdfUrl: null,
      sourceName: "Редакция GOSZAKON",
      isPublished: true,
      isFeatured: true,
      sortOrder: 8,
      publishedAt: new Date(),
    },
  ];

  for (const item of materials) {
    await prisma.material.upsert({
      where: { slug: item.slug },
      update: {
        title: item.title,
        type: item.type,
        topic: item.topic,
        authority: item.authority,
        outcome: item.outcome,
        caseNumber: item.caseNumber,
        decisionDate: item.decisionDate,
        excerpt: item.excerpt,
        body: item.body,
        seoTitle: item.seoTitle,
        seoDescription: item.seoDescription,
        pdfUrl: item.pdfUrl,
        sourceName: item.sourceName,
        isPublished: item.isPublished,
        isFeatured: item.isFeatured,
        sortOrder: item.sortOrder,
        publishedAt: item.publishedAt,
      },
      create: item,
    });
  }

  const services = [
    {
      title: "Жалоба в ФАС",
      slug: "zhaloba-v-fas",
      shortDescription:
        "Подготовка жалобы, правовая позиция и сопровождение закупочного спора.",
      content:
        "Помогаем оценить перспективы жалобы, подготовить правовую позицию и представить интересы заявителя в антимонопольном органе.",
      published: true,
      seoTitle: "Жалоба в ФАС",
      seoDescription:
        "Подготовка и сопровождение жалобы в ФАС по закупочному спору.",
    },
    {
      title: "Риск РНП",
      slug: "risk-rnp",
      shortDescription:
        "Защита поставщика при угрозе включения в реестр недобросовестных поставщиков.",
      content:
        "Анализируем документы, собираем доказательства добросовестности и готовим позицию для рассмотрения в УФАС.",
      published: true,
      seoTitle: "Защита при риске РНП",
      seoDescription:
        "Юридическая помощь поставщику при риске включения в РНП.",
    },
  ];

  for (const item of services) {
    await prisma.service.upsert({
      where: { slug: item.slug },
      update: {
        title: item.title,
        shortDescription: item.shortDescription,
        content: item.content,
        published: item.published,
        seoTitle: item.seoTitle,
        seoDescription: item.seoDescription,
      },
      create: item,
    });
  }

  const pages = [
    {
      title: "О проекте",
      slug: "o-proekte",
      content:
        "GOSZAKON — практический проект о закупочных спорах, практике ФАС, РНП и судебной защите.",
      published: true,
      seoTitle: "О проекте GOSZAKON",
      seoDescription:
        "О проекте GOSZAKON и его специализации на закупочных спорах.",
    },
  ];

  for (const item of pages) {
    await prisma.page.upsert({
      where: { slug: item.slug },
      update: {
        title: item.title,
        content: item.content,
        published: item.published,
        seoTitle: item.seoTitle,
        seoDescription: item.seoDescription,
      },
      create: item,
    });
  }

  console.log("Seed completed successfully");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });