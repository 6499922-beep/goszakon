import Link from "next/link";

export default function HiddenComplaintPage() {
  const situations = [
    "Техническое задание фактически сформировано под конкретного производителя или участника.",
    "Поставщик видит нарушение, но не хочет напрямую раскрывать свою заинтересованность на раннем этапе.",
    "Есть риск осложнения дальнейших отношений с заказчиком при прямом обращении.",
    "Нужна аккуратная правовая стратегия с учётом чувствительности закупки и поведения заказчика.",
  ];

  const steps = [
    {
      title: "Анализ закупки",
      text: "Изучаем документацию, техническое задание, ограничения конкуренции, товарные знаки и иные спорные условия закупки.",
    },
    {
      title: "Оценка перспективы",
      text: "Понимаем, действительно ли нарушение имеет практическую значимость и насколько сильной может быть правовая позиция.",
    },
    {
      title: "Выбор стратегии",
      text: "Определяем формат защиты интересов поставщика с учётом деликатности ситуации и необходимости не усиливать конфликт.",
    },
    {
      title: "Сопровождение обращения",
      text: "Подготавливаем правовую позицию, сопровождаем процесс и помогаем довести вопрос до практического результата.",
    },
  ];

  const benefits = [
    "Снижение риска прямого конфликта с заказчиком на ранней стадии.",
    "Возможность аккуратно отреагировать на закупку, заточенную под другого участника.",
    "Профессиональная правовая оценка, а не эмоциональная реакция на спорную документацию.",
    "Фокус на результате и защите интересов поставщика в реальной закупочной ситуации.",
  ];

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:py-20">
          <div>
            <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600">
              Услуга GOSZAKON
            </div>

            <h1 className="mt-5 max-w-5xl text-5xl font-bold tracking-tight text-[#081a4b] md:text-6xl">
              Защита поставщика без раскрытия инициатора обращения
            </h1>

            <p className="mt-6 max-w-3xl text-lg leading-9 text-slate-700">
              В отдельных закупках поставщик видит, что документация или техническое
              задание фактически сформированы под конкретного участника, но не хочет
              напрямую раскрывать свою заинтересованность на раннем этапе. В таких
              ситуациях особенно важен аккуратный и профессиональный правовой подход.
            </p>

            <p className="mt-4 max-w-3xl text-lg leading-9 text-slate-700">
              Мы сопровождаем такие ситуации с учётом чувствительности спора,
              особенностей закупки и необходимости защищать интересы поставщика без
              лишней эскалации конфликта.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/#request"
                className="inline-flex items-center justify-center rounded-2xl bg-[#081a4b] px-6 py-4 text-base font-semibold text-white transition hover:bg-[#0d2568]"
              >
                Отправить закупку на проверку
              </Link>

              <Link
                href="/cases"
                className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-6 py-4 text-base font-semibold text-[#081a4b] transition hover:bg-slate-50"
              >
                Смотреть практику ФАС
              </Link>
            </div>
          </div>

          <div className="grid gap-5">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-7 shadow-sm">
              <div className="text-sm uppercase tracking-[0.14em] text-slate-400">
                Когда это особенно актуально
              </div>

              <div className="mt-5 space-y-4">
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

            <div className="rounded-3xl bg-[#081a4b] p-7 text-white shadow-sm">
              <div className="text-sm uppercase tracking-[0.14em] text-white/60">
                Практический смысл услуги
              </div>
              <p className="mt-4 text-lg leading-9 text-white/90">
                В подобных кейсах важно не просто увидеть нарушение, а выбрать
                правовую стратегию, которая поможет защитить интересы поставщика
                без ненужных репутационных и деловых рисков.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="max-w-3xl">
            <div className="inline-flex rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600">
              Как мы работаем
            </div>

            <h2 className="mt-5 text-4xl font-bold tracking-tight text-[#081a4b] md:text-5xl">
              Правовая защита строится поэтапно и с учётом деликатности ситуации
            </h2>

            <p className="mt-5 text-lg leading-9 text-slate-700">
              Такая услуга требует не шаблонного подхода, а внимательной оценки
              закупки, реальной перспективы спора и выбора стратегии, которая будет
              полезна поставщику в конкретной ситуации.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {steps.map((step) => (
              <div
                key={step.title}
                className="flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-7 shadow-sm"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
                  <div className="h-3 w-3 rounded-full bg-[#081a4b]" />
                </div>

                <h3 className="text-xl font-semibold leading-8 text-[#081a4b]">
                  {step.title}
                </h3>
                <p className="mt-3 text-base leading-8 text-slate-700">
                  {step.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-20 lg:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 shadow-sm">
            <div className="inline-flex rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600">
              Что это даёт поставщику
            </div>

            <div className="mt-6 space-y-4">
              {benefits.map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-slate-200 bg-white p-5"
                >
                  <p className="text-base leading-8 text-slate-700">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl bg-[#081a4b] p-8 text-white shadow-sm">
            <div className="inline-flex rounded-full border border-white/20 px-4 py-2 text-sm text-white/80">
              Важно понимать
            </div>

            <h2 className="mt-5 text-4xl font-bold tracking-tight">
              Каждая закупка требует отдельной правовой оценки
            </h2>

            <p className="mt-5 text-lg leading-9 text-white/90">
              Мы не предлагаем универсальных решений и не публикуем шаблонных
              сценариев. В подобных ситуациях важно оценивать закупку индивидуально:
              документацию, рынок, позицию заказчика и практический риск для поставщика.
            </p>

            <p className="mt-4 text-lg leading-9 text-white/90">
              Именно поэтому первый шаг — это разбор закупки и понимание, имеет ли
              смысл идти в спор и какая стратегия действительно будет работать.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-[#081a4b] text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-20 md:grid-cols-2">
          <div>
            <div className="inline-flex rounded-full border border-white/20 px-4 py-2 text-sm text-white/80">
              Следующий шаг
            </div>

            <h2 className="mt-5 text-4xl font-bold tracking-tight">
              Если вы видите закупку, заточенную под другого участника — направьте её на проверку
            </h2>

            <p className="mt-5 max-w-2xl text-lg leading-9 text-slate-200">
              Мы оценим документацию, посмотрим перспективу спора и предложим
              правовой подход, который поможет защитить ваши интересы.
            </p>
          </div>

          <div className="flex flex-col justify-center gap-4 rounded-3xl bg-white p-8 text-slate-900 shadow-2xl">
            <a
              href="tel:84956680706"
              className="inline-flex items-center justify-center rounded-2xl bg-[#081a4b] px-6 py-4 text-base font-semibold text-white transition hover:bg-[#0d2568]"
            >
              Позвонить: 8 (495) 668-07-06
            </a>

            <a
              href="mailto:info@goszakon.ru"
              className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-6 py-4 text-base font-semibold text-[#081a4b] transition hover:bg-slate-50"
            >
              info@goszakon.ru
            </a>

            <Link
              href="/#request"
              className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-6 py-4 text-base font-semibold text-[#081a4b] transition hover:bg-slate-50"
            >
              Отправить закупку на проверку
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}