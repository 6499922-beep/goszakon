import Link from "next/link";
import { Prisma } from "@prisma/client";
import { getPrisma } from "@/lib/prisma";
import { getCasePath } from "@/lib/cases";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 24;

type PageProps = {
  searchParams: Promise<{
    q?: string;
    region?: string;
    violation?: string;
    category?: string;
    page?: string;
    sort?: string;
  }>;
};

const quickCollections = [
  {
    title: "Неоплата по контракту",
    description: "Кейсы, где заказчик задерживал оплату, удерживал деньги или создавал искусственные препятствия.",
    href: "/cases/neoplata",
  },
  {
    title: "РНП и защита поставщика",
    description: "Подборка решений по включению в реестр, добросовестности поставщика и защите в ФАС.",
    href: "/cases/rnp",
  },
  {
    title: "Неустойка и удержания",
    description: "Практика по завышенным санкциям, штрафам, удержаниям и спорным условиям контракта.",
    href: "/cases/neustoyka",
  },
  {
    title: "Товарный знак и ограничение конкуренции",
    description: "Решения по документации закупки, эквивалентам, ограничению конкуренции и спорным требованиям.",
    href: "/cases/dokumentaciya-i-konkurenciya",
  },
];

const sortOptions = [
  { value: "recent", label: "Сначала свежие решения" },
  { value: "featured", label: "Сначала важные кейсы" },
  { value: "updated", label: "Сначала недавно обновленные" },
];

function formatDate(value?: Date | null) {
  if (!value) return "Дата не указана";
  return new Intl.DateTimeFormat("ru-RU").format(value);
}

function parsePage(value?: string) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return 1;
  }
  return parsed;
}

function buildPageHref(params: {
  q?: string;
  region?: string;
  violation?: string;
  category?: string;
  page?: number;
  sort?: string;
}) {
  const search = new URLSearchParams();

  if (params.q) search.set("q", params.q);
  if (params.region) search.set("region", params.region);
  if (params.violation) search.set("violation", params.violation);
  if (params.category) search.set("category", params.category);
  if (params.sort && params.sort !== "recent") search.set("sort", params.sort);
  if (params.page && params.page > 1) search.set("page", String(params.page));

  const query = search.toString();
  return query ? `/cases?${query}` : "/cases";
}

export default async function CasesPage({ searchParams }: PageProps) {
  const prisma = getPrisma();
  const params = await searchParams;

  const q = (params.q || "").trim();
  const region = (params.region || "").trim();
  const violation = (params.violation || "").trim();
  const category = (params.category || "").trim();
  const sort = (params.sort || "recent").trim();
  const page = parsePage(params.page);

  const safeSort = sortOptions.some((item) => item.value === sort) ? sort : "recent";

  const where: Prisma.CaseWhereInput = {
    published: true,
    ...(q
      ? {
          OR: [
            {
              title: {
                contains: q,
                mode: Prisma.QueryMode.insensitive,
              },
            },
            {
              procurementNumber: {
                contains: q,
                mode: Prisma.QueryMode.insensitive,
              },
            },
            {
              customerName: {
                contains: q,
                mode: Prisma.QueryMode.insensitive,
              },
            },
            {
              customerInn: {
                contains: q,
                mode: Prisma.QueryMode.insensitive,
              },
            },
            {
              region: {
                contains: q,
                mode: Prisma.QueryMode.insensitive,
              },
            },
            {
              violation: {
                contains: q,
                mode: Prisma.QueryMode.insensitive,
              },
            },
            {
              result: {
                contains: q,
                mode: Prisma.QueryMode.insensitive,
              },
            },
            {
              subject: {
                contains: q,
                mode: Prisma.QueryMode.insensitive,
              },
            },
            {
              summary: {
                contains: q,
                mode: Prisma.QueryMode.insensitive,
              },
            },
          ],
        }
      : {}),
    ...(region
      ? {
          region: {
            equals: region,
            mode: Prisma.QueryMode.insensitive,
          },
        }
      : {}),
    ...(violation
      ? {
          violation: {
            equals: violation,
            mode: Prisma.QueryMode.insensitive,
          },
        }
      : {}),
    ...(category
      ? {
          category: {
            slug: category,
          },
        }
      : {}),
  };

  const totalCount = await prisma.case.count({ where });
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const skip = (safePage - 1) * PAGE_SIZE;

  const [cases, categories, regionOptionsRaw, violationOptionsRaw] =
    await Promise.all([
      prisma.case.findMany({
        where,
        orderBy:
          safeSort === "featured"
            ? [{ isFeatured: "desc" }, { decisionDate: "desc" }, { updatedAt: "desc" }]
            : safeSort === "updated"
              ? [{ updatedAt: "desc" }, { decisionDate: "desc" }, { isFeatured: "desc" }]
              : [{ decisionDate: "desc" }, { isFeatured: "desc" }, { updatedAt: "desc" }],
        skip,
        take: PAGE_SIZE,
        include: {
          category: true,
        },
      }),
      prisma.category.findMany({
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
          slug: true,
        },
      }),
      prisma.case.findMany({
        where: {
          published: true,
          region: { not: null },
        },
        distinct: ["region"],
        orderBy: { region: "asc" },
        select: {
          region: true,
        },
      }),
      prisma.case.findMany({
        where: {
          published: true,
          violation: { not: null },
        },
        distinct: ["violation"],
        orderBy: { violation: "asc" },
        select: {
          violation: true,
        },
      }),
    ]);

  const regionOptions = regionOptionsRaw
    .map((item) => item.region)
    .filter((value): value is string => Boolean(value));

  const violationOptions = violationOptionsRaw
    .map((item) => item.violation)
    .filter((value): value is string => Boolean(value));

  const hasFilters = Boolean(q || region || violation || category);

  const prevHref =
    safePage > 1
      ? buildPageHref({
          q,
          region,
          violation,
          category,
          sort: safeSort,
          page: safePage - 1,
        })
      : null;

  const nextHref =
    safePage < totalPages
      ? buildPageHref({
          q,
          region,
          violation,
          category,
          sort: safeSort,
          page: safePage + 1,
        })
      : null;

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="max-w-3xl">
          <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600">
            База практики ФАС
          </div>

          <h1 className="mt-5 text-5xl font-bold tracking-tight text-[#081a4b]">
            База практики ФАС
          </h1>

          <p className="mt-4 text-lg leading-8 text-slate-600">
            Не просто архив решений, а рабочая база по закупочным спорам. Ищите
            практику по номеру закупки, ИНН заказчика, нарушению, категории,
            региону или типу результата.
          </p>
        </div>

        <div className="mt-8 grid gap-4 xl:grid-cols-4">
          {quickCollections.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="text-lg font-semibold text-[#081a4b]">{item.title}</div>
              <p className="mt-3 text-sm leading-7 text-slate-600">{item.description}</p>
              <span className="mt-4 inline-flex text-sm font-semibold text-[#081a4b]">
                Открыть подборку →
              </span>
            </Link>
          ))}
        </div>

        <form className="mt-8 rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
          <div className="grid gap-4 lg:grid-cols-12">
            <div className="lg:col-span-12 xl:col-span-5">
              <label className="block text-sm font-medium text-slate-700">
                Поиск
              </label>
              <input
                name="q"
                defaultValue={q}
                placeholder="Номер закупки, ИНН, заказчик, нарушение..."
                className="mt-2 h-14 w-full rounded-2xl border border-slate-300 bg-white px-5 text-base outline-none focus:border-[#081a4b]"
              />
            </div>

            <div className="lg:col-span-4 xl:col-span-2">
              <label className="block text-sm font-medium text-slate-700">
                Регион
              </label>
              <select
                name="region"
                defaultValue={region}
                className="mt-2 h-14 w-full rounded-2xl border border-slate-300 bg-white px-4 text-sm outline-none focus:border-[#081a4b]"
              >
                <option value="">Все регионы</option>
                {regionOptions.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div className="lg:col-span-4 xl:col-span-2">
              <label className="block text-sm font-medium text-slate-700">
                Нарушение
              </label>
              <select
                name="violation"
                defaultValue={violation}
                className="mt-2 h-14 w-full rounded-2xl border border-slate-300 bg-white px-4 text-sm outline-none focus:border-[#081a4b]"
                title={violation || "Все нарушения"}
              >
                <option value="">Все нарушения</option>
                {violationOptions.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div className="lg:col-span-4 xl:col-span-2">
              <label className="block text-sm font-medium text-slate-700">
                Категория
              </label>
              <select
                name="category"
                defaultValue={category}
                className="mt-2 h-14 w-full rounded-2xl border border-slate-300 bg-white px-4 text-sm outline-none focus:border-[#081a4b]"
                title={
                  categories.find((item) => item.slug === category)?.name ||
                  "Все категории"
                }
              >
                <option value="">Все категории</option>
                {categories.map((item) => (
                  <option key={item.id} value={item.slug}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="lg:col-span-4 xl:col-span-2">
              <label className="block text-sm font-medium text-slate-700">
                Сортировка
              </label>
              <select
                name="sort"
                defaultValue={safeSort}
                className="mt-2 h-14 w-full rounded-2xl border border-slate-300 bg-white px-4 text-sm outline-none focus:border-[#081a4b]"
              >
                {sortOptions.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="lg:col-span-12 xl:col-span-1">
              <label className="block text-sm font-medium text-transparent">
                Действие
              </label>
              <button
                type="submit"
                className="mt-2 h-14 w-full rounded-2xl bg-[#081a4b] px-6 text-sm font-semibold text-white transition hover:bg-[#0d2568]"
              >
                Найти
              </button>
            </div>
          </div>

          <div className="mt-4">
            <Link
              href="/cases"
              className="inline-flex rounded-2xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Сбросить фильтры
            </Link>
          </div>
        </form>

        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-500">
          <span>Найдено кейсов: {totalCount}</span>

          <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">
            Страница {safePage} из {totalPages}
          </span>

          {hasFilters ? (
            <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">
              Показаны результаты по выбранным фильтрам
            </span>
          ) : null}

          <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">
            {sortOptions.find((item) => item.value === safeSort)?.label}
          </span>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-white p-5">
            <div className="text-base font-semibold text-[#081a4b]">
              Как пользоваться базой
            </div>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              Ищите не только по заказчику или номеру закупки. Сильнее всего
              работают фильтры по нарушению, категории и результату спора.
            </p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5">
            <div className="text-base font-semibold text-[#081a4b]">
              Что смотреть в карточке
            </div>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              Важнее всего: предмет спора, нарушение, результат, заказчик и
              связанная аналитика. Это помогает быстро понять перспективу.
            </p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5">
            <div className="text-base font-semibold text-[#081a4b]">
              Нужна оценка вашей ситуации
            </div>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              Если нашли похожую практику, следующий шаг — оценить документы,
              а не просто читать решения. Мы можем быстро посмотреть перспективу.
            </p>
          </div>
        </div>

        <div className="mt-10 space-y-6">
          {cases.length === 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 text-slate-600">
              По вашему запросу ничего не найдено. Попробуйте убрать часть
              фильтров или изменить запрос.
            </div>
          ) : (
            cases.map((item) => (
              <article
                key={item.id}
                className="rounded-3xl border border-slate-200 bg-slate-50 p-6 transition hover:bg-white hover:shadow-md"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                        {formatDate(item.decisionDate)}
                      </span>

                      {item.isFeatured ? (
                        <span className="rounded-full bg-[#081a4b] px-3 py-1 text-xs font-semibold text-white">
                          Важный кейс
                        </span>
                      ) : null}

                      {item.category?.name ? (
                        <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                          {item.category.name}
                        </span>
                      ) : null}
                    </div>

                    <h2 className="text-2xl font-semibold leading-9 text-[#081a4b]">
                      <Link href={getCasePath(item)} className="transition hover:opacity-80">
                        {item.title}
                      </Link>
                    </h2>

                    {item.summary ? (
                      <p className="mt-3 text-base leading-8 text-slate-700">
                        {item.summary}
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  {item.subject ? (
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
                      Суть спора: {item.subject}
                    </span>
                  ) : null}
                  {item.violation ? (
                    <Link
                      href={buildPageHref({ q, region, category, violation: item.violation, sort: safeSort })}
                      className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50"
                    >
                      Нарушение: {item.violation}
                    </Link>
                  ) : null}
                  {item.result ? (
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
                      Итог: {item.result}
                    </span>
                  ) : null}
                </div>

                <div className="mt-5 grid gap-3 text-sm text-slate-600 md:grid-cols-2 xl:grid-cols-4">
                  <div>
                    <span className="font-semibold text-slate-800">
                      Заказчик:
                    </span>{" "}
                    {item.customerInn ? (
                      <Link
                        href={`/zakazchik/${item.customerInn}`}
                        className="font-medium text-[#081a4b] underline-offset-4 transition hover:underline"
                      >
                        {item.customerName || "Открыть карточку заказчика"}
                      </Link>
                    ) : (
                      item.customerName || "Не указан"
                    )}
                  </div>

                  <div>
                    <span className="font-semibold text-slate-800">ИНН:</span>{" "}
                    {item.customerInn || "Не указан"}
                  </div>

                  <div>
                    <span className="font-semibold text-slate-800">
                      Регион:
                    </span>{" "}
                    {item.region || "Не указан"}
                  </div>

                  <div>
                    <span className="font-semibold text-slate-800">
                      Номер закупки:
                    </span>{" "}
                    {item.procurementNumber || "Не указан"}
                  </div>
                </div>

                {item.result ? (
                  <div className="mt-4 text-sm leading-7 text-slate-700">
                    <span className="font-semibold text-slate-800">
                      Практический результат:
                    </span>{" "}
                    {item.result}
                  </div>
                ) : null}

                <div className="mt-5 flex flex-wrap gap-3">
                  <Link
                    href={getCasePath(item)}
                    className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-[#081a4b] transition hover:bg-slate-50"
                  >
                    Открыть кейс
                  </Link>

                  {item.customerInn ? (
                    <Link
                      href={`/zakazchik/${item.customerInn}`}
                      className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      Все кейсы по заказчику
                    </Link>
                  ) : null}

                  <Link
                    href="/uslugi/proverka-zakupki"
                    className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Оценить мою ситуацию
                  </Link>
                </div>
              </article>
            ))
          )}
        </div>

        {totalPages > 1 ? (
          <div className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <div className="text-sm text-slate-600">
              Страница {safePage} из {totalPages}
            </div>

            <div className="flex items-center gap-3">
              {prevHref ? (
                <Link
                  href={prevHref}
                  className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  ← Назад
                </Link>
              ) : (
                <span className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-300">
                  ← Назад
                </span>
              )}

              {nextHref ? (
                <Link
                  href={nextHref}
                  className="rounded-2xl bg-[#081a4b] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0d2568]"
                >
                  Вперёд →
                </Link>
              ) : (
                <span className="rounded-2xl bg-slate-200 px-5 py-3 text-sm font-semibold text-slate-400">
                  Вперёд →
                </span>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}
