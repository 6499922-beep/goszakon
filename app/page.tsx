import Link from "next/link";
import { cases } from "./data/cases";

export default function Home() {
  const stats = [
    { label: "Заседаний ФАС ежедневно", value: "3–5" },
    { label: "Обоснованных жалоб", value: "≈ 50%" },
    { label: "Специализация", value: "223-ФЗ" },
    { label: "Кейсов в базе", value: "50+" },
  ];

  const trustItems = [
    {
      title: "Ежедневная практика в ФАС",
      text: "Мы регулярно участвуем в заседаниях и работаем с реальными закупками, нарушениями документации и жалобами поставщиков.",
    },
    {
      title: "Узкая специализация по 223-ФЗ",
      text: "Фокус только на закупках по 223-ФЗ позволяет глубже понимать логику споров, позиции сторон и перспективу обращения.",
    },
    {
      title: "Реальные кейсы вместо общих обещаний",
      text: "Портал строится на практических делах: решениях, результатах жалоб, категориях нарушений и прикладных выводах.",
    },
    {
      title: "Понимание логики рассмотрения жалоб",
      text: "Важно не просто увидеть нарушение, а правильно выстроить позицию, которая действительно будет работать в ФАС.",
    },
    {
      title: "Фокус на интересах поставщика",
      text: "Наша задача — защитить поставщика, оценить перспективу жалобы и сопровождать дело до практического результата.",
    },
    {
      title: "Доверие через прозрачную практику",
      text: "Посетитель видит предмет закупки, категорию нарушения, регион и итог рассмотрения, а не абстрактную рекламу.",
    },
  ];

  const services = [
    {
      title: "Подготовка жалоб в ФАС",
      text: "Анализ закупочной документации, выявление нарушений, подготовка жалобы и сопровождение поставщика на стадии рассмотрения.",
      href: null,
    },
    {
      title: "Проверка закупки",
      text: "Оценка перспектив обращения в ФАС по конкретной закупке: что нарушено, насколько сильная позиция и есть ли практический смысл идти дальше.",
      href: "/#request",
    },
    {
      title: "Защита интересов поставщика",
      text: "Формирование правовой позиции, участие в заседаниях и юридическое сопровождение по ключевым вопросам закупки по 223-ФЗ.",
      href: null,
    },
    {
      title: "Споры по неоплате",
      text: "Работа с вопросами сроков оплаты, исполнения договора, взыскания задолженности и дальнейшего сопровождения поставщика.",
      href: null,
    },
    {
      title: "Защита без раскрытия инициатора",
      text: "В отдельных ситуациях поставщику важно оспорить закупку без прямого раскрытия своей заинтересованности. Мы сопровождаем такие обращения в правовом поле.",
      href: "/uslugi/skrytaya-zhaloba",
    },
    {
      title: "Судебное продолжение спора",
      text: "При необходимости сопровождаем спор после ФАС: готовим позицию, защищаем интересы клиента и ведём дело дальше.",
      href: null,
    },
  ];

  const categories = [
    { title: "Национальный режим", href: "/narusheniya-nacionalnyj-rezhim" },
    { title: "Товарный знак", href: "/narusheniya-tovarnyj-znak" },
    { title: "Документация", href: null },
    { title: "Ограничение конкуренции", href: "/narusheniya-ogranichenie-konkurencii" },
    { title: "Процедура", href: null },
    { title: "ОКПД2", href: null },
    { title: "Неоплата", href: null },
    { title: "Судебная практика", href: null },
  ];

  const featuredCase = cases.find((item) => item.id === 100) ?? cases[0];

  const latestCases = cases
    .filter((item) => item.id !== featuredCase?.id)
    .slice(0, 3);

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-start lg:py-24">
          <div className="flex h-full flex-col">
            <div className="inline-flex w-fit rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600">
              Экспертный портал для поставщиков по 223-ФЗ
            </div>

            <h1 className="mt-6 max-w-4xl text-5xl font-bold leading-[1.02] tracking-tight text-[#081a4b] md:text-7xl">
              Защищаем интересы поставщиков в ФАС и превращаем ежедневную практику в сильную юридическую экспертизу.
            </h1>

            <p className="mt-6 max-w-2xl text-xl leading-9 text-slate-700">
              GOSZAKON — экспертный портал и практическая юридическая база по жалобам в ФАС
              по 223-ФЗ. Сайт создан для поставщиков, которым важно быстро понять перспективу
              жалобы, защитить свои интересы и получить сопровождение по делу.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="#request"
                className="rounded-2xl bg-[#081a4b] px-7 py-4 text-center text-base font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-[#0d2568]"
              >
                Проверить закупку
              </a>

              <Link
                href="/cases"
                className="rounded-2xl border border-slate-300 bg-white px-7 py-4 text-center text-base font-semibold text-[#081a4b] transition hover:bg-slate-50"
              >
                Смотреть практику ФАС
              </Link>
            </div>

            <div className="mt-10 grid gap-5 sm:grid-cols-2">
              <div className="flex h-full rounded-3xl border border-slate-200 bg-slate-50 p-7">
                <div>
                  <div className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-400">
                    Для кого сайт
                  </div>
                  <p className="mt-4 text-lg leading-8 text-slate-700">
                    Для поставщиков, которым нужна правовая оценка закупки, подготовка жалобы и защита интересов при рассмотрении дела в ФАС.
                  </p>
                </div>
              </div>

              <div className="flex h-full rounded-3xl border border-slate-200 bg-slate-50 p-7">
                <div>
                  <div className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-400">
                    Главная задача
                  </div>
                  <p className="mt-4 text-lg leading-8 text-slate-700">
                    Не просто публиковать кейсы, а превращать ежедневную практику по 223-ФЗ в доверие, обращения и юридическое сопровождение клиентов.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-6">
            <div className="rounded-[32px] border border-slate-200 bg-slate-50 p-7 shadow-sm">
              <div className="mb-6 text-2xl font-semibold text-[#081a4b]">
                Практика в цифрах
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {stats.map((item) => (
                  <div
                    key={item.label}
                    className="flex min-h-[148px] flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6"
                  >
                    <div className="text-4xl font-bold tracking-tight text-[#081a4b]">
                      {item.value}
                    </div>
                    <div className="mt-4 text-base leading-7 text-slate-600">
                      {item.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[32px] bg-[#081a4b] p-7 text-white shadow-sm">
              <div className="text-sm font-medium uppercase tracking-[0.16em] text-white/60">
                Почему это важно
              </div>
              <p className="mt-5 text-lg leading-9 text-white/90">
                Поставщику нужен не формальный юридический сайт, а команда, которая каждый день
                видит реальные закупки, реальные нарушения и реальные результаты рассмотрения жалоб.
              </p>
            </div>

            <div className="rounded-[32px] border border-slate-200 bg-white p-7 shadow-sm">
              <div className="text-sm font-medium uppercase tracking-[0.16em] text-slate-400">
                Почему поставщики обращаются к нам
              </div>

              <div className="mt-5 grid gap-4">
                {[
                  {
                    title: "Практика, а не теория",
                    text: "Мы работаем с реальными закупками и жалобами, а не с абстрактными формулировками.",
                  },
                  {
                    title: "Понимание перспективы",
                    text: "Мы оцениваем не только наличие нарушения, но и вероятность практического результата.",
                  },
                  {
                    title: "Сопровождение до результата",
                    text: "Поставщик получает не просто разбор закупки, а юридическую работу по защите своих интересов.",
                  },
                ].map((item) => (
                  <div key={item.title} className="rounded-2xl bg-slate-50 p-6">
                    <div className="text-xl font-semibold text-[#081a4b]">
                      {item.title}
                    </div>
                    <p className="mt-3 text-base leading-8 text-slate-700">
                      {item.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="trust" className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="max-w-3xl">
            <div className="inline-flex rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600">
              Почему нам доверяют
            </div>

            <h2 className="mt-5 text-4xl font-bold tracking-tight text-[#081a4b] md:text-5xl">
              Поставщики обращаются к нам не за теорией, а за практической защитой в ФАС
            </h2>

            <p className="mt-5 text-lg leading-9 text-slate-700">
              Основа доверия — это ежедневная работа по 223-ФЗ, участие в заседаниях,
              анализ документации, сопровождение жалоб и понимание того, какие доводы
              действительно работают на практике.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {trustItems.map((item) => (
              <div
                key={item.title}
                className="flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
                  <div className="h-3 w-3 rounded-full bg-[#081a4b]" />
                </div>

                <h3 className="text-xl font-semibold text-[#081a4b]">{item.title}</h3>
                <p className="mt-3 text-base leading-8 text-slate-700">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {featuredCase && (
        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-7xl px-6 py-20">
            <div className="mb-8">
              <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600">
                Ключевой кейс из практики
              </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-9 shadow-sm">
                <div className="mb-5 flex flex-wrap items-center gap-3">
                  <span className="inline-flex rounded-full bg-white px-3 py-1 text-sm font-medium text-slate-700">
                    {featuredCase.tag}
                  </span>
                  <span className="text-sm text-slate-400">
                    Выделенный кейс портала
                  </span>
                </div>

                <h2 className="max-w-4xl text-4xl font-bold tracking-tight text-[#081a4b] md:text-5xl">
                  {featuredCase.title}
                </h2>

                <p className="mt-6 max-w-3xl text-lg leading-9 text-slate-700">
                  На главной странице мы показываем не абстрактную экспертизу, а конкретную практику.
                  Такой кейс демонстрирует подход к защите поставщика и помогает посетителю понять,
                  как именно строится правовая работа по 223-ФЗ.
                </p>

                <div className="mt-7 grid gap-4 md:grid-cols-3">
                  <div className="flex min-h-[170px] flex-col rounded-2xl bg-white p-5">
                    <div className="text-xs uppercase tracking-wide text-slate-400">
                      Регион / орган
                    </div>
                    <div className="mt-3 text-base font-semibold leading-8 text-slate-900">
                      {featuredCase.region}
                    </div>
                  </div>

                  <div className="flex min-h-[170px] flex-col rounded-2xl bg-white p-5">
                    <div className="text-xs uppercase tracking-wide text-slate-400">
                      Категория
                    </div>
                    <div className="mt-3 text-base font-semibold leading-8 text-slate-900">
                      {featuredCase.tag}
                    </div>
                  </div>

                  <div className="flex min-h-[170px] flex-col rounded-2xl bg-white p-5">
                    <div className="text-xs uppercase tracking-wide text-slate-400">
                      Предмет
                    </div>
                    <div className="mt-3 text-base font-semibold leading-8 text-slate-900">
                      {featuredCase.subject}
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href={`/cases/${featuredCase.id}`}
                    className="inline-flex items-center justify-center rounded-2xl bg-[#081a4b] px-6 py-4 text-base font-semibold text-white transition hover:bg-[#0d2568]"
                  >
                    Смотреть кейс
                  </Link>

                  <a
                    href={featuredCase.pdf}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-6 py-4 text-base font-semibold text-slate-700 transition hover:bg-slate-100"
                  >
                    Открыть PDF
                  </a>
                </div>
              </div>

              <div className="grid gap-6">
                <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
                  <div className="text-sm uppercase tracking-wide text-slate-400">
                    Что получает поставщик
                  </div>
                  <ul className="mt-4 space-y-3 text-base leading-8 text-slate-700">
                    <li>• понимание перспективы жалобы;</li>
                    <li>• практический разбор нарушения;</li>
                    <li>• возможность обратиться за сопровождением.</li>
                  </ul>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
                  <div className="text-sm uppercase tracking-wide text-slate-400">
                    Результат кейса
                  </div>
                  <p className="mt-4 text-base leading-8 text-slate-700">
                    {featuredCase.result}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-4xl font-bold tracking-tight text-[#081a4b]">
                Последние кейсы
              </h2>
              <p className="mt-3 max-w-2xl text-lg leading-8 text-slate-700">
                Реальные кейсы из базы практики по жалобам в ФАС по 223-ФЗ.
              </p>
            </div>

            <Link
              href="/cases"
              className="hidden text-base font-semibold text-slate-700 underline-offset-4 hover:underline md:block"
            >
              Смотреть все кейсы
            </Link>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {latestCases.map((item) => (
              <article
                key={item.id}
                className="flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="mb-4 flex items-start justify-between gap-4">
                  <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
                    {item.tag}
                  </span>
                  <span className="text-sm text-slate-400">Кейс #{item.id}</span>
                </div>

                <h3 className="text-2xl font-semibold leading-9 text-[#081a4b]">
                  {item.title}
                </h3>

                <div className="mt-4 space-y-2 text-base text-slate-700">
                  <div>
                    <span className="font-medium text-slate-900">Закупка:</span>{" "}
                    {item.number}
                  </div>
                  <div>
                    <span className="font-medium text-slate-900">Регион:</span>{" "}
                    {item.region}
                  </div>
                  <div>
                    <span className="font-medium text-slate-900">Предмет:</span>{" "}
                    {item.subject}
                  </div>
                </div>

                <div className="mt-5 flex-1 rounded-2xl bg-slate-50 p-5">
                  <div className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Результат
                  </div>
                  <div className="mt-2 text-base leading-8 text-slate-700">
                    {item.result}
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between">
                  <Link
                    href={`/cases/${item.id}`}
                    className="inline-flex rounded-2xl bg-[#081a4b] px-5 py-3 text-base font-medium text-white transition hover:bg-[#0d2568]"
                  >
                    Смотреть кейс
                  </Link>

                  <a
                    href={item.pdf}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-base font-medium text-slate-700 underline-offset-4 hover:underline"
                  >
                    PDF
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600">
                Практическая помощь по 223-ФЗ
              </div>

              <h2 className="mt-5 text-4xl font-bold tracking-tight text-[#081a4b] md:text-5xl">
                Чем занимается GOSZAKON
              </h2>

              <p className="mt-5 max-w-2xl text-lg leading-9 text-slate-700">
                Мы развиваем портал вокруг реальной практики и одновременно используем его
                как точку входа для поставщиков, которым нужна оценка закупки, жалоба в ФАС,
                защита интересов и дальнейшее юридическое сопровождение.
              </p>
            </div>

            <div id="services" className="grid gap-5 md:grid-cols-2">
              {services.map((service) =>
                service.href ? (
                  <Link
                    key={service.title}
                    href={service.href}
                    className="flex h-full flex-col rounded-3xl border border-slate-200 bg-slate-50 p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                  >
                    <h3 className="text-xl font-semibold leading-8 text-[#081a4b]">
                      {service.title}
                    </h3>
                    <p className="mt-3 text-base leading-8 text-slate-700">
                      {service.text}
                    </p>
                    <span className="mt-5 text-sm font-semibold text-[#081a4b]">
                      Подробнее →
                    </span>
                  </Link>
                ) : (
                  <div
                    key={service.title}
                    className="flex h-full flex-col rounded-3xl border border-slate-200 bg-slate-50 p-7 shadow-sm"
                  >
                    <h3 className="text-xl font-semibold leading-8 text-[#081a4b]">
                      {service.title}
                    </h3>
                    <p className="mt-3 text-base leading-8 text-slate-700">
                      {service.text}
                    </p>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </section>

      <section id="categories" className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="mb-8">
            <h2 className="text-4xl font-bold tracking-tight text-[#081a4b]">
              Категории нарушений
            </h2>
            <p className="mt-3 max-w-3xl text-lg leading-8 text-slate-700">
              Основные категории нарушений в закупках по 223-ФЗ, по которым формируется практика ФАС.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((category) =>
              category.href ? (
                <Link
                  key={category.title}
                  href={category.href}
                  className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="text-lg font-semibold leading-8 text-[#081a4b]">
                    {category.title}
                  </div>
                  <div className="mt-3 text-sm font-medium text-[#081a4b]">
                    Открыть категорию →
                  </div>
                </Link>
              ) : (
                <div
                  key={category.title}
                  className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <div className="text-lg font-semibold leading-8 text-slate-700">
                    {category.title}
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="grid gap-8 lg:grid-cols-2">
            <Link
              href="/uslugi/skrytaya-zhaloba"
              className="rounded-3xl border border-slate-200 bg-slate-50 p-8 transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="inline-flex rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600">
                Особая услуга
              </div>

              <h2 className="mt-5 text-4xl font-bold tracking-tight text-[#081a4b]">
                Защита поставщика без раскрытия инициатора обращения
              </h2>

              <p className="mt-5 text-lg leading-9 text-slate-700">
                В ряде закупок поставщик видит, что техническое задание фактически сформировано
                под другого производителя или конкретного участника. При этом прямое обращение
                может осложнить отношения с заказчиком. В таких ситуациях мы сопровождаем
                правовую защиту интересов поставщика с учётом деликатности вопроса и особенностей спора.
              </p>

              <div className="mt-6 rounded-2xl bg-white p-6">
                <div className="text-xs uppercase tracking-wide text-slate-400">
                  Когда это особенно актуально
                </div>
                <ul className="mt-3 space-y-2 text-base leading-8 text-slate-700">
                  <li>• техническое задание переписано под конкретный товар;</li>
                  <li>• поставщик не хочет раскрывать своё участие до нужного этапа;</li>
                  <li>• требуется аккуратная правовая стратегия без лишнего конфликта.</li>
                </ul>
              </div>

              <div className="mt-6 text-sm font-semibold text-[#081a4b]">
                Подробнее об услуге →
              </div>
            </Link>

            <div className="rounded-3xl bg-[#081a4b] p-8 text-white">
              <div className="inline-flex rounded-full border border-white/20 px-4 py-2 text-sm text-white/80">
                Условия работы
              </div>

              <h2 className="mt-5 text-4xl font-bold tracking-tight">
                Стоимость и реквизиты
              </h2>

              <p className="mt-5 text-lg leading-9 text-white/90">
                Мы не публикуем фиксированный прайс-лист, поскольку стоимость сопровождения зависит
                от сложности закупки, стадии обращения, срочности и объёма правовой работы.
              </p>

              <div className="mt-6 space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6">
                <div>
                  <div className="text-xs uppercase tracking-wide text-white/50">
                    Первичная коммуникация
                  </div>
                  <div className="mt-1 text-base text-white/90">
                    По телефону или через отправку закупки на проверку.
                  </div>
                </div>

                <div>
                  <div className="text-xs uppercase tracking-wide text-white/50">
                    Формат расчёта
                  </div>
                  <div className="mt-1 text-base text-white/90">
                    Индивидуально после оценки ситуации и перспективы обращения.
                  </div>
                </div>

                <div>
                  <div className="text-xs uppercase tracking-wide text-white/50">
                    Реквизиты
                  </div>
                  <div className="mt-1 text-base text-white/90">
                    Могут быть предоставлены по запросу и вынесены на отдельную страницу сайта.
                  </div>
                </div>
              </div>

              <a
                href="tel:84956680706"
                className="mt-6 inline-flex rounded-2xl bg-white px-6 py-4 text-base font-semibold text-[#081a4b] transition hover:bg-slate-100"
              >
                Позвонить: 8 (495) 668-07-06
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#081a4b] text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-20 md:grid-cols-2">
          <div className="space-y-5">
            <div className="inline-flex rounded-full border border-white/20 px-4 py-2 text-sm text-white/80">
              Главный лидогенерирующий блок
            </div>

            <h2 className="text-4xl font-bold tracking-tight">
              Проверим закупку и оценим перспективу жалобы в ФАС
            </h2>

            <p className="max-w-2xl text-lg leading-9 text-slate-200">
              Если у вас есть сомнение по документации, ограничению конкуренции, товарному
              знаку, срокам оплаты или другим нарушениям по 223-ФЗ — отправьте закупку.
              Мы посмотрим ситуацию и определим, есть ли практический смысл в обращении.
            </p>

            <ul className="space-y-3 text-base leading-8 text-slate-200">
              <li>• анализ закупочной документации и условий;</li>
              <li>• первичная оценка перспектив жалобы;</li>
              <li>• определение сильных и слабых сторон позиции;</li>
              <li>• возможность дальнейшего юридического сопровождения.</li>
            </ul>
          </div>

          <div className="rounded-3xl bg-white p-8 text-slate-900 shadow-2xl">
            <h3 className="text-3xl font-bold tracking-tight text-[#081a4b]">
              Отправить закупку на проверку
            </h3>
            <p className="mt-3 text-base leading-8 text-slate-700">
              Укажите ссылку на закупку и кратко опишите проблему. Это самый быстрый способ начать работу.
            </p>

            <form
              className="mt-6 space-y-4"
              id="request"
              action="mailto:info@goszakon.ru"
              method="post"
              encType="text/plain"
            >
              <input
                name="link"
                className="w-full rounded-2xl border border-slate-300 px-5 py-4 text-base outline-none transition focus:border-slate-500"
                placeholder="Ссылка на закупку"
              />
              <textarea
                name="problem"
                className="min-h-[140px] w-full rounded-2xl border border-slate-300 px-5 py-4 text-base outline-none transition focus:border-slate-500"
                placeholder="Кратко опишите проблему"
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <input
                  name="phone"
                  className="w-full rounded-2xl border border-slate-300 px-5 py-4 text-base outline-none transition focus:border-slate-500"
                  placeholder="Телефон"
                />
                <input
                  name="email"
                  className="w-full rounded-2xl border border-slate-300 px-5 py-4 text-base outline-none transition focus:border-slate-500"
                  placeholder="Email"
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-2xl bg-[#081a4b] px-6 py-4 text-base font-medium text-white transition hover:bg-[#0d2568]"
              >
                Отправить на проверку
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}