import Link from "next/link";
import { SITE_CONTACTS } from "@/lib/site-config";
import type { SeriesHubConfig, SeriesPageItem } from "@/lib/series-pages";

export function SeriesHubPage({
  config,
  items,
}: {
  config: SeriesHubConfig;
  items: SeriesPageItem[];
}) {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
          <div>
            <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600">
              {config.eyebrow}
            </div>
            <h1 className="mt-6 max-w-5xl text-5xl font-bold leading-[1.02] tracking-tight text-[#081a4b] md:text-7xl">
              {config.title}
            </h1>
            <p className="mt-6 max-w-3xl text-xl leading-9 text-slate-700">
              {config.description}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href={config.primaryCta.href}
                className="rounded-2xl bg-[#081a4b] px-7 py-4 text-center text-base font-semibold text-white transition hover:bg-[#0d2568]"
              >
                {config.primaryCta.label}
              </Link>
              <Link
                href={config.secondaryCta.href}
                className="rounded-2xl border border-slate-300 bg-white px-7 py-4 text-center text-base font-semibold text-[#081a4b] transition hover:bg-slate-50"
              >
                {config.secondaryCta.label}
              </Link>
            </div>
          </div>

          <div className="grid gap-5">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-7 shadow-sm">
              <div className="text-sm uppercase tracking-[0.14em] text-slate-400">
                Что внутри
              </div>
              <div className="mt-4 text-5xl font-bold text-[#081a4b]">
                {items.length}
              </div>
              <p className="mt-3 text-lg leading-9 text-slate-700">
                тематических страниц по одной логике: от ситуации и риска до
                следующего практического шага.
              </p>
            </div>

            <div className="rounded-3xl bg-[#081a4b] p-7 text-white shadow-sm">
              <div className="text-sm uppercase tracking-[0.14em] text-white/60">
                Как использовать
              </div>
              <p className="mt-4 text-lg leading-9 text-white/90">
                {config.helperText}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="max-w-3xl">
            <div className="inline-flex rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600">
              {config.helperTitle}
            </div>
            <h2 className="mt-5 text-4xl font-bold tracking-tight text-[#081a4b] md:text-5xl">
              Выбирайте не абстрактную услугу, а свой тип спора
            </h2>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => (
              <Link
                key={item.slug}
                href={`${config.secondaryCta.href}/${item.slug}`}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="text-sm uppercase tracking-[0.14em] text-slate-400">
                  {item.eyebrow}
                </div>
                <h3 className="mt-4 text-2xl font-semibold leading-8 text-[#081a4b]">
                  {item.title}
                </h3>
                <p className="mt-4 text-base leading-8 text-slate-700">
                  {item.description}
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

export function SeriesDetailPage({
  item,
  items,
  hubHref,
  hubLabel,
}: {
  item: SeriesPageItem;
  items: SeriesPageItem[];
  hubHref: string;
  hubLabel: string;
}) {
  const siblings = items.filter((entry) => entry.slug !== item.slug).slice(0, 3);

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:py-24">
          <div className="max-w-4xl">
            <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600">
              {item.eyebrow}
            </div>
            <h1 className="mt-6 text-5xl font-bold leading-[1.05] tracking-tight text-[#081a4b] md:text-7xl">
              {item.title}
            </h1>
            <p className="mt-6 max-w-3xl text-xl leading-9 text-slate-700">
              {item.description}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href={hubHref}
                className="rounded-2xl bg-[#081a4b] px-7 py-4 text-center text-base font-semibold text-white transition hover:bg-[#0d2568]"
              >
                {hubLabel}
              </Link>
              <a
                href={SITE_CONTACTS.phoneHref}
                className="rounded-2xl border border-slate-300 bg-white px-7 py-4 text-center text-base font-semibold text-[#081a4b] transition hover:bg-slate-50"
              >
                Обсудить ситуацию
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="text-sm uppercase tracking-[0.14em] text-slate-400">
                Что здесь происходит
              </div>
              <p className="mt-5 text-lg leading-9 text-slate-700">
                {item.intro}
              </p>
              <p className="mt-4 text-lg leading-9 text-slate-700">
                {item.whyImportant}
              </p>
            </div>

            <div className="rounded-3xl bg-[#081a4b] p-8 text-white shadow-sm">
              <div className="text-sm uppercase tracking-[0.14em] text-white/60">
                Что проверить первым
              </div>
              <ul className="mt-5 space-y-4">
                {item.whatCheckFirst.map((entry) => (
                  <li
                    key={entry}
                    className="rounded-2xl bg-white/10 p-4 text-base leading-8 text-white/90"
                  >
                    {entry}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-8">
              <div className="text-sm uppercase tracking-[0.14em] text-emerald-700">
                Что делать
              </div>
              <div className="mt-5 space-y-4">
                {item.whatToDo.map((entry) => (
                  <div
                    key={entry}
                    className="rounded-2xl border border-emerald-200 bg-white p-5 text-base leading-8 text-slate-700"
                  >
                    {entry}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-amber-200 bg-amber-50 p-8">
              <div className="text-sm uppercase tracking-[0.14em] text-amber-700">
                Где чаще всего риск
              </div>
              <div className="mt-5 space-y-4">
                {item.whereRisk.map((entry) => (
                  <div
                    key={entry}
                    className="rounded-2xl border border-amber-200 bg-white p-5 text-base leading-8 text-slate-700"
                  >
                    {entry}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="max-w-3xl">
            <div className="inline-flex rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600">
              Куда перейти дальше
            </div>
            <h2 className="mt-5 text-4xl font-bold tracking-tight text-[#081a4b] md:text-5xl">
              Связанные материалы по этой теме
            </h2>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {item.relatedLinks.map((entry) => (
              <Link
                key={entry.href}
                href={entry.href}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="text-xl font-semibold leading-8 text-[#081a4b]">
                  {entry.title}
                </div>
                <p className="mt-3 text-base leading-8 text-slate-700">
                  {entry.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="max-w-3xl">
            <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600">
              Соседние темы
            </div>
            <h2 className="mt-5 text-4xl font-bold tracking-tight text-[#081a4b] md:text-5xl">
              Что еще посмотреть рядом
            </h2>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {siblings.map((entry) => (
              <Link
                key={entry.slug}
                href={`${hubHref}/${entry.slug}`}
                className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm transition hover:bg-white hover:shadow-md"
              >
                <div className="text-sm uppercase tracking-[0.14em] text-slate-400">
                  {entry.eyebrow}
                </div>
                <div className="mt-4 text-xl font-semibold leading-8 text-[#081a4b]">
                  {entry.title}
                </div>
                <p className="mt-3 text-base leading-8 text-slate-700">
                  {entry.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
