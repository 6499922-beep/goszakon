import Link from "next/link";
import { getPrisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminLeadsPage() {
  const prisma = getPrisma();

  const leads = await prisma.lead.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <main>
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-[#081a4b]">Заявки</h1>
          <p className="mt-2 text-slate-600">
            Все обращения с формы сайта, отсортированные от новых к старым.
          </p>
        </div>

        <Link
          href="/admin"
          className="rounded-2xl border border-slate-300 px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-white"
        >
          ← Назад в админку
        </Link>
      </div>

      {leads.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500 shadow-sm">
          Заявок пока нет.
        </div>
      ) : (
        <div className="space-y-4">
          {leads.map((lead) => (
            <article
              key={lead.id}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                    Заявка #{lead.id}
                  </span>

                  <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
                    {lead.status || "new"}
                  </span>
                </div>

                <div className="text-sm text-slate-400">
                  {new Date(lead.createdAt).toLocaleString("ru-RU")}
                </div>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="text-xs uppercase tracking-wide text-slate-400">
                    Телефон
                  </div>
                  <div className="mt-2 text-base text-slate-900">
                    {lead.phone || "—"}
                  </div>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="text-xs uppercase tracking-wide text-slate-400">
                    Email
                  </div>
                  <div className="mt-2 text-base text-slate-900">
                    {lead.email || "—"}
                  </div>
                </div>
              </div>

              <div className="mt-5 rounded-2xl bg-slate-50 p-4">
                <div className="text-xs uppercase tracking-wide text-slate-400">
                  Ссылка на закупку
                </div>
                <div className="mt-2 break-all text-base text-slate-900">
                  {lead.procurementLink ? (
                    <a
                      href={lead.procurementLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#081a4b] underline"
                    >
                      {lead.procurementLink}
                    </a>
                  ) : (
                    "—"
                  )}
                </div>
              </div>

              <div className="mt-5 rounded-2xl bg-slate-50 p-4">
                <div className="text-xs uppercase tracking-wide text-slate-400">
                  Проблема
                </div>
                <div className="mt-2 whitespace-pre-wrap text-base leading-8 text-slate-700">
                  {lead.problem || "—"}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
