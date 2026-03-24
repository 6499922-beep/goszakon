import type { Metadata } from "next";
import Link from "next/link";
import { SITE_CONTACTS } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Защита интересов заказчика в ФАС | GOSZAKON",
  description:
    "Помогаем заказчикам защищать закупку в ФАС: готовим позицию, документы и аргументацию по жалобе, национальному режиму, документации и критериям оценки.",
};

const situations = [
  "На закупку уже подана жалоба, и нужно быстро собрать письменную позицию.",
  "Жалоба бьет по документации, критериям оценки, срокам поставки или условиям договора.",
  "Есть риск, что ФАС увидит нарушение в национальном режиме, товарном знаке или ограничении конкуренции.",
  "Закупку нужно отстоять так, чтобы не потерять процедуру и не усилить риск штрафов.",
];

const support = [
  "Разбираем жалобу по существу и отделяем реальные риски от слабых доводов заявителя.",
  "Готовим письменную позицию заказчика и комплект подтверждающих документов к заседанию ФАС.",
  "Помогаем отстоять документацию, логику закупки, критерии оценки и национальный режим.",
  "Если спор не заканчивается в ФАС, помогаем подготовить дальнейшую судебную защиту.",
];

export default function CustomerFasDefensePage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:py-24">
          <div className="max-w-5xl">
            <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600">
              Для заказчиков
            </div>

            <h1 className="mt-6 text-5xl font-bold tracking-tight text-[#081a4b] md:text-7xl">
              Защита интересов заказчика в ФАС
            </h1>

            <p className="mt-6 max-w-4xl text-xl leading-9 text-slate-700">
              Помогаем заказчикам не терять управление закупкой, когда на
              процедуру уже подана жалоба. Наша задача не просто написать
              объяснение, а защитить документацию, логику закупки и позицию
              заказчика перед комиссией ФАС.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href={SITE_CONTACTS.phoneHref}
                className="rounded-2xl bg-[#081a4b] px-7 py-4 text-center font-semibold text-white"
              >
                Срочно разобрать жалобу
              </a>
              <a
                href={SITE_CONTACTS.emailHref}
                className="rounded-2xl border border-slate-300 px-7 py-4 text-center font-semibold text-[#081a4b]"
              >
                Направить документы
              </a>
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
              Что мы делаем для заказчика
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

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <Link
              href="/zakazchikam/osparivanie-predpisaniya-fas"
              className="rounded-3xl border border-slate-200 bg-slate-50 p-7 transition hover:bg-white hover:shadow-md"
            >
              <h3 className="text-2xl font-semibold text-[#081a4b]">
                Оспаривание предписания ФАС
              </h3>
              <p className="mt-3 text-slate-700">
                Если спор уже вышел за рамки обычной жалобы и заказчик не
                согласен с выданным предписанием.
              </p>
            </Link>

            <Link
              href="/zakazchikam/nacionalnyj-rezhim"
              className="rounded-3xl border border-slate-200 bg-slate-50 p-7 transition hover:bg-white hover:shadow-md"
            >
              <h3 className="text-2xl font-semibold text-[#081a4b]">
                Национальный режим
              </h3>
              <p className="mt-3 text-slate-700">
                Если спор в ФАС строится вокруг ограничений, допуска товаров и
                подтверждающих документов.
              </p>
            </Link>

            <Link
              href="/zakazchikam/soprovozhdenie-zakupki-s-riskom-zhaloby"
              className="rounded-3xl border border-slate-200 bg-slate-50 p-7 transition hover:bg-white hover:shadow-md"
            >
              <h3 className="text-2xl font-semibold text-[#081a4b]">
                Закупка с риском жалобы
              </h3>
              <p className="mt-3 text-slate-700">
                Если нужно усилить документацию до публикации, когда жалоба по
                такой процедуре почти ожидаема.
              </p>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
