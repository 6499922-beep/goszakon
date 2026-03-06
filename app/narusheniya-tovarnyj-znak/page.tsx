import Link from "next/link";

export default function TrademarkViolationPage() {
  const signs = [
    "В документации указан конкретный товарный знак без достаточного обоснования.",
    "Отсутствует реальная возможность поставки эквивалента.",
    "Описание закупки фактически подходит только одному производителю.",
    "Техническое задание искусственно ограничивает круг участников.",
  ];

  const whenToComplain = [
    "Если заказчик указывает конкретный товарный знак и это ограничивает конкуренцию.",
    "Если эквивалент предусмотрен формально, но фактически поставить аналог невозможно.",
    "Если техническое задание составлено так, что подходит только один производитель.",
    "Если закупка явно заточена под конкретный товар.",
  ];

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:py-20">
          <div className="max-w-4xl">
            <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600">
              Категория нарушения
            </div>

            <h1 className="mt-5 text-5xl font-bold tracking-tight text-[#081a4b] md:text-6xl">
              Товарный знак в закупке по 223-ФЗ
            </h1>

            <p className="mt-6 text-lg leading-9 text-slate-700">
              Одной из самых частых причин обращения в ФАС является указание
              конкретного товарного знака в закупке или составление технического
              задания таким образом, что фактически участвовать может только
              заранее определённый производитель.
            </p>

            <p className="mt-4 text-lg leading-9 text-slate-700">
              Важно понимать, что само по себе упоминание бренда не всегда
              является нарушением. Однако если документация ограничивает
              конкуренцию и не допускает реального эквивалента, это может стать
              основанием для жалобы в ФАС.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/#request"
                className="rounded-2xl bg-[#081a4b] px-6 py-4 text-base font-semibold text-white hover:bg-[#0d2568]"
              >
                Проверить закупку
              </Link>

              <Link
                href="/cases"
                className="rounded-2xl border border-slate-300 bg-white px-6 py-4 text-base font-semibold text-[#081a4b] hover:bg-slate-50"
              >
                Смотреть практику ФАС
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <h2 className="text-4xl font-bold text-[#081a4b]">
            Признаки возможного нарушения
          </h2>

          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {signs.map((item) => (
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
        <div className="mx-auto max-w-7xl px-6 py-20 lg:grid lg:grid-cols-2 lg:gap-8">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8">
            <h2 className="text-3xl font-bold text-[#081a4b]">
              Когда есть смысл подавать жалобу
            </h2>

            <div className="mt-6 space-y-4">
              {whenToComplain.map((item) => (
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
              Как мы оцениваем такие закупки
            </h2>

            <p className="mt-5 text-lg leading-9 text-white/90">
              Мы анализируем не только наличие товарного знака в документации,
              но и то, допускается ли реальный эквивалент, насколько обоснованы
              требования заказчика и как ФАС может оценить такую закупку на
              практике.
            </p>

            <p className="mt-4 text-lg leading-9 text-white/90">
              Если вы видите закупку, заточенную под конкретный бренд, лучше
              сразу проверить её до подачи жалобы.
            </p>

            <Link
              href="/#request"
              className="mt-6 inline-flex rounded-2xl bg-white px-6 py-4 text-base font-semibold text-[#081a4b]"
            >
              Отправить закупку на проверку
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}