import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentTenderUser } from "@/lib/admin-auth";
import { tenderHasCapability } from "@/lib/tender-permissions";
import { getPrisma } from "@/lib/prisma";
import { deleteTenderRecognitionAction } from "@/app/tender/actions";
import { formatTenderMoscowShortDateTime } from "@/lib/tender-format";
import { buildTenderCustomerHref } from "@/lib/tender-customers";
import { TenderProcurementStatus } from "@prisma/client";

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

function getPricingStatusMeta(item: {
  pricingStatus: string | null;
  pricingComment: string | null;
  pricingReviewedAt: Date | null;
}) {
  if (item.pricingStatus === "profitable") {
    return {
      label: "Просчитано",
      tone: "bg-emerald-50 text-emerald-700",
      note: "Предпросчёт сохранён, можно двигаться дальше.",
    };
  }

  if (item.pricingStatus === "low_margin") {
    return {
      label: "Низкая маржа",
      tone: "bg-amber-50 text-amber-700",
      note: item.pricingComment?.trim() || "Найдены цены, но рентабельность низкая.",
    };
  }

  if (item.pricingStatus === "not_found") {
    return {
      label: "Нет цен",
      tone: "bg-rose-50 text-rose-700",
      note: item.pricingComment?.trim() || "Ценовой ориентир пока не найден.",
    };
  }

  if (item.pricingReviewedAt) {
    return {
      label: "На ручном просчёте",
      tone: "bg-amber-50 text-amber-700",
      note: item.pricingComment?.trim() || "Требуется дополнительная проверка просчёта.",
    };
  }

  return {
    label: "Новый",
    tone: "bg-sky-50 text-sky-700",
    note: "Закупка передана из анализа и ждёт предпросчёта.",
  };
}

export default async function TenderPricingQueuePage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const currentUser = await getCurrentTenderUser();

  if (!currentUser || !tenderHasCapability(currentUser.role, "procurement_pricing")) {
    redirect("/procurements/new");
  }

  const resolvedSearchParams = (await searchParams) ?? {};
  const uploadedRaw = resolvedSearchParams.uploaded;
  const uploadedProcurementId =
    typeof uploadedRaw === "string" ? Number(uploadedRaw) : null;

  const prisma = getPrisma();
  const pricingProcurements = await prisma.tenderProcurement.findMany({
    where: {
      status: TenderProcurementStatus.PRICING,
    },
    orderBy: [{ createdAt: "desc" }],
    take: 50,
    select: {
      id: true,
      procurementNumber: true,
      customerName: true,
      customerInn: true,
      nmck: true,
      nmckWithoutVat: true,
      pricingStatus: true,
      pricingComment: true,
      pricingReviewedAt: true,
      stopFactorsSummary: true,
      createdAt: true,
    },
  });

  return (
    <main className="space-y-4">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-sm font-medium uppercase tracking-[0.14em] text-slate-400">
              Этап 2
            </div>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-[#081a4b]">
              Просчёт
            </h1>
            <div className="mt-2 text-sm leading-6 text-slate-500">
              Здесь собраны только те закупки, которые проверили на первом этапе и
              передали дальше на предпросчёт.
            </div>
          </div>
          {uploadedProcurementId ? (
            <div className="rounded-2xl bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">
              Закупка передана на просчёт.
            </div>
          ) : null}
        </div>
      </section>

      <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-sm font-medium uppercase tracking-[0.14em] text-slate-400">
              Закупки на просчёте
            </div>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-[#081a4b]">
              Таблица просчёта
            </h2>
          </div>
          <div className="rounded-2xl bg-slate-100 px-4 py-2 text-sm text-slate-600">
            Сортировка: по дате передачи
          </div>
        </div>

        <div className="mt-5 overflow-hidden rounded-3xl border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Статус</th>
                <th className="px-4 py-3 font-medium">Добавлена</th>
                <th className="px-4 py-3 font-medium">Номер закупки</th>
                <th className="px-4 py-3 font-medium">Заказчик</th>
                <th className="px-4 py-3 font-medium">НМЦК</th>
                <th className="px-4 py-3 font-medium">Стоп-факторы</th>
                <th className="px-4 py-3 text-right font-medium">Удалить</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {pricingProcurements.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-slate-500">
                    Пока на просчёт ничего не передано.
                  </td>
                </tr>
              ) : (
                pricingProcurements.map((item) => {
                  const pricingMeta = getPricingStatusMeta(item);
                  const stopTone =
                    item.stopFactorsSummary?.toLowerCase().includes("не выявлены")
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-amber-50 text-amber-700";
                  const stopLabel = item.stopFactorsSummary?.toLowerCase().includes("не выявлены")
                    ? "Не выявлены"
                    : "Проверить";
                  const rowHref = `/procurements/${item.id}#pricing-review`;

                  return (
                    <tr key={item.id} className="cursor-pointer hover:bg-slate-50/80">
                      <td className="px-4 py-4">
                        <a href={rowHref} className="block -mx-4 -my-4 px-4 py-4">
                          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${pricingMeta.tone}`}>
                            {pricingMeta.label}
                          </span>
                        </a>
                      </td>
                      <td className="px-4 py-4 text-slate-600">
                        <a href={rowHref} className="block -mx-4 -my-4 px-4 py-4">
                          {formatTenderMoscowShortDateTime(item.createdAt)}
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
                          {item.customerName ?? "Не определён"}
                        </Link>
                      </td>
                      <td className="px-4 py-4">
                        <a href={rowHref} className="block -mx-4 -my-4 px-4 py-4">
                          <div className="font-semibold text-[#081a4b]">
                            {formatCurrency(item.nmck ?? item.nmckWithoutVat)}
                          </div>
                          <div className="mt-2 max-w-xs text-xs leading-5 text-slate-500">
                            {pricingMeta.note}
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
                      <td className="px-4 py-4 text-right">
                        <form action={deleteTenderRecognitionAction}>
                          <input type="hidden" name="procurementId" value={item.id} />
                          <button
                            type="submit"
                            className="inline-flex items-center rounded-full border border-rose-200 bg-white px-3 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-50"
                          >
                            Удалить
                          </button>
                        </form>
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
