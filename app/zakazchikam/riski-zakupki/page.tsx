import type { Metadata } from "next";
import Link from "next/link";
import { SITE_CONTACTS } from "@/lib/site-config";
import { CUSTOMER_RISK_PAGES } from "@/lib/customer-risk-pages";

export const metadata: Metadata = {
  title: "Риски закупки для заказчика | GOSZAKON",
  description:
    "Серия страниц для заказчиков: как не получить жалобу в ФАС, где чаще ошибаются в документации, нацрежиме, сроках поставки и защите отклонения заявок.",
};

export default function CustomerRiskHubPage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
          <div>
            <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600">
              Серия для заказчиков
            </div>
            <h1 className="mt-6 max-w-5xl text-5xl font-bold leading-[1.02] tracking-tight text-[#081a4b] md:text-7xl">
              Риски закупки для заказчика
            </h1>
            <p className="mt-6 max-w-3xl text-xl leading-9 text-slate-700">
              Это не просто перечень услуг, а серия рабочих страниц по тем
              точкам, где закупка чаще всего начинает разваливаться: документация,
              жалоба в ФАС, отклонение заявки, национальный режим, сроки
              поставки, проект договора и ограничения конкуренции.
            </p>
            <p className="mt-4 max-w-3xl text-lg leading-9 text-slate-700">
              Такой формат удобен, когда нужно быстро понять не абстрактную
              услугу, а конкретный риск: что может сломать процедуру и где
              заказчику нужна сильная правовая конструкция еще до спора.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/zakazchikam"
                className="rounded-2xl bg-[#081a4b] px-7 py-4 text-center text-base font-semibold text-white transition hover:bg-[#0d2568]"
              >
                Перейти в раздел заказчикам
              </Link>
              <a
                href={SITE_CONTACTS.phoneHref}
                className="rounded-2xl border border-slate-300 bg-white px-7 py-4 text-center text-base font-semibold text-[#081a4b] transition hover:bg-slate-50"
              >
                Обсудить закупку
              </a>
            </div>
          </div>

          <div className="grid gap-5">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-7 shadow-sm">
              <div className="text-sm uppercase tracking-[0.14em] text-slate-400">
                Что внутри
              </div>
              <div className="mt-4 text-5xl font-bold text-[#081a4b]">
                {CUSTOMER_RISK_PAGES.length}
              </div>
              <p className="mt-3 text-lg leading-9 text-slate-700">
                тематических страниц по самым частым рискам заказчика до
                публикации, во время жалобы и на стадии защиты закупки.
              </p>
            </div>

            <div className="rounded-3xl bg-[#081a4b] p-7 text-white shadow-sm">
              <div className="text-sm uppercase tracking-[0.14em] text-white/60">
                Как использовать
              </div>
              <p className="mt-4 text-lg leading-9 text-white/90">
                Сначала открывайте риск, который ближе всего к вашей закупке.
                Потом переходите к аудиту, сопровождению, защите в ФАС или
                судебному блоку. Так раздел работает как система, а не как
                витрина разрозненных услуг.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="max-w-3xl">
            <div className="inline-flex rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600">
              Тематические входы
            </div>
            <h2 className="mt-5 text-4xl font-bold tracking-tight text-[#081a4b] md:text-5xl">
              Не с общей услугой, а с конкретным риском закупки
            </h2>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {CUSTOMER_RISK_PAGES.map((page) => (
              <Link
                key={page.slug}
                href={`/zakazchikam/riski-zakupki/${page.slug}`}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="text-sm uppercase tracking-[0.14em] text-slate-400">
                  {page.eyebrow}
                </div>
                <h3 className="mt-4 text-2xl font-semibold leading-8 text-[#081a4b]">
                  {page.title}
                </h3>
                <p className="mt-4 text-base leading-8 text-slate-700">
                  {page.description}
                </p>
                <span className="mt-5 inline-flex text-sm font-semibold text-[#081a4b]">
                  Открыть страницу →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
