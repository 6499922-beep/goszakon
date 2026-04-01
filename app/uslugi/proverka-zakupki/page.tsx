import Link from "next/link";
import { SITE_CONTACTS } from "@/lib/site-config";

export default function ProcurementReviewPage() {
  const situations = [
    "Есть сомнения, что документация закупки составлена с нарушениями.",
    "Нужно понять, есть ли реальная перспектива жалобы в ФАС.",
    "Неясно, является ли спорное условие нарушением или допустимым требованием.",
    "Важно быстро оценить риски и не тратить время на заведомо слабую жалобу.",
    "Нужно понять, стоит ли идти в ФАС, в суд или выбрать другую стратегию защиты.",
  ];

  const checks = [
    {
      title: "Документация закупки",
      text: "Изучаем извещение, документацию, техническое задание, проект договора и иные условия закупки.",
    },
    {
      title: "Основания для спора",
      text: "Определяем, есть ли правовые основания для жалобы, обращения в ФАС или дальнейшего судебного спора.",
    },
    {
      title: "Сила позиции",
      text: "Оцениваем, насколько убедительно нарушение будет выглядеть на практике с учётом подхода ФАС.",
    },
    {
      title: "Рекомендация по действиям",
      text: "Даём понятный вывод: есть ли смысл идти дальше и какой формат защиты будет оптимальным.",
    },
  ];

  const results = [
    "Понимание, есть ли реальное нарушение в закупке.",
    "Оценка перспективы жалобы в ФАС до начала спора.",
    "Понимание сильных и слабых сторон позиции поставщика.",
    "Выбор правильного следующего шага: жалоба, переговоры, судебная защита или отказ от спора.",
  ];

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <section className="border-b border-slate-200">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-2">
          <div>
            <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-600">
              Услуга GOSZAKON
            </div>

            <h1 className="mt-6 text-5xl font-bold tracking-tight text-[#081a4b] md:text-6xl">
              Проверка закупки
            </h1>

            <p className="mt-6 text-lg leading-9 text-slate-700">
              Проверка закупки — это быстрый и практический способ понять,
              есть ли в документации нарушения, насколько сильна позиция поставщика
              и имеет ли смысл идти в ФАС или продолжать защиту в другой форме.
            </p>

            <p className="mt-4 text-lg leading-9 text-slate-700">
              Во многих ситуациях важнее сначала трезво оценить перспективу,
              чем сразу готовить жалобу. Это помогает экономить время, деньги
              и не начинать заведомо слабый спор.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/cases"
                className="rounded-2xl bg-[#081a4b] px-6 py-4 font-semibold text-white transition hover:bg-[#0d2568]"
              >
                Практика ФАС
              </Link>

              <a
                href={SITE_CONTACTS.phoneHref}
                className="rounded-2xl border border-slate-300 px-6 py-4 font-semibold transition hover:bg-slate-50"
              >
                {SITE_CONTACTS.phoneDisplay}
              </a>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8">
            <h3 className="text-xl font-semibold text-[#081a4b]">
              Когда особенно нужна проверка закупки
            </h3>

            <div className="mt-6 space-y-4">
              {situations.map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-slate-200 bg-white p-5"
                >
                  <p className="text-base leading-8 text-slate-700">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="max-w-3xl">
            <h2 className="text-4xl font-bold text-[#081a4b]">
              Что входит в проверку закупки
            </h2>

            <p className="mt-4 text-lg text-slate-700">
              Проверка строится не как формальный обзор, а как практическая оценка
              перспективы будущего спора или жалобы.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {checks.map((item) => (
              <div
                key={item.title}
                className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                  <div className="h-2 w-2 rounded-full bg-[#081a4b]" />
                </div>

                <h3 className="text-xl font-semibold text-[#081a4b]">
                  {item.title}
                </h3>

                <p className="mt-3 text-base leading-8 text-slate-700">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-20 lg:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8">
            <h2 className="text-3xl font-bold text-[#081a4b]">
              Что получает поставщик по итогу
            </h2>

            <div className="mt-6 space-y-4">
              {results.map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-slate-200 bg-white p-5"
                >
                  <p className="text-base leading-8 text-slate-700">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl bg-[#081a4b] p-8 text-white">
            <h2 className="text-3xl font-bold">
              Хотите понять перспективу обращения?
            </h2>

            <p className="mt-4 text-lg leading-8 text-white/90">
              Направьте ссылку на закупку или описание ситуации. Мы посмотрим
              документы, оценим, есть ли основания для жалобы, и подскажем,
              как действовать дальше.
            </p>

            <div className="mt-8 flex flex-col gap-4">
              <a
                href={SITE_CONTACTS.phoneHref}
                className="rounded-2xl bg-white px-6 py-4 text-center font-semibold text-[#081a4b] transition hover:bg-slate-100"
              >
                Позвонить: {SITE_CONTACTS.phoneDisplay}
              </a>

              <a
                href={SITE_CONTACTS.emailHref}
                className="rounded-2xl border border-white/30 px-6 py-4 text-center font-semibold transition hover:bg-white/10"
              >
                {SITE_CONTACTS.email}
              </a>

              <Link
                href="/uslugi/zhaloba-v-fas"
                className="rounded-2xl border border-white/30 px-6 py-4 text-center font-semibold transition hover:bg-white/10"
              >
                Смотреть услугу “Жалоба в ФАС”
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
