import Link from "next/link";

export default function CompetitionRestrictionPage() {
  const examples = [
    "Требования закупки составлены под конкретного участника или производителя.",
    "Условия закупки делают участие большинства поставщиков фактически невозможным.",
    "Документация содержит чрезмерные, избыточные или необоснованные требования.",
    "Закупка организована так, что внешне остаётся конкурентной, но по сути ограничивает рынок.",
  ];

  const risks = [
    "Искусственное сужение числа участников закупки.",
    "Создание преимущества заранее определённому участнику.",
    "Жалоба в ФАС с риском отмены условий закупки.",
    "Формирование устойчивого основания для дальнейшего спора и судебной защиты.",
  ];

  const nextSteps = [
    {
      title: "Практика ФАС",
      text: "Изучите материалы по схожим ситуациям и подходу комиссии к ограничению конкуренции.",
      href: "/cases",
    },
    {
      title: "Проверка закупки",
      text: "Если нужно оценить силу позиции и перспективу спора, начните с проверки закупки.",
      href: "/uslugi/proverka-zakupki",
    },
    {
      title: "Жалоба в ФАС",
      text: "Если нарушение уже очевидно, следующим шагом становится подготовка жалобы.",
      href: "/uslugi/zhaloba-v-fas",
    },
  ];

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-2">
          <div>
            <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-600">
              Категория нарушений
            </div>

            <h1 className="mt-6 text-5xl font-bold tracking-tight text-[#081a4b] md:text-6xl">
              Ограничение конкуренции
            </h1>

            <p className="mt-6 text-lg leading-9 text-slate-700">
              Ограничение конкуренции — одна из ключевых категорий закупочных споров.
              Оно может проявляться не только в прямых запретах, но и в совокупности
              условий, которые фактически оставляют закупку доступной для узкого круга лиц.
            </p>

            <p className="mt-4 text-lg leading-9 text-slate-700">
              В таких ситуациях важно показать не просто неудобство для участника,
              а реальное влияние требований на конкурентную среду и доступ к закупке.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/narusheniya"
                className="rounded-2xl bg-[#081a4b] px-6 py-4 font-semibold text-white transition hover:bg-[#0d2568]"
              >
                Все нарушения
              </Link>
              <Link
                href="/cases"
                className="rounded-2xl border border-slate-300 px-6 py-4 font-semibold transition hover:bg-slate-50"
              >
                Практика ФАС
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8">
            <h2 className="text-2xl font-semibold text-[#081a4b]">
              Как это выглядит на практике
            </h2>

            <div className="mt-6 space-y-4">
              {examples.map((item) => (
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
              Почему это важно для жалобы
            </h2>

            <p className="mt-4 text-lg text-slate-700">
              ФАС оценивает не только отдельную формулировку, но и реальный эффект
              закупочных условий для участников рынка.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {risks.map((item) => (
              <div
                key={item}
                className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                  <div className="h-2 w-2 rounded-full bg-[#081a4b]" />
                </div>
                <p className="text-base leading-8 text-slate-700">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="mb-8 max-w-3xl">
            <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600">
              Что делать дальше
            </div>

            <h2 className="mt-5 text-4xl font-bold tracking-tight text-[#081a4b] md:text-5xl">
              Как перейти от нарушения к защите
            </h2>

            <p className="mt-5 text-lg leading-9 text-slate-700">
              После выявления ограничения конкуренции важно быстро перейти либо к анализу
              практики, либо к проверке закупки, либо к подготовке жалобы.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {nextSteps.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex h-full flex-col rounded-3xl border border-slate-200 bg-slate-50 p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <h3 className="text-2xl font-semibold text-[#081a4b]">{item.title}</h3>
                <p className="mt-4 text-base leading-8 text-slate-700">{item.text}</p>
                <span className="mt-5 text-sm font-semibold text-[#081a4b]">
                  Перейти →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}