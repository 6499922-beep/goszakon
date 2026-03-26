import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentTenderUser } from "@/lib/admin-auth";
import { getPrisma } from "@/lib/prisma";
import { tenderHasCapability } from "@/lib/tender-permissions";

function formatCurrency(value: { toString(): string } | null | undefined) {
  if (value == null) return "Не определено";
  const parsed = Number(String(value).replace(",", "."));
  if (!Number.isFinite(parsed)) return String(value);
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 2,
  }).format(parsed);
}

function jsonListToStrings(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.map(String).map((item) => item.trim()).filter(Boolean);
}

function getAiAnalysisObject(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
}

type TenderEquipmentViewMode = "analysis" | "pricing" | "approval" | "submission";

export async function renderTenderRecognitionEquipmentPage({
  params,
  viewMode = "analysis",
}: {
  params: Promise<{ id: string }>;
  viewMode?: TenderEquipmentViewMode;
}) {
  const currentUser = await getCurrentTenderUser();
  const isPricingView = viewMode === "pricing";
  const isApprovalView = viewMode === "approval";
  const isSubmissionView = viewMode === "submission";
  const requiredCapability = isSubmissionView
    ? "procurement_submission"
    : isApprovalView
    ? "procurement_decision"
    : isPricingView
      ? "procurement_pricing"
      : "procurement_create";

  if (!currentUser || !tenderHasCapability(currentUser.role, requiredCapability)) {
    redirect("/procurements/new");
  }

  const { id } = await params;
  const procurementId = Number(id);

  if (!Number.isInteger(procurementId) || procurementId <= 0) {
    redirect("/procurements/new");
  }

  const prisma = getPrisma();
  const procurement = await prisma.tenderProcurement.findUnique({
    where: { id: procurementId },
    select: {
      id: true,
      title: true,
      procurementNumber: true,
      itemsCount: true,
      aiAnalysis: true,
      technicalItems: {
        orderBy: [{ lineNumber: "asc" }, { id: "asc" }],
        select: {
          id: true,
          lineNumber: true,
          requestedName: true,
          quantity: true,
          unit: true,
          identifiedProduct: true,
          identifiedBrand: true,
          identifiedModel: true,
          approximateUnitPrice: true,
          status: true,
        },
      },
    },
  });

  if (!procurement) {
    notFound();
  }

  const aiAnalysis = getAiAnalysisObject(procurement.aiAnalysis);
  const equipmentItems = jsonListToStrings(aiAnalysis?.equipment_items);

  const rows =
    procurement.technicalItems.length > 0
      ? procurement.technicalItems.map((item, index) => ({
          key: `tech-${item.id}`,
          index: item.lineNumber ?? index + 1,
          name:
            item.identifiedProduct?.trim() ||
            item.requestedName?.trim() ||
            "Не определено",
          details: [
            item.identifiedBrand ? `Бренд: ${item.identifiedBrand}` : null,
            item.identifiedModel ? `Модель: ${item.identifiedModel}` : null,
            item.quantity ? `Кол-во: ${item.quantity}${item.unit ? ` ${item.unit}` : ""}` : null,
          ]
            .filter(Boolean)
            .join(" • "),
          amount: formatCurrency(item.approximateUnitPrice),
        }))
      : equipmentItems.map((item, index) => ({
          key: `ai-${index}`,
          index: index + 1,
          name: item,
          details: "",
          amount: "Не определено автоматически",
        }));
  const resolvedItemsCount = Math.max(procurement.itemsCount ?? 0, rows.length);
  const backHref = isSubmissionView
    ? `/procurements/submission/${procurement.id}`
    : isApprovalView
    ? `/procurements/approval/${procurement.id}`
    : isPricingView
      ? `/procurements/pricing/${procurement.id}`
      : `/procurements/recognition/${procurement.id}`;

  return (
    <main className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <Link
          href={backHref}
          className="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
        >
          Назад к закупке
        </Link>
        <div className="text-sm text-slate-500">
          {procurement.procurementNumber
            ? `Закупка № ${procurement.procurementNumber}`
            : procurement.title}
        </div>
      </div>

      <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-500">
          Оборудование и позиции
        </div>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-[#081a4b]">
          Список оборудования по закупке
        </h1>
        <div className="mt-2 text-sm text-slate-600">
          Всего позиций: {resolvedItemsCount}
        </div>

        <div className="mt-5 overflow-hidden rounded-3xl border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr className="text-left text-slate-600">
                <th className="px-4 py-3 font-semibold">№</th>
                <th className="px-4 py-3 font-semibold">Оборудование</th>
                <th className="px-4 py-3 font-semibold">Детали</th>
                <th className="px-4 py-3 font-semibold">НМЦК / цена позиции</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {rows.length > 0 ? (
                rows.map((row) => (
                  <tr key={row.key} className="align-top">
                    <td className="px-4 py-3 font-semibold text-[#081a4b]">{row.index}</td>
                    <td className="px-4 py-3 text-slate-800">{row.name}</td>
                    <td className="px-4 py-3 text-slate-600">{row.details || "—"}</td>
                    <td className="px-4 py-3 text-slate-800">{row.amount}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-slate-500">
                    Список оборудования пока не удалось определить автоматически.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
