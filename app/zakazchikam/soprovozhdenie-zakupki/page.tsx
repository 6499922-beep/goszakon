import type { Metadata } from "next";
import Link from "next/link";
import { SITE_CONTACTS } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Сопровождение закупки под задачу заказчика | GOSZAKON",
  description:
    "Помогаем заказчикам выстроить закупку под реальную потребность: документация, национальный режим, условия договора, НМЦК, защита от жалоб и управляемость процедуры.",
};

const situations = [
  "Заказчику нужно закупить конкретный товар, работу или услугу, но стандартная документация не решает реальную задачу.",
  "Закупка уже не в первый раз получает жалобы, отмены или претензии из-за слабой юридической конструкции.",
  "Нужно выстроить процедуру так, чтобы она была управляемой и не разваливалась из-за формальных ошибок в документации.",
  "Есть сложный предмет закупки, национальный режим, чувствительные сроки, критерии оценки или особые требования к исполнителю.",
];

const support = [
  "Разбираем реальную задачу заказчика и переводим ее в устойчивую закупочную конструкцию.",
  "Помогаем собрать документацию, условия договора, критерии оценки и логику закупки так, чтобы они работали вместе, а не спорили друг с другом.",
  "Снимаем формулировки, которые чаще всего дают жалобы, предписания и штрафы.",
  "Особенно глубоко смотрим на национальный режим, НМЦК, описание объекта закупки и требования к участникам.",
];

const principles = [
  {
    title: "Сначала понимаем задачу закупки",
    text: "Не подгоняем заказчика под шаблон, а разбираем, что именно он хочет получить, где у процедуры реальная чувствительность и что нельзя потерять по результату.",
  },
  {
    title: "Потом выстраиваем юридическую конструкцию",
    text: "Собираем документацию так, чтобы она не ломала саму цель закупки и при этом выдерживала контроль, жалобу и проверку по существу.",
  },
  {
    title: "Снимаем спорные места до публикации",
    text: "Находим слабые формулировки в описании объекта закупки, сроках, критериях оценки, режиме допуска и проекте договора, пока они не стали жалобой.",
  },
  {
    title: "Думаем не только о публикации, но и о защите",
    text: "Смотрим на закупку сразу с учетом того, как ее потом придется объяснять в ФАС, суде и перед контролем.",
  },
];

const outcomes = [
  "Более управляемая закупка, которая лучше держит жалобу и проверку.",
  "Документация, собранная под предмет закупки, а не просто по шаблону.",
  "Снижение риска, что процедуру придется переделывать уже после публикации.",
  "Более сильная позиция заказчика, если спор все же начнется.",
];

export default function CustomerProcurementSupportPage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:py-24">
          <div className="max-w-5xl">
            <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600">
              Для заказчиков
            </div>

            <h1 className="mt-6 text-5xl font-bold tracking-tight text-[#081a4b] md:text-7xl">
              Сопровождение закупки под задачу заказчика
            </h1>

            <p className="mt-6 max-w-4xl text-xl leading-9 text-slate-700">
              Мы помогаем заказчику не просто выпустить закупку, а выстроить ее
              под реальную потребность так, чтобы процедура была рабочей,
              управляемой и юридически устойчивой. Слабая документация почти
              всегда распадается уже на стадии жалобы или проверки. Наша задача
              сделать так, чтобы закупка держалась не на удаче, а на сильной
              конструкции.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href={SITE_CONTACTS.phoneHref}
                className="rounded-2xl bg-[#081a4b] px-7 py-4 text-center font-semibold text-white"
              >
                Разобрать закупочную задачу
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
              Чем мы помогаем заказчику
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
              Как мы смотрим на такую закупку
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
                  Если нужно сначала снять уязвимости до публикации.
                </p>
              </Link>

              <Link
                href="/zakazchikam/nacionalnyj-rezhim"
                className="block rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:bg-white/10"
              >
                <div className="text-xl font-semibold">Национальный режим</div>
                <p className="mt-2 text-base leading-8 text-white/90">
                  Если предмет закупки и режим допуска требуют отдельной точной
                  настройки.
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
                  Если спор по закупке уже перешел в административную защиту.
                </p>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-16 md:grid-cols-2">
          <div>
            <h2 className="text-4xl font-bold tracking-tight text-[#081a4b]">
              Если закупка сложная, ее лучше собирать под задачу заранее, а не спасать после жалобы
            </h2>
            <p className="mt-5 max-w-2xl text-lg leading-9 text-slate-700">
              Направьте нам предмет закупки, проект документации, условия
              договора, расчет НМЦК и проблемные точки. Мы посмотрим, как лучше
              собрать закупку, чтобы она не развалилась на контроле.
            </p>
          </div>

          <div className="flex flex-col justify-center gap-4 rounded-3xl border border-slate-200 bg-slate-50 p-8 shadow-sm">
            <a
              href={SITE_CONTACTS.phoneHref}
              className="inline-flex items-center justify-center rounded-2xl bg-[#081a4b] px-6 py-4 text-base font-semibold text-white"
            >
              Позвонить: {SITE_CONTACTS.phoneDisplay}
            </a>
            <a
              href={SITE_CONTACTS.emailHref}
              className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-6 py-4 text-base font-semibold text-[#081a4b]"
            >
              Написать: {SITE_CONTACTS.email}
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
