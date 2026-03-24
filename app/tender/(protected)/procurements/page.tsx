import { getPrisma } from "@/lib/prisma";
import { getCurrentTenderUser } from "@/lib/admin-auth";
import { tenderHasCapability } from "@/lib/tender-permissions";
import {
  formatTenderCurrency,
  formatTenderDate,
  tenderStatusLabels,
  tenderStatusTone,
} from "@/lib/tender-format";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function TenderProcurementsPage() {
  const currentUser = await getCurrentTenderUser();
  if (!currentUser || !tenderHasCapability(currentUser.role, "procurements_list")) {
    return null;
  }

  const prisma = getPrisma();
  const procurements = await prisma.tenderProcurement.findMany({
    orderBy: { updatedAt: "desc" },
    take: 20,
  });

  return (
    <main className="space-y-8">
      <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
        <div className="bg-[linear-gradient(135deg,#081a4b_0%,#143b8f_55%,#2f78ff_100%)] px-8 py-8 text-white">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="max-w-3xl">
              <div className="text-sm font-medium uppercase tracking-[0.16em] text-white/65">
                Реестр закупок
              </div>
              <h1 className="mt-3 text-4xl font-bold tracking-tight">
                Закупки в работе
              </h1>
              <p className="mt-4 text-base leading-7 text-white/80">
                Здесь сотрудники видят все карточки в одной ленте: сроки, статус,
                НМЦ и готовность закупки к следующему этапу.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              {tenderHasCapability(currentUser.role, "procurement_create") ? (
                <Link
                  href="/procurements/new"
                  className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-[#081a4b] transition hover:bg-slate-100"
                >
                  Новая закупка
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-sm font-medium uppercase tracking-[0.14em] text-slate-400">
            Список карточек
          </div>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-[#081a4b]">
            Актуальные записи
          </h2>
        </div>

        <div className="rounded-2xl bg-slate-100 px-4 py-2 text-sm text-slate-600">
          Можно открыть закупку и сразу перейти к её структурной карточке.
        </div>
      </div>

      {procurements.length === 0 ? (
        <div className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-500">
          Пока реестр пуст. Структура готова для статусов: новая, анализ,
          предпросчет, подготовка, пакет готов, подано.
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Закупка</th>
                <th className="px-4 py-3 font-medium">Заказчик</th>
                <th className="px-4 py-3 font-medium">Статус</th>
                <th className="px-4 py-3 font-medium">Срок</th>
                <th className="px-4 py-3 font-medium">НМЦ без НДС</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {procurements.map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-3 font-medium text-[#081a4b]">
                    <Link
                      href={`/procurements/${item.id}`}
                      className="transition hover:text-[#0d5bd7]"
                    >
                      {item.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {item.customerName ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${tenderStatusTone[item.status]}`}
                    >
                      {tenderStatusLabels[item.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {formatTenderDate(item.deadline)}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {formatTenderCurrency(item.nmckWithoutVat?.toString())}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      </section>
    </main>
  );
}
