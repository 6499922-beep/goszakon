import Link from "next/link";
import { SITE_CONTACTS } from "@/lib/site-config";

export default function CourtProtectionPage() {
  const situations = [
    "Решение ФАС нарушает интересы компании, и его необходимо оспорить в арбитражном суде.",
    "Жалоба в ФАС не закончила спор, и защита интересов должна продолжаться уже в судебной плоскости.",
    "Необходимо отменить решение или предписание ФАС, которое влияет на закупку, договор или положение клиента.",
    "Спор в сфере закупок требует полноценной процессуальной стратегии, а не только административной защиты.",
  ];

  const directions = [
    {
      title: "Оспаривание решений ФАС",
      text: "Подготавливаем правовую позицию и сопровождаем дела по отмене решений и предписаний антимонопольного органа в арбитражном суде.",
    },
    {
      title: "Судебная защита после жалобы",
      text: "Если спор не закончился на стадии ФАС, продолжаем защиту интересов клиента в суде с учётом материалов административного дела.",
    },
    {
      title: "Анализ перспективы спора",
      text: "Оцениваем, есть ли реальные основания для обращения в суд, насколько сильна позиция и какой результат можно считать достижимым.",
    },
    {
      title: "Полное сопровождение дела",
      text: "Готовим заявления, отзывы, ходатайства, правовую позицию и сопровождаем клиента на всех стадиях судебного процесса.",
    },
  ];

  const advantages = [
    "Опыт сопровождения закупочных споров не только в ФАС, но и в арбитражных судах.",
    "Понимание связи между административной стадией и последующей судебной защитой.",
    "Оценка не формальной, а практической перспективы судебного обжалования.",
    "Фокус на защите интересов клиента и на экономическом смысле судебного спора.",
  ];

  const stages = [
    {
      title: "Изучаем материалы дела",
      text: "Анализируем решение ФАС, предписание, доводы сторон, документы закупки и фактические обстоятельства спора.",
    },
    {
      title: "Оцениваем судебную перспективу",
      text: "Смотрим, насколько обоснованны выводы ФАС, есть ли ошибки в правоприменении и доказательства для суда.",
    },
    {
      title: "Формируем правовую позицию",
      text: "Определяем стратегию: какие требования заявлять, на какие нарушения ссылаться и как выстраивать аргументацию.",
    },
    {
      title: "Сопровождаем спор в суде",
      text: "Ведём дело в арбитражном суде, готовим процессуальные документы и представляем интересы клиента.",
    },
  ];

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
          <div>
            <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600">
              Отдельное направление GOSZAKON
            </div>

            <h1 className="mt-6 max-w-5xl text-5xl font-bold leading-[1.02] tracking-tight text-[#081a4b] md:text-7xl">
              Судебная защита в закупочных спорах
            </h1>

            <p className="mt-6 max-w-3xl text-xl leading-9 text-slate-700">
              Мы сопровождаем клиентов не только на стадии жалобы в ФАС, но и в
              арбитражном суде, когда требуется оспорить решение антимонопольного
              органа или продолжить защиту интересов по закупочному спору.
            </p>

            <p className="mt-4 max-w-3xl text-lg leading-9 text-slate-700">
              Основная практика связана с закупочными спорами и вопросами, вытекающими
              из решений ФАС, включая дела, связанные с закупками по 223-ФЗ.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href={SITE_CONTACTS.phoneHref}
                className="rounded-2xl bg-[#081a4b] px-7 py-4 text-center text-base font-semibold text-white transition hover:bg-[#0d2568]"
              >
                Позвонить: {SITE_CONTACTS.phoneDisplay}
              </a>

              <a
                href={SITE_CONTACTS.emailHref}
                className="rounded-2xl border border-slate-300 bg-white px-7 py-4 text-center text-base font-semibold text-[#081a4b] transition hover:bg-slate-50"
              >
                Написать: {SITE_CONTACTS.email}
              </a>
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
                Практический смысл
              </div>
              <p className="mt-4 text-lg leading-9 text-white/90">
                Судебная защита нужна там, где административной стадии уже недостаточно.
                Важна не просто подача документов, а сильная процессуальная позиция
                с учётом реальной практики закупочных споров.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="max-w-3xl">
            <div className="inline-flex rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600">
              Основные направления
            </div>

            <h2 className="mt-5 text-4xl font-bold tracking-tight text-[#081a4b] md:text-5xl">
              Что входит в судебную защиту
            </h2>

            <p className="mt-5 text-lg leading-9 text-slate-700">
              Работа строится вокруг конкретного спора, решения ФАС, закупки и
              процессуальной перспективы. Мы сопровождаем как поставщиков, так и заказчиков.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {directions.map((item) => (
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
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-20 lg:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 shadow-sm">
            <div className="inline-flex rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600">
              Почему это важно
            </div>

            <div className="mt-6 space-y-4">
              {advantages.map((item) => (
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
              Как строится работа
            </div>

            <div className="mt-6 space-y-5">
              {stages.map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-white/10 bg-white/5 p-5"
                >
                  <h3 className="text-xl font-semibold">{item.title}</h3>
                  <p className="mt-3 text-base leading-8 text-white/90">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
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
              Если спор требует продолжения в суде — направьте материалы на первичную оценку
            </h2>

            <p className="mt-5 max-w-2xl text-lg leading-9 text-slate-200">
              Мы посмотрим решение ФАС, документы закупки, перспективу спора и предложим
              правовой формат дальнейшей судебной защиты.
            </p>
          </div>

          <div className="flex flex-col justify-center gap-4 rounded-3xl bg-white p-8 text-slate-900 shadow-2xl">
            <a
              href={SITE_CONTACTS.phoneHref}
              className="inline-flex items-center justify-center rounded-2xl bg-[#081a4b] px-6 py-4 text-base font-semibold text-white transition hover:bg-[#0d2568]"
            >
              Позвонить: {SITE_CONTACTS.phoneDisplay}
            </a>

            <a
              href={SITE_CONTACTS.emailHref}
              className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-6 py-4 text-base font-semibold text-[#081a4b] transition hover:bg-slate-50"
            >
              {SITE_CONTACTS.email}
            </a>

            <Link
              href="/cases"
              className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-6 py-4 text-base font-semibold text-[#081a4b] transition hover:bg-slate-50"
            >
              Смотреть практику ФАС
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
