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

function getSubmissionStatusMeta(status: TenderProcurementStatus) {
  switch (status) {
    case TenderProcurementStatus.READY:
      return {
        label: "Пакет готов",
        tone: "bg-emerald-50 text-emerald-700",
        note: "Документы готовы к выгрузке.",
      };
    case TenderProcurementStatus.SUBMITTED:
      return {
        label: "Подано",
        tone: "bg-emerald-100 text-emerald-800",
        note: "Подача подтверждена.",
      };
    default:
      return {
        label: "На подаче",
        tone: "bg-indigo-50 text-indigo-700",
        note: "Идёт подготовка пакета документов.",
      };
  }
}

export default async function TenderSubmissionPage() {
  const currentUser = await getCurrentTenderUser();

  if (!currentUser || !tenderHasCapability(currentUser.role, "procurement_submission")) {
    redirect("/procurements/new");
  }

  const prisma = getPrisma();
  const procurements = await prisma.tenderProcurement.findMany({
    where: {
      status: {
        in: [
          TenderProcurementStatus.IN_PREPARATION,
          TenderProcurementStatus.READY,
          TenderProcurementStatus.SUBMITTED,
        ],
      },
    },
    orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
    take: 50,
    select: {
      id: true,
      title: true,
      procurementNumber: true,
      customerName: true,
      customerInn: true,
      nmck: true,
      nmckWithoutVat: true,
      status: true,
      stopFactorsSummary: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  const inns = Array.from(
    new Set(
      procurements
        .map((item) => item.customerInn?.replace(/\D+/g, "").trim())
        .filter((value): value is string => Boolean(value))
    )
  );
  const registryRecords = inns.length
    ? await prisma.tenderInnRegistry.findMany({
        where: { isActive: true, inn: { in: inns } },
        select: { id: true, inn: true, label: true },
      })
    : [];
  const registryByInn = new Map(
    registryRecords.map((item) => [item.inn, { id: item.id, label: item.label }])
  );

  return (
    <main className="space-y-4">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-sm font-medium uppercase tracking-[0.14em] text-slate-400">
              Четвёртый этап
            </div>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-[#081a4b]">
              Подача
            </h1>
            <div className="mt-2 text-sm text-slate-500">
              Здесь заявки, которые после согласования перешли на подготовку и подачу.
            </div>
          </div>
          <div className="rounded-2xl bg-slate-100 px-4 py-2 text-sm text-slate-600">
            Сортировка: по последнему обновлению
          </div>
        </div>

        <div className="mt-5 overflow-hidden rounded-3xl border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Статус</th>
                <th className="px-4 py-3 font-medium">Передана</th>
                <th className="px-4 py-3 font-medium">Номер закупки</th>
                <th className="px-4 py-3 font-medium">Заказчик</th>
                <th className="px-4 py-3 font-medium">НМЦК</th>
                <th className="px-4 py-3 font-medium">Стоп-факторы</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {procurements.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
                    Пока нет заявок на подаче.
                  </td>
                </tr>
              ) : (
                procurements.map((item) => {
                  const normalizedInn = item.customerInn?.replace(/\D+/g, "").trim() ?? "";
                  const registryRecord = normalizedInn
                    ? registryByInn.get(normalizedInn) ?? null
                    : null;
                  const submissionMeta = getSubmissionStatusMeta(item.status);
                  const stopTone =
                    item.stopFactorsSummary?.toLowerCase().includes("не выявлены")
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-amber-50 text-amber-700";
                  const stopLabel = item.stopFactorsSummary?.toLowerCase().includes("не выявлены")
                    ? "Не выявлены"
                    : "Проверить";
                  const rowHref = `/procurements/submission/${item.id}`;

                  return (
                    <tr key={item.id} className="cursor-pointer hover:bg-slate-50/80">
                      <td className="px-4 py-4">
                        <a href={rowHref} className="block -mx-4 -my-4 px-4 py-4">
                          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${submissionMeta.tone}`}>
                            {submissionMeta.label}
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
                        <Link
                          href={buildTenderCustomerHref(item.customerName, item.customerInn)}
                          className="block -mx-4 -my-4 px-4 py-4 font-medium transition hover:text-[#0d5bd7]"
                        >
                          <div>{item.customerName ?? "Не определён"}</div>
                          {registryRecord ? (
                            <div className="mt-2">
                              <Link
                                href={`/registry/${registryRecord.id}`}
                                className="inline-flex rounded-full bg-rose-50 px-2.5 py-1 text-[11px] font-semibold text-rose-700 transition hover:bg-rose-100"
                              >
                                ТВАРИ!: {registryRecord.label}
                              </Link>
                            </div>
                          ) : null}
                        </Link>
                      </td>
                      <td className="px-4 py-4">
                        <a href={rowHref} className="block -mx-4 -my-4 px-4 py-4">
                          <div className="font-semibold text-[#081a4b]">
                            {formatCurrency(item.nmck ?? item.nmckWithoutVat)}
                          </div>
                          <div className="mt-2 max-w-xs text-xs leading-5 text-slate-500">
                            {submissionMeta.note}
                          </div>
                        </a>
                      </td>
                      <td className="px-4 py-4">
                        <a href={rowHref} className="block -mx-4 -my-4 px-4 py-4">
                          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${stopTone}`}>
                            {stopLabel}
                          </span>
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
