import Link from "next/link";

export default function CompetitionRestrictionPage() {
  const signs = [
    "Техническое задание сформулировано так, что под него подходит только один производитель или одна модель.",
    "Требования к товару, опыту, характеристикам или комплектности явно избыточны и не обоснованы предметом закупки.",
    "Документация искусственно сужает круг участников без разумной деловой необходимости.",
    "Поставщик видит, что условия закупки фактически заточены под заранее определённого участника.",
  ];

  const typicalSituations = [
    "Установлены характеристики, которые не влияют на результат исполнения договора, но исключают большинство поставщиков.",
    "В закупке используются формулировки, совпадающие с описанием конкретного товара или производителя.",
    "Заказчик вводит непропорциональные требования к опыту, ресурсам или подтверждающим документам.",
    "Условия закупки выглядят формально законными, но по сути создают преимущество конкретному участнику.",
  ];

  const approach = [
    {
      title: "Анализ документации",
      text: "Изучаем закупочную документацию, техническое задание и критерии допуска, чтобы понять, есть ли реальное ограничение конкуренции.",
    },
    {
      title: "Оценка перспективы",
      text: "Смотрим не только на наличие спорного условия, но и на то, насколько сильной будет позиция при рассмотрении жалобы в ФАС.",
    },
    {
      title: "Подготовка позиции",
      text: "Формируем аргументацию, которая показывает, почему требование ограничивает рынок и нарушает интересы поставщика.",
    },
    {
      title: "Сопровождение обращения",
      text: "Помогаем довести дело до результата: от первичной оценки до жалобы и дальнейшего юридического сопровождения.",
    },
  ];

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:py-20">
          <div>
            <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600">
              Категория нарушения
            </div>

            <h1 className="mt-5 max-w-5xl text-5xl font-bold tracking-tight text-[#081a4b] md:text-6xl">
              Ограничение конкуренции в закупке по 223-ФЗ
            </h1>

            <p className="mt-6 max-w-3xl text-lg leading-9 text-slate-700">
              Одно из самых чувствительных нарушений в закупках по 223-ФЗ —
              ситуация, когда документация формально выглядит нейтральной, но
              фактически выстроена под конкретного поставщика, товар или заранее
              согласованного участника.
            </p>

            <p className="mt-4 max-w-3xl text-lg leading-9 text-slate-700">
              Для поставщика важно не просто почувствовать несправедливость
              условий, а понять, можно ли доказать ограничение конкуренции,
              насколько сильна перспектива жалобы и как ФАС смотрит на такие
              кейсы на практике.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/#request"
                className="inline-flex items-center justify-center rounded-2xl bg-[#081a4b] px-6 py-4 text-base font-semibold text-white transition hover:bg-[#0d2568]"
              >
                Проверить закупку
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
                О чём важно помнить
              </div>

              <p className="mt-4 text-lg leading-9 text-slate-700">
                Ограничение конкуренции не всегда выглядит как прямой запрет.
                Чаще оно скрывается в деталях: в технических характеристиках,
                лишних требованиях к участникам, необоснованных критериях или
                сочетании условий, под которые подходит только один поставщик.
              </p>
            </div>

            <div className="rounded-3xl bg-[#081a4b] p-7 text-white shadow-sm">
              <div className="text-sm uppercase tracking-[0.14em] text-white/60">
                Практический подход
              </div>
              <p className="mt-4 text-lg leading-9 text-white/90">
                Мы оцениваем не только спорное условие само по себе, но и
                контекст закупки: рынок, предмет договора, реальную необходимость
                требования и вероятность того, что ФАС сочтёт его ограничивающим конкуренцию.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="max-w-3xl">
            <div className="inline-flex rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600">
              Признаки нарушения
            </div>

            <h2 className="mt-5 text-4xl font-bold tracking-tight text-[#081a4b] md:text-5xl">
              Как выглядит ограничение конкуренции на практике
            </h2>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {signs.map((item) => (
              <div
                key={item}
                className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
                  <div className="h-3 w-3 rounded-full bg-[#081a4b]" />
                </div>
                <p className="text-base leading-8 text-slate-700">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-20 lg:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 shadow-sm">
            <div className="inline-flex rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600">
              Типовые ситуации
            </div>

            <div className="mt-6 space-y-4">
              {typicalSituations.map((item) => (
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
              Когда есть смысл жаловаться
            </div>

            <h2 className="mt-5 text-4xl font-bold tracking-tight">
              Если спорное требование реально отсекает рынок
            </h2>

            <p className="mt-5 text-lg leading-9 text-white/90">
              Жалоба имеет смысл тогда, когда ограничение конкуренции можно
              показать не абстрактно, а через влияние на рынок и на возможность
              поставщика участвовать в закупке на равных условиях.
            </p>

            <p className="mt-4 text-lg leading-9 text-white/90">
              Именно поэтому сначала важно проверить закупку, а уже потом решать,
              есть ли практический смысл в обращении в ФАС.
            </p>

            <Link
              href="/#request"
              className="mt-6 inline-flex rounded-2xl bg-white px-6 py-4 text-base font-semibold text-[#081a4b] transition hover:bg-slate-100"
            >
              Отправить закупку на проверку
            </Link>
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
              Проверяем закупку не формально, а по реальной перспективе спора
            </h2>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {approach.map((item) => (
              <div
                key={item.title}
                className="flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-7 shadow-sm"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
                  <div className="h-3 w-3 rounded-full bg-[#081a4b]" />
                </div>

                <h3 className="text-xl font-semibold leading-8 text-[#081a4b]">
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

      <section className="bg-[#081a4b] text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-20 md:grid-cols-2">
          <div>
            <div className="inline-flex rounded-full border border-white/20 px-4 py-2 text-sm text-white/80">
              Следующий шаг
            </div>

            <h2 className="mt-5 text-4xl font-bold tracking-tight">
              Если закупка выглядит заточенной под конкретного участника — направьте её на проверку
            </h2>

            <p className="mt-5 max-w-2xl text-lg leading-9 text-slate-200">
              Мы оценим документацию, посмотрим реальную перспективу жалобы и
              предложим правовой подход для защиты интересов поставщика.
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