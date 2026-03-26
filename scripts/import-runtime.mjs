import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

function requiredEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is not set`);
  }
  return value;
}

export function createPrisma() {
  return new PrismaClient({
    adapter: new PrismaPg({ connectionString: requiredEnv("DATABASE_URL") }),
  });
}

export function filterByOnlySlugs(items) {
  const onlySlugs = process.env.ONLY_SLUGS
    ? new Set(
        process.env.ONLY_SLUGS.split(",")
          .map((item) => item.trim())
          .filter(Boolean),
      )
    : null;

  return onlySlugs ? items.filter((item) => onlySlugs.has(item.slug)) : items;
}

export async function upsertMaterials(prisma, materials) {
  for (const item of materials) {
    const payload = {
      title: item.title,
      slug: item.slug,
      type: item.type,
      topic: item.topic,
      authority: item.authority,
      outcome: item.outcome,
      caseNumber: item.caseNumber,
      decisionDate: new Date(item.decisionDate),
      excerpt: item.excerpt,
      body: item.body,
      seoTitle: item.seoTitle,
      seoDescription: item.seoDescription,
      pdfUrl: item.pdfUrl,
      sourceName: item.sourceName,
      isPublished: item.isPublished ?? true,
      isFeatured: item.isFeatured ?? false,
      publishedAt: item.publishedAt
        ? new Date(item.publishedAt)
        : new Date(item.decisionDate),
    };

    await prisma.material.upsert({
      where: { slug: item.slug },
      update: payload,
      create: payload,
    });

    console.log(`Upserted material: ${item.slug}`);
  }
}

export async function buildCategoryMap(prisma, items) {
  const categorySlugs = [...new Set(items.map((item) => item.categorySlug))];
  const categories = await prisma.category.findMany({
    where: { slug: { in: categorySlugs } },
  });

  return new Map(categories.map((item) => [item.slug, item.id]));
}

export async function upsertCases(prisma, cases, categoryMap) {
  for (const item of cases) {
    const categoryId = categoryMap.get(item.categorySlug) ?? null;
    const payload = {
      slug: item.slug,
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
      isFeatured: item.isFeatured ?? false,
      published: item.published ?? true,
      categoryId,
    };

    await prisma.case.upsert({
      where: { slug: item.slug },
      update: payload,
      create: payload,
    });

    console.log(`Upserted case: ${item.slug}`);
  }
}
