import Link from "next/link";
import { Prisma } from "@prisma/client";
import CustomerInnSearch from "@/app/zakazchikam/_components/customer-inn-search";
import { getPrisma } from "@/lib/prisma";
import { SITE_CONTACTS } from "@/lib/site-config";

type PageProps = {
  searchParams: Promise<{ q?: string }>;
};

type CustomerSearchItem = {
  customerName: string;
  customerInn: string;
  count: number;
};

async function searchCustomers(query: string): Promise<CustomerSearchItem[]> {
  const normalizedQuery = query.trim();
  if (!normalizedQuery) return [];

  const prisma = getPrisma();
  const digitsOnly = normalizedQuery.replace(/\D/g, "");

  const where: Prisma.CaseWhereInput = {
    published: true,
    customerInn: { not: null },
    customerName: { not: null },
    OR: [
      {
        customerName: {
          contains: normalizedQuery,
          mode: Prisma.QueryMode.insensitive,
        },
      },
      ...(digitsOnly
        ? [
            {
              customerInn: {
                contains: digitsOnly,
                mode: Prisma.QueryMode.insensitive,
              },
            } satisfies Prisma.CaseWhereInput,
          ]
        : []),
    ],
  };

  const items = await prisma.case.findMany({
    where,
    select: {
      customerName: true,
      customerInn: true,
    },
    orderBy: { updatedAt: "desc" },
    take: 200,
  });

  const grouped = new Map<string, CustomerSearchItem>();

  for (const item of items) {
    const inn = item.customerInn?.trim();
    const name = item.customerName?.trim();

    if (!inn || !name) continue;

    const existing = grouped.get(inn);
    if (existing) {
      existing.count += 1;
      continue;
    }

    grouped.set(inn, {
      customerInn: inn,
      customerName: name,
      count: 1,
    });
  }

  return [...grouped.values()]
    .sort((a, b) => b.count - a.count || a.customerName.localeCompare(b.customerName))
    .slice(0, 12);
}

export default async function CustomersPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const query = (params.q || "").trim();
  const searchResults = query ? await searchCustomers(query) : [];

  const directions = [
    {
      title: "Аудит документации до публикации",
      text: "Проверяем проект извещения, документацию, критерии оценки и условия договора на предмет спорных формулировок и типовых рисков жалоб.",
    },
    {
      title: "Расчет НМЦК и обоснование закупки",
      text: "Помогаем собрать доказательственную базу по НМЦК, коммерческим предложениям, описанию объекта закупки и деловой логике закупки.",
      href: "/zakazchikam/raschet-nmck",
    },
    {
      title: "Подготовка позиции на жалобу",
      text: "Если жалоба уже подана, формируем позицию заказчика, подбираем аргументы и документы к заседанию ФАС.",
    },
    {
      title: "Сопровождение спора в ФАС",
      text: "Представляем интересы заказчика при рассмотрении жалобы, помогаем отвечать на вопросы комиссии и защищать закупку по существу.",
    },
    {
      title: "Оспаривание выводов контролирующего органа",
      text: "Когда административный спор не заканчивается в ФАС, готовим стратегию дальнейшей защиты и работаем с судебной перспективой.",
      href: "/sudebnaya-zashita-v-zakupkah",
    },
    {
      title: "Проверка закупки на уязвимости",
      text: "Находим условия, которые чаще всего становятся основанием для жалоб: товарный знак, ограничение конкуренции, национальный режим, неустойка и сроки.",
      href: "/narusheniya",
    },
  ];

  const situations = [
    "документация готовится к публикации и нужно заранее снять спорные риски;",
    "на закупку уже поступила жалоба и важно не потерять темп до заседания;",
    "есть спор по национальному режиму, товарному знаку или ограничению конкуренции;",
    "нужно обосновать НМЦК и защитить расчет от претензий;",
    "спор вышел за пределы ФАС и требует дальнейшей судебной защиты.",
  ];

  const process = [
    "Разбираем закупку, документацию, расчет и фактическую цель заказчика.",
    "Показываем слабые места, которые могут стать основанием для жалобы.",
    "Формируем письменную позицию и комплект документов для защиты.",
    "Сопровождаем заказчика в ФАС и далее при необходимости в суде.",
  ];

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:py-20">
          <div className="max-w-5xl">
            <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600">
              GOSZAKON для заказчиков
            </div>

            <h1 className="mt-6 text-4xl font-bold tracking-tight text-[#081a4b] md:text-6xl">
              Юридическая поддержка заказчиков в закупках и спорах с ФАС
            </h1>

            <p className="mt-6 max-w-4xl text-lg leading-9 text-slate-700">
              Помогаем заказчикам выстроить закупку так, чтобы снизить риск жалоб,
              а если спор уже возник, быстро собрать позицию, защитить документацию
              и сохранить управляемость процедуры.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href={SITE_CONTACTS.phoneHref}
                className="rounded-2xl bg-[#081a4b] px-7 py-4 text-center text-base font-semibold text-white transition hover:bg-[#0d2568]"
              >
                Позвонить: {SITE_CONTACTS.phoneDisplay}
              </a>

              <Link
                href="/zakazchikam/raschet-nmck"
                className="rounded-2xl border border-slate-300 bg-white px-7 py-4 text-center text-base font-semibold text-[#081a4b] transition hover:bg-slate-50"
              >
                Расчет НМЦК
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <CustomerInnSearch />

          {query ? (
            <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-medium uppercase tracking-[0.14em] text-slate-400">
                    Результаты поиска
                  </div>
                  <h2 className="mt-2 text-2xl font-bold tracking-tight text-[#081a4b]">
                    По запросу: {query}
                  </h2>
                </div>

                <Link
                  href="/zakazchikam"
                  className="rounded-2xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Сбросить поиск
                </Link>
              </div>

              {searchResults.length === 0 ? (
                <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-slate-500">
                  По этому запросу заказчики в базе пока не найдены.
                </div>
              ) : (
                <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {searchResults.map((item) => (
                    <Link
                      key={item.customerInn}
                      href={`/zakazchik/${item.customerInn}`}
                      className="rounded-3xl border border-slate-200 bg-slate-50 p-5 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-sm"
                    >
                      <div className="text-xs uppercase tracking-[0.12em] text-slate-400">
                        ИНН {item.customerInn}
                      </div>
                      <div className="mt-3 text-lg font-semibold leading-8 text-[#081a4b]">
                        {item.customerName}
                      </div>
                      <div className="mt-3 text-sm text-slate-600">
                        Кейсов в базе: {item.count}
                      </div>
                      <div className="mt-4 text-sm font-semibold text-[#081a4b]">
                        Открыть карточку →
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ) : null}

          <div className="mb-10 max-w-3xl">
            <h2 className="text-3xl font-bold tracking-tight text-[#081a4b] md:text-4xl">
              Чем помогаем заказчикам
            </h2>
            <p className="mt-4 text-lg leading-8 text-slate-700">
              Здесь акцент не на жалобе от поставщика, а на защите закупки, логики
              документации и позиции заказчика перед контролирующим органом.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {directions.map((item) =>
              item.href ? (
                <Link
                  key={item.title}
                  href={item.href}
                  className="flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  <h3 className="text-xl font-semibold leading-8 text-[#081a4b]">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-base leading-8 text-slate-700">
                    {item.text}
                  </p>
                  <span className="mt-5 text-sm font-semibold text-[#081a4b]">
                    Подробнее →
                  </span>
                </Link>
              ) : (
                <div
                  key={item.title}
                  className="flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-7 shadow-sm"
                >
                  <h3 className="text-xl font-semibold leading-8 text-[#081a4b]">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-base leading-8 text-slate-700">
                    {item.text}
                  </p>
                </div>
              )
            )}
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8">
              <h2 className="text-3xl font-bold tracking-tight text-[#081a4b]">
                Когда это особенно полезно
              </h2>

              <ul className="mt-6 space-y-3 text-base leading-8 text-slate-700">
                {situations.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </div>

            <div className="rounded-3xl bg-[#081a4b] p-8 text-white">
              <h2 className="text-3xl font-bold tracking-tight">
                Как строится работа
              </h2>

              <div className="mt-6 space-y-4 text-base leading-8 text-white/90">
                {process.map((item, index) => (
                  <p key={item}>
                    {index + 1}. {item}
                  </p>
                ))}
              </div>

              <a
                href={SITE_CONTACTS.emailHref}
                className="mt-8 inline-flex rounded-2xl bg-white px-6 py-4 text-base font-semibold text-[#081a4b] transition hover:bg-slate-100"
              >
                Написать: {SITE_CONTACTS.email}
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
