import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SITE_CONTACTS } from "@/lib/site-config";
import {
  getSupplierRiskPage,
  SUPPLIER_RISK_PAGES,
} from "@/lib/supplier-risk-pages";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return SUPPLIER_RISK_PAGES.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = getSupplierRiskPage(slug);
  if (!page) return {};

  return {
    title: `${page.title} | GOSZAKON`,
    description: page.description,
  };
}

export default async function SupplierRiskDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const page = getSupplierRiskPage(slug);
  if (!page) notFound();

  const siblings = SUPPLIER_RISK_PAGES.filter((item) => item.slug !== slug).slice(
    0,
    3,
  );

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:py-24">
          <div className="max-w-4xl">
            <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600">
              {page.eyebrow}
            </div>
            <h1 className="mt-6 text-5xl font-bold leading-[1.05] tracking-tight text-[#081a4b] md:text-7xl">
              {page.title}
            </h1>
            <p className="mt-6 max-w-3xl text-xl leading-9 text-slate-700">
              {page.description}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/postavshikam/riski"
                className="rounded-2xl bg-[#081a4b] px-7 py-4 text-center text-base font-semibold text-white transition hover:bg-[#0d2568]"
              >
                Все риски поставщика
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
                {page.intro}
              </p>
              <p className="mt-4 text-lg leading-9 text-slate-700">
                {page.whyImportant}
              </p>
            </div>

            <div className="rounded-3xl bg-[#081a4b] p-8 text-white shadow-sm">
              <div className="text-sm uppercase tracking-[0.14em] text-white/60">
                Что проверить первым
              </div>
              <ul className="mt-5 space-y-4">
                {page.whatCheckFirst.map((item) => (
                  <li
                    key={item}
                    className="rounded-2xl bg-white/10 p-4 text-base leading-8 text-white/90"
                  >
                    {item}
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
                Что делать поставщику
              </div>
              <div className="mt-5 space-y-4">
                {page.whatToDo.map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-emerald-200 bg-white p-5 text-base leading-8 text-slate-700"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-amber-200 bg-amber-50 p-8">
              <div className="text-sm uppercase tracking-[0.14em] text-amber-700">
                Где чаще всего риск
              </div>
              <div className="mt-5 space-y-4">
                {page.whereRisk.map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-amber-200 bg-white p-5 text-base leading-8 text-slate-700"
                  >
                    {item}
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
            {page.relatedLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="text-xl font-semibold leading-8 text-[#081a4b]">
                  {item.title}
                </div>
                <p className="mt-3 text-base leading-8 text-slate-700">
                  {item.description}
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
              Другие риски
            </div>
            <h2 className="mt-5 text-4xl font-bold tracking-tight text-[#081a4b] md:text-5xl">
              Соседние темы для поставщика
            </h2>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {siblings.map((item) => (
              <Link
                key={item.slug}
                href={`/postavshikam/riski/${item.slug}`}
                className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm transition hover:bg-white hover:shadow-md"
              >
                <div className="text-sm uppercase tracking-[0.14em] text-slate-400">
                  {item.eyebrow}
                </div>
                <div className="mt-4 text-xl font-semibold leading-8 text-[#081a4b]">
                  {item.title}
                </div>
                <p className="mt-3 text-base leading-8 text-slate-700">
                  {item.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
