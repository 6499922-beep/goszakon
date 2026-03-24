import type { Metadata } from "next";
import Link from "next/link";
import { SITE_CONTACTS } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Оспаривание предписания ФАС заказчиком | GOSZAKON",
  description:
    "Помогаем заказчикам оспаривать предписания ФАС по закупочной документации, национальному режиму, оценке заявок и иным спорным блокам процедуры.",
};

const situations = [
  "ФАС уже выдал предписание по закупке, и заказчик не согласен с выводами комиссии.",
  "Предписание фактически ломает процедуру, заставляет переделывать закупку или отменять ключевые условия документации.",
  "Спор касается нацрежима, критериев оценки, описания объекта закупки, требований к участникам или проекта договора.",
  "Нужно понять, есть ли основания оспаривать предписание, а не просто механически исполнять его.",
];

const support = [
  "Разбираем решение и предписание ФАС вместе с самой закупкой, а не только по формальному тексту документа.",
  "Проверяем, насколько глубоко комиссия исследовала материалы дела и не вышла ли за пределы реального предмета жалобы.",
  "Готовим позицию для дальнейшего оспаривания, если предписание разрушает закупочную модель заказчика без достаточных оснований.",
  "Сопровождаем заказчика в споре так, чтобы защита касалась не только одного документа, но и всей логики закупки.",
];

const principles = [
  {
    title: "Предписание нужно оценивать по всей конструкции закупки",
    text: "Один и тот же вывод ФАС может выглядеть иначе, если рассматривать его не отдельно, а в связке с предметом закупки, режимом, критериями и проектом договора.",
  },
  {
    title: "Не каждое предписание нужно исполнять без спора",
    text: "Если предписание построено на формальной или неполной оценке, заказчику важно не терять право на дальнейшую защиту и проверку выводов ФАС.",
  },
  {
    title: "Важно видеть, где комиссия подменила анализ общими фразами",
    text: "Мы смотрим, исследовал ли ФАС материалы дела по существу или ограничился удобной формальной позицией, которая не учитывает специфику закупки.",
  },
  {
    title: "Защита должна сохранять управляемость закупки",
    text: "Наша задача не только спорить с предписанием, но и сохранить для заказчика сильную и последовательную позицию по всей процедуре.",
  },
];

const outcomes = [
  "Понимание, есть ли реальные основания оспаривать предписание ФАС.",
  "Более сильная позиция заказчика по закупке, если административный спор не исчерпан.",
  "Снижение риска, что спорный вывод ФАС автоматически разрушит всю закупочную конструкцию.",
  "Связка между текущей защитой и тем, как заказчику строить следующие процедуры сильнее.",
];

export default function CustomerFasOrderChallengePage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:py-24">
          <div className="max-w-5xl">
            <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600">
              Для заказчиков
            </div>

            <h1 className="mt-6 text-5xl font-bold tracking-tight text-[#081a4b] md:text-7xl">
              Оспаривание предписания ФАС заказчиком
            </h1>

            <p className="mt-6 max-w-4xl text-xl leading-9 text-slate-700">
              Предписание ФАС не всегда означает, что выводы комиссии сильны и
              безупречны. Иногда именно предписание ломает закупку сильнее, чем
              сама жалоба. Мы помогаем заказчику разбирать такие акты по
              существу и понимать, где есть основания для дальнейшего
              оспаривания и защиты своей закупочной позиции.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href={SITE_CONTACTS.phoneHref}
                className="rounded-2xl bg-[#081a4b] px-7 py-4 text-center font-semibold text-white"
              >
                Разобрать предписание ФАС
              </a>
              <Link
                href="/zakazchikam/zashita-v-fas"
                className="rounded-2xl border border-slate-300 px-7 py-4 text-center font-semibold text-[#081a4b]"
              >
                Защита в ФАС
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
              Что мы делаем по такому спору
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
              Как мы смотрим на предписание ФАС
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
                href="/zakazchikam/zashita-v-fas"
                className="block rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:bg-white/10"
              >
                <div className="text-xl font-semibold">
                  Защита интересов заказчика в ФАС
                </div>
                <p className="mt-2 text-base leading-8 text-white/90">
                  Если спор еще находится внутри административной стадии и
                  закупку нужно защищать перед комиссией.
                </p>
              </Link>

              <Link
                href="/zakazchikam/sudebnaya-zashita"
                className="block rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:bg-white/10"
              >
                <div className="text-xl font-semibold">
                  Судебная защита заказчика
                </div>
                <p className="mt-2 text-base leading-8 text-white/90">
                  Если спор по предписанию уже требует полноценной дальнейшей
                  судебной стратегии.
                </p>
              </Link>

              <Link
                href="/zakazchikam/podgotovka-zakupochnoj-dokumentacii"
                className="block rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:bg-white/10"
              >
                <div className="text-xl font-semibold">
                  Подготовка закупочной документации
                </div>
                <p className="mt-2 text-base leading-8 text-white/90">
                  Если важно не только спорить по предписанию, но и усилить
                  следующие процедуры заранее.
                </p>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
