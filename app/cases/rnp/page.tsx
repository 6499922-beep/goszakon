import type { Metadata } from "next";
import Link from "next/link";
import { getPrisma } from "@/lib/prisma";
import { getCasePath } from "@/lib/cases";
import { SITE_CONTACTS } from "@/lib/site-config";
import { PRACTICE_HUBS } from "@/lib/practice-hubs";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Практика ФАС по РНП | GOSZAKON",
  description:
    "Подборка практики ФАС по РНП: отказ во включении, оценка добросовестности поставщика, уклонение от заключения договора и защита в комиссии.",
};

const keySignals = [
  "Включение в РНП не должно быть автоматическим только потому, что заказчик расторг договор или пожаловался в ФАС.",
  "Ключевой вопрос в таких делах — была ли у поставщика реальная вина и признаки недобросовестного поведения.",
  "Для комиссии важны переписка, действия поставщика до конфликта и то, пытался ли он разумно исполнить обязательства.",
];

const practiceConclusions = [
  "Само по себе нарушение срока или спор с заказчиком еще не означает, что поставщика нужно включать в реестр.",
  "Сильная защита по РНП строится на фактах: переписке, предупреждениях, попытках исполнить договор и отсутствии умысла на уклонение.",
  "Практика по РНП особенно полезна, когда нужно быстро понять, как ФАС смотрит на добросовестность поставщика в похожих обстоятельствах.",
];

const practiceWins = [
  "Подтверждение того, что поставщик пытался исполнить договор и заранее сообщал о проблеме, а не исчезал из обязательства.",
  "Хронология переписки, из которой видно отсутствие умысла на уклонение и разумное поведение до конфликта.",
  "Материалы, которые показывают, что формальное нарушение не равно недобросовестности.",
];

const practiceLosses = [
  "Поставщик выходит в комиссию без собранной переписки и без четкой версии того, почему конфликт возник.",
  "Защита строится только на объяснениях о сложности ситуации, без документов и следов добросовестных действий.",
  "Игнорируется вопрос вины: спор сводят к факту расторжения, а не к анализу поведения поставщика.",
];

const firstChecks = [
  "Что именно заказчик вменяет поставщику и где в материалах есть признаки или отсутствие недобросовестности.",
  "Какие письма, уведомления и попытки исполнения можно показать комиссии.",
  "Есть ли в деле факты, которые отделяют реальный срыв обязательства от умышленного уклонения.",
];

function formatDate(value?: Date | null) {
  if (!value) return "Дата не указана";
  return new Intl.DateTimeFormat("ru-RU").format(value);
}

export default async function RnpPracticeHubPage() {
  const prisma = getPrisma();
  const otherHubs = PRACTICE_HUBS.filter((item) => item.href !== "/cases/rnp").slice(0, 2);

  const [totalCount, cases] = await Promise.all([
    prisma.case.count({
      where: {
        published: true,
        violation: {
          equals: "РНП",
        },
      },
    }),
    prisma.case.findMany({
      where: {
        published: true,
        violation: {
          equals: "РНП",
        },
      },
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
              Практика ФАС по РНП
            </h1>

            <p className="mt-6 max-w-3xl text-xl leading-9 text-slate-700">
              Это подборка решений по включению и отказу во включении в реестр
              недобросовестных поставщиков. Здесь удобно смотреть, как ФАС
              оценивает вину, добросовестность поставщика, уклонение от
              заключения договора и последствия расторжения.
            </p>

            <p className="mt-4 max-w-3xl text-lg leading-9 text-slate-700">
              По РНП особенно важно не просто читать итог, а понимать логику:
              что именно заказчик вменял поставщику, какие доказательства были
              у сторон и почему комиссия посчитала поведение добросовестным или,
              наоборот, проблемным.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/rnp"
                className="rounded-2xl bg-[#081a4b] px-7 py-4 text-center text-base font-semibold text-white transition hover:bg-[#0d2568]"
              >
                Разобрать риск РНП
              </Link>

              <Link
                href="/cases?violation=%D0%A0%D0%9D%D0%9F"
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
                решений и кейсов по включению в РНП, добросовестности поставщика
                и защите в комиссии ФАС.
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
              В РНП решает не формальное событие, а оценка поведения поставщика
            </h2>

            <p className="mt-5 text-lg leading-9 text-slate-700">
              Самые полезные дела по РНП — те, где видно, почему комиссия
              приняла или не приняла аргументы заказчика. Смотрите не только на
              результат, но и на переписку, попытки исполнить договор, причины
              срыва и наличие либо отсутствие недобросовестности.
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
              По РНП спор выигрывается на поведении поставщика до заседания
            </h2>

            <p className="mt-5 text-lg leading-9 text-slate-700">
              Комиссия смотрит не только на то, что произошло, но и на то, как
              поставщик действовал до конфликта: предупреждал ли о проблеме,
              пытался ли исполнить договор и собирал ли доказательства своей добросовестности.
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
                В первую очередь стоит смотреть решения, где комиссия подробно
                оценила вину поставщика и отказала во включении в реестр.
              </p>
            </div>

            <Link
              href="/cases?sort=featured&violation=%D0%A0%D0%9D%D0%9F"
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
                Свежая практика по РНП
              </h2>
              <p className="mt-4 text-lg leading-9 text-slate-700">
                Ниже собраны решения, которые помогают быстро понять, как ФАС
                оценивает недобросовестность поставщика и когда удается избежать
                включения в реестр.
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
                По РНП важна скорость: позицию нужно собирать до заседания комиссии
              </h2>

              <p className="mt-5 text-lg leading-9 text-white/90">
                В таких делах многое решает переписка, комплект документов и то,
                успел ли поставщик заранее зафиксировать свою добросовестность.
                Мы можем быстро оценить риск включения и показать, какие доводы
                действительно работают в комиссии ФАС.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a
                  href={SITE_CONTACTS.phoneHref}
                  className="rounded-2xl bg-white px-6 py-4 text-center text-sm font-semibold text-[#081a4b] transition hover:bg-slate-100"
                >
                  Обсудить риск РНП
                </a>
                <a
                  href={SITE_CONTACTS.emailHref}
                  className="rounded-2xl border border-white/20 px-6 py-4 text-center text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Направить материалы
                </a>
              </div>
            </div>

            <div className="grid gap-5">
              <Link
                href="/rnp"
                className="rounded-3xl border border-slate-200 bg-slate-50 p-7 shadow-sm transition hover:bg-white"
              >
                <div className="text-lg font-semibold text-[#081a4b]">
                  Раздел по РНП
                </div>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  Подробно разбираем, когда включают в реестр, как выстраивать
                  защиту и на что ФАС смотрит в первую очередь.
                </p>
              </Link>

              <Link
                href="/uslugi/risk-rnp"
                className="rounded-3xl border border-slate-200 bg-slate-50 p-7 shadow-sm transition hover:bg-white"
              >
                <div className="text-lg font-semibold text-[#081a4b]">
                  Оценка риска включения в РНП
                </div>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  Если заседание комиссии близко, важнее всего быстро понять
                  перспективу и собрать доказательства отсутствия вины.
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
                  Если хотите сравнить РНП с другими типами закупочных споров,
                  начните с обзорного навигатора по основным темам базы практики.
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
