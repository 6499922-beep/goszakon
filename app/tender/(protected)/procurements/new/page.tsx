import { redirect } from "next/navigation";
import { getCurrentTenderUser } from "@/lib/admin-auth";
import { tenderHasCapability } from "@/lib/tender-permissions";
import { TenderAnalysisQueueRunner } from "@/app/tender/_components/tender-analysis-queue-runner";
import { TenderIntakeUploadForm } from "@/app/tender/_components/tender-intake-upload-form";
import { getPrisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function NewTenderProcurementPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const currentUser = await getCurrentTenderUser();

  if (!currentUser || !tenderHasCapability(currentUser.role, "procurement_create")) {
    redirect("/procurements");
  }

  const resolvedSearchParams = (await searchParams) ?? {};
  const uploadedRaw = resolvedSearchParams.uploaded;
  const uploadedProcurementId =
    typeof uploadedRaw === "string" ? Number(uploadedRaw) : null;

  const actorName =
    currentUser.name?.trim() || currentUser.email?.trim() || "Сотрудник";
  const prisma = getPrisma();
  const recentProcurements = await prisma.tenderProcurement.findMany({
    orderBy: [{ createdAt: "desc" }],
    take: 20,
    select: {
      id: true,
      title: true,
      procurementNumber: true,
      customerName: true,
      status: true,
      aiAnalysisStatus: true,
      stopFactorsSummary: true,
      createdAt: true,
    },
  });

  return (
    <main className="space-y-4">
      {uploadedProcurementId && Number.isInteger(uploadedProcurementId) && uploadedProcurementId > 0 ? (
        <TenderAnalysisQueueRunner procurementId={uploadedProcurementId} />
      ) : null}

      <section className="rounded-[1.5rem] border border-slate-200 bg-white px-5 py-3 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
              Шаг 1
            </div>
            <h1 className="mt-1 text-xl font-bold tracking-tight text-[#081a4b]">
              Загрузка документов и первичное распознавание
            </h1>
          </div>
          <div className="rounded-2xl bg-slate-100 px-4 py-2 text-sm text-slate-600">
            Сейчас настраиваем только первый этап
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="text-sm font-medium uppercase tracking-[0.14em] text-slate-400">
          Загрузка пакета документов
        </div>
        <div className="mt-2 text-lg font-semibold tracking-tight text-[#081a4b]">
          {uploadedProcurementId || recentProcurements.length > 0
            ? "Добавить ещё одну закупку"
            : "Загрузить первую закупку на распознавание"}
        </div>
        <div className="mt-4">
          <TenderIntakeUploadForm
            actorName={actorName}
            compact={Boolean(uploadedProcurementId || recentProcurements.length > 0)}
            resetToken={uploadedProcurementId ? String(uploadedProcurementId) : "empty"}
          />
        </div>
      </section>

      <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-sm font-medium uppercase tracking-[0.14em] text-slate-400">
              Загруженные закупки
            </div>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-[#081a4b]">
              Таблица распознавания
            </h2>
          </div>
          <div className="rounded-2xl bg-slate-100 px-4 py-2 text-sm text-slate-600">
            Сортировка: по дате добавления
          </div>
        </div>

        <div className="mt-5 overflow-hidden rounded-3xl border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Добавлена</th>
                <th className="px-4 py-3 font-medium">Номер закупки</th>
                <th className="px-4 py-3 font-medium">Заказчик</th>
                <th className="px-4 py-3 font-medium">Распознавание</th>
                <th className="px-4 py-3 font-medium">Стоп-факторы</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {recentProcurements.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-slate-500">
                    Пока ещё нет загруженных закупок.
                  </td>
                </tr>
              ) : (
                recentProcurements.map((item) => {
                  const recognitionLabel =
                    item.aiAnalysisStatus === "completed"
                      ? "Распознано"
                      : item.aiAnalysisStatus === "running"
                        ? "Идёт анализ"
                        : item.aiAnalysisStatus === "failed"
                          ? "Ошибка"
                          : item.aiAnalysisStatus === "needs_text"
                            ? "Нужна ручная проверка"
                            : "В очереди";
                  const recognitionTone =
                    item.aiAnalysisStatus === "completed"
                      ? "bg-emerald-50 text-emerald-700"
                      : item.aiAnalysisStatus === "running"
                        ? "bg-blue-50 text-blue-700"
                        : item.aiAnalysisStatus === "failed"
                          ? "bg-rose-50 text-rose-700"
                          : "bg-amber-50 text-amber-700";
                  const stopTone =
                    item.status === "STOPPED"
                      ? "bg-rose-50 text-rose-700"
                      : item.stopFactorsSummary?.toLowerCase().includes("не выявлены")
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-amber-50 text-amber-700";
                  const stopLabel =
                    item.status === "STOPPED"
                      ? "Есть стоп-факторы"
                      : item.stopFactorsSummary?.toLowerCase().includes("не выявлены")
                        ? "Не выявлены"
                        : "Проверить";
                  const rowHref = `/procurements/recognition/${item.id}`;
                  const stopHref =
                    item.status === "STOPPED"
                      ? `/procurements/recognition/${item.id}#stop-factors-result`
                      : rowHref;

                  return (
                    <tr
                      key={item.id}
                      className="cursor-pointer hover:bg-slate-50/80"
                    >
                      <td className="px-4 py-4 text-slate-600">
                        <a href={rowHref} className="block -mx-4 -my-4 px-4 py-4">
                          {new Intl.DateTimeFormat("ru-RU", {
                            day: "2-digit",
                            month: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          }).format(item.createdAt)}
                        </a>
                      </td>
                      <td className="px-4 py-4 font-semibold text-[#081a4b]">
                        <a href={rowHref} className="block -mx-4 -my-4 px-4 py-4">
                          {item.procurementNumber ?? "Не определён"}
                        </a>
                      </td>
                      <td className="px-4 py-4 text-slate-600">
                        <a href={rowHref} className="block -mx-4 -my-4 px-4 py-4">
                          {item.customerName ?? "Не определён"}
                        </a>
                      </td>
                      <td className="px-4 py-4">
                        <a href={rowHref} className="block -mx-4 -my-4 px-4 py-4">
                          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${recognitionTone}`}>
                            {recognitionLabel}
                          </span>
                        </a>
                      </td>
                      <td className="px-4 py-4">
                        <a
                          href={stopHref}
                          className="block -mx-4 -my-4 px-4 py-4"
                        >
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
