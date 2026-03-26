import Link from "next/link";
import { TenderProcurementStatus } from "@prisma/client";
import { redirect } from "next/navigation";
import { getCurrentTenderUser } from "@/lib/admin-auth";
import { tenderHasCapability } from "@/lib/tender-permissions";
import { getPrisma } from "@/lib/prisma";
import { formatTenderMoscowShortDateTime } from "@/lib/tender-format";
import { buildTenderCustomerHref } from "@/lib/tender-customers";

export const dynamic = "force-dynamic";

function formatCurrency(value: { toString(): string } | null | undefined) {
  if (value == null) return "Не определена";
  const parsed = Number(String(value).replace(",", "."));
  if (!Number.isFinite(parsed)) return String(value);
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 2,
  }).format(parsed);
}

function buildProcurementSubject(input: {
  summary: string | null;
  title: string;
  purchaseType: string | null;
}) {
  const summary = String(input.summary ?? "").replace(/\s+/g, " ").trim();
  if (summary) {
    return summary.length <= 180 ? summary : `${summary.slice(0, 177).trim()}...`;
  }

  const title = String(input.title ?? "")
    .replace(/^Закупка по файлам:\s*/i, "")
    .replace(/^Закупка\s+\d+[^\s]*\s*/i, "")
    .replace(/\s+/g, " ")
    .trim();

  if (title) {
    return title.length <= 180 ? title : `${title.slice(0, 177).trim()}...`;
  }

  return input.purchaseType?.trim() || "Предмет закупки не определён";
}

export default async function TenderArchivePage() {
  const currentUser = await getCurrentTenderUser();

  if (!currentUser || !tenderHasCapability(currentUser.role, "procurements_list")) {
    redirect("/procurements/new");
  }

  const prisma = getPrisma();
  const procurements = await prisma.tenderProcurement.findMany({
    where: { status: TenderProcurementStatus.ARCHIVED },
    orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
    take: 100,
    select: {
      id: true,
      title: true,
      procurementNumber: true,
      customerName: true,
      customerInn: true,
      summary: true,
      purchaseType: true,
      nmck: true,
      nmckWithoutVat: true,
      updatedAt: true,
    },
  });

  return (
    <main className="space-y-4">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-sm font-medium uppercase tracking-[0.14em] text-slate-400">
              Скрытые закупки
            </div>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-[#081a4b]">
              Архив
            </h1>
            <div className="mt-2 text-sm text-slate-500">
              Здесь лежат заявки, которые вручную отправили в архив после анализа.
            </div>
          </div>
          <div className="rounded-2xl bg-slate-100 px-4 py-2 text-sm text-slate-600">
            Сортировка: по дате архивации
          </div>
        </div>

        <div className="mt-5 overflow-hidden rounded-3xl border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Архив</th>
                <th className="px-4 py-3 font-medium">Дата</th>
                <th className="px-4 py-3 font-medium">Номер закупки</th>
                <th className="px-4 py-3 font-medium">Заказчик</th>
                <th className="px-4 py-3 font-medium">НМЦК</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {procurements.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-slate-500">
                    В архиве пока нет заявок.
                  </td>
                </tr>
              ) : (
                procurements.map((item) => {
                  const rowHref = `/procurements/recognition/${item.id}`;
                  const procurementSubject = buildProcurementSubject({
                    summary: item.summary,
                    title: item.title,
                    purchaseType: item.purchaseType,
                  });

                  return (
                    <tr key={item.id} className="cursor-pointer hover:bg-slate-50/80">
                      <td className="px-4 py-4">
                        <a href={rowHref} className="block -mx-4 -my-4 px-4 py-4">
                          <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                            В архиве
                          </span>
                        </a>
                      </td>
                      <td className="px-4 py-4 text-slate-600">
                        <a href={rowHref} className="block -mx-4 -my-4 px-4 py-4">
                          {formatTenderMoscowShortDateTime(item.updatedAt)}
                        </a>
                      </td>
                      <td className="px-4 py-4 font-semibold text-[#081a4b]">
                        <a href={rowHref} className="block -mx-4 -my-4 px-4 py-4">
                          {item.procurementNumber ?? "Не определён"}
                        </a>
                      </td>
                      <td className="px-4 py-4 text-slate-600">
                        <div className="-mx-4 -my-4 px-4 py-4">
                          <Link
                            href={buildTenderCustomerHref(item.customerName, item.customerInn)}
                            className="block font-medium transition hover:text-[#0d5bd7]"
                          >
                            {item.customerName ?? "Не определён"}
                          </Link>
                          <a
                            href={rowHref}
                            className="mt-2 block max-w-[420px] text-sm leading-5 text-slate-500 transition hover:text-slate-700"
                          >
                            {procurementSubject}
                          </a>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <a href={rowHref} className="block -mx-4 -my-4 px-4 py-4">
                          <div className="font-semibold text-[#081a4b]">
                            {formatCurrency(item.nmck ?? item.nmckWithoutVat)}
                          </div>
                        </a>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
