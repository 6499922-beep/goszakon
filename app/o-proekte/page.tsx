import Link from "next/link";
import { SITE_CONTACTS } from "@/lib/site-config";

export default function AboutUsPage() {
  const stats = [
    { value: "10+ лет", label: "на рынке государственного заказа" },
    { value: "6000+", label: "исполненных тендеров и контрактов" },
    { value: "1000+", label: "судебных заседаний в личной практике" },
    { value: "400+", label: "заседаний ФАС в личной практике" },
  ];

  const strengths = [
    {
      title: "Мы знаем закупки изнутри",
      text: "Наша команда выросла из реальной практики поставщика. Мы понимаем систему закупок не только как юристы, но и как участники рынка.",
    },
    {
      title: "Понимаем логику поставщика",
      text: "Мы знаем, как выглядит закупочный конфликт на практике: риски, сроки, давление и экономика контракта.",
    },
    {
      title: "Работаем с реальными спорами",
      text: "Практика ФАС и судов для нас — не теория, а путь, который мы сами проходили в реальных закупочных конфликтах.",
    },
    {
      title: "Ориентируемся на результат",
      text: "Наша задача — не просто выявить нарушение, а помочь выбрать стратегию, которая даст реальный результат.",
    },
  ];

  const directions = [
    "жалобы в ФАС по закупкам;",
    "споры по документации и ограничению конкуренции;",
    "вопросы РНП и защита поставщика;",
    "судебное оспаривание решений ФАС;",
    "споры по исполнению и оплате контрактов;",
    "правовая помощь поставщикам и заказчикам.",
  ];

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-14 lg:py-16">
          <div className="grid gap-8 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
            <div>
              <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600">
                О нас
              </div>

              <h1 className="mt-5 max-w-4xl text-4xl font-bold leading-[1.02] tracking-tight text-[#081a4b] md:text-5xl xl:text-[58px]">
                GOSZAKON — проект, выросший из реальной практики в сфере закупок
              </h1>

              <div className="mt-6 max-w-3xl space-y-4">
                <p className="text-[17px] leading-8 text-slate-700">
                  Мы работаем в закупках более 10 лет и знаем систему не только по нормам,
                  но и по собственному опыту участия в процедурах, исполнения контрактов,
                  жалоб в ФАС и судебных споров.
                </p>

                <p className="text-[17px] leading-8 text-slate-700">
                  Работаем по всей России: подключаемся онлайн, выезжаем в регион и при
                  необходимости помогаем не только со спором, но и с практическим обучением команды.
                </p>
              </div>

              <div className="mt-7 flex flex-wrap gap-4">
                <a
                  href={SITE_CONTACTS.phoneHref}
                  className="rounded-2xl bg-[#081a4b] px-6 py-3.5 text-base font-semibold text-white transition hover:bg-[#0d2568]"
                >
                  {SITE_CONTACTS.phoneDisplay}
                </a>

                <a
                  href={SITE_CONTACTS.emailHref}
                  className="rounded-2xl border border-slate-300 px-6 py-3.5 text-base font-semibold transition hover:bg-slate-50"
                >
                  {SITE_CONTACTS.email}
                </a>

                <Link
                  href="/cases"
                  className="rounded-2xl border border-slate-300 px-6 py-3.5 text-base font-semibold text-[#081a4b] transition hover:bg-slate-50"
                >
                  Смотреть практику ФАС
                </Link>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-[32px] border border-slate-200 bg-slate-50 p-5 shadow-sm">
                <div className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-400">
                  Коротко о проекте
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {stats.map((item) => (
                    <div key={item.label} className="rounded-2xl bg-white p-4 shadow-sm">
                      <div className="text-2xl font-bold text-[#081a4b]">{item.value}</div>
                      <div className="mt-1 text-sm leading-6 text-slate-600">{item.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[32px] bg-[#081a4b] p-5 text-white shadow-sm">
                <div className="text-sm font-semibold uppercase tracking-[0.12em] text-white/60">
                  Формат работы
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="font-semibold">Онлайн</div>
                    <p className="mt-2 text-sm leading-6 text-white/80">
                      Быстро подключаемся к жалобе, спору или проверке закупки.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="font-semibold">Выезд в регион</div>
                    <p className="mt-2 text-sm leading-6 text-white/80">
                      Приезжаем к клиенту, если задачу удобнее решать на месте.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="font-semibold">Обучение команды</div>
                    <p className="mt-2 text-sm leading-6 text-white/80">
                      Помогаем встроить закупочную практику в ежедневную работу.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            <Link
              href="/cases"
              className="rounded-3xl border border-slate-200 bg-slate-50 p-6 transition hover:bg-white hover:shadow-sm"
            >
              <div className="font-semibold text-[#081a4b]">Практика ФАС</div>
              <p className="mt-2 text-sm leading-7 text-slate-600">
                База решений по жалобам, РНП, неоплате, неустойке и другим закупочным спорам.
              </p>
            </Link>
            <Link
              href="/spornye-praktiki"
              className="rounded-3xl border border-slate-200 bg-slate-50 p-6 transition hover:bg-white hover:shadow-sm"
            >
              <div className="font-semibold text-[#081a4b]">Спорные практики</div>
              <p className="mt-2 text-sm leading-7 text-slate-600">
                Разбираем перекосы, которые заказчики пытаются сделать обычной практикой.
              </p>
            </Link>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <div className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-400">
                Формат помощи
              </div>
              <p className="mt-3 text-sm leading-7 text-slate-700">
                Жалобы в ФАС, споры по исполнению и оплате, РНП, спорная документация, судебная защита и практическое сопровождение закупочной работы.
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-4 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
            <div className="rounded-[32px] border border-slate-200 bg-slate-50 p-7 shadow-sm">
              <div className="text-sm uppercase tracking-[0.14em] text-slate-400">
                Почему нам доверяют
              </div>

              <p className="mt-4 text-base leading-8 text-slate-700">
                Мы понимаем закупочный спор не как внешний наблюдатель, а как участники
                рынка, которые сами проходили через ограничения конкуренции, спорную
                документацию, неоплату, ФАС и суд.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {strengths.slice(0, 3).map((item) => (
                <div
                  key={item.title}
                  className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="text-base font-semibold text-[#081a4b]">
                    {item.title}
                  </div>
                  <p className="mt-2 text-sm leading-7 text-slate-600">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-50">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <h2 className="text-3xl font-bold text-[#081a4b] md:text-4xl">
              Основные направления работы
            </h2>

            <ul className="mt-6 space-y-3 text-lg text-slate-700">
              {directions.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </div>

          <div className="rounded-3xl bg-[#081a4b] p-8 text-white">
            <h3 className="text-3xl font-bold">{SITE_CONTACTS.phoneDisplay}</h3>

            <p className="mt-4 text-lg text-white/90">
              Правовая помощь в закупках. Напишите нам на электронную почту или
              просто позвоните.
            </p>

            <div className="mt-4 text-base text-white/80">
              {SITE_CONTACTS.email}
            </div>

            <div className="mt-6 flex flex-col gap-4">
              <a
                href={SITE_CONTACTS.phoneHref}
                className="rounded-2xl bg-white px-6 py-4 text-center font-semibold text-[#081a4b]"
              >
                Позвонить
              </a>

              <a
                href={SITE_CONTACTS.emailHref}
                className="rounded-2xl border border-white/20 px-6 py-4 text-center font-semibold text-white transition hover:bg-white/10"
              >
                Написать на почту
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
