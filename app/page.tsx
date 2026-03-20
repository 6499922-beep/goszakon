import Link from "next/link";
import { getPrisma } from "@/lib/prisma";
import { materialTypeLabels } from "@/lib/materials";
import { SITE_CONTACTS } from "@/lib/site-config";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const prisma = getPrisma();

  const latestMaterials = await prisma.material.findMany({
    where: { isPublished: true },
    orderBy: [
      { isFeatured: "desc" },
      { decisionDate: "desc" },
      { publishedAt: "desc" },
      { updatedAt: "desc" },
    ],
    take: 3,
  });

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

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="grid items-start gap-12 xl:grid-cols-[minmax(0,1fr)_460px]">
            <div>
              <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600">
                GOSZAKON • Правовая помощь в закупках
              </div>

              <h1 className="mt-6 text-5xl font-bold tracking-tight text-[#081a4b] md:text-6xl xl:text-[72px] xl:leading-[0.98]">
                Практика ФАС и защита интересов в закупках
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-9 text-slate-700">
                Помогаем поставщикам и заказчикам в закупочных спорах: жалобы в ФАС,
                РНП, неоплата по контрактам, спорные условия документации,
                судебная защита и правовая оценка перспектив спора.
              </p>

              <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-6">
                <div className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Важно
                </div>

                <p className="mt-3 text-base leading-8 text-slate-700">
                  База практики на сайте основана на реальной закупочной практике нашей команды,
                  делах, в которых участвовали мы, и кейсах наших клиентов. Мы не просто
                  пересказываем решения ФАС — мы работаем с этими спорами на практике.
                </p>
              </div>

              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="/cases"
                  className="rounded-2xl bg-[#081a4b] px-7 py-4 text-base font-semibold text-white transition hover:bg-[#0d2568]"
                >
                  Практика ФАС
                </Link>

                <Link
                  href="/analitika"
                  className="rounded-2xl border border-slate-300 bg-white px-7 py-4 text-base font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Аналитика
                </Link>
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

                <a
                  href={SITE_CONTACTS.telegramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-base font-medium transition hover:text-[#081a4b]"
                >
                  Telegram
                </a>
              </div>
            </div>

            <div className="xl:pt-16">
              <div className="rounded-[32px] border border-slate-200 bg-slate-50 p-8 shadow-sm">
                <div className="text-sm uppercase tracking-[0.14em] text-slate-400">
                  Почему нам доверяют
                </div>

                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {advantages.map((item) => (
                    <div
                      key={item}
                      className="flex min-h-[120px] items-start rounded-2xl border border-slate-200 bg-white p-5"
                    >
                      <div className="break-words text-[17px] font-semibold leading-7 text-[#081a4b] sm:text-[18px]">
                        {item}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 rounded-2xl bg-[#081a4b] p-6 text-white">
                  <div className="text-xl font-semibold leading-8">
                    Мы сами работаем в закупочной практике
                  </div>

                  <p className="mt-3 text-base leading-8 text-white/90">
                    Поэтому сайт построен не как абстрактный блог, а как рабочая база
                    решений, выводов и спорных ситуаций, с которыми сталкиваются
                    поставщики и заказчики в реальной работе.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div>
              <div className="inline-flex rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600">
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
                  href={SITE_CONTACTS.phoneHref}
                  className="rounded-2xl border border-slate-300 bg-white px-7 py-4 text-base font-semibold text-[#081a4b] transition hover:bg-slate-50"
                >
                  Позвонить
                </a>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
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
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="max-w-3xl">
            <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600">
              Ключевые разделы
            </div>

            <h2 className="mt-5 text-4xl font-bold text-[#081a4b]">
              Как устроен сайт
            </h2>

            <p className="mt-5 text-lg leading-9 text-slate-700">
              Мы разделяем базу решений ФАС, типовые нарушения и аналитические материалы,
              чтобы пользователю было проще найти нужную практику и понять правовую логику спора.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <Link
              href="/cases"
              className="rounded-3xl border border-slate-200 bg-slate-50 p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
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
              className="rounded-3xl border border-slate-200 bg-slate-50 p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
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
              className="rounded-3xl border border-slate-200 bg-slate-50 p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
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