import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentTenderUser } from "@/lib/admin-auth";
import { tenderHasCapability } from "@/lib/tender-permissions";
import { TenderAnalysisQueueRunner } from "@/app/tender/_components/tender-analysis-queue-runner";
import { TenderIntakeUploadForm } from "@/app/tender/_components/tender-intake-upload-form";
import { getPrisma } from "@/lib/prisma";
import { deleteTenderRecognitionAction } from "@/app/tender/actions";
import { formatTenderMoscowShortDateTime } from "@/lib/tender-format";
import { buildTenderCustomerHref } from "@/lib/tender-customers";

export const dynamic = "force-dynamic";
const STALE_ANALYSIS_MINUTES = 20;

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

function getRecognitionStatusMeta(
  status: string | null,
  error: string | null,
  createdAt: Date,
  updatedAt: Date
) {
  const minutesFromCreation = Math.max(
    0,
    Math.round((Date.now() - createdAt.getTime()) / 60000)
  );
  const minutesFromUpdate = Math.max(
    0,
    Math.round((Date.now() - updatedAt.getTime()) / 60000)
  );

  if (status === "completed") {
    return {
      label: "Распознано",
      tone: "bg-emerald-50 text-emerald-700",
      note: "Первичный анализ завершён.",
    };
  }

  if (status === "running") {
    if (minutesFromUpdate >= STALE_ANALYSIS_MINUTES) {
      return {
        label: "Продлённый анализ",
        tone: "bg-violet-50 text-violet-700",
        note:
          "Анализ идёт дольше обычного, но ещё выполняется. Для крупных комплектов это может занимать до 15 минут.",
      };
    }

    return {
      label: "Идёт анализ",
      tone: "bg-blue-50 text-blue-700",
      note:
        minutesFromCreation <= 2
          ? "Система обрабатывает документы. Обычно это занимает 1-3 минуты."
          : minutesFromCreation <= 5
            ? "Анализ продолжается. Для средних комплектов обычно нужно до 5 минут."
            : "Идёт глубокий анализ. Для больших комплектов это может занимать до 10-15 минут.",
    };
  }

  if (status === "failed") {
    return {
      label: "Ошибка",
      tone: "bg-rose-50 text-rose-700",
      note: error?.trim() || "Не удалось завершить первичный анализ.",
    };
  }

  if (status === "needs_text") {
    return {
      label: "Не хватило текста",
      tone: "bg-amber-50 text-amber-700",
      note:
        error?.trim() ||
        "Из части файлов не удалось извлечь читаемый текст автоматически.",
    };
  }

  if (status === "queued" && minutesFromUpdate >= STALE_ANALYSIS_MINUTES) {
    return {
      label: "Повторный запуск",
      tone: "bg-indigo-50 text-indigo-700",
      note:
        "Система повторно запускает углублённый анализ после долгой обработки.",
    };
  }

  return {
    label: "В очереди",
    tone: "bg-amber-50 text-amber-700",
    note: "Закупка принята. Обычно старт анализа занимает до 1 минуты.",
  };
}

function isStaleRunningAnalysis(status: string | null, updatedAt: Date) {
  if (status !== "running") return false;

  const ageMinutes = Math.max(
    0,
    Math.round((Date.now() - updatedAt.getTime()) / 60000)
  );

  return ageMinutes >= STALE_ANALYSIS_MINUTES;
}

function getRecognitionStatusNote(note: string) {
  const normalized = note.replace(/\s+/g, " ").trim();
  if (!normalized) return null;

  if (normalized.includes("RAR-архив") || normalized.includes("ZIP-архив")) {
    return "Часть архива не разобралась автоматически. Нужно проверить вложенные файлы.";
  }

  if (normalized.includes("Не удалось автоматически извлечь текст")) {
    return "Из части файлов не удалось извлечь текст автоматически.";
  }

  if (normalized.includes("OpenAI API error")) {
    return "Ошибка AI-анализа. Нужно повторить запуск или проверить документы.";
  }

  if (normalized.length <= 120) return normalized;
  return `${normalized.slice(0, 117).trim()}...`;
}

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
        customerInn: true,
        nmck: true,
        nmckWithoutVat: true,
        status: true,
        aiAnalysisStatus: true,
        aiAnalysisError: true,
        stopFactorsSummary: true,
        createdAt: true,
        updatedAt: true,
    },
  });
  const inns = Array.from(
    new Set(
      recentProcurements
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
  const firstQueuedProcurement =
    recentProcurements.find(
      (item) =>
        item.aiAnalysisStatus === "queued" ||
        isStaleRunningAnalysis(item.aiAnalysisStatus, item.updatedAt)
    ) ?? null;
  const queueRunnerProcurementId =
    uploadedProcurementId && Number.isInteger(uploadedProcurementId) && uploadedProcurementId > 0
      ? uploadedProcurementId
      : firstQueuedProcurement?.id ?? null;

  return (
    <main className="space-y-4">
      {queueRunnerProcurementId ? (
        <TenderAnalysisQueueRunner procurementId={queueRunnerProcurementId} />
      ) : null}

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
              {recentProcurements.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-slate-500">
                    Пока ещё нет загруженных закупок.
                  </td>
                </tr>
              ) : (
                recentProcurements.map((item) => {
                  const normalizedInn = item.customerInn?.replace(/\D+/g, "").trim() ?? "";
                  const registryRecord = normalizedInn
                    ? registryByInn.get(normalizedInn) ?? null
                    : null;
                  const recognitionMeta = getRecognitionStatusMeta(
                    item.aiAnalysisStatus,
                    item.aiAnalysisError,
                    item.createdAt,
                    item.updatedAt
                  );
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
                      <td className="px-4 py-4">
                        <a href={rowHref} className="block -mx-4 -my-4 px-4 py-4">
                          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${recognitionMeta.tone}`}>
                            {recognitionMeta.label}
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
                            {item.nmck
                              ? "Начальная цена определена"
                              : item.nmckWithoutVat
                                ? "Определена цена без НДС"
                                : getRecognitionStatusNote(recognitionMeta.note) ?? "Не удалось определить автоматически"}
                          </div>
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
