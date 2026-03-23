import type { Metadata } from "next";
import Link from "next/link";
import { Prisma } from "@prisma/client";
import { getPrisma } from "@/lib/prisma";
import { getCasePath } from "@/lib/cases";
import { SITE_CONTACTS } from "@/lib/site-config";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Практика ФАС по товарному знаку и ограничению конкуренции | GOSZAKON",
  description:
    "Подборка практики ФАС по товарному знаку, эквивалентам, избыточным требованиям и ограничению конкуренции в закупочной документации.",
};

const keySignals = [
  "В документации указан конкретный товарный знак без реальной возможности поставить эквивалент.",
  "Условия закупки выглядят формально нейтральными, но по факту сужают круг участников.",
  "Избыточные требования к участникам или товару не связаны с предметом закупки и ограничивают конкуренцию.",
];

const practiceConclusions = [
  "По таким спорам важно анализировать не только отдельную фразу в документации, а весь эффект закупочных условий для рынка.",
  "Формальное упоминание эквивалента не спасает заказчика, если по сути поставить аналогичный товар невозможно.",
  "Сильная жалоба строится там, где можно показать: требования не просто неудобны, а реально исключают часть поставщиков или производителей.",
];

function formatDate(value?: Date | null) {
  if (!value) return "Дата не указана";
  return new Intl.DateTimeFormat("ru-RU").format(value);
}

function getDocumentationWhere(): Prisma.CaseWhereInput {
  const terms = [
    "товарн",
    "эквивалент",
    "конкуренц",
    "документац",
    "требован",
    "участник",
  ];

  return {
    published: true,
    OR: [
      {
        violation: {
          equals: "Товарный знак",
        },
      },
      {
        violation: {
          equals: "Ограничение конкуренции",
        },
      },
      ...terms.flatMap((term) => [
        {
          title: {
            contains: term,
            mode: Prisma.QueryMode.insensitive,
          },
        },
        {
          summary: {
            contains: term,
            mode: Prisma.QueryMode.insensitive,
          },
        },
        {
          subject: {
            contains: term,
            mode: Prisma.QueryMode.insensitive,
          },
        },
        {
          violation: {
            contains: term,
            mode: Prisma.QueryMode.insensitive,
          },
        },
        {
          result: {
            contains: term,
            mode: Prisma.QueryMode.insensitive,
          },
        },
      ]),
    ],
  };
}

export default async function DocumentationCompetitionHubPage() {
  const prisma = getPrisma();
  const where = getDocumentationWhere();

  const [totalCount, cases] = await Promise.all([
    prisma.case.count({ where }),
    prisma.case.findMany({
      where,
      orderBy: [{ isFeatured: "desc" }, { decisionDate: "desc" }, { updatedAt: "desc" }],
      take: 12,
      include: {
        category: true,
      },
    }),
  ]);

  const featuredCases = cases.filter((item) => item.isFeatured).slice(0, 3);
  const recentCases = cases.slice(0, 6);

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
          <div>
            <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600">
              Практика ФАС по теме
            </div>

            <h1 className="mt-6 max-w-5xl text-5xl font-bold leading-[1.02] tracking-tight text-[#081a4b] md:text-7xl">
              Практика ФАС по товарному знаку и ограничению конкуренции
            </h1>

            <p className="mt-6 max-w-3xl text-xl leading-9 text-slate-700">
              Это подборка решений по закупочной документации, где спор идет о
              товарном знаке, эквивалентах, избыточных требованиях и фактическом
              ограничении конкуренции.
            </p>

            <p className="mt-4 max-w-3xl text-lg leading-9 text-slate-700">
              В таких делах важно не просто увидеть спорную формулировку, а
              показать, как именно документация влияет на допуск участников,
              возможность предложить эквивалент и реальную конкурентную среду.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/uslugi/zhaloba-v-fas"
                className="rounded-2xl bg-[#081a4b] px-7 py-4 text-center text-base font-semibold text-white transition hover:bg-[#0d2568]"
              >
                Разобрать документацию
              </Link>

              <Link
                href="/cases?violation=%D0%A2%D0%BE%D0%B2%D0%B0%D1%80%D0%BD%D1%8B%D0%B9%20%D0%B7%D0%BD%D0%B0%D0%BA"
                className="rounded-2xl border border-slate-300 bg-white px-7 py-4 text-center text-base font-semibold text-[#081a4b] transition hover:bg-slate-50"
              >
                Смотреть все решения по теме
              </Link>
            </div>
          </div>

          <div className="grid gap-5">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-7 shadow-sm">
              <div className="text-sm uppercase tracking-[0.14em] text-slate-400">
                Что чаще всего становится предметом спора
              </div>

              <div className="mt-5 space-y-4">
                {keySignals.map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-slate-200 bg-white p-5"
                  >
                    <p className="text-base leading-8 text-slate-700">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl bg-[#081a4b] p-7 text-white shadow-sm">
              <div className="text-sm uppercase tracking-[0.14em] text-white/60">
                В базе по теме
              </div>
              <div className="mt-4 text-5xl font-bold">{totalCount}</div>
              <p className="mt-3 text-lg leading-9 text-white/90">
                кейсов по товарному знаку, эквивалентам, спорной документации и
                ограничению конкуренции в закупках.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="max-w-3xl">
            <div className="inline-flex rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600">
              Как читать подборку
            </div>

            <h2 className="mt-5 text-4xl font-bold tracking-tight text-[#081a4b] md:text-5xl">
              Здесь важна не одна формулировка, а весь эффект документации
            </h2>

            <p className="mt-5 text-lg leading-9 text-slate-700">
              Самые сильные дела по документации — те, где видно, как спорное
              условие реально влияет на поставщика: делает невозможной подачу
              заявки, закрывает путь для эквивалента или создает преимущество
              для заранее удобного участника.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {practiceConclusions.map((item) => (
              <div
                key={item}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <p className="text-base leading-8 text-slate-700">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600">
                Показательные кейсы
              </div>
              <h2 className="mt-5 text-4xl font-bold tracking-tight text-[#081a4b]">
                С чего начать изучение практики
              </h2>
              <p className="mt-4 text-lg leading-9 text-slate-700">
                Лучше всего начинать с решений, где ФАС прямо показала, почему
                товарный знак или структура требований сделали закупку спорной
                для рынка.
              </p>
            </div>

            <Link
              href="/cases?sort=featured&violation=%D0%A2%D0%BE%D0%B2%D0%B0%D1%80%D0%BD%D1%8B%D0%B9%20%D0%B7%D0%BD%D0%B0%D0%BA"
              className="inline-flex rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-[#081a4b] transition hover:bg-slate-50"
            >
              Открыть расширенную выборку
            </Link>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            {(featuredCases.length ? featuredCases : recentCases.slice(0, 3)).map((item) => (
              <Link
                key={item.id}
                href={getCasePath(item)}
                className="rounded-3xl border border-slate-200 bg-slate-50 p-6 transition hover:bg-white hover:shadow-sm"
              >
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                    {formatDate(item.decisionDate)}
                  </span>
                  {item.category?.name ? (
                    <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                      {item.category.name}
                    </span>
                  ) : null}
                </div>

                <h3 className="mt-4 text-xl font-semibold leading-8 text-[#081a4b]">
                  {item.title}
                </h3>

                {item.summary ? (
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    {item.summary}
                  </p>
                ) : null}

                <div className="mt-4 flex flex-wrap gap-2">
                  {item.subject ? (
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
                      Суть: {item.subject}
                    </span>
                  ) : null}
                  {item.result ? (
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
                      Итог: {item.result}
                    </span>
                  ) : null}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600">
                Все свежие решения
              </div>
              <h2 className="mt-5 text-4xl font-bold tracking-tight text-[#081a4b]">
                Свежая практика по документации и конкуренции
              </h2>
              <p className="mt-4 text-lg leading-9 text-slate-700">
                Ниже собраны решения, которые помогают увидеть, как ФАС смотрит
                на эквиваленты, спорные характеристики товара и ограничительные
                требования к участникам.
              </p>
            </div>

            <Link
              href="/cases"
              className="inline-flex rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-[#081a4b] transition hover:bg-slate-50"
            >
              Вернуться в базу практики
            </Link>
          </div>

          <div className="mt-8 space-y-5">
            {recentCases.map((item) => (
              <article
                key={item.id}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
                        {formatDate(item.decisionDate)}
                      </span>
                      {item.violation ? (
                        <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
                          {item.violation}
                        </span>
                      ) : null}
                      {item.customerInn ? (
                        <Link
                          href={`/zakazchik/${item.customerInn}`}
                          className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                        >
                          ИНН {item.customerInn}
                        </Link>
                      ) : null}
                    </div>

                    <h3 className="mt-4 text-2xl font-semibold leading-9 text-[#081a4b]">
                      <Link href={getCasePath(item)} className="transition hover:opacity-80">
                        {item.title}
                      </Link>
                    </h3>

                    {item.summary ? (
                      <p className="mt-3 text-base leading-8 text-slate-700">
                        {item.summary}
                      </p>
                    ) : null}

                    <div className="mt-5 grid gap-3 md:grid-cols-3">
                      <div className="rounded-2xl bg-slate-50 p-4">
                        <div className="text-xs uppercase tracking-[0.12em] text-slate-400">
                          Предмет спора
                        </div>
                        <div className="mt-2 text-sm leading-7 text-slate-700">
                          {item.subject || "Не указан"}
                        </div>
                      </div>
                      <div className="rounded-2xl bg-slate-50 p-4">
                        <div className="text-xs uppercase tracking-[0.12em] text-slate-400">
                          Заказчик
                        </div>
                        <div className="mt-2 text-sm leading-7 text-slate-700">
                          {item.customerName || "Не указан"}
                        </div>
                      </div>
                      <div className="rounded-2xl bg-slate-50 p-4">
                        <div className="text-xs uppercase tracking-[0.12em] text-slate-400">
                          Практический результат
                        </div>
                        <div className="mt-2 text-sm leading-7 text-slate-700">
                          {item.result || "Уточняется"}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="w-full md:w-auto">
                    <Link
                      href={getCasePath(item)}
                      className="inline-flex rounded-2xl bg-[#081a4b] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0d2568]"
                    >
                      Читать кейс
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="rounded-3xl bg-[#081a4b] p-8 text-white shadow-sm">
              <div className="inline-flex rounded-full border border-white/20 px-4 py-2 text-sm text-white/80">
                Если ситуация похожа на вашу
              </div>

              <h2 className="mt-6 text-3xl font-bold tracking-tight">
                По документации важно быстро понять: это спорная формулировка или сильное основание для жалобы
              </h2>

              <p className="mt-5 text-lg leading-9 text-white/90">
                В делах о товарном знаке и ограничении конкуренции время играет
                против поставщика. Мы можем быстро посмотреть документацию,
                найти рабочие доводы и сказать, есть ли у жалобы реальная перспектива.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a
                  href={SITE_CONTACTS.phoneHref}
                  className="rounded-2xl bg-white px-6 py-4 text-center text-sm font-semibold text-[#081a4b] transition hover:bg-slate-100"
                >
                  Обсудить закупку
                </a>
                <a
                  href={SITE_CONTACTS.emailHref}
                  className="rounded-2xl border border-white/20 px-6 py-4 text-center text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Направить документацию
                </a>
              </div>
            </div>

            <div className="grid gap-5">
              <Link
                href="/narusheniya-tovarnyj-znak"
                className="rounded-3xl border border-slate-200 bg-slate-50 p-7 shadow-sm transition hover:bg-white"
              >
                <div className="text-lg font-semibold text-[#081a4b]">
                  Товарный знак
                </div>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  Отдельно разбираем, когда ссылка на товарный знак и эквивалент
                  превращаются в нарушение документации.
                </p>
              </Link>

              <Link
                href="/narusheniya-ogranichenie-konkurencii"
                className="rounded-3xl border border-slate-200 bg-slate-50 p-7 shadow-sm transition hover:bg-white"
              >
                <div className="text-lg font-semibold text-[#081a4b]">
                  Ограничение конкуренции
                </div>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  Материалы по избыточным требованиям, спорной документации и
                  искусственному сужению круга участников.
                </p>
              </Link>

              <Link
                href="/uslugi/proverka-zakupki"
                className="rounded-3xl border border-slate-200 bg-slate-50 p-7 shadow-sm transition hover:bg-white"
              >
                <div className="text-lg font-semibold text-[#081a4b]">
                  Проверка закупки
                </div>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  Если нужно быстро оценить перспективу жалобы и силу позиции
                  по документации, удобнее всего начать с проверки закупки.
                </p>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
