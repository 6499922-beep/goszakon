import Link from "next/link";

export default function AboutPage() {
  const principles = [
    {
      title: "Ежедневная практика в ФАС",
      text: "Основа проекта — постоянная работа с жалобами по 223-ФЗ, участие в заседаниях и анализ реальных закупок, а не пересказ общих норм.",
    },
    {
      title: "Узкая специализация",
      text: "GOSZAKON сфокусирован на защите интересов поставщиков именно в закупках по 223-ФЗ, что позволяет глубже понимать специфику споров.",
    },
    {
      title: "Практический подход",
      text: "Для нас важна не формальная публикация кейсов, а прикладная польза: понять перспективу жалобы, выстроить позицию и довести дело до результата.",
    },
    {
      title: "Доверие через реальные кейсы",
      text: "Сайт строится вокруг практики: категории нарушений, позиции сторон, решения ФАС и конкретные результаты по каждому делу.",
    },
  ];

  const focus = [
    "Жалобы в ФАС по 223-ФЗ",
    "Проверка закупки и оценка перспективы обращения",
    "Защита поставщиков при ограничении конкуренции",
    "Споры по товарным знакам и документации",
    "Вопросы национального режима",
    "Неоплата и дальнейшее сопровождение спора",
  ];

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:py-20">
          <div>
            <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600">
              О проекте GOSZAKON
            </div>

            <h1 className="mt-5 max-w-4xl text-5xl font-bold tracking-tight text-[#081a4b] md:text-6xl">
              Экспертный портал по защите интересов поставщиков в ФАС по 223-ФЗ
            </h1>

            <p className="mt-6 max-w-3xl text-lg leading-9 text-slate-700">
              GOSZAKON создан как практическая база и рабочий инструмент для
              поставщиков, которым важно быстро понять перспективу жалобы,
              оценить нарушение и получить юридическое сопровождение по делу.
            </p>

            <p className="mt-4 max-w-3xl text-lg leading-9 text-slate-700">
              Проект вырос из реальной ежедневной практики: участия в заседаниях
              ФАС, анализа закупочной документации, подготовки жалоб и защиты
              интересов поставщиков в спорах по 223-ФЗ.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/cases"
                className="inline-flex items-center justify-center rounded-2xl bg-[#081a4b] px-6 py-4 text-base font-semibold text-white transition hover:bg-[#0d2568]"
              >
                Смотреть практику ФАС
              </Link>

              <Link
                href="/#request"
                className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-6 py-4 text-base font-semibold text-[#081a4b] transition hover:bg-slate-50"
              >
                Проверить закупку
              </Link>
            </div>
          </div>

          <div className="grid gap-5">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-7 shadow-sm">
              <div className="text-sm uppercase tracking-[0.14em] text-slate-400">
                Практика в цифрах
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <div className="text-3xl font-bold tracking-tight text-[#081a4b]">
                    3–5
                  </div>
                  <div className="mt-2 text-base text-slate-600">
                    заседаний ФАС ежедневно
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <div className="text-3xl font-bold tracking-tight text-[#081a4b]">
                    ≈ 50%
                  </div>
                  <div className="mt-2 text-base text-slate-600">
                    жалоб признаются обоснованными
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <div className="text-3xl font-bold tracking-tight text-[#081a4b]">
                    223-ФЗ
                  </div>
                  <div className="mt-2 text-base text-slate-600">
                    ключевая специализация
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <div className="text-3xl font-bold tracking-tight text-[#081a4b]">
                    50+
                  </div>
                  <div className="mt-2 text-base text-slate-600">
                    кейсов уже в базе
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl bg-[#081a4b] p-7 text-white shadow-sm">
              <div className="text-sm uppercase tracking-[0.14em] text-white/60">
                Зачем создан проект
              </div>
              <p className="mt-4 text-lg leading-9 text-white/90">
                Мы создаём не формальный юридический сайт, а экспертный портал,
                где каждая публикация, кейс и услуга опираются на реальную
                практику рассмотрения жалоб в ФАС по 223-ФЗ.
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
              Проект строится на реальной юридической работе, а не на абстрактной экспертизе
            </h2>

            <p className="mt-5 text-lg leading-9 text-slate-700">
              Для поставщика важно не просто узнать, что закупка вызывает
              сомнения, а понять, есть ли реальная перспектива обращения,
              насколько сильна правовая позиция и что можно сделать для защиты
              своих интересов.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {principles.map((item) => (
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

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-20 lg:grid-cols-[0.95fr_1.05fr]">
          <div>
            <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600">
              Основные направления
            </div>

            <h2 className="mt-5 text-4xl font-bold tracking-tight text-[#081a4b] md:text-5xl">
              На чём сфокусирован GOSZAKON
            </h2>

            <p className="mt-5 text-lg leading-9 text-slate-700">
              Портал ориентирован на прикладные вопросы, с которыми поставщики
              сталкиваются в закупках по 223-ФЗ: нарушения документации,
              ограничение конкуренции, товарные знаки, неоплата и правовая
              защита при обращении в ФАС.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {focus.map((item) => (
              <div
                key={item}
                className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm"
              >
                <div className="text-lg font-semibold leading-8 text-[#081a4b]">
                  {item}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-20 lg:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600">
              Для кого полезен сайт
            </div>

            <h2 className="mt-5 text-4xl font-bold tracking-tight text-[#081a4b]">
              Для поставщиков, которым нужна не теория, а результат
            </h2>

            <p className="mt-5 text-lg leading-9 text-slate-700">
              GOSZAKON полезен тем, кто хочет проверить закупку до подачи
              жалобы, понять перспективу обращения, разобраться в практике ФАС и
              получить сопровождение по спорной ситуации.
            </p>
          </div>

          <div className="rounded-3xl bg-[#081a4b] p-8 text-white shadow-sm">
            <div className="inline-flex rounded-full border border-white/20 px-4 py-2 text-sm text-white/80">
              Главный смысл проекта
            </div>

            <h2 className="mt-5 text-4xl font-bold tracking-tight">
              Превратить практику в доверие и обращения
            </h2>

            <p className="mt-5 text-lg leading-9 text-white/90">
              Мы развиваем сайт как экспертный портал, который помогает
              поставщику увидеть реальную практику, понять качество нашей работы
              и обратиться за юридическим сопровождением по своему делу.
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
              Если у вас есть сомнение по закупке — направьте её на проверку
            </h2>

            <p className="mt-5 max-w-2xl text-lg leading-9 text-slate-200">
              Мы оценим закупочную документацию, посмотрим перспективу жалобы и
              определим, есть ли практический смысл в обращении в ФАС.
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