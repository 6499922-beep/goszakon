import Link from "next/link";

export default function NationalRegimeViolationPage() {
  const examples = [
    "Заказчик неверно применил ограничения или запреты на иностранные товары.",
    "Условия допуска сформулированы так, что искажают логику закупки.",
    "В документации смешаны правила национального режима и требования к характеристикам товара.",
    "Закупка построена с ошибками, которые влияют на состав участников и результат процедуры.",
  ];

  const risks = [
    "Неверная оценка заявок и нарушение правил допуска.",
    "Сужение круга участников закупки из-за ошибки в документации.",
    "Риск жалобы в ФАС и пересмотра закупочной процедуры.",
    "Повышенная вероятность признания действий заказчика неправомерными.",
  ];

  const nextSteps = [
    {
      title: "Практика ФАС",
      text: "Смотрите материалы практики по закупкам, где спор возник из-за национального режима.",
      href: "/cases",
    },
    {
      title: "Проверка закупки",
      text: "Если нужно оценить перспективу жалобы и силу позиции, начните с проверки закупки.",
      href: "/uslugi/proverka-zakupki",
    },
    {
      title: "Жалоба в ФАС",
      text: "Если нарушение уже очевидно, следующим шагом становится подготовка обращения.",
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
              Национальный режим
            </h1>

            <p className="mt-6 text-lg leading-9 text-slate-700">
              Ошибки в применении национального режима часто влияют не только на
              условия закупки, но и на итог допуска участников, порядок оценки заявок
              и результат всей процедуры.
            </p>

            <p className="mt-4 text-lg leading-9 text-slate-700">
              Для поставщика важно понять, действительно ли закупка сформирована
              с нарушением и насколько сильной будет позиция при обращении в ФАС.
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
              Почему такие ошибки критичны
            </h2>

            <p className="mt-4 text-lg text-slate-700">
              Национальный режим — это одна из самых чувствительных зон закупки,
              потому что ошибка здесь влияет и на документацию, и на конкурентную среду.
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
              Следующий шаг после выявления проблемы
            </h2>

            <p className="mt-5 text-lg leading-9 text-slate-700">
              После выявления ошибки в национальном режиме важно быстро понять,
              есть ли смысл сразу идти в ФАС или сначала оценить перспективу спора.
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