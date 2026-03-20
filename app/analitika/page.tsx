import Link from "next/link";
import { getPrisma } from "@/lib/prisma";
import { materialTypeLabels } from "@/lib/materials";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const prisma = getPrisma();

  const materials = await prisma.material.findMany({
    where: { isPublished: true },
    orderBy: [
      { isFeatured: "desc" },
      { publishedAt: "desc" },
      { updatedAt: "desc" },
    ],
  });

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="max-w-3xl">
            <div className="text-sm font-medium uppercase tracking-[0.14em] text-slate-400">
              Аналитика
            </div>
            <h1 className="mt-3 text-5xl font-bold tracking-tight text-[#081a4b]">
              Аналитика закупочных споров
            </h1>
            <p className="mt-5 text-lg leading-9 text-slate-700">
              Разборы практики, инструкции, аналитические материалы, комментарии к спорным ситуациям
              и правовые подходы по жалобам в ФАС, РНП, нарушениям и судебной защите.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-16">
          {materials.length === 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
              <div className="text-2xl font-semibold text-[#081a4b]">
                Аналитика пока не опубликована
              </div>
              <p className="mt-3 text-base leading-8 text-slate-600">
                Добавьте первую публикацию через админку — и она появится здесь.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {materials.map((item) => (
                <Link
                  key={item.id}
                  href={`/analitika/${item.slug}`}
                  className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm text-slate-500">
                      {materialTypeLabels[item.type] ?? item.type}
                    </span>

                    {item.isFeatured ? (
                      <span className="text-xs font-semibold uppercase tracking-wide text-[#081a4b]">
                        Важно
                      </span>
                    ) : null}
                  </div>

                  <h2 className="mt-4 text-2xl font-semibold text-[#081a4b]">
                    {item.title}
                  </h2>

                  {item.excerpt ? (
                    <p className="mt-4 text-slate-700">{item.excerpt}</p>
                  ) : null}

                  <span className="mt-5 block text-sm font-semibold text-[#081a4b]">
                    Читать →
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}