import type { Metadata } from "next";
import Link from "next/link";
import { Prisma } from "@prisma/client";
import { getPrisma } from "@/lib/prisma";
import { getCasePath } from "@/lib/cases";
import { SITE_CONTACTS } from "@/lib/site-config";
import { PRACTICE_HUBS } from "@/lib/practice-hubs";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Практика ФАС по неоплате по контракту | GOSZAKON",
  description:
    "Подборка практики ФАС по неоплате: задержка оплаты, формальные замечания к УПД, затягивание приемки и искусственные препятствия со стороны заказчика.",
};

const keySignals = [
  "Срок оплаты пытаются считать не от подписанного УПД, а от внутренних актов, программ и согласований заказчика.",
  "Заказчик затягивает приемку, а затем использует этот же период против поставщика.",
  "Формальные замечания к документам становятся предлогом не платить, а не способом исправить реальную ошибку.",
];

const practiceConclusions = [
  "Для спора по неоплате важнее всего дата фактической приемки и поведение заказчика после исполнения контракта.",
  "Внутренние системы, платежные дни, бухгалтерские процессы и дополнительные акты сами по себе не должны сдвигать срок оплаты.",
  "Если заказчик сам создавал препятствия для приемки или оплаты, это нужно превращать в активную доказательственную позицию, а не в оправдания поставщика.",
];

const practiceWins = [
  "Подписанные УПД, акты и переписка, из которых видно, что обязанность по оплате уже наступила.",
  "Фиксация затянутой приемки, повторных требований к документам и других искусственных препятствий со стороны заказчика.",
  "Позиция, где поставщик не оправдывается, а показывает: срок оплаты сорвался из-за поведения самого заказчика.",
];

const practiceLosses = [
  "Поставщик не фиксирует дату реальной приемки и остается без четкой точки отсчета для срока оплаты.",
  "Переписка по замечаниям к документам идет хаотично, без подтверждения, что замечания формальны и не мешают оплате.",
  "Спор строится на эмоциях, а не на конкретных датах, документах и действиях заказчика после исполнения контракта.",
];

const firstChecks = [
  "От какой даты по документам реально должен идти срок оплаты.",
  "Какие документы уже подписаны и есть ли у заказчика законное основание не платить.",
  "Создавал ли заказчик собственными действиями препятствия для приемки или расчета.",
];

function formatDate(value?: Date | null) {
  if (!value) return "Дата не указана";
  return new Intl.DateTimeFormat("ru-RU").format(value);
}

function getNonPaymentWhere(): Prisma.CaseWhereInput {
  const terms = ["оплат", "неоплат", "УПД", "упд", "приемк", "удержан"];

  return {
    published: true,
    OR: terms.flatMap((term) => [
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
      {
        decision: {
          contains: term,
          mode: Prisma.QueryMode.insensitive,
        },
      },
    ]),
  };
}

export default async function NonPaymentPracticeHubPage() {
  const prisma = getPrisma();
  const where = getNonPaymentWhere();
  const otherHubs = PRACTICE_HUBS.filter((item) => item.href !== "/cases/neoplata").slice(0, 2);

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
              Практика ФАС по неоплате по контракту
            </h1>

            <p className="mt-6 max-w-3xl text-xl leading-9 text-slate-700">
              Это не просто список кейсов по задержке оплаты. Это рабочая
              подборка практики, где можно быстро увидеть, как ФАС оценивает
              срок оплаты, приемку, УПД, формальные замечания к документам и
              внутренние процедуры заказчика.
            </p>

            <p className="mt-4 max-w-3xl text-lg leading-9 text-slate-700">
              По таким спорам важен не только сам факт неоплаты, но и то, как
              заказчик создавал препятствия: затягивал приемку, переносил срок
              оплаты на свои внутренние акты, требовал повторного оформления
              документов или ссылался на бухгалтерию и платежные дни.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/neoplata-po-goskontraktu"
                className="rounded-2xl bg-[#081a4b] px-7 py-4 text-center text-base font-semibold text-white transition hover:bg-[#0d2568]"
              >
                Разобрать неоплату
              </Link>

              <Link
                href="/cases?q=%D0%BE%D0%BF%D0%BB%D0%B0%D1%82%D0%B0"
                className="rounded-2xl border border-slate-300 bg-white px-7 py-4 text-center text-base font-semibold text-[#081a4b] transition hover:bg-slate-50"
              >
                Смотреть все кейсы по теме
              </Link>
            </div>
          </div>

          <div className="grid gap-5">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-7 shadow-sm">
              <div className="text-sm uppercase tracking-[0.14em] text-slate-400">
                Что чаще всего встречается
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
                решений и кейсов, связанных с неоплатой, приемкой, УПД и
                попытками заказчика сдвинуть срок расчета.
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
              В неоплате важны не отговорки заказчика, а момент приемки и его поведение
            </h2>

            <p className="mt-5 text-lg leading-9 text-slate-700">
              В этой подборке сильнее всего работают дела, где видно, от какой
              даты действительно должен идти срок оплаты, какие документы были
              подписаны и что именно заказчик делал после исполнения контракта.
              Неоплата редко выглядит как прямой отказ. Чаще это цепочка
              искусственных препятствий, которую нужно разбирать по шагам.
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
          <div className="max-w-3xl">
            <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600">
              Что обычно усиливает или ослабляет спор
            </div>

            <h2 className="mt-5 text-4xl font-bold tracking-tight text-[#081a4b] md:text-5xl">
              По неоплате выигрывают детали, а не общие жалобы на заказчика
            </h2>

            <p className="mt-5 text-lg leading-9 text-slate-700">
              Самая сильная позиция по неоплате строится на хронологии:
              подписанные документы, дата приемки, переписка после исполнения и
              конкретные препятствия, которые создавал заказчик.
            </p>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
              <div className="text-xl font-semibold text-[#081a4b]">Что обычно выигрывает</div>
              <div className="mt-4 space-y-3">
                {practiceWins.map((item) => (
                  <p key={item} className="text-base leading-8 text-slate-700">{item}</p>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
              <div className="text-xl font-semibold text-[#081a4b]">Что обычно ослабляет позицию</div>
              <div className="mt-4 space-y-3">
                {practiceLosses.map((item) => (
                  <p key={item} className="text-base leading-8 text-slate-700">{item}</p>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
              <div className="text-xl font-semibold text-[#081a4b]">Что смотреть первым</div>
              <div className="mt-4 space-y-3">
                {firstChecks.map((item) => (
                  <p key={item} className="text-base leading-8 text-slate-700">{item}</p>
                ))}
              </div>
            </div>
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
                Сначала смотрите самые показательные решения, где спор строится
                вокруг УПД, приемки и момента наступления обязанности по оплате.
              </p>
            </div>

            <Link
              href="/cases?sort=featured&q=%D0%BE%D0%BF%D0%BB%D0%B0%D1%82%D0%B0"
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
                Свежая практика по неоплате
              </h2>
              <p className="mt-4 text-lg leading-9 text-slate-700">
                Ниже собраны решения, которые помогают понять, как ФАС и суды
                смотрят на задержку оплаты, приемку и формальные претензии к
                документам.
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
                По неоплате читать практику полезно, но важнее быстро проверить документы
              </h2>

              <p className="mt-5 text-lg leading-9 text-white/90">
                В спорах по оплате решает не общая теория, а конкретные даты,
                УПД, порядок приемки, переписка и то, какие препятствия создал
                заказчик. Мы можем быстро оценить перспективу и показать, где
                именно его позиция слаба.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a
                  href={SITE_CONTACTS.phoneHref}
                  className="rounded-2xl bg-white px-6 py-4 text-center text-sm font-semibold text-[#081a4b] transition hover:bg-slate-100"
                >
                  Обсудить спор
                </a>
                <a
                  href={SITE_CONTACTS.emailHref}
                  className="rounded-2xl border border-white/20 px-6 py-4 text-center text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Направить УПД и договор
                </a>
              </div>
            </div>

            <div className="grid gap-5">
              <Link
                href="/neoplata-po-goskontraktu"
                className="rounded-3xl border border-slate-200 bg-slate-50 p-7 shadow-sm transition hover:bg-white"
              >
                <div className="text-lg font-semibold text-[#081a4b]">
                  Неоплата по госконтракту
                </div>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  Отдельная страница о том, как мы ломаем формальные причины
                  неоплаты и взыскиваем деньги с заказчика.
                </p>
              </Link>

              <Link
                href="/spornye-praktiki/vnutrennie-sistemy-oplaty"
                className="rounded-3xl border border-slate-200 bg-slate-50 p-7 shadow-sm transition hover:bg-white"
              >
                <div className="text-lg font-semibold text-[#081a4b]">
                  Привязка оплаты к внутренним документам
                </div>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  Разбираем спорную практику, когда срок оплаты пытаются сдвинуть
                  за счет актов, программ, реестров и внутренних согласований.
                </p>
              </Link>

              <Link
                href="/cases/praktika-fas"
                className="rounded-3xl border border-slate-200 bg-slate-50 p-7 shadow-sm transition hover:bg-white"
              >
                <div className="text-lg font-semibold text-[#081a4b]">
                  Практика ФАС по темам
                </div>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  Если хотите сравнить неоплату с другими типами споров, начните
                  с обзорного навигатора по основным темам базы практики.
                </p>
              </Link>

              {otherHubs.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-3xl border border-slate-200 bg-slate-50 p-7 shadow-sm transition hover:bg-white"
                >
                  <div className="text-lg font-semibold text-[#081a4b]">
                    {item.title}
                  </div>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    {item.description}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
