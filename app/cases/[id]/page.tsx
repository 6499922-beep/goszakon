import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { getPrisma } from "@/lib/prisma";
import { SITE_CONTACTS, SITE_URL } from "@/lib/site-config";
import { getCasePath, parseCaseParam } from "@/lib/cases";

export const revalidate = 3600;

type PageProps = {
  params: Promise<{ id: string }>;
};

async function getCaseById(id: number) {
  const prisma = getPrisma();

  return prisma.case.findUnique({
    where: { id },
    include: { category: true },
  });
}

async function getRelatedCases(item: {
  id: number;
  categoryId?: number | null;
  region?: string | null;
  violation?: string | null;
}) {
  const prisma = getPrisma();

  const orConditions: Array<
    | { categoryId: number }
    | { region: string }
    | { violation: string }
  > = [];

  if (item.categoryId) {
    orConditions.push({ categoryId: item.categoryId });
  }

  if (item.region) {
    orConditions.push({ region: item.region });
  }

  if (item.violation) {
    orConditions.push({ violation: item.violation });
  }

  if (!orConditions.length) {
    return [];
  }

  return prisma.case.findMany({
    where: {
      published: true,
      id: { not: item.id },
      OR: orConditions,
    },
    orderBy: [{ decisionDate: "desc" }, { updatedAt: "desc" }],
    take: 6,
    include: {
      category: true,
    },
  });
}

async function getCustomerCases(item: {
  id: number;
  customerInn?: string | null;
}) {
  if (!item.customerInn) {
    return [];
  }

  const prisma = getPrisma();

  return prisma.case.findMany({
    where: {
      published: true,
      id: { not: item.id },
      customerInn: item.customerInn,
    },
    orderBy: [{ decisionDate: "desc" }, { updatedAt: "desc" }],
    take: 4,
    select: {
      id: true,
      slug: true,
      title: true,
      summary: true,
      decisionDate: true,
    },
  });
}

function formatDate(value?: Date | null) {
  if (!value) return "Не указана";
  return new Intl.DateTimeFormat("ru-RU").format(value);
}

function buildCaseTitle(item: {
  title: string;
  region?: string | null;
}) {
  const parts = [item.title];

  if (item.region) {
    parts.push(item.region);
  }

  return `${parts.join(" — ")} | Практика ФАС | GOSZAKON`;
}

function buildCaseDescription(item: {
  summary?: string | null;
  violation?: string | null;
  result?: string | null;
  customerName?: string | null;
  region?: string | null;
}) {
  const raw =
    item.summary ||
    item.result ||
    item.violation ||
    [
      item.customerName ? `Заказчик: ${item.customerName}` : null,
      item.region ? `Регион: ${item.region}` : null,
    ]
      .filter(Boolean)
      .join(". ");

  if (!raw) {
    return "Практика ФАС по закупочным спорам: обстоятельства дела, позиция комиссии и практический вывод.";
  }

  return raw.length > 170 ? `${raw.slice(0, 167)}...` : raw;
}

function getRelatedLinks(categoryName?: string | null) {
  const category = (categoryName || "").toLowerCase();

  if (category.includes("рнп")) {
    return [
      {
        title: "Раздел РНП",
        text: "Материалы о включении в реестр, рисках для поставщика и защите позиции в ФАС.",
        href: "/rnp",
      },
      {
        title: "Услуга: риск РНП",
        text: "Если есть риск включения в реестр, важно заранее собрать позицию и документы.",
        href: "/uslugi/risk-rnp",
      },
      {
        title: "Судебная защита",
        text: "Если спор выходит за пределы административной стадии, может потребоваться дальнейшая защита в суде.",
        href: "/sudebnaya-zashita-v-zakupkah",
      },
    ];
  }

  if (
    category.includes("товар") ||
    category.includes("знак") ||
    category.includes("националь") ||
    category.includes("конкуренц")
  ) {
    return [
      {
        title: "Категории нарушений",
        text: "Посмотрите связанные категории нарушений и основания для жалобы в ФАС.",
        href: "/narusheniya",
      },
      {
        title: "Услуга: жалоба в ФАС",
        text: "Если по закупке есть спорные условия документации, следующим шагом обычно становится подготовка жалобы.",
        href: "/uslugi/zhaloba-v-fas",
      },
      {
        title: "Услуга: проверка закупки",
        text: "Если нужно сначала оценить перспективу спора и силу позиции, начните с проверки закупки.",
        href: "/uslugi/proverka-zakupki",
      },
    ];
  }

  return [
    {
      title: "Практика ФАС",
      text: "Посмотрите другие материалы из практики по жалобам, закупочным спорам и решениям комиссии.",
      href: "/cases",
    },
    {
      title: "Услуги поставщикам",
      text: "Если у вас похожая ситуация, можно перейти к страницам услуг и выбрать подходящий формат защиты.",
      href: "/uslugi",
    },
    {
      title: "Судебная защита",
      text: "Если спор требует продолжения после ФАС, посмотрите раздел о судебной защите в закупочных конфликтах.",
      href: "/sudebnaya-zashita-v-zakupkah",
    },
  ];
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const resolved = await params;
  const parsed = parseCaseParam(resolved.id);

  if (!parsed) {
    return {
      title: "Кейс не найден | GOSZAKON",
    };
  }

  const item = await getCaseById(parsed.numericId);

  if (!item || !item.published) {
    return {
      title: "Кейс не найден | GOSZAKON",
    };
  }

  const title = buildCaseTitle(item);
  const description = buildCaseDescription(item);
  const canonicalPath = getCasePath(item);
  const canonicalUrl = `${SITE_URL}${canonicalPath}`;

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
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function CasePage({ params }: PageProps) {
  const resolved = await params;
  const parsed = parseCaseParam(resolved.id);

  if (!parsed) {
    notFound();
  }

  const item = await getCaseById(parsed.numericId);

  if (!item || !item.published) {
    notFound();
  }

  const canonicalPath = getCasePath(item);

  if (resolved.id !== canonicalPath.replace("/cases/", "")) {
    redirect(canonicalPath);
  }

  const [relatedCases, customerCases] = await Promise.all([
    getRelatedCases(item),
    getCustomerCases(item),
  ]);

  const relatedLinks = getRelatedLinks(item.category?.name);
  const canonicalUrl = `${SITE_URL}${canonicalPath}`;

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: item.title,
    description: buildCaseDescription(item),
    datePublished: item.createdAt.toISOString(),
    dateModified: item.updatedAt.toISOString(),
    mainEntityOfPage: canonicalUrl,
    publisher: {
      "@type": "Organization",
      name: "GOSZAKON",
      url: SITE_URL,
    },
  };

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-5xl px-6 py-16 lg:py-20">
          <div className="mb-8 flex flex-wrap items-center gap-4">
            <Link
              href="/cases"
              className="text-sm font-medium text-slate-500 transition hover:text-slate-700"
            >
              ← Назад к практике ФАС
            </Link>

            {item.category?.name ? (
              <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
                {item.category.name}
              </span>
            ) : null}

            <span className="text-sm text-slate-400">Материал #{item.id}</span>
          </div>

          <h1 className="max-w-4xl text-4xl font-bold tracking-tight text-[#081a4b] md:text-6xl">
            {item.title}
          </h1>

          {item.summary ? (
            <p className="mt-6 max-w-3xl text-xl leading-9 text-slate-700">
              {item.summary}
            </p>
          ) : null}

          <div className="mt-8 grid gap-4 md:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <div className="text-xs uppercase tracking-wide text-slate-400">
                Дата решения
              </div>
              <div className="mt-2 text-base font-semibold text-slate-900">
                {formatDate(item.decisionDate)}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <div className="text-xs uppercase tracking-wide text-slate-400">
                Регион
              </div>
              <div className="mt-2 text-base font-semibold text-slate-900">
                {item.region || "Не указан"}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <div className="text-xs uppercase tracking-wide text-slate-400">
                Закупка
              </div>
              <div className="mt-2 text-base font-semibold text-slate-900">
                {item.procurementNumber || "Не указана"}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <div className="text-xs uppercase tracking-wide text-slate-400">
                Предмет
              </div>
              <div className="mt-2 text-base font-semibold text-slate-900">
                {item.subject || "Не указан"}
              </div>
            </div>
          </div>

          {item.customerInn ? (
            <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-medium uppercase tracking-[0.14em] text-slate-400">
                    Карточка заказчика
                  </div>
                  <div className="mt-2 text-lg font-semibold text-[#081a4b]">
                    {item.customerName || "Заказчик"} · ИНН {item.customerInn}
                  </div>
                </div>

                <Link
                  href={`/zakazchik/${item.customerInn}`}
                  className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-[#081a4b] transition hover:bg-slate-100"
                >
                  Вся практика по заказчику
                </Link>
              </div>
            </div>
          ) : null}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            {item.pdfUrl ? (
              <a
                href={item.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-2xl bg-[#081a4b] px-6 py-4 text-base font-semibold text-white transition hover:bg-[#0d2568]"
              >
                Открыть PDF решения
              </a>
            ) : null}

            <Link
              href="/cases"
              className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-6 py-4 text-base font-semibold text-[#081a4b] transition hover:bg-slate-50"
            >
              Вся практика ФАС
            </Link>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
            <article className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="space-y-10">
                {item.violation ? (
                  <section>
                    <h2 className="text-2xl font-semibold text-[#081a4b]">
                      Ситуация
                    </h2>
                    <p className="mt-4 whitespace-pre-line text-base leading-8 text-slate-700">
                      {item.violation}
                    </p>
                  </section>
                ) : null}

                {item.applicantPosition ? (
                  <section>
                    <h2 className="text-2xl font-semibold text-[#081a4b]">
                      Позиция заявителя
                    </h2>
                    <p className="mt-4 whitespace-pre-line text-base leading-8 text-slate-700">
                      {item.applicantPosition}
                    </p>
                  </section>
                ) : null}

                {item.decision ? (
                  <section>
                    <h2 className="text-2xl font-semibold text-[#081a4b]">
                      Что исследовала комиссия
                    </h2>
                    <p className="mt-4 whitespace-pre-line text-base leading-8 text-slate-700">
                      {item.decision}
                    </p>
                  </section>
                ) : null}

                {item.result ? (
                  <section>
                    <h2 className="text-2xl font-semibold text-[#081a4b]">
                      Практический вывод
                    </h2>
                    <p className="mt-4 whitespace-pre-line text-base leading-8 text-slate-700">
                      {item.result}
                    </p>
                  </section>
                ) : null}

                <section className="rounded-3xl bg-[#081a4b] p-8 text-white shadow-sm">
                  <div className="inline-flex rounded-full border border-white/20 px-4 py-2 text-sm text-white/80">
                    Оценка ситуации
                  </div>

                  <h2 className="mt-5 text-3xl font-bold tracking-tight">
                    Похожая ситуация по закупке?
                  </h2>

                  <p className="mt-4 text-lg leading-9 text-white/90">
                    Разберём вашу ситуацию и оценим перспективу жалобы в ФАС,
                    риски по закупке и возможную стратегию защиты.
                  </p>

                  <div className="mt-6 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl border border-white/15 bg-white/5 p-4 text-sm leading-7 text-white/90">
                      Оценка перспектив жалобы
                    </div>
                    <div className="rounded-2xl border border-white/15 bg-white/5 p-4 text-sm leading-7 text-white/90">
                      Выявление нарушений и слабых мест
                    </div>
                    <div className="rounded-2xl border border-white/15 bg-white/5 p-4 text-sm leading-7 text-white/90">
                      Рекомендация по следующему шагу
                    </div>
                  </div>

                  <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <a
                      href={SITE_CONTACTS.emailHref}
                      className="inline-flex items-center justify-center rounded-2xl border border-white/20 px-6 py-4 text-base font-semibold text-white transition hover:bg-white/10"
                    >
                      Отправить материалы
                    </a>

                    <a
                      href={SITE_CONTACTS.phoneHref}
                      className="inline-flex items-center justify-center rounded-2xl border border-white/20 px-6 py-4 text-base font-semibold text-white transition hover:bg-white/10"
                    >
                      {SITE_CONTACTS.phoneDisplay}
                    </a>
                  </div>
                </section>
              </div>
            </article>

            <aside className="space-y-6">
              <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-[#081a4b]">
                  Ключевые данные
                </h2>

                <dl className="mt-5 space-y-4 text-sm leading-7 text-slate-700">
                  <div>
                    <dt className="font-semibold text-slate-900">Заказчик</dt>
                    <dd>
                      {item.customerInn ? (
                        <Link
                          href={`/zakazchik/${item.customerInn}`}
                          className="text-[#081a4b] underline-offset-4 transition hover:underline"
                        >
                          {item.customerName || "Открыть карточку заказчика"}
                        </Link>
                      ) : (
                        item.customerName || "Не указан"
                      )}
                    </dd>
                  </div>

                  <div>
                    <dt className="font-semibold text-slate-900">ИНН</dt>
                    <dd>{item.customerInn || "Не указан"}</dd>
                  </div>

                  <div>
                    <dt className="font-semibold text-slate-900">КПП</dt>
                    <dd>{item.customerKpp || "Не указан"}</dd>
                  </div>

                  <div>
                    <dt className="font-semibold text-slate-900">Нарушение</dt>
                    <dd>{item.violation || "Не указано"}</dd>
                  </div>

                  <div>
                    <dt className="font-semibold text-slate-900">Итог</dt>
                    <dd>{item.result || "Не указан"}</dd>
                  </div>
                </dl>
              </section>

              <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-[#081a4b]">
                  Полезные разделы
                </h2>

                <div className="mt-5 space-y-4">
                  {relatedLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="block rounded-2xl border border-slate-200 p-4 transition hover:bg-slate-50"
                    >
                      <div className="font-semibold text-slate-900">
                        {link.title}
                      </div>
                      <div className="mt-2 text-sm leading-7 text-slate-600">
                        {link.text}
                      </div>
                    </Link>
                  ))}
                </div>
              </section>

              {customerCases.length ? (
                <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h2 className="text-xl font-semibold text-[#081a4b]">
                    Еще кейсы по этому заказчику
                  </h2>

                  <div className="mt-5 space-y-4">
                    {customerCases.map((relatedCase) => (
                      <Link
                        key={relatedCase.id}
                        href={getCasePath(relatedCase)}
                        className="block rounded-2xl border border-slate-200 p-4 transition hover:bg-slate-50"
                      >
                        <div className="text-xs uppercase tracking-[0.12em] text-slate-400">
                          {formatDate(relatedCase.decisionDate)}
                        </div>
                        <div className="mt-2 font-semibold text-slate-900">
                          {relatedCase.title}
                        </div>
                        {relatedCase.summary ? (
                          <div className="mt-2 text-sm leading-7 text-slate-600">
                            {relatedCase.summary}
                          </div>
                        ) : null}
                      </Link>
                    ))}
                  </div>
                </section>
              ) : null}
            </aside>
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-[#081a4b]">
                Похожие кейсы
              </h2>
              <p className="mt-3 max-w-2xl text-base leading-8 text-slate-600">
                Близкая практика по теме, региону или категории для быстрого сравнения.
              </p>
            </div>

            <Link
              href="/cases"
              className="hidden rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-[#081a4b] transition hover:bg-slate-50 md:inline-flex"
            >
              Смотреть все кейсы
            </Link>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {relatedCases.length === 0 ? (
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-slate-600">
                Пока нет похожих кейсов для автоматической подборки.
              </div>
            ) : (
              relatedCases.map((relatedCase) => (
                <Link
                  key={relatedCase.id}
                  href={getCasePath(relatedCase)}
                  className="rounded-3xl border border-slate-200 bg-slate-50 p-6 transition hover:bg-white hover:shadow-sm"
                >
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                      {formatDate(relatedCase.decisionDate)}
                    </span>

                    {relatedCase.category?.name ? (
                      <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                        {relatedCase.category.name}
                      </span>
                    ) : null}
                  </div>

                  <h3 className="mt-4 text-xl font-semibold leading-8 text-[#081a4b]">
                    {relatedCase.title}
                  </h3>

                  {relatedCase.summary ? (
                    <p className="mt-3 text-sm leading-7 text-slate-600">
                      {relatedCase.summary}
                    </p>
                  ) : null}
                </Link>
              ))
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
