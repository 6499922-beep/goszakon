import type { Metadata } from "next";
import Link from "next/link";
import { SITE_CONTACTS } from "@/lib/site-config";
import { THEMATIC_PRACTICE_PAGES } from "@/lib/thematic-practice-pages";

export const metadata: Metadata = {
  title: "Практика ФАС: обзор по ключевым темам | GOSZAKON",
  description:
    "10 обзорных страниц по ключевым темам практики ФАС: товарный знак, национальный режим, отклонение заявок, условия оплаты, неустойка, сроки поставки и ограничения конкуренции.",
};

export default function FasPracticeHubPage() {
  return (
    <main className="min-h-screen bg-transparent text-slate-900">
      <section className="border-b border-[color:var(--line)] bg-transparent">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
          <div>
            <div className="inline-flex rounded-full border border-[color:var(--line)] bg-[rgba(255,253,249,0.9)] px-4 py-2 text-sm font-medium text-slate-600">
              Новый слой над базой практики
            </div>
            <h1 className="mt-6 max-w-5xl text-5xl font-bold leading-[1.02] tracking-[-0.03em] text-[#081a4b] md:text-7xl">
              Практика ФАС по ключевым темам
            </h1>
            <p className="mt-6 max-w-3xl text-xl leading-9 text-slate-700">
              Это не архив решений по дате, а обзорные страницы по тем
              конфликтам, которые чаще всего ломают закупки, отклоняют заявки,
              задерживают оплату и создают спор уже на стадии документации.
            </p>
            <p className="mt-4 max-w-3xl text-lg leading-9 text-slate-700">
              Здесь удобно начинать с темы, а не с одного кейса: так быстрее
              понять, какие доводы обычно работают, где заказчик чаще ошибается
              и на чем вообще строится сильная жалоба в ФАС.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/cases/praktika-fas"
                className="rounded-2xl bg-[#081a4b] px-7 py-4 text-center text-base font-semibold text-white transition hover:bg-[#0d2568]"
              >
                Перейти в базу практики
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
            <div className="hero-panel rounded-3xl p-7">
              <div className="text-sm uppercase tracking-[0.16em] text-[#8b6a3a]">
                Что внутри
              </div>
              <div className="mt-4 text-5xl font-bold text-[#081a4b]">
                {THEMATIC_PRACTICE_PAGES.length}
              </div>
              <p className="mt-3 text-lg leading-9 text-slate-700">
                обзорных страниц по самым повторяющимся закупочным спорам:
                документация, допуск, нацрежим, эквивалентность, неоплата,
                неустойка и процедурные ошибки.
              </p>
            </div>

            <div className="rounded-3xl bg-[#081a4b] p-7 text-white shadow-sm">
              <div className="text-sm uppercase tracking-[0.14em] text-white/60">
                Как использовать
              </div>
              <p className="mt-4 text-lg leading-9 text-white/90">
                Сначала открывайте тему, которая ближе всего к вашей ситуации.
                Потом уже переходите в кейсы, жалобы, услуги и документы. Так
                практика работает как система, а не как хаотичный архив.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section-wash border-b border-[color:var(--line)]">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="max-w-3xl">
            <div className="inline-flex rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600">
              Тематические обзоры
            </div>
            <h2 className="mt-5 text-4xl font-bold tracking-tight text-[#081a4b] md:text-5xl">
              Начинайте с темы, а не с одного случайного решения
            </h2>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {THEMATIC_PRACTICE_PAGES.map((page) => (
              <Link
                key={page.slug}
                href={`/praktika-fas/${page.slug}`}
                className="hero-panel rounded-3xl p-6 transition hover:-translate-y-0.5 hover:shadow-md"
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
                  Открыть обзор →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
