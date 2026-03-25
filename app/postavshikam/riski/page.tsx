import type { Metadata } from "next";
import Link from "next/link";
import { SITE_CONTACTS } from "@/lib/site-config";
import { SUPPLIER_RISK_PAGES } from "@/lib/supplier-risk-pages";

export const metadata: Metadata = {
  title: "Риски поставщика в закупках | GOSZAKON",
  description:
    "Серия страниц для поставщиков: жалобы в ФАС, отклонение заявки, РНП, неоплата, неустойка, спорные документы и переход в суд.",
};

export default function SupplierRiskHubPage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
          <div>
            <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600">
              Серия для поставщиков
            </div>
            <h1 className="mt-6 max-w-5xl text-5xl font-bold leading-[1.02] tracking-tight text-[#081a4b] md:text-7xl">
              Риски поставщика в закупках
            </h1>
            <p className="mt-6 max-w-3xl text-xl leading-9 text-slate-700">
              Это серия страниц не про абстрактные услуги, а про реальные
              точки конфликта для поставщика: документация, отклонение заявки,
              РНП, неоплата, неустойка, внутренние документы заказчика и
              продолжение спора в суде.
            </p>
            <p className="mt-4 max-w-3xl text-lg leading-9 text-slate-700">
              Здесь удобно начинать не с общей формулировки, а со своей
              ситуации: что именно произошло и где сейчас главный риск.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/uslugi"
                className="rounded-2xl bg-[#081a4b] px-7 py-4 text-center text-base font-semibold text-white transition hover:bg-[#0d2568]"
              >
                Перейти в услуги
              </Link>
              <a
                href={SITE_CONTACTS.phoneHref}
                className="rounded-2xl border border-slate-300 bg-white px-7 py-4 text-center text-base font-semibold text-[#081a4b] transition hover:bg-slate-50"
              >
                Разобрать ситуацию
              </a>
            </div>
          </div>

          <div className="grid gap-5">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-7 shadow-sm">
              <div className="text-sm uppercase tracking-[0.14em] text-slate-400">
                Что внутри
              </div>
              <div className="mt-4 text-5xl font-bold text-[#081a4b]">
                {SUPPLIER_RISK_PAGES.length}
              </div>
              <p className="mt-3 text-lg leading-9 text-slate-700">
                тематических страниц по самым частым закупочным конфликтам
                поставщика до ФАС, в ходе ФАС и после него.
              </p>
            </div>

            <div className="rounded-3xl bg-[#081a4b] p-7 text-white shadow-sm">
              <div className="text-sm uppercase tracking-[0.14em] text-white/60">
                Как использовать
              </div>
              <p className="mt-4 text-lg leading-9 text-white/90">
                Сначала открывайте страницу по своему риску. Потом переходите
                в практику, спорные практики, услуги и судебный блок. Так сайт
                работает как карта конфликта, а не как витрина общих описаний.
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
              Не с общей услугой, а с конкретной проблемой поставщика
            </h2>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {SUPPLIER_RISK_PAGES.map((page) => (
              <Link
                key={page.slug}
                href={`/postavshikam/riski/${page.slug}`}
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

            <Link
              href="/chto-delat-esli"
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="text-sm uppercase tracking-[0.14em] text-slate-400">
                Для поставщиков
              </div>
              <h3 className="mt-4 text-2xl font-semibold leading-8 text-[#081a4b]">
                Что делать, если...
              </h3>
              <p className="mt-4 text-base leading-8 text-slate-700">
                Отдельная серия коротких страниц для горячих ситуаций: неоплата,
                отклонение заявки, риск РНП, удержание неустойки и отказ ФАС.
              </p>
              <span className="mt-5 inline-flex text-sm font-semibold text-[#081a4b]">
                Открыть серию →
              </span>
            </Link>

            <Link
              href="/otklonenie-zayavki"
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="text-sm uppercase tracking-[0.14em] text-slate-400">
                Для поставщиков
              </div>
              <h3 className="mt-4 text-2xl font-semibold leading-8 text-[#081a4b]">
                Отклонение заявки
              </h3>
              <p className="mt-4 text-base leading-8 text-slate-700">
                Большой раздел по незаконному отклонению заявки, формальным
                основаниям, характеристикам товара и реестровым записям.
              </p>
              <span className="mt-5 inline-flex text-sm font-semibold text-[#081a4b]">
                Открыть раздел →
              </span>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
