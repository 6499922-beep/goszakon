import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");

function requiredEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is not set`);
  }
  return value;
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: requiredEnv("DATABASE_URL") }),
});

const cases = [
  {
    slug: "rosseti-yantar-ne-razmestila-perenos-srokov-zakupki",
    title:
      "Калининградское УФАС признало жалобу обоснованной из-за непубликации переноса этапов закупки",
    summary:
      "Заказчик изменил сроки рассмотрения заявок и подведения итогов по 223-ФЗ, но не разместил новые сведения в ЕИС. УФАС сочло такое бездействие нарушением принципа информационной открытости закупки.",
    procurementNumber: "32414397100",
    region: "Калининградская область",
    subject: "Проведение этапов закупки и публикация сведений в ЕИС по 223-ФЗ",
    violation:
      "Заказчик фактически перенес сроки рассмотрения заявок и подведения итогов, но не разместил соответствующую информацию в ЕИС и на электронной площадке, чем ввел участников закупки в неопределенность относительно хода процедуры.",
    applicantPosition:
      "Заявитель указал, что после изменения извещения заказчик не подвел итоги в опубликованные сроки и не сообщил участникам о переносе последующих этапов закупки.",
    decision:
      "Комиссия установила, что результаты рассмотрения заявок и решение о переносе этапов содержались только во внутреннем протоколе от 06.05.2025, который не был своевременно размещен в ЕИС. Такое бездействие нарушило требования информационной открытости закупки по 223-ФЗ.",
    result:
      "Жалоба признана обоснованной, заказчик признан нарушившим пункт 1 части 1 статьи 3 Закона о закупках. Предписание не выдано, но материалы переданы для решения вопроса об административной ответственности.",
    pdfUrl:
      "/fas-decisions/2025/rossseti-yantar-ne-razmestila-sroki-039-07-3-478-2025.pdf",
    customerName: "АО «Россети Янтарь»",
    customerInn: "3903007130",
    customerKpp: null,
    decisionDate: "2025-05-14",
    categorySlug: "praktika-fas",
    isFeatured: false,
    published: true,
  },
  {
    slug: "moskoviya-otklonenie-zayavki-iz-za-nekonkretnyh-pokazatelej",
    title:
      "МособлУФАС отменило отклонение заявки из-за формального подхода к конкретным показателям товара",
    summary:
      "Заказчик отклонил заявку в запросе котировок, сославшись на отсутствие конкретных показателей товара. Комиссия пришла к выводу, что сама документация была составлена с нарушениями, а отклонение участника оказалось неправомерным.",
    procurementNumber: "32514572282",
    region: "Московская область",
    subject:
      "Отклонение заявки и требования документации к описанию товара в запросе котировок по 223-ФЗ",
    violation:
      "Закупочная комиссия признала заявку несоответствующей, хотя спор возник из-за некорректно сформулированных требований документации к описанию товара и конкретным показателям.",
    applicantPosition:
      "Заявитель настаивал, что его заявку нельзя было отклонять за описание товара по форме, которую сам заказчик закрепил в документации и инструкции по заполнению заявки.",
    decision:
      "Московское областное УФАС указало, что заказчик нарушил требования к описанию предмета закупки в документации, а закупочная комиссия неправомерно отклонила заявку, хотя она не противоречила положениям Закона о закупках по приведенным в протоколе основаниям.",
    result:
      "Жалоба признана обоснованной, выдано предписание. Если документация содержит дефектные требования к описанию товара, заказчик не вправе отклонять заявку участника за следование таким условиям.",
    pdfUrl:
      "/fas-decisions/2025/moskoviya-otklonenie-zayavki-050-07-223-9227-2025.pdf",
    customerName:
      "ГАПОУ Московской области «Профессиональный колледж «Московия»",
    customerInn: null,
    customerKpp: null,
    decisionDate: "2025-03-24",
    categorySlug: "narusheniya",
    isFeatured: false,
    published: true,
  },
  {
    slug: "rsp-neprozrachnye-kriterii-ocenki-i-nezakonnoe-otklonenie",
    title:
      "МособлУФАС признало незаконными непрозрачную оценку срока поставки и отклонение заявки",
    summary:
      "В конкурсе на поставку кабеля заказчик установил непрозрачную шкалу оценки по сроку поставки и дополнительно отклонил заявку участника. УФАС признало жалобу обоснованной и выдало обязательное предписание.",
    procurementNumber: "32514513540",
    region: "Московская область",
    subject:
      "Критерии оценки заявок и отклонение участника в конкурсе по 223-ФЗ",
    violation:
      "Заказчик установил необъективный порядок оценки заявок по критерию срока поставки, а закупочная комиссия незаконно признала заявку участника несоответствующей требованиям документации.",
    applicantPosition:
      "Заявитель оспаривал как само отклонение заявки, так и порядок оценки по критерию срока поставки, который не позволял объективно сопоставить предложения участников.",
    decision:
      "Комиссия установила, что шкала оценки по сроку поставки не содержала пропорциональной зависимости между баллами и предложением участника, а заявка заявителя не противоречила документации по названным в протоколе основаниям. Это привело к нарушениям порядка оценки заявок и части 6 статьи 3 Закона о закупках.",
    result:
      "Жалоба признана обоснованной, выдано предписание об отмене протоколов и корректировке документации. Для закупочной практики это сильный пример того, что непрозрачные критерии оценки и формальное отклонение заявки могут ломать всю процедуру.",
    pdfUrl:
      "/fas-decisions/2025/rsp-neprozrachnye-kriterii-050-07-223-8088-2025.pdf",
    customerName: "АО «Ремонтно-строительное предприятие»",
    customerInn: null,
    customerKpp: null,
    decisionDate: "2025-03-17",
    categorySlug: "narusheniya",
    isFeatured: false,
    published: true,
  },
  {
    slug: "fas-rossii-operator-ploshadki-ne-obespechil-podachu-zayavki",
    title:
      "ФАС России выдала предписание из-за технического сбоя оператора электронной площадки",
    summary:
      "ФАС России рассмотрела жалобу на работу оператора электронной площадки при проведении аукциона по 223-ФЗ и пришла к выводу, что заявитель не смог подать документы в полном объеме из-за ненадежной работы программно-технических средств площадки.",
    procurementNumber: null,
    region: "Москва",
    subject:
      "Технический сбой оператора электронной площадки при подаче заявки по 223-ФЗ",
    violation:
      "Жалоба была связана не с содержанием документации, а с технической невозможностью подать заявку и прикрепить документы в полном объеме из-за сбоев электронной площадки.",
    applicantPosition:
      "Заявитель указал, что в период подачи заявок оператор площадки допустил технические неполадки, из-за которых документы не были загружены надлежащим образом, а возможность участия в закупке фактически оказалась нарушена.",
    decision:
      "Из материалов дела следовало, что при подаче заявки возникли технические неполадки, связанные с загрузкой документов. ФАС России сочла, что оператор не обеспечил надежность функционирования программно-технических средств, используемых при проведении аукциона.",
    result:
      "По итогам рассмотрения жалобы ФАС России выдала предписание об устранении нарушений. Для практики это важный сигнал: технический сбой площадки может стать самостоятельным основанием для защиты участника, если проблема подтверждается материалами дела.",
    pdfUrl:
      "/fas-decisions/2025/fas-rossii-operator-ploshadki-sboj-223fz-38-25.pdf",
    customerName: "АО «БПО «Сибприбормаш»",
    customerInn: null,
    customerKpp: null,
    decisionDate: "2025-01-27",
    categorySlug: "praktika-fas",
    isFeatured: false,
    published: true,
  },
];

async function main() {
  const categorySlugs = [...new Set(cases.map((item) => item.categorySlug))];
  const categories = await prisma.category.findMany({
    where: { slug: { in: categorySlugs } },
    select: { id: true, slug: true },
  });

  const categoryMap = new Map(categories.map((item) => [item.slug, item.id]));

  for (const item of cases) {
    const categoryId = categoryMap.get(item.categorySlug) ?? null;
    const pdfPath = item.pdfUrl
      ? path.join(repoRoot, "public", item.pdfUrl.replace(/^\//, ""))
      : null;

    if (pdfPath && !fs.existsSync(pdfPath)) {
      throw new Error(`PDF file is missing: ${pdfPath}`);
    }

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
        decisionDate: item.decisionDate ? new Date(item.decisionDate) : null,
        categoryId,
        isFeatured: item.isFeatured,
        published: item.published,
      },
      create: {
        title: item.title,
        slug: item.slug,
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
        decisionDate: item.decisionDate ? new Date(item.decisionDate) : null,
        categoryId,
        isFeatured: item.isFeatured,
        published: item.published,
      },
    });

    console.log(`Upserted: ${item.slug}`);
  }
}

try {
  await main();
} finally {
  await prisma.$disconnect();
}
