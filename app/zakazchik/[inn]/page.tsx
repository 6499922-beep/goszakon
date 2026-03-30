import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Prisma } from "@prisma/client";
import { getPrisma } from "@/lib/prisma";
import { getCasePath } from "@/lib/cases";
import { SITE_CONTACTS, SITE_URL } from "@/lib/site-config";

export const revalidate = 3600;

type PageProps = {
  params: Promise<{ inn: string }>;
};

function normalizeInn(value: string) {
  return value.replace(/\D/g, "");
}

function formatDate(value?: Date | null) {
  if (!value) return "Дата не указана";
  return new Intl.DateTimeFormat("ru-RU").format(value);
}

function buildResultSummary(items: Array<{ result?: string | null }>) {
  let justified = 0;
  let partial = 0;
  let rejected = 0;

  for (const item of items) {
    const raw = (item.result || "").toLowerCase();

    if (raw.includes("част")) {
      partial += 1;
      continue;
    }

    if (
      raw.includes("обосн") ||
      raw.includes("удовлетвор") ||
      raw.includes("нарушени") ||
      raw.includes("выдано предписание")
    ) {
      justified += 1;
      continue;
    }

    if (
      raw.includes("необосн") ||
      raw.includes("отказ") ||
      raw.includes("не выявлено") ||
      raw.includes("оставлена без удовлетворения")
    ) {
      rejected += 1;
    }
  }

  return {
    justified,
    partial,
    rejected,
  };
}

function buildTopViolations(items: Array<{ violation?: string | null }>) {
  const counts = new Map<string, number>();

  for (const item of items) {
    const violation = (item.violation || "").trim();
    if (!violation) continue;
    counts.set(violation, (counts.get(violation) || 0) + 1);
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([title, count]) => ({ title, count }));
}

function buildTopRegions(items: Array<{ region?: string | null }>) {
  const counts = new Map<string, number>();

  for (const item of items) {
    const region = (item.region || "").trim();
    if (!region) continue;
    counts.set(region, (counts.get(region) || 0) + 1);
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([title, count]) => ({ title, count }));
}

function buildSuccessRate(params: {
  totalCases: number;
  justified: number;
  partial: number;
}) {
  if (!params.totalCases) return 0;
  return Math.round(((params.justified + params.partial) / params.totalCases) * 100);
}

function buildConclusion(params: {
  totalCases: number;
  justified: number;
  partial: number;
  topViolations: Array<{ title: string; count: number }>;
}) {
  const findings = params.justified + params.partial;
  const ratio = params.totalCases > 0 ? findings / params.totalCases : 0;
  const topViolation = params.topViolations[0]?.title;

  if (params.totalCases === 0) {
    return "По этому ИНН в базе пока нет опубликованных кейсов. Это не означает отсутствие рисков, но публичной практики по заказчику у нас сейчас не найдено.";
  }

  if (ratio >= 0.6) {
    return topViolation
      ? `По этому заказчику заметна повышенная конфликтность: значительная часть кейсов связана с подтвержденными нарушениями или частичным удовлетворением жалоб. Особенно часто встречается тема: ${topViolation}. Поставщику стоит заранее проверять документацию и готовить позицию до подачи заявки.`
      : "По этому заказчику заметна повышенная конфликтность: значительная часть кейсов связана с подтвержденными нарушениями или частичным удовлетворением жалоб. Поставщику стоит заранее проверять документацию и готовить позицию до подачи заявки.";
  }

  if (ratio >= 0.3) {
    return topViolation
      ? `По этому заказчику практика неоднозначная: жалобы встречаются регулярно, и часть из них оказывается результативной. Наиболее заметный риск связан с темой: ${topViolation}. Перед участием в закупке лучше отдельно проверить спорные условия документации.`
      : "По этому заказчику практика неоднозначная: жалобы встречаются регулярно, и часть из них оказывается результативной. Перед участием в закупке лучше отдельно проверить спорные условия документации.";
  }

  return "По опубликованным кейсам нельзя сказать, что заказчик системно проигрывает споры, но сама по себе практика жалоб означает, что закупки этого заказчика все равно стоит проверять внимательно: особенно условия допуска, описания объекта закупки и проект договора.";
}

async function getCustomerCases(inn: string) {
  const prisma = getPrisma();

  return prisma.case.findMany({
    where: {
      published: true,
      customerInn: inn,
    },
    orderBy: [{ decisionDate: "desc" }, { updatedAt: "desc" }],
    select: {
      id: true,
      slug: true,
      title: true,
      summary: true,
      result: true,
      violation: true,
      region: true,
      customerName: true,
      customerInn: true,
      decisionDate: true,
      updatedAt: true,
    },
  });
}

async function getSimilarCustomers(params: {
  inn: string;
  topViolations: Array<{ title: string; count: number }>;
  topRegions: Array<{ title: string; count: number }>;
}) {
  const prisma = getPrisma();
  const violationTitles = params.topViolations.map((item) => item.title);
  const regionTitles = params.topRegions.map((item) => item.title);

  if (!violationTitles.length && !regionTitles.length) {
    return [];
  }

  const items = await prisma.case.findMany({
    where: {
      published: true,
      customerInn: { not: null },
      customerName: { not: null },
      NOT: { customerInn: params.inn },
      OR: [
        ...(violationTitles.length
          ? [{
              violation: {
                in: violationTitles,
                mode: Prisma.QueryMode.insensitive,
              },
            } satisfies Prisma.CaseWhereInput]
          : []),
        ...(regionTitles.length
          ? [{
              region: {
                in: regionTitles,
                mode: Prisma.QueryMode.insensitive,
              },
            } satisfies Prisma.CaseWhereInput]
          : []),
      ],
    },
    select: {
      customerInn: true,
      customerName: true,
      violation: true,
      region: true,
    },
    take: 200,
  });

  const grouped = new Map<
    string,
    { customerInn: string; customerName: string; count: number }
  >();

  for (const item of items) {
    const customerInn = item.customerInn?.trim();
    const customerName = item.customerName?.trim();
    if (!customerInn || !customerName) continue;

    const existing = grouped.get(customerInn);
    if (existing) {
      existing.count += 1;
      continue;
    }

    grouped.set(customerInn, {
      customerInn,
      customerName,
      count: 1,
    });
  }

  return [...grouped.values()]
    .sort((a, b) => b.count - a.count || a.customerName.localeCompare(b.customerName))
    .slice(0, 6);
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { inn: rawInn } = await params;
  const inn = normalizeInn(rawInn);

  if (!inn || (inn.length !== 10 && inn.length !== 12)) {
    return {
      title: "Заказчик не найден | GOSZAKON",
    };
  }

  const items = await getCustomerCases(inn);

  if (!items.length) {
    return {
      title: `Заказчик ${inn} | GOSZAKON`,
      description:
        "Страница заказчика по ИНН в базе практики GOSZAKON. Публичные кейсы по этому ИНН пока не найдены.",
    };
  }

  const customerName = items[0].customerName?.trim() || `Заказчик ${inn}`;
  const stats = buildResultSummary(items);
  const title = `${customerName} (${inn}) — жалобы ФАС и практика | GOSZAKON`;
  const description = `Практика по заказчику ${customerName}, ИНН ${inn}: всего кейсов ${items.length}, обоснованных жалоб ${stats.justified}, частично обоснованных ${stats.partial}.`;
  const canonicalUrl = `${SITE_URL}/zakazchik/${inn}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: "GOSZAKON",
      type: "article",
      locale: "ru_RU",
    },
  };
}

export default async function CustomerInnPage({ params }: PageProps) {
  const { inn: rawInn } = await params;
  const inn = normalizeInn(rawInn);

  if (!inn || (inn.length !== 10 && inn.length !== 12)) {
    notFound();
  }

  const items = await getCustomerCases(inn);

  if (!items.length) {
    notFound();
  }

  const customerName = items[0].customerName?.trim() || `Заказчик ${inn}`;
  const totalCases = items.length;
  const stats = buildResultSummary(items);
  const topViolations = buildTopViolations(items);
  const topRegions = buildTopRegions(items);
  const successRate = buildSuccessRate({
    totalCases,
    justified: stats.justified,
    partial: stats.partial,
  });
  const conclusion = buildConclusion({
    totalCases,
    justified: stats.justified,
    partial: stats.partial,
    topViolations,
  });
  const similarCustomers = await getSimilarCustomers({
    inn,
    topViolations,
    topRegions,
  });

  const pageJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${customerName} (${inn})`,
    description: `Практика ФАС и кейсы по заказчику ${customerName}, ИНН ${inn}.`,
    url: `${SITE_URL}/zakazchik/${inn}`,
  };

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pageJsonLd) }}
      />

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:py-20">
          <div className="max-w-5xl">
            <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600">
              Практика по заказчику
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-4">
              <Link
                href="/zakazchikam"
                className="text-sm font-medium text-slate-500 transition hover:text-slate-700"
              >
                ← Назад к разделу для заказчиков
              </Link>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
                ИНН {inn}
              </span>
            </div>

            <h1 className="mt-6 text-4xl font-bold tracking-tight text-[#081a4b] md:text-6xl">
              {customerName}
            </h1>

            <p className="mt-6 max-w-4xl text-lg leading-9 text-slate-700">
              На этой странице собраны опубликованные кейсы и жалобы по заказчику с
              ИНН {` ${inn}`}. Это помогает быстро понять, насколько часто по его
              закупкам возникают споры и какие риски чаще всего встречаются.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <span className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600">
                Кейсов в базе: {totalCases}
              </span>
              <span className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600">
                Результативных жалоб: {successRate}%
              </span>
              {topViolations[0] ? (
                <span className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600">
                  Частая тема: {topViolations[0].title}
                </span>
              ) : null}
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/uslugi/proverka-zakupki"
                className="inline-flex items-center justify-center rounded-2xl bg-[#081a4b] px-6 py-4 text-base font-semibold text-white transition hover:bg-[#0d2568]"
              >
                Проверить закупку этого заказчика
              </Link>
              <a
                href={SITE_CONTACTS.emailHref}
                className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-6 py-4 text-base font-semibold text-[#081a4b] transition hover:bg-slate-50"
              >
                Отправить документы на разбор
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="text-sm uppercase tracking-[0.12em] text-slate-400">
                Всего кейсов
              </div>
              <div className="mt-3 text-4xl font-bold tracking-tight text-[#081a4b]">
                {totalCases}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="text-sm uppercase tracking-[0.12em] text-slate-400">
                Обоснованных
              </div>
              <div className="mt-3 text-4xl font-bold tracking-tight text-emerald-700">
                {stats.justified}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="text-sm uppercase tracking-[0.12em] text-slate-400">
                Частично обоснованных
              </div>
              <div className="mt-3 text-4xl font-bold tracking-tight text-amber-700">
                {stats.partial}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="text-sm uppercase tracking-[0.12em] text-slate-400">
                Необоснованных / отказов
              </div>
              <div className="mt-3 text-4xl font-bold tracking-tight text-slate-700">
                {stats.rejected}
              </div>
            </div>

            <div className="rounded-3xl border border-[rgba(8,26,75,0.08)] bg-[rgba(8,26,75,0.04)] p-6 shadow-sm md:col-span-2 xl:col-span-2">
              <div className="text-sm uppercase tracking-[0.12em] text-slate-400">
                Доля результативных жалоб
              </div>
              <div className="mt-3 text-4xl font-bold tracking-tight text-[#081a4b]">
                {successRate}%
              </div>
              <div className="mt-2 text-sm leading-7 text-slate-600">
                Обоснованные и частично обоснованные жалобы в общей выборке по заказчику.
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-16 lg:grid-cols-[minmax(0,1fr)_320px]">
          <article className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600">
              Практический вывод
            </div>

            <h2 className="mt-5 text-3xl font-bold tracking-tight text-[#081a4b]">
              Что это значит для поставщика
            </h2>

            <p className="mt-5 text-lg leading-9 text-slate-700">{conclusion}</p>

            {topViolations.length ? (
              <div className="mt-8 grid gap-3 md:grid-cols-2">
                {topViolations.map((item) => (
                  <div
                    key={item.title}
                    className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-4 text-sm text-slate-700"
                  >
                    <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                      Повторяющаяся тема
                    </div>
                    <div className="mt-2 font-medium text-slate-900">{item.title}</div>
                    <div className="mt-1 text-slate-500">Кейсов: {item.count}</div>
                  </div>
                ))}
              </div>
            ) : null}

            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href={SITE_CONTACTS.phoneHref}
                className="rounded-2xl bg-[#081a4b] px-6 py-4 text-base font-semibold text-white transition hover:bg-[#0d2568]"
              >
                Обсудить закупку
              </a>

              <Link
                href="/uslugi/proverka-zakupki"
                className="rounded-2xl border border-slate-300 bg-white px-6 py-4 text-base font-semibold text-[#081a4b] transition hover:bg-slate-50"
              >
                Проверить закупку
              </Link>
            </div>
          </article>

          <aside className="space-y-6">
            <section className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-[#081a4b]">
                Где чаще возникают споры
              </h2>

              <div className="mt-5 space-y-3">
                {topRegions.length ? (
                  topRegions.map((item) => (
                    <div
                      key={item.title}
                      className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700"
                    >
                      {item.title} • {item.count}
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500">
                    Региональная привязка в кейсах указана не везде.
                  </div>
                )}
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-[#081a4b]">
                Типовые темы жалоб
              </h2>

              <div className="mt-5 space-y-3">
                {topViolations.length ? (
                  topViolations.map((item) => (
                    <div
                      key={item.title}
                      className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700"
                    >
                      {item.title} • {item.count}
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500">
                    В карточках кейсов не хватает данных о типовых нарушениях.
                  </div>
                )}
              </div>
            </section>

            {similarCustomers.length ? (
              <section className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-[#081a4b]">
                  Похожие заказчики
                </h2>

                <div className="mt-5 space-y-3">
                  {similarCustomers.map((item) => (
                    <Link
                      key={item.customerInn}
                      href={`/zakazchik/${item.customerInn}`}
                      className="block rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 transition hover:bg-slate-50"
                    >
                      <div className="font-semibold text-slate-900">{item.customerName}</div>
                      <div className="mt-1">ИНН {item.customerInn}</div>
                      <div className="mt-1 text-slate-500">Совпадений по практике: {item.count}</div>
                    </Link>
                  ))}
                </div>
              </section>
            ) : null}
          </aside>
        </div>
      </section>

      <section className="bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="max-w-3xl">
            <div className="inline-flex rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600">
              Кейсы по заказчику
            </div>

            <h2 className="mt-5 text-4xl font-bold tracking-tight text-[#081a4b]">
              Все найденные кейсы
            </h2>
          </div>

          <div className="mt-10 grid gap-6">
            {items.map((item) => (
              <article
                key={item.id}
                className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
                    {formatDate(item.decisionDate)}
                  </span>
                  {item.region ? (
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
                      {item.region}
                    </span>
                  ) : null}
                </div>

                <h3 className="mt-4 text-2xl font-semibold leading-9 text-[#081a4b]">
                  <Link href={getCasePath(item)} className="transition hover:opacity-80">
                    {item.title}
                  </Link>
                </h3>

                {item.summary ? (
                  <p className="mt-4 max-w-4xl text-base leading-8 text-slate-700">
                    {item.summary}
                  </p>
                ) : null}

                <div className="mt-6 flex flex-wrap gap-3">
                  {item.violation ? (
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                      <span className="font-semibold text-slate-900">Нарушение:</span>{" "}
                      {item.violation}
                    </div>
                  ) : null}

                  {item.result ? (
                    <div className="rounded-2xl border border-[rgba(8,26,75,0.08)] bg-[rgba(8,26,75,0.04)] px-4 py-3 text-sm text-slate-700">
                      <span className="font-semibold text-[#081a4b]">Итог:</span>{" "}
                      {item.result}
                    </div>
                  ) : null}
                </div>

                <div className="mt-6">
                  <Link
                    href={getCasePath(item)}
                    className="inline-flex rounded-2xl border border-slate-300 px-5 py-3 text-sm font-semibold text-[#081a4b] transition hover:bg-slate-50"
                  >
                    Открыть кейс
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
