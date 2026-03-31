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

  const steps = [
    {
      title: "1. Анализ ситуации",
      text: "Изучаем закупку, документацию, контракт, переписку и документы, чтобы понять реальную картину спора.",
    },
    {
      title: "2. Оценка перспективы",
      text: "Определяем, есть ли основания для жалобы в ФАС, претензии, переговоров или судебной защиты.",
    },
    {
      title: "3. Выбор стратегии",
      text: "Понимаем, что будет эффективнее: переговоры, жалоба в ФАС, претензия или судебное взыскание.",
    },
    {
      title: "4. Подготовка позиции",
      text: "Формируем аргументацию, документы и правовую позицию для защиты интересов клиента.",
    },
    {
      title: "5. Сопровождение до результата",
      text: "Представляем позицию в ФАС, суде и помогаем довести ситуацию до практического результата.",
    },
  ];

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="mx-auto max-w-4xl">
            <div>
              <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600">
                О нас
              </div>

              <h1 className="mt-6 max-w-3xl text-4xl font-bold leading-[1.02] tracking-tight text-[#081a4b] md:text-5xl xl:text-[64px]">
                GOSZAKON — проект, выросший из реальной практики в сфере закупок
              </h1>

              <div className="mt-7 max-w-3xl space-y-5">
                <p className="text-[17px] leading-8 text-slate-700">
                Мы — практикующие участники рынка государственного заказа, которые более
                10 лет работают в сфере закупок и знают систему не только по нормативной
                базе, но и по собственному опыту участия в процедурах и исполнении контрактов.
                </p>

                <p className="text-[17px] leading-8 text-slate-700">
                За это время нами исполнено более 6000 тендеров и контрактов. Работая
                в закупках, мы неоднократно сталкивались с ситуациями ограничения
                конкуренции, спорной документации и конфликтов между заказчиками
                и поставщиками.
                </p>

                <p className="text-[17px] leading-8 text-slate-700">
                Мы работаем по всей России: можем подключиться онлайн, приехать к
                клиенту в регион и при необходимости помочь не только со спором,
                но и с практическим обучением команды по закупочной работе.
                </p>
              </div>

              <div className="mt-9 flex flex-wrap gap-4">
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
              </div>
            </div>
          </div>

          <div className="mx-auto mt-12 grid max-w-4xl gap-4 lg:grid-cols-2">
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
                Формат работы
              </div>
              <p className="mt-3 text-sm leading-7 text-slate-700">
                Онлайн-подключение к спору, жалобе или срочной закупочной ситуации. Выезд к клиенту в регион, если задачу удобнее решать на месте.
              </p>
            </div>
            <div className="rounded-3xl bg-[#081a4b] p-6 text-white shadow-sm">
              <div className="text-sm font-semibold uppercase tracking-[0.12em] text-white/60">
                По всей России
              </div>
              <p className="mt-3 text-sm leading-7 text-white/85">
                Подключаемся онлайн, выезжаем в регион и при необходимости работаем с командой клиента на месте.
              </p>
            </div>
          </div>

          <div className="mt-12 grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <div className="rounded-[32px] border border-slate-200 bg-slate-50 p-7 shadow-sm">
              <div className="text-sm uppercase tracking-[0.14em] text-slate-400">
                Правовая помощь в закупках
              </div>

              <h2 className="mt-4 text-3xl font-bold tracking-tight text-[#081a4b]">
                Почему нам доверяют
              </h2>

              <p className="mt-4 text-base leading-8 text-slate-700">
                Мы понимаем закупочный спор не как внешний наблюдатель, а как
                участники рынка, которые сами проходили через закупочные конфликты
                и судебные споры.
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

          <div className="mt-6 rounded-[32px] bg-[#081a4b] p-7 text-white shadow-sm">
            <div className="text-sm uppercase tracking-[0.14em] text-white/60">
              По всей России
            </div>

            <h3 className="mt-4 text-2xl font-bold tracking-tight">
              Подключаемся быстро и работаем в удобном для клиента формате
            </h3>

            <div className="mt-6 grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-sm font-semibold">Онлайн</div>
                <p className="mt-2 text-sm leading-7 text-white/80">
                  Быстро подключаемся к жалобе, спору или закупочной ситуации из любого региона.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-sm font-semibold">Выезд</div>
                <p className="mt-2 text-sm leading-7 text-white/80">
                  При необходимости приезжаем к клиенту и работаем с командой на месте.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-sm font-semibold">Обучение</div>
                <p className="mt-2 text-sm leading-7 text-white/80">
                  Помогаем не только в споре, но и встраиваем рабочую закупочную практику в команду.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-[#081a4b] text-white">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {stats.map((item) => (
              <div key={item.label} className="rounded-3xl bg-white/5 p-7">
                <div className="text-4xl font-bold">{item.value}</div>
                <div className="mt-3 text-sm text-white/80">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <h2 className="text-4xl font-bold text-[#081a4b]">
            Наш подход к закупочным спорам
          </h2>

          <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {strengths.map((item) => (
              <div key={item.title} className="rounded-3xl border p-7">
                <h3 className="text-xl font-semibold text-[#081a4b]">
                  {item.title}
                </h3>
                <p className="mt-3 text-base text-slate-700">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <h2 className="text-4xl font-bold text-[#081a4b]">Как мы работаем</h2>

          <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-5">
            {steps.map((item) => (
              <div key={item.title} className="rounded-3xl bg-white p-7 shadow-sm">
                <h3 className="text-xl font-semibold text-[#081a4b]">
                  {item.title}
                </h3>
                <p className="mt-3 text-base text-slate-700">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-20 lg:grid-cols-2">
          <div>
            <h2 className="text-4xl font-bold text-[#081a4b]">
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

              <Link
                href="/cases"
                className="rounded-2xl border border-white/20 px-6 py-4 text-center font-semibold text-white transition hover:bg-white/10"
              >
                Смотреть практику ФАС
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="grid gap-4 lg:grid-cols-4">
            <Link href="/neoplata-po-goskontraktu" className="rounded-3xl border border-slate-200 bg-white p-6 transition hover:shadow-sm">
              <div className="font-semibold text-[#081a4b]">Неоплата по контракту</div>
              <p className="mt-2 text-sm leading-7 text-slate-600">Когда заказчик не платит, затягивает приемку или привязывает оплату к своим документам.</p>
            </Link>
            <Link href="/rnp" className="rounded-3xl border border-slate-200 bg-white p-6 transition hover:shadow-sm">
              <div className="font-semibold text-[#081a4b]">РНП</div>
              <p className="mt-2 text-sm leading-7 text-slate-600">Как защищать компанию от включения в реестр и на чем строится сильная позиция поставщика.</p>
            </Link>
            <Link href="/sudebnaya-zashita-v-zakupkah" className="rounded-3xl border border-slate-200 bg-white p-6 transition hover:shadow-sm">
              <div className="font-semibold text-[#081a4b]">Судебная защита</div>
              <p className="mt-2 text-sm leading-7 text-slate-600">Когда решение ФАС нужно оспаривать дальше и как ломать слабую позицию заказчика через суд.</p>
            </Link>
            <Link href="/uslugi" className="rounded-3xl border border-slate-200 bg-white p-6 transition hover:shadow-sm">
              <div className="font-semibold text-[#081a4b]">Услуги</div>
              <p className="mt-2 text-sm leading-7 text-slate-600">Все основные направления помощи поставщикам: жалобы, неоплата, РНП и проверка закупки.</p>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
