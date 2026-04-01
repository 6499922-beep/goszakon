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
      title: "Штрафы и ответственность заказчика",
      text: "Отдельный раздел по тем ошибкам, из-за которых заказчик получает предписания и штрафы: неоплата, слабая документация, нацрежим и процедурные нарушения.",
      href: "/otvetstvennost-zakazchika",
    },
    {
      title: "Статистика по контрагентам и частым жалобам",
      text: "Сводка по заказчикам из нашей базы: у кого чаще всего возникают жалобы, какие темы споров повторяются и где уже видна устойчивая конфликтная практика.",
      href: "/zakazchikam/statistika-po-kontragentam",
    },
    {
      title: "Риски закупки: серия для заказчиков",
      text: "Отдельный тематический блок по тем рискам, которые чаще всего разваливают закупку: жалобы в ФАС, документация, нацрежим, отклонение заявки, сроки поставки и проект договора.",
      href: "/zakazchikam/riski-zakupki",
    },
    {
      title: "Аудит закупки и документации до публикации",
      text: "Проверяем извещение, документацию, критерии оценки, проект договора и слабые места закупки до того, как процедура начнет разваливаться уже после публикации.",
      href: "/zakazchikam/audit-zakupki",
    },
    {
      title: "Сопровождение закупки под задачу заказчика",
      text: "Помогаем выстроить закупку под реальную потребность заказчика так, чтобы документация, режим, цена и условия работали как одна конструкция.",
      href: "/zakazchikam/soprovozhdenie-zakupki",
    },
    {
      title: "Подготовка закупочной документации",
      text: "Собираем закупочную документацию под предмет закупки так, чтобы она не разваливалась после публикации и выдерживала жалобу, проверку и контроль.",
      href: "/zakazchikam/podgotovka-zakupochnoj-dokumentacii",
    },
    {
      title: "Расчет НМЦК и обоснование закупки",
      text: "Помогаем собрать доказательственную базу по НМЦК, коммерческим предложениям, описанию объекта закупки и деловой логике закупки.",
      href: "/zakazchikam/raschet-nmck",
    },
    {
      title: "Защита интересов заказчика в ФАС",
      text: "Если жалоба уже подана, быстро собираем позицию заказчика, подбираем аргументы и документы и сопровождаем закупку на стадии ФАС.",
      href: "/zakazchikam/zashita-v-fas",
    },
    {
      title: "Оспаривание предписания ФАС заказчиком",
      text: "Помогаем заказчику разбирать и оспаривать предписания ФАС, если они разрушают закупку, документацию или ключевые условия процедуры.",
      href: "/zakazchikam/osparivanie-predpisaniya-fas",
    },
    {
      title: "Сопровождение закупки с риском жалобы",
      text: "Собираем конфликтную закупку так, чтобы спорные места были ослаблены еще до публикации и процедура была лучше подготовлена к жалобе.",
      href: "/zakazchikam/soprovozhdenie-zakupki-s-riskom-zhaloby",
    },
    {
      title: "Национальный режим без лишних рисков",
      text: "Помогаем встроить национальный режим в закупку так, чтобы он работал в логике предмета, документации и действующего законодательства.",
      href: "/zakazchikam/nacionalnyj-rezhim",
    },
    {
      title: "Нацрежим под предмет закупки и документацию",
      text: "Помогаем связать режим допуска, подтверждающие документы, предмет закупки и проект договора в одну устойчивую закупочную конструкцию.",
      href: "/zakazchikam/nacionalnyj-rezhim-pod-predmet-zakupki",
    },
    {
      title: "Положение о закупке без нарушений",
      text: "Готовим или перерабатываем положение о закупке так, чтобы оно выдерживало актуальное законодательство и реальную закупочную практику.",
      href: "/zakazchikam/polozhenie-o-zakupke",
    },
    {
      title: "Судебная защита интересов заказчика",
      text: "Если спор по закупке вышел за пределы ФАС, выстраиваем дальнейшую судебную защиту заказчика и его документации.",
      href: "/zakazchikam/sudebnaya-zashita",
    },
    {
      title: "Оспаривание штрафа за закупочную документацию",
      text: "Помогаем заказчику разбирать и оспаривать штрафы, если привлечение связано с документацией, нацрежимом, критериями оценки или иными дефектами процедуры.",
      href: "/zakazchikam/osparivanie-shtrafa-za-zakupochnuyu-dokumentaciyu",
    },
  ];

  const situations = [
    "закупка готовится к публикации и нужно заранее снять уязвимости документации;",
    "процедура уже начала сыпаться из-за слабых условий договора, критериев или национального режима;",
    "на закупку подали жалобу и нужно быстро собрать позицию к ФАС;",
    "нужно провести закупку под реальную потребность заказчика, не выходя за пределы действующего законодательства;",
    "ответственных лиц могут оштрафовать за ошибочную закупочную документацию;",
    "спор по закупке уже перешел в суд и требует отдельной стратегии защиты.",
  ];

  const process = [
    "Разбираем закупку, документацию, расчет и реальную задачу заказчика.",
    "Показываем, где документация с высокой вероятностью даст жалобу, штраф или срыв процедуры.",
    "Формируем правовую конструкцию, которая позволяет сохранить закупку и управляемость процесса.",
    "Сопровождаем заказчика в ФАС, а при необходимости и в суде.",
  ];

  const formatOfWork = [
    "Подключаемся онлайн по всей России и быстро входим в конфликтную закупку или жалобу.",
    "Выезжаем к заказчику, если нужно собрать позицию с участием контрактной службы, закупочного подразделения и руководства.",
    "Проводим практическое обучение команды по документации, нацрежиму, защите в ФАС и типовым ошибкам закупки.",
  ];

  const riskBlocks = [
    "Закупка распадается уже после публикации, потому что слабая документация не выдерживает жалобу.",
    "ФАС видит нарушение там, где заказчик пытался решить практическую задачу, но оформил ее юридически слабо.",
    "Национальный режим, критерии оценки и проект договора собраны так, что процедура получает лишние риски.",
    "В итоге закупку приходится переделывать, а ответственных лиц штрафуют за дефекты документации.",
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
              Юридическая поддержка заказчиков в закупках, ФАС и суде
            </h1>

            <p className="mt-6 max-w-4xl text-lg leading-9 text-slate-700">
              Помогаем заказчикам выстроить закупку под их реальную задачу без
              лишних правовых рисков: проверяем документацию, национальный режим,
              положение о закупке, защищаем закупку в ФАС и ведем спор дальше в
              суде, если административной стадии уже недостаточно.
            </p>

            <p className="mt-4 max-w-4xl text-lg leading-9 text-slate-700">
              Работаем по всей России: подключаемся дистанционно, выезжаем к
              заказчику и можем не только вести спор, но и помогать команде
              выстроить более устойчивую закупочную практику.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href={SITE_CONTACTS.emailHref}
                className="rounded-2xl bg-[#081a4b] px-7 py-4 text-center text-base font-semibold text-white transition hover:bg-[#0d2568]"
              >
                Направить закупку на разбор
              </a>

              <Link
                href="/zakazchikam/audit-zakupki"
                className="rounded-2xl border border-slate-300 bg-white px-7 py-4 text-center text-base font-semibold text-[#081a4b] transition hover:bg-slate-50"
              >
                Аудит закупки
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-bold tracking-tight text-[#081a4b] md:text-4xl">
              Почему заказчикам здесь нужен не просто юрист, а закупочная практика
            </h2>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {riskBlocks.map((item) => (
              <div
                key={item}
                className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm"
              >
                <p className="text-base leading-8 text-slate-700">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-bold tracking-tight text-[#081a4b] md:text-4xl">
              Формат работы с заказчиком
            </h2>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {formatOfWork.map((item) => (
              <div
                key={item}
                className="rounded-3xl border border-slate-200 bg-slate-50 p-7 shadow-sm"
              >
                <p className="text-base leading-8 text-slate-700">{item}</p>
              </div>
            ))}
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
                      className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="text-xs uppercase tracking-[0.12em] text-slate-400">
                          ИНН {item.customerInn}
                        </div>
                        <span className="rounded-full bg-slate-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-500 ring-1 ring-slate-200">
                          Заказчик
                        </span>
                      </div>

                      <div className="mt-3 text-lg font-semibold leading-8 text-[#081a4b]">
                        {item.customerName}
                      </div>

                      <div className="mt-4 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600 ring-1 ring-slate-200/80">
                        Кейсов в базе: <span className="font-semibold text-slate-800">{item.count}</span>
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
              Здесь акцент не на споре ради спора, а на сохранении самой
              закупки, снижении риска жалоб, штрафов и переделки документации.
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
                Когда это особенно полезно заказчику
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

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="grid gap-6 md:grid-cols-3">
            <Link
              href="/narusheniya"
              className="rounded-3xl border border-slate-200 bg-slate-50 p-7 transition hover:bg-white hover:shadow-md"
            >
              <h3 className="text-2xl font-semibold text-[#081a4b]">
                Типовые нарушения в закупках
              </h3>
              <p className="mt-3 text-slate-700">
                Посмотреть, какие условия чаще всего становятся основанием для
                жалоб и что лучше убрать еще до публикации.
              </p>
            </Link>

            <Link
              href="/sudebnaya-zashita-v-zakupkah"
              className="rounded-3xl border border-slate-200 bg-slate-50 p-7 transition hover:bg-white hover:shadow-md"
            >
              <h3 className="text-2xl font-semibold text-[#081a4b]">
                Судебная защита
              </h3>
              <p className="mt-3 text-slate-700">
                Если административного уровня уже недостаточно и закупку нужно
                защищать дальше.
              </p>
            </Link>

            <Link
              href="/zakazchikam/raschet-nmck"
              className="rounded-3xl border border-slate-200 bg-slate-50 p-7 transition hover:bg-white hover:shadow-md"
            >
              <h3 className="text-2xl font-semibold text-[#081a4b]">
                Расчет НМЦК
              </h3>
              <p className="mt-3 text-slate-700">
                Отдельное направление, если спор или риск строится вокруг цены
                и обоснования закупки.
              </p>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
