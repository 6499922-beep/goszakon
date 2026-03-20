import Link from "next/link";

const CONTACT_PHONE_DISPLAY = "+7 936 135-03-03";
const CONTACT_PHONE_HREF = "tel:+79361350303";
const CONTACT_EMAIL = "info@goszakon.ru";
const CONTACT_EMAIL_HREF = "mailto:info@goszakon.ru";

export default function AmbiguousPenaltyPage() {
  const risks = [
    "непонятный порядок расчёта неустойки;",
    "двойственное толкование условий контракта;",
    "завышенные санкции без прозрачной логики;",
    "условия, которые можно трактовать против поставщика;",
    "конфликт между текстом контракта и фактическим порядком исполнения.",
  ];

  const practicePoints = [
    {
      title: "Анализ условий контракта",
      text: "Проверяем, насколько формулировки о неустойке соответствуют закону, судебной практике и принципу правовой определённости.",
    },
    {
      title: "Оценка риска для поставщика",
      text: "Смотрим, может ли заказчик использовать расплывчатую формулировку для взыскания чрезмерной санкции.",
    },
    {
      title: "Подготовка правовой позиции",
      text: "Формируем аргументы по толкованию условий контракта и допустимости применения неустойки.",
    },
    {
      title: "Сопровождение спора",
      text: "Помогаем в претензионной работе, переговорах и при необходимости в судебном споре.",
    },
  ];

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600">
                Спорные практики
              </div>

              <h1 className="mt-6 text-5xl font-bold tracking-tight text-[#081a4b] md:text-6xl">
                Неоднозначная неустойка в контракте
              </h1>

              <p className="mt-6 text-lg leading-9 text-slate-700">
                Если условие о неустойке сформулировано расплывчато или допускает
                разные варианты толкования, это создаёт высокий риск спора между
                заказчиком и поставщиком.
              </p>

              <p className="mt-4 text-lg leading-9 text-slate-700">
                В закупочной практике такие положения могут использоваться как
                инструмент давления, особенно когда размер санкции зависит от
                неясного порядка расчёта или внутренней трактовки заказчика.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <a
                  href={CONTACT_PHONE_HREF}
                  className="rounded-2xl bg-[#081a4b] px-6 py-4 font-semibold text-white transition hover:bg-[#0d2568]"
                >
                  {CONTACT_PHONE_DISPLAY}
                </a>

                <a
                  href={CONTACT_EMAIL_HREF}
                  className="rounded-2xl border border-slate-300 px-6 py-4 font-semibold transition hover:bg-slate-50"
                >
                  {CONTACT_EMAIL}
                </a>

              </div>
            </div>

            <div className="rounded-[32px] border border-slate-200 bg-slate-50 p-8 shadow-sm">
              <div className="text-sm uppercase tracking-[0.14em] text-slate-400">
                Основные риски
              </div>

              <h2 className="mt-4 text-3xl font-bold text-[#081a4b]">
                Что настораживает в таких условиях
              </h2>

              <ul className="mt-6 space-y-3 text-base leading-8 text-slate-700">
                {risks.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="max-w-3xl">
            <h2 className="text-4xl font-bold text-[#081a4b]">
              Как мы работаем с такими спорами
            </h2>

            <p className="mt-5 text-lg leading-9 text-slate-700">
              Важно оценить не только сам текст условия, но и весь контекст:
              документацию, контракт, переписку, этап исполнения и возможные
              последствия для поставщика.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {practicePoints.map((item) => (
              <div
                key={item.title}
                className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm"
              >
                <h3 className="text-xl font-semibold text-[#081a4b]">
                  {item.title}
                </h3>
                <p className="mt-4 text-slate-700">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#081a4b] text-white">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <h2 className="text-4xl font-bold">
                Нужна оценка условий контракта?
              </h2>

              <p className="mt-5 max-w-3xl text-lg leading-9 text-white/90">
                Если неустойка сформулирована неясно или заказчик уже ссылается
                на спорное толкование, лучше заранее подготовить сильную правовую позицию.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3 text-base text-white/85">
                <a href={CONTACT_PHONE_HREF} className="font-semibold text-white">
                  {CONTACT_PHONE_DISPLAY}
                </a>
                <a href={CONTACT_EMAIL_HREF} className="transition hover:text-white">
                  {CONTACT_EMAIL}
                </a>
              </div>

              <div className="mt-5 text-sm text-white/70">
                Смотрите также{" "}
                <Link href="/cases" className="underline underline-offset-4">
                  практику ФАС
                </Link>{" "}
                и раздел{" "}
                <Link href="/analitika" className="underline underline-offset-4">
                  аналитики
                </Link>.
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <a
                href={CONTACT_PHONE_HREF}
                className="rounded-2xl bg-white px-6 py-4 text-center font-semibold text-[#081a4b]"
              >
                Позвонить
              </a>

              <a
                href={CONTACT_EMAIL_HREF}
                className="rounded-2xl border border-white/20 px-6 py-4 text-center transition hover:bg-white/5"
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
