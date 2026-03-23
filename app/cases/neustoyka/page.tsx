import type { Metadata } from "next";
import Link from "next/link";
import { Prisma } from "@prisma/client";
import { getPrisma } from "@/lib/prisma";
import { getCasePath } from "@/lib/cases";
import { SITE_CONTACTS } from "@/lib/site-config";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Практика ФАС по неустойке и удержаниям | GOSZAKON",
  description:
    "Подборка практики ФАС по неустойке, штрафам и удержаниям: завышенные санкции, удержание из оплаты, спорный расчет и перекос ответственности сторон.",
};

const keySignals = [
  "Заказчик начисляет неустойку на всю сумму контракта, а не на фактически проблемную часть.",
  "Штраф или удержание используют как инструмент давления, а не как соразмерную реакцию на нарушение.",
  "Спор часто связан не только с суммой, но и с тем, имел ли заказчик право удерживать деньги вообще.",
];

const practiceConclusions = [
  "В делах о неустойке важно смотреть не только на саму цифру, но и на базу расчета, период, претензионный порядок и поведение заказчика.",
  "Неравная ответственность сторон и собственные нарушения заказчика часто становятся ключом к снижению или выбиванию санкции.",
  "Практика полезна тогда, когда помогает быстро понять: спор идет о реальном нарушении или о слабом и перекошенном применении договора заказчиком.",
];

function formatDate(value?: Date | null) {
  if (!value) return "Дата не указана";
  return new Intl.DateTimeFormat("ru-RU").format(value);
}

function getPenaltyWhere(): Prisma.CaseWhereInput {
  const terms = ["неустой", "штраф", "санкц", "удержан"];

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

export default async function PenaltyPracticeHubPage() {
  const prisma = getPrisma();
  const where = getPenaltyWhere();

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
              Практика ФАС по неустойке и удержаниям
            </h1>

            <p className="mt-6 max-w-3xl text-xl leading-9 text-slate-700">
              Это подборка кейсов и решений, где спор шел о штрафах, удержании
              денег из оплаты, спорном расчете неустойки и перекосе
              ответственности между заказчиком и поставщиком.
            </p>

            <p className="mt-4 max-w-3xl text-lg leading-9 text-slate-700">
              По таким делам особенно важно смотреть не только на размер
              санкции, но и на основание начисления, порядок предъявления
              требований, базу расчета и собственные нарушения заказчика,
              которые могут полностью изменить исход спора.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/sudebnaya-zashita-v-zakupkah/snizhenie-neustojki-postavshiku"
                className="rounded-2xl bg-[#081a4b] px-7 py-4 text-center text-base font-semibold text-white transition hover:bg-[#0d2568]"
              >
                Разобрать спор по неустойке
              </Link>

              <Link
                href="/cases?q=%D0%BD%D0%B5%D1%83%D1%81%D1%82%D0%BE%D0%B9%D0%BA%D0%B0"
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
                кейсов по неустойке, штрафам, удержаниям и спорной договорной
                ответственности в закупках.
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
              Вопрос почти никогда не только в сумме неустойки
            </h2>

            <p className="mt-5 text-lg leading-9 text-slate-700">
              В сильных делах по неустойке спор разворачивается вокруг того,
              как именно заказчик применил договор: что взял за базу,
              правильно ли считал период, соблюдал ли претензионный порядок и
              имел ли право удерживать деньги из оплаты.
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
                В первую очередь стоит смотреть решения, где заказчик не только
                насчитал санкцию, но и допустил ошибки в ее расчете, удержании
                или самом применении договора.
              </p>
            </div>

            <Link
              href="/cases?sort=featured&q=%D0%BD%D0%B5%D1%83%D1%81%D1%82%D0%BE%D0%B9%D0%BA%D0%B0"
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
                Свежая практика по неустойке и удержаниям
              </h2>
              <p className="mt-4 text-lg leading-9 text-slate-700">
                Ниже собраны решения, которые помогают понять, как ФАС и суды
                смотрят на санкции поставщику, удержания из оплаты и спорную
                конструкцию договора.
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
                В спорах по неустойке важнее всего быстро разобрать расчет и действия заказчика
              </h2>

              <p className="mt-5 text-lg leading-9 text-white/90">
                По таким делам сильная позиция рождается из деталей: базы
                начисления, сроков, претензионного порядка, удержаний и
                собственных нарушений заказчика. Мы можем быстро оценить, где
                его расчет и поведение действительно слабы.
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
                  Направить договор и расчет
                </a>
              </div>
            </div>

            <div className="grid gap-5">
              <Link
                href="/sudebnaya-zashita-v-zakupkah/snizhenie-neustojki-postavshiku"
                className="rounded-3xl border border-slate-200 bg-slate-50 p-7 shadow-sm transition hover:bg-white"
              >
                <div className="text-lg font-semibold text-[#081a4b]">
                  Снижение неустойки поставщику
                </div>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  Отдельная страница о том, как мы снижаем и выбиваем
                  завышенные санкции, удержания и спорные штрафы.
                </p>
              </Link>

              <Link
                href="/spornye-praktiki/neravnoznachnaya-neustoyka"
                className="rounded-3xl border border-slate-200 bg-slate-50 p-7 shadow-sm transition hover:bg-white"
              >
                <div className="text-lg font-semibold text-[#081a4b]">
                  Неравная неустойка
                </div>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  Разбираем системный перекос, когда договор изначально делает
                  ответственность поставщика значительно тяжелее.
                </p>
              </Link>

              <Link
                href="/cases"
                className="rounded-3xl border border-slate-200 bg-slate-50 p-7 shadow-sm transition hover:bg-white"
              >
                <div className="text-lg font-semibold text-[#081a4b]">
                  Вся база практики ФАС
                </div>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  Если хотите сравнить споры по неустойке с другими типами
                  конфликтов, вернитесь в общую базу и используйте фильтры.
                </p>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
