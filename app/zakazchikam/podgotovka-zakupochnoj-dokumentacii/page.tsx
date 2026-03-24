import type { Metadata } from "next";
import Link from "next/link";
import { SITE_CONTACTS } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Подготовка закупочной документации для заказчика | GOSZAKON",
  description:
    "Помогаем заказчикам подготовить закупочную документацию так, чтобы она решала задачу закупки, выдерживала жалобу в ФАС и не вела к штрафам и срыву процедуры.",
};

const situations = [
  "Документацию нужно собрать с нуля под конкретный предмет закупки, а не просто по шаблону.",
  "Процедуры уже срывались из-за жалоб, слабых формулировок или противоречий внутри документации.",
  "Есть риск штрафа за закупочную документацию, национальный режим, сроки поставки или критерии оценки.",
  "Нужно подготовить закупку так, чтобы она выдерживала и ФАС, и последующую проверку по существу.",
];

const support = [
  "Помогаем собрать извещение, документацию, критерии оценки и проект договора в одну рабочую конструкцию.",
  "Проверяем, чтобы описание объекта закупки, требования к участникам и условия исполнения не спорили друг с другом.",
  "Снимаем формулировки, которые чаще всего становятся основанием для жалоб, предписаний и штрафов.",
  "Особенно внимательно смотрим на национальный режим, предмет закупки, сроки, приемку, оплату и проект договора.",
];

const principles = [
  {
    title: "Документация должна решать задачу закупки",
    text: "Мы не подменяем реальную потребность заказчика формальным набором блоков. Сначала разбираем, что нужно закупить и где у процедуры чувствительные точки.",
  },
  {
    title: "Все блоки документации должны работать вместе",
    text: "Если критерии оценки, условия договора, сроки, порядок приемки и требования к участникам собраны отдельно друг от друга, закупка становится уязвимой.",
  },
  {
    title: "Слабые формулировки лучше убирать до публикации",
    text: "Ошибки в документации почти всегда дешевле исправлять заранее, чем потом спасать закупку после жалобы, предписания или штрафа.",
  },
  {
    title: "Смотрим на документацию глазами ФАС и суда",
    text: "Мы заранее оцениваем, как документация будет выглядеть при жалобе, проверке и в споре, если закупка все же пойдет дальше в защиту.",
  },
];

const outcomes = [
  "Документация, собранная под предмет закупки, а не просто по формальному образцу.",
  "Меньше риска, что процедура развалится после публикации из-за жалобы или внутренних противоречий.",
  "Более сильная позиция заказчика в ФАС, если спор по закупке все же начнется.",
  "Снижение риска штрафов за дефекты закупочной документации.",
];

export default function CustomerDocumentationPage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:py-24">
          <div className="max-w-5xl">
            <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600">
              Для заказчиков
            </div>

            <h1 className="mt-6 text-5xl font-bold tracking-tight text-[#081a4b] md:text-7xl">
              Подготовка закупочной документации для заказчика
            </h1>

            <p className="mt-6 max-w-4xl text-xl leading-9 text-slate-700">
              Слабая закупочная документация почти всегда стоит заказчику
              слишком дорого: жалоба в ФАС, переделка процедуры, штрафы и
              потеря управляемости закупкой. Мы помогаем подготовить
              документацию так, чтобы она решала задачу закупки и выдерживала
              правовую проверку по существу.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href={SITE_CONTACTS.phoneHref}
                className="rounded-2xl bg-[#081a4b] px-7 py-4 text-center font-semibold text-white"
              >
                Разобрать документацию
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
              Чем мы помогаем заказчику по документации
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
              Как мы смотрим на подготовку документации
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
                href="/zakazchikam/soprovozhdenie-zakupki"
                className="block rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:bg-white/10"
              >
                <div className="text-xl font-semibold">
                  Сопровождение закупки под задачу заказчика
                </div>
                <p className="mt-2 text-base leading-8 text-white/90">
                  Если нужно собрать не только документацию, но и всю закупочную
                  конструкцию под конкретную задачу.
                </p>
              </Link>

              <Link
                href="/zakazchikam/nacionalnyj-rezhim"
                className="block rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:bg-white/10"
              >
                <div className="text-xl font-semibold">Национальный режим</div>
                <p className="mt-2 text-base leading-8 text-white/90">
                  Если закупка чувствительна к режиму допуска, ограничениям и
                  подтверждающим документам.
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
                  Если документацию уже оспаривают и закупку нужно защищать в
                  административном споре.
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
              Если документация слабая, закупка обычно распадается уже после публикации
            </h2>
            <p className="mt-5 max-w-2xl text-lg leading-9 text-slate-700">
              Направьте нам проект документации, предмет закупки, проект
              договора и проблемные точки. Мы посмотрим, как собрать документацию
              сильнее и где сейчас заложены основные риски жалобы, штрафа или
              срыва процедуры.
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
