import type { Metadata } from "next";
import Link from "next/link";
import { getPrisma } from "@/lib/prisma";
import { SITE_URL } from "@/lib/site-config";
import {
  aggregateCustomerStats,
  buildTopViolations,
} from "@/lib/customer-case-stats";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Статистика по контрагентам и заказчикам в базе практики ФАС | GOSZAKON",
  description:
    "Сводка по заказчикам из базы практики GOSZAKON: где чаще всего возникают жалобы, какие темы споров повторяются и по каким ИНН в базе больше всего кейсов.",
  alternates: {
    canonical: `${SITE_URL}/zakazchikam/statistika-po-kontragentam`,
  },
};

async function getCustomerStats() {
  const prisma = getPrisma();

  const items = await prisma.case.findMany({
    where: {
      published: true,
      customerInn: { not: null },
      customerName: { not: null },
    },
    select: {
      customerName: true,
      customerInn: true,
      violation: true,
      result: true,
      region: true,
    },
    orderBy: [{ decisionDate: "desc" }, { updatedAt: "desc" }],
  });

  const customerStats = aggregateCustomerStats(items);
  const topViolations = buildTopViolations(items, 8);
  const totalCustomers = customerStats.length;
  const totalCases = items.length;
  const highRiskCustomers = customerStats.filter(
    (item) => item.totalCases >= 2 && item.successRate >= 50,
  );

  return {
    customerStats,
    topViolations,
    totalCustomers,
    totalCases,
    highRiskCustomers,
  };
}

export default async function CustomerStatsPage() {
  const {
    customerStats,
    topViolations,
    totalCustomers,
    totalCases,
    highRiskCustomers,
  } = await getCustomerStats();

  const featuredCustomers = customerStats.slice(0, 18);
  const mostSensitiveCustomers = highRiskCustomers.slice(0, 8);

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:py-20">
          <div className="max-w-5xl">
            <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600">
              Статистика по контрагентам
            </div>

            <h1 className="mt-6 text-4xl font-bold tracking-tight text-[#081a4b] md:text-6xl">
              Какие заказчики чаще всего попадают в жалобы и по каким темам
            </h1>

            <p className="mt-6 max-w-4xl text-lg leading-9 text-slate-700">
              Это обзор по всей нашей базе практики ФАС: какие заказчики чаще
              всего встречаются в кейсах, какие типы жалоб по ним повторяются и
              где уже видна устойчивая конфликтная практика.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/zakazchikam"
                className="rounded-2xl bg-[#081a4b] px-7 py-4 text-center text-base font-semibold text-white transition hover:bg-[#0d2568]"
              >
                Проверить заказчика по ИНН
              </Link>
              <Link
                href="/cases"
                className="rounded-2xl border border-slate-300 bg-white px-7 py-4 text-center text-base font-semibold text-[#081a4b] transition hover:bg-slate-50"
              >
                Перейти в базу практики ФАС
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="text-sm uppercase tracking-[0.12em] text-slate-400">
                Заказчиков в статистике
              </div>
              <div className="mt-3 text-4xl font-bold tracking-tight text-[#081a4b]">
                {totalCustomers}
              </div>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="text-sm uppercase tracking-[0.12em] text-slate-400">
                Кейсов с ИНН
              </div>
              <div className="mt-3 text-4xl font-bold tracking-tight text-[#081a4b]">
                {totalCases}
              </div>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="text-sm uppercase tracking-[0.12em] text-slate-400">
                Заказчиков с 2+ кейсами
              </div>
              <div className="mt-3 text-4xl font-bold tracking-tight text-[#081a4b]">
                {customerStats.filter((item) => item.totalCases >= 2).length}
              </div>
            </div>
            <div className="rounded-3xl border border-[rgba(8,26,75,0.08)] bg-[rgba(8,26,75,0.04)] p-6 shadow-sm">
              <div className="text-sm uppercase tracking-[0.12em] text-slate-400">
                Контрагентов с высокой долей результативных жалоб
              </div>
              <div className="mt-3 text-4xl font-bold tracking-tight text-[#081a4b]">
                {highRiskCustomers.length}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="max-w-3xl">
              <h2 className="text-3xl font-bold tracking-tight text-[#081a4b] md:text-4xl">
                Самые частые темы жалоб по базе
              </h2>
              <p className="mt-4 text-base leading-8 text-slate-700">
                Этот блок показывает, какие типы нарушений и спорных условий чаще
                всего повторяются у заказчиков, попавших в публичную практику.
              </p>
            </div>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {topViolations.map((item) => (
              <div
                key={item.title}
                className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm"
              >
                <div className="text-sm uppercase tracking-[0.12em] text-slate-400">
                  Повторяющаяся тема
                </div>
                <div className="mt-3 text-lg font-semibold leading-8 text-[#081a4b]">
                  {item.title}
                </div>
                <div className="mt-3 text-sm text-slate-500">
                  Кейсов в базе: {item.count}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-bold tracking-tight text-[#081a4b] md:text-4xl">
              Заказчики, по которым в базе больше всего кейсов
            </h2>
            <p className="mt-4 text-base leading-8 text-slate-700">
              Это не рейтинг нарушителей в формальном смысле, а рабочая сводка по
              тем заказчикам, чьи закупки чаще всего попадают в жалобы и практику
              ФАС.
            </p>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            {featuredCustomers.map((item) => (
              <article
                key={item.customerInn}
                className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                        ИНН {item.customerInn}
                      </span>
                      <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                        Кейсов: {item.totalCases}
                      </span>
                      <span className="rounded-full border border-[rgba(8,26,75,0.08)] bg-[rgba(8,26,75,0.04)] px-3 py-1 text-xs font-semibold text-[#081a4b]">
                        Результативных жалоб: {item.successRate}%
                      </span>
                    </div>

                    <h3 className="text-2xl font-semibold leading-9 text-[#081a4b]">
                      <Link
                        href={`/zakazchik/${item.customerInn}`}
                        className="transition hover:opacity-80"
                      >
                        {item.customerName}
                      </Link>
                    </h3>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  {item.topViolations.length ? (
                    item.topViolations.slice(0, 3).map((violation) => (
                      <span
                        key={violation.title}
                        className="rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200"
                      >
                        {violation.title} • {violation.count}
                      </span>
                    ))
                  ) : (
                    <span className="rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-500 ring-1 ring-slate-200">
                      Темы жалоб указаны не во всех карточках
                    </span>
                  )}
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600 ring-1 ring-slate-200/80">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                      Обоснованных
                    </div>
                    <div className="mt-2 leading-6 text-slate-700">
                      {item.resultSummary.justified}
                    </div>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600 ring-1 ring-slate-200/80">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                      Частично
                    </div>
                    <div className="mt-2 leading-6 text-slate-700">
                      {item.resultSummary.partial}
                    </div>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600 ring-1 ring-slate-200/80">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                      Необоснованных
                    </div>
                    <div className="mt-2 leading-6 text-slate-700">
                      {item.resultSummary.rejected}
                    </div>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600 ring-1 ring-slate-200/80">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                      Частый регион
                    </div>
                    <div className="mt-2 leading-6 text-slate-700">
                      {item.topRegions[0]?.title || "Не указан"}
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <Link
                    href={`/zakazchik/${item.customerInn}`}
                    className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-[#081a4b] transition hover:bg-slate-50"
                  >
                    Открыть карточку заказчика
                  </Link>
                  <Link
                    href={`/cases?q=${encodeURIComponent(item.customerInn)}`}
                    className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Открыть кейсы в базе
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-bold tracking-tight text-[#081a4b] md:text-4xl">
              Где особенно много результативных жалоб
            </h2>
            <p className="mt-4 text-base leading-8 text-slate-700">
              В эту выборку попадают заказчики как минимум с двумя кейсами в базе,
              у которых заметна высокая доля обоснованных или частично обоснованных жалоб.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {mostSensitiveCustomers.map((item) => (
              <Link
                key={item.customerInn}
                href={`/zakazchik/${item.customerInn}`}
                className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm transition hover:bg-white"
              >
                <div className="text-sm uppercase tracking-[0.12em] text-slate-400">
                  ИНН {item.customerInn}
                </div>
                <div className="mt-3 text-lg font-semibold leading-8 text-[#081a4b]">
                  {item.customerName}
                </div>
                <div className="mt-3 text-sm text-slate-600">
                  Кейсов: {item.totalCases}
                </div>
                <div className="mt-1 text-sm text-slate-600">
                  Результативных жалоб: {item.successRate}%
                </div>
                <div className="mt-3 text-sm text-slate-500">
                  Частая тема: {item.topViolations[0]?.title || "недостаточно данных"}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
