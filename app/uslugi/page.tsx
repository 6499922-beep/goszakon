import Link from "next/link";
import { SITE_CONTACTS } from "@/lib/site-config";

export default function ServicesPage() {
  const services = [
    {
      title: "Что делать, если...",
      text: "Серия быстрых страниц по самым частым ситуациям поставщика: неоплата, отклонение заявки, риск РНП, удержание неустойки и отказ ФАС.",
      href: "/chto-delat-esli",
    },
    {
      title: "Риски поставщика: тематическая серия",
      text: "Отдельный блок по ключевым рискам поставщика: жалобы в ФАС, отклонение заявки, РНП, неоплата, неустойка, формальные документы и продолжение спора в суде.",
      href: "/postavshikam/riski",
    },
    {
      title: "Отклонение заявки",
      text: "Большой раздел по незаконному отклонению заявки, формальным основаниям, характеристикам товара и спорам по реестровым записям.",
      href: "/otklonenie-zayavki",
    },
    {
      title: "Подготовка жалобы в ФАС",
      text: "Анализ закупочной документации, выявление нарушений, подготовка жалобы и сопровождение поставщика на стадии рассмотрения.",
      href: "/uslugi/zhaloba-v-fas",
    },
    {
      title: "Проверка закупки",
      text: "Оценка перспектив обращения в ФАС по конкретной закупке: что нарушено, насколько сильная позиция и есть ли практический смысл идти дальше.",
      href: "/#request",
    },
    {
      title: "Защита интересов поставщика",
      text: "Формирование правовой позиции, участие в заседаниях и юридическое сопровождение по ключевым вопросам закупки по 223-ФЗ.",
      href: "/uslugi/proverka-zakupki",
    },
    {
      title: "Споры по неоплате",
      text: "Работа с вопросами сроков оплаты, исполнения договора, взыскания задолженности и дальнейшего сопровождения поставщика.",
      href: "/uslugi/spory-po-neoplate",
    },
    {
      title: "Защита без раскрытия инициатора",
      text: "В отдельных ситуациях поставщику важно оспорить закупку без прямого раскрытия своей заинтересованности. Мы сопровождаем такие обращения в правовом поле.",
      href: "/uslugi/skrytaya-zhaloba",
    },
    {
      title: "Судебное продолжение спора",
      text: "При необходимости сопровождаем спор после ФАС: готовим позицию, защищаем интересы клиента и ведём дело дальше.",
      href: "/sudebnaya-zashita-v-zakupkah",
    },
    {
      title: "ФАС или суд",
      text: "Отдельный раздел о том, где спор решается жалобой, а где нужно сразу готовить судебное продолжение или идти туда после отказа ФАС.",
      href: "/fas-ili-sud",
    },
  ];

  return (
    <main className="min-h-screen bg-transparent text-slate-900">
      <section className="border-b border-[color:var(--line)] bg-transparent">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:py-20">
          <div className="max-w-4xl">
            <div className="inline-flex rounded-full border border-[color:var(--line)] bg-[rgba(255,253,249,0.9)] px-4 py-2 text-sm font-medium text-slate-600">
              Услуги GOSZAKON
            </div>

            <h1 className="mt-6 text-4xl font-bold tracking-[-0.03em] text-[#081a4b] md:text-6xl">
              Юридическая помощь поставщикам по 223-ФЗ и спорам в ФАС
            </h1>

            <p className="mt-6 max-w-3xl text-lg leading-9 text-slate-700">
              Мы помогаем поставщикам оценить перспективу жалобы, подготовить правовую
              позицию, защитить интересы в ФАС, снизить риски включения в РНП и
              сопровождать спор до практического результата.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href={SITE_CONTACTS.phoneHref}
                className="rounded-2xl bg-[#081a4b] px-7 py-4 text-center text-base font-semibold text-white transition hover:bg-[#0d2568]"
              >
                Позвонить: {SITE_CONTACTS.phoneDisplay}
              </a>

              <Link
                href="/cases"
                className="rounded-2xl border border-slate-300 bg-white px-7 py-4 text-center text-base font-semibold text-[#081a4b] transition hover:bg-slate-50"
              >
                Смотреть практику ФАС
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section-wash border-b border-[color:var(--line)]">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="mb-10 max-w-3xl">
            <h2 className="text-3xl font-bold tracking-tight text-[#081a4b] md:text-4xl">
              Основные направления работы
            </h2>
            <p className="mt-4 text-lg leading-8 text-slate-700">
              Работаем с закупочной документацией, жалобами в ФАС, РНП, ограничением конкуренции,
              товарными знаками, неоплатой и сопровождением поставщика по ключевым вопросам закупки.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {services.map((service) =>
              service.href ? (
                <Link
                  key={service.title}
                  href={service.href}
                  className="hero-panel flex h-full flex-col rounded-3xl p-7 transition hover:-translate-y-1 hover:shadow-md"
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
                  className="hero-panel flex h-full flex-col rounded-3xl p-7"
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
      </section>

      <section className="border-b border-[color:var(--line)] bg-transparent">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="accent-wash rounded-3xl p-8">
              <h2 className="text-3xl font-bold tracking-tight text-[#081a4b]">
                Когда стоит обращаться
              </h2>

              <ul className="mt-6 space-y-3 text-base leading-8 text-slate-700">
                <li>• документация ограничивает конкуренцию;</li>
                <li>• указаны конкретные товарные знаки без допуска эквивалентов;</li>
                <li>• заказчик создаёт заведомо неисполнимые условия;</li>
                <li>• есть риск включения в РНП;</li>
                <li>• заказчик не оплачивает поставку или уклоняется от обязательств.</li>
              </ul>
            </div>

            <div className="rounded-3xl bg-[#081a4b] p-8 text-white">
              <h2 className="text-3xl font-bold tracking-tight">
                Как проходит работа
              </h2>

              <div className="mt-6 space-y-4 text-base leading-8 text-white/90">
                <p>1. Изучаем закупку, документы и фактическую ситуацию.</p>
                <p>2. Оцениваем перспективу обращения и риски.</p>
                <p>3. Формируем правовую позицию и готовим документы.</p>
                <p>4. Сопровождаем поставщика в ФАС и далее при необходимости.</p>
              </div>

              <a
                href={SITE_CONTACTS.emailHref}
                className="mt-8 inline-flex rounded-2xl bg-white px-6 py-4 text-base font-semibold text-[#081a4b] transition hover:bg-slate-100"
              >
                Написать: {SITE_CONTACTS.email}
              </a>
            </div>
          </div>

          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            <Link
              href="/cases"
              className="hero-panel rounded-3xl p-6 transition hover:bg-white hover:shadow-sm"
            >
              <div className="text-lg font-semibold text-[#081a4b]">
                Практика ФАС
              </div>
              <p className="mt-2 text-sm leading-7 text-slate-600">
                Смотреть реальные кейсы по жалобам, РНП, неоплате и спорным условиям договоров.
              </p>
            </Link>
            <Link
              href="/spornye-praktiki"
              className="hero-panel rounded-3xl p-6 transition hover:bg-white hover:shadow-sm"
            >
              <div className="text-lg font-semibold text-[#081a4b]">
                Спорные практики
              </div>
              <p className="mt-2 text-sm leading-7 text-slate-600">
                Что заказчики пытаются сделать нормой и какие условия мы считаем недопустимыми.
              </p>
            </Link>
            <Link
              href="/sudebnaya-zashita-v-zakupkah"
              className="hero-panel rounded-3xl p-6 transition hover:bg-white hover:shadow-sm"
            >
              <div className="text-lg font-semibold text-[#081a4b]">
                Судебная защита
              </div>
              <p className="mt-2 text-sm leading-7 text-slate-600">
                Когда административной жалобы недостаточно и спор нужно продолжать в арбитражном суде.
              </p>
            </Link>
            <Link
              href="/chto-delat-esli"
              className="hero-panel rounded-3xl p-6 transition hover:bg-white hover:shadow-sm"
            >
              <div className="text-lg font-semibold text-[#081a4b]">
                Что делать, если...
              </div>
              <p className="mt-2 text-sm leading-7 text-slate-600">
                Быстрые входы по самой понятной боли поставщика: неоплата, отклонение, РНП, удержание и отказ ФАС.
              </p>
            </Link>
          </div>
        </div>
      </section>

      <section className="section-wash">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="grid gap-8 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm lg:grid-cols-[1fr_0.9fr]">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-[#081a4b]">
                Нужно быстро оценить закупку или жалобу?
              </h2>
              <p className="mt-4 text-lg leading-8 text-slate-700">
                Для таких вопросов лучше не оставлять формальную заявку, а сразу
                связываться напрямую. Так мы быстрее поймем, есть ли практический
                смысл в жалобе и какие документы нужно смотреть в первую очередь.
              </p>
            </div>

            <div className="rounded-3xl bg-slate-50 p-6 ring-1 ring-slate-200">
              <div className="text-lg font-semibold text-[#081a4b]">
                Быстрый контакт
              </div>
              <div className="mt-5 flex flex-wrap gap-3">
                <a
                  href={SITE_CONTACTS.phoneHref}
                  className="rounded-2xl bg-[#081a4b] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#0d2568]"
                >
                  Позвонить
                </a>
                <a
                  href={SITE_CONTACTS.emailHref}
                  className="rounded-2xl border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-white"
                >
                  Написать на почту
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
