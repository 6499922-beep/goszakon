import type { Metadata } from "next";
import Link from "next/link";
import { SITE_CONTACTS } from "@/lib/site-config";

export const metadata: Metadata = {
  title:
    "Сопровождение закупки с риском жалобы до публикации | GOSZAKON",
  description:
    "Помогаем заказчикам выстроить закупку, которая уже на старте выглядит конфликтной: снимаем точки жалобы в документации, нацрежиме, критериях оценки и проекте договора.",
};

const situations = [
  "Заказчик понимает, что будущая закупка почти наверняка вызовет жалобу еще до публикации процедуры.",
  "Предмет закупки сложный, чувствительный или уже раньше давал конфликт по документации, срокам или нацрежиму.",
  "Есть риск, что участники будут атаковать критерии оценки, требования к участникам, проект договора или описание объекта закупки.",
  "Нужно подготовить закупку так, чтобы она выдерживала конфликтный сценарий заранее, а не только после подачи жалобы.",
];

const support = [
  "Проверяем документацию как в обычном аудите, но с фокусом на тех местах, которые почти наверняка станут предметом жалобы.",
  "Убираем формулировки, которые создают лишние риски по нацрежиму, ограничению конкуренции, товарному знаку, срокам и проекту договора.",
  "Собираем закупку так, чтобы у заказчика заранее была понятная и защищаемая позиция на случай административного спора.",
  "Смотрим не только на публикацию, но и на то, как закупка будет выглядеть в ФАС, если жалоба все же поступит.",
];

const principles = [
  {
    title: "Конфликтную закупку нужно собирать заранее",
    text: "Если закупка чувствительная, ее нельзя выпускать в надежде потом быстро отбиться в ФАС. Сильная защита начинается еще на стадии документации.",
  },
  {
    title: "Риски жалобы нужно называть прямо",
    text: "Мы заранее выделяем, какие формулировки и блоки документации с высокой вероятностью будут атакованы участниками и контролем.",
  },
  {
    title: "Профилактика дешевле, чем спасение процедуры",
    text: "Сильнее и дешевле убрать спорные места до публикации, чем потом переписывать документацию, получать штраф и заново собирать закупку под давлением сроков.",
  },
  {
    title: "Закупка должна держать не только закон, но и спор",
    text: "Мы смотрим на процедуру сразу в логике конфликта: как ее будут читать участники, ФАС и контроль, если спор начнется уже на первой неделе.",
  },
];

const outcomes = [
  "Закупка сильнее подготовлена к жалобе еще до публикации.",
  "У заказчика заранее есть более понятная и защитимая позиция по спорным блокам документации.",
  "Снижается риск, что процедура развалится из-за предсказуемых жалоб и слабых формулировок.",
  "Меньше шансов, что закупка закончится переделкой, штрафом или потерей сроков.",
];

export default function CustomerComplaintRiskSupportPage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:py-24">
          <div className="max-w-5xl">
            <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600">
              Для заказчиков
            </div>

            <h1 className="mt-6 text-5xl font-bold tracking-tight text-[#081a4b] md:text-7xl">
              Сопровождение закупки с риском жалобы до публикации
            </h1>

            <p className="mt-6 max-w-4xl text-xl leading-9 text-slate-700">
              Если заказчик заранее понимает, что закупка будет конфликтной,
              такую процедуру нужно сопровождать не как обычную публикацию, а
              как спорную конструкцию с высоким риском жалобы. Мы помогаем
              собрать ее так, чтобы спорные места были ослаблены еще до выхода
              закупки в рынок.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href={SITE_CONTACTS.phoneHref}
                className="rounded-2xl bg-[#081a4b] px-7 py-4 text-center font-semibold text-white"
              >
                Разобрать риск жалобы
              </a>
              <Link
                href="/zakazchikam/audit-zakupki"
                className="rounded-2xl border border-slate-300 px-7 py-4 text-center font-semibold text-[#081a4b]"
              >
                Аудит закупки
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto grid max-w-7xl gap-6 px-6 py-16 md:grid-cols-2">
          {situations.map((item) => (
            <div
              key={item}
              className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm"
            >
              <p className="text-base leading-8 text-slate-700">{item}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="max-w-3xl">
            <h2 className="text-4xl font-bold tracking-tight text-[#081a4b]">
              Что мы делаем по такой закупке
            </h2>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {support.map((item) => (
              <div
                key={item}
                className="rounded-3xl border border-slate-200 bg-slate-50 p-7 shadow-sm"
              >
                <p className="text-base leading-8 text-slate-700">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="max-w-3xl">
            <h2 className="text-4xl font-bold tracking-tight text-[#081a4b]">
              Как мы смотрим на закупку с высоким риском жалобы
            </h2>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {principles.map((item) => (
              <div
                key={item.title}
                className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm"
              >
                <h3 className="text-xl font-semibold text-[#081a4b]">
                  {item.title}
                </h3>
                <p className="mt-4 text-base leading-8 text-slate-700">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-16 lg:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 shadow-sm">
            <h2 className="text-3xl font-bold tracking-tight text-[#081a4b]">
              Что это дает заказчику
            </h2>
            <div className="mt-6 space-y-4">
              {outcomes.map((item) => (
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
            <h2 className="text-3xl font-bold tracking-tight">
              Что смотреть рядом
            </h2>

            <div className="mt-6 space-y-4">
              <Link
                href="/zakazchikam/audit-zakupki"
                className="block rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:bg-white/10"
              >
                <div className="text-xl font-semibold">
                  Аудит закупки и документации
                </div>
                <p className="mt-2 text-base leading-8 text-white/90">
                  Если нужно сначала снять типовые уязвимости процедуры до
                  публикации.
                </p>
              </Link>

              <Link
                href="/zakazchikam/soprovozhdenie-zakupki"
                className="block rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:bg-white/10"
              >
                <div className="text-xl font-semibold">
                  Сопровождение закупки под задачу заказчика
                </div>
                <p className="mt-2 text-base leading-8 text-white/90">
                  Если нужно собрать не только защиту от жалобы, но и всю
                  закупочную конструкцию под конкретную задачу.
                </p>
              </Link>

              <Link
                href="/zakazchikam/zashita-v-fas"
                className="block rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:bg-white/10"
              >
                <div className="text-xl font-semibold">
                  Защита интересов заказчика в ФАС
                </div>
                <p className="mt-2 text-base leading-8 text-white/90">
                  Если жалоба уже подана и закупка требует быстрой
                  административной защиты.
                </p>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
