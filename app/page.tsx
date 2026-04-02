import Link from "next/link";
import { getPrisma } from "@/lib/prisma";
import { materialTypeLabels } from "@/lib/materials";
import { SITE_CONTACTS } from "@/lib/site-config";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const prisma = getPrisma();

  const [latestMaterials, publishedCaseCount] = await Promise.all([
    prisma.material.findMany({
      where: { isPublished: true },
      orderBy: [
        { isFeatured: "desc" },
        { decisionDate: "desc" },
        { publishedAt: "desc" },
        { updatedAt: "desc" },
      ],
      take: 3,
    }),
    prisma.case.count({
      where: { published: true },
    }),
  ]);

  const services = [
    {
      title: "Жалоба в ФАС",
      text: "Анализ документации, подготовка жалобы, правовая позиция и сопровождение спора.",
      href: "/uslugi/zhaloba-v-fas",
    },
    {
      title: "Проверка закупки",
      text: "Оценка перспектив обращения, выявление нарушений и правовых рисков.",
      href: "/uslugi/proverka-zakupki",
    },
    {
      title: "Неоплата по контракту",
      text: "Претензионная работа, правовая позиция и сопровождение возврата денег по государственным контрактам.",
      href: "/neoplata-po-goskontraktu",
    },
  ];

  const advantages = [
    "10+ лет практики в государственном заказе",
    "6000+ исполненных тендеров",
    "1000+ судебных заседаний",
    "400+ заседаний ФАС",
  ];

  const contactActions = [
    "Быстро оцениваем перспективу спора по документам.",
    "Подключаемся онлайн по всей России и при необходимости выезжаем на место.",
    "Работаем не только по спору, но и по выстраиванию закупочной практики команды.",
  ];

  const problemScenarios = [
    "жалоба в ФАС на документацию или отклонение заявки",
    "неоплата по контракту и удержание денег из оплаты",
    "риск включения в РНП или защита от включения",
    "спорные условия закупки, нацрежим и ограничение конкуренции",
  ];

  const audienceRoutes = [
    {
      title: "Поставщикам",
      text: "Жалобы в ФАС, РНП, неоплата, удержания, неустойка и судебная защита по закупочным конфликтам.",
      href: "/postavshikam/riski",
      cta: "Перейти к сценариям поставщика",
    },
    {
      title: "Заказчикам",
      text: "Аудит закупки, защита в ФАС, нацрежим, документация, оспаривание штрафов и сопровождение закупок.",
      href: "/zakazchikam",
      cta: "Перейти к разделу для заказчиков",
    },
  ];

  return (
    <main className="min-h-screen bg-transparent text-slate-900">
      <section className="border-b border-[color:var(--line)] bg-transparent">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="grid items-start gap-12 xl:grid-cols-[minmax(0,1fr)_460px]">
            <div>
              <div className="inline-flex rounded-full border border-[color:var(--line)] bg-[rgba(255,253,249,0.82)] px-4 py-2 text-sm font-medium text-slate-600 shadow-sm">
                GOSZAKON • Правовая помощь в закупках
              </div>

              <h1 className="mt-6 max-w-4xl text-5xl font-bold tracking-[-0.03em] text-[#081a4b] md:text-6xl xl:text-[72px] xl:leading-[0.94]">
                Практика ФАС, споры по закупкам и защита интересов поставщиков и заказчиков
              </h1>

              <p className="mt-6 max-w-2xl text-[19px] leading-9 text-slate-700">
                Мы не общие юристы по тендерам, а практическая команда по закупочным конфликтам:
                жалобы в ФАС, РНП, неоплата по контрактам, спорная документация,
                неустойка, ограничения конкуренции и продолжение спора в суде.
              </p>

              <div className="mt-8 grid gap-3 md:grid-cols-2">
                {problemScenarios.map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-[color:var(--line)] bg-[rgba(255,253,249,0.9)] px-5 py-4 text-sm font-medium leading-7 text-slate-700 shadow-sm"
                  >
                    {item}
                  </div>
                ))}
              </div>

              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="/uslugi"
                  className="rounded-2xl bg-[#081a4b] px-7 py-4 text-base font-semibold text-white shadow-[0_18px_34px_rgba(8,26,75,0.18)] transition hover:bg-[#0d2568]"
                >
                  Разобрать ситуацию
                </Link>

                <a
                  href={SITE_CONTACTS.emailHref}
                  className="rounded-2xl border border-[color:var(--line)] bg-[rgba(255,253,249,0.92)] px-7 py-4 text-base font-semibold text-slate-700 transition hover:bg-white"
                >
                  Прислать документы
                </a>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm text-slate-600">
                <a
                  href={SITE_CONTACTS.phoneHref}
                  className="text-xl font-bold text-[#081a4b]"
                >
                  {SITE_CONTACTS.phoneDisplay}
                </a>

                <a
                  href={SITE_CONTACTS.emailHref}
                  className="text-base font-medium transition hover:text-[#081a4b]"
                >
                  {SITE_CONTACTS.email}
                </a>

              </div>

              <div className="mt-8 grid gap-4 md:grid-cols-3">
                {contactActions.map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-[color:var(--line)] bg-[rgba(255,253,249,0.9)] p-4 text-sm leading-7 text-slate-700 shadow-sm"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="xl:pt-16">
              <div className="hero-panel rounded-[32px] p-8">
                <div className="text-sm uppercase tracking-[0.16em] text-[#8b6a3a]">
                  Почему сюда приходят
                </div>

                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {advantages.map((item) => (
                    <div
                      key={item}
                      className="flex min-h-[120px] items-start rounded-2xl border border-[color:var(--line)] bg-[rgba(255,255,255,0.92)] p-5"
                    >
                      <div className="break-words text-[17px] font-semibold leading-7 text-[#081a4b] sm:text-[18px]">
                        {item}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="ink-card mt-6 rounded-2xl p-6 text-white">
                  <div className="text-xl font-semibold leading-8">
                    Мы сами работаем в закупочной практике
                  </div>

                  <p className="mt-3 text-base leading-8 text-white/90">
                    Поэтому сайт построен не как блог, а как рабочая база решений,
                    конфликтов и правовых выводов, с которыми поставщики и заказчики
                    реально сталкиваются в закупках.
                  </p>

                  <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="text-sm font-semibold uppercase tracking-[0.12em] text-white/60">
                      Что уже собрано
                    </div>
                    <p className="mt-2 text-sm leading-7 text-white/90">
                      Мы уже сами собрали и разложили {publishedCaseCount} решений и
                      жалоб ФАС по нарушениям, регионам, заказчикам и типовым
                      закупочным конфликтам.
                    </p>
                  </div>

                  <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="text-sm font-semibold uppercase tracking-[0.12em] text-white/60">
                      По всей России
                    </div>
                    <p className="mt-2 text-sm leading-7 text-white/90">
                      Подключаемся дистанционно, выезжаем в регион и можем
                      работать не только по спору, но и с командой клиента:
                      разбирать закупочные риски, документацию и практику ФАС.
                    </p>
                  </div>

                  <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="text-sm font-semibold uppercase tracking-[0.12em] text-white/60">
                      Быстрый старт
                    </div>
                    <p className="mt-2 text-sm leading-7 text-white/90">
                      Если нужно быстро понять перспективу, достаточно
                      направить договор, переписку, решение ФАС или комплект
                      документов по спору.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-wash border-b border-[color:var(--line)]">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="max-w-3xl">
            <div className="inline-flex rounded-full border border-[color:var(--line)] bg-[rgba(255,253,249,0.92)] px-4 py-2 text-sm font-medium text-slate-600">
              С чего начать
            </div>

            <h2 className="mt-5 text-4xl font-bold tracking-tight text-[#081a4b] md:text-5xl">
              Быстрые входы по вашей ситуации
            </h2>

            <p className="mt-5 text-lg leading-9 text-slate-700">
              На сайте уже есть два понятных маршрута: отдельно для поставщика в споре
              и отдельно для заказчика, которому нужно выстроить закупку, защититься в ФАС
              или пройти сложную процедуру без лишнего риска.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {audienceRoutes.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="hero-panel rounded-[32px] p-8 transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="text-sm font-semibold uppercase tracking-[0.14em] text-[#8b6a3a]">
                  Маршрут
                </div>
                <h3 className="mt-4 text-3xl font-bold text-[#081a4b]">{item.title}</h3>
                <p className="mt-4 text-base leading-8 text-slate-700">{item.text}</p>
                <span className="mt-6 block text-sm font-semibold text-[#081a4b]">
                  {item.cta} →
                </span>
              </Link>
            ))}
          </div>

          <div className="mt-12 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div>
              <div className="inline-flex rounded-full border border-[color:var(--line)] bg-[rgba(255,253,249,0.92)] px-4 py-2 text-sm font-medium text-slate-600">
                Отдельное направление
              </div>

              <h2 className="mt-5 text-4xl font-bold tracking-tight text-[#081a4b] md:text-5xl">
                Неоплата по госконтракту
              </h2>

              <p className="mt-5 max-w-3xl text-lg leading-9 text-slate-700">
                Если заказчик затягивает оплату, не подписывает документы или ищет
                формальные основания не платить, мы поможем оценить ситуацию и
                выстроить стратегию возврата денег.
              </p>

              <p className="mt-4 max-w-3xl text-lg leading-9 text-slate-700">
                Мы регулярно сталкиваемся с такими спорами и понимаем не только
                правовую сторону вопроса, но и реальную практику поведения заказчиков.
                В ряде ситуаций сильная правовая позиция и инструменты ФАС становятся
                эффективным способом давления на заказчика.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="/neoplata-po-goskontraktu"
                  className="rounded-2xl bg-[#081a4b] px-7 py-4 text-base font-semibold text-white transition hover:bg-[#0d2568]"
                >
                  Вернуть деньги по контракту
                </Link>

                <a
                  href={SITE_CONTACTS.emailHref}
                  className="rounded-2xl border border-slate-300 bg-white px-7 py-4 text-base font-semibold text-[#081a4b] transition hover:bg-slate-50"
                >
                  Прислать документы по неоплате
                </a>
              </div>
            </div>

            <div className="hero-panel rounded-3xl p-6">
              <h3 className="text-xl font-semibold text-[#081a4b]">
                Чем можем помочь
              </h3>

              <div className="mt-5 space-y-3 text-sm leading-7 text-slate-700">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  Анализ контракта и документов
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  Оценка законности отказа в оплате
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  Претензионная работа и правовая позиция
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  При необходимости — подключение инструментов ФАС
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  Онлайн-подключение по всей России, выезд и обучение команды
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-[color:var(--line)] bg-transparent">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="max-w-3xl">
            <div className="inline-flex rounded-full border border-[color:var(--line)] bg-[rgba(255,253,249,0.88)] px-4 py-2 text-sm font-medium text-slate-600">
              Ключевые разделы
            </div>

            <h2 className="mt-5 text-4xl font-bold text-[#081a4b]">
              Где искать практику и рабочие выводы
            </h2>

            <p className="mt-5 text-lg leading-9 text-slate-700">
              Мы разделяем базу решений ФАС, типовые нарушения и аналитические материалы,
              чтобы пользователю было проще быстро выйти на нужную практику и понять,
              как строить правовую позицию по спору.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <Link
              href="/cases"
              className="hero-panel rounded-3xl p-7 transition hover:-translate-y-1 hover:shadow-md"
            >
              <h3 className="text-2xl font-semibold text-[#081a4b]">Практика ФАС</h3>
              <p className="mt-4 text-slate-700">
                База решений ФАС, жалоб и карточек дел с кратким описанием сути спора и результата.
              </p>
              <span className="mt-5 block text-sm font-semibold text-[#081a4b]">
                Открыть →
              </span>
            </Link>

            <Link
              href="/narusheniya"
              className="hero-panel rounded-3xl p-7 transition hover:-translate-y-1 hover:shadow-md"
            >
              <h3 className="text-2xl font-semibold text-[#081a4b]">Нарушения</h3>
              <p className="mt-4 text-slate-700">
                Каталог типовых нарушений в закупках: ограничение конкуренции, товарный знак,
                национальный режим и другие спорные условия.
              </p>
              <span className="mt-5 block text-sm font-semibold text-[#081a4b]">
                Открыть →
              </span>
            </Link>

            <Link
              href="/analitika"
              className="hero-panel rounded-3xl p-7 transition hover:-translate-y-1 hover:shadow-md"
            >
              <h3 className="text-2xl font-semibold text-[#081a4b]">Аналитика</h3>
              <p className="mt-4 text-slate-700">
                Разборы практики, инструкции, комментарии к спорным ситуациям и объяснение правовых подходов.
              </p>
              <span className="mt-5 block text-sm font-semibold text-[#081a4b]">
                Открыть →
              </span>
            </Link>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="grid gap-8 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm lg:grid-cols-[1fr_0.9fr] lg:p-12">
            <div>
              <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600">
                Связаться с нами
              </div>
              <h2 className="mt-5 text-4xl font-bold tracking-tight text-[#081a4b]">
                Нужна правовая оценка ситуации по закупке?
              </h2>
              <p className="mt-5 text-lg leading-9 text-slate-700">
                Мы не собираем потоковые заявки с сайта. Если вопрос действительно
                требует разбора, лучше сразу связаться с нами напрямую и обсудить
                ситуацию по существу.
              </p>
            </div>

            <div className="rounded-3xl bg-slate-50 p-6 ring-1 ring-slate-200">
              <div className="text-2xl font-bold text-[#081a4b]">
                Что подготовить перед обращением
              </div>
              <div className="mt-5 grid gap-3">
                <div className="rounded-2xl bg-white px-5 py-4 text-base text-slate-700 ring-1 ring-slate-200">
                  номер закупки или ссылка на спор
                </div>
                <div className="rounded-2xl bg-white px-5 py-4 text-base text-slate-700 ring-1 ring-slate-200">
                  краткое описание проблемы и текущей стадии
                </div>
                <div className="rounded-2xl bg-white px-5 py-4 text-base text-slate-700 ring-1 ring-slate-200">
                  документы, переписку и спорные условия
                </div>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href={SITE_CONTACTS.phoneHref}
                  className="rounded-2xl bg-[#081a4b] px-6 py-3 text-white transition hover:bg-[#0d2568]"
                >
                  Позвонить
                </a>
                <a
                  href={SITE_CONTACTS.emailHref}
                  className="rounded-2xl border border-slate-300 px-6 py-3 transition hover:bg-white"
                >
                  Написать на почту
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="max-w-3xl">
            <div className="inline-flex rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600">
              Чем мы можем помочь
            </div>

            <h2 className="mt-5 text-4xl font-bold text-[#081a4b]">
              Юридическая помощь поставщикам и заказчикам
            </h2>

            <p className="mt-5 text-lg leading-9 text-slate-700">
              Работаем с закупочными конфликтами системно: от анализа документации до жалобы в ФАС,
              от неоплаты по контракту до судебного продолжения спора.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {services.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <h3 className="text-2xl font-semibold text-[#081a4b]">
                  {item.title}
                </h3>

                <p className="mt-4 text-slate-700">{item.text}</p>

                <span className="mt-5 text-sm font-semibold text-[#081a4b]">
                  Подробнее →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-3xl">
              <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600">
                Последние материалы
              </div>

              <h2 className="mt-5 text-4xl font-bold text-[#081a4b]">
                Новые аналитические материалы
              </h2>

              <p className="mt-5 text-lg leading-9 text-slate-700">
                Подборка свежих материалов по практике ФАС, закупочным конфликтам и правовым подходам.
              </p>
            </div>

            <Link
              href="/analitika"
              className="rounded-2xl border border-slate-300 bg-white px-6 py-4 text-base font-semibold text-[#081a4b] transition hover:bg-slate-50"
            >
              Все материалы
            </Link>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {latestMaterials.map((item) => (
              <Link
                key={item.id}
                href={`/analitika/${item.slug}`}
                className="rounded-3xl border border-slate-200 bg-slate-50 p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                  {materialTypeLabels[item.type]}
                </div>

                <h3 className="mt-5 text-2xl font-semibold text-[#081a4b]">
                  {item.title}
                </h3>

                {item.excerpt ? (
                  <p className="mt-4 text-slate-700">{item.excerpt}</p>
                ) : null}

                <span className="mt-5 block text-sm font-semibold text-[#081a4b]">
                  Читать →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
