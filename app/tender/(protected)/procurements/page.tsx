import { TenderDecision, TenderFasReviewStatus, TenderUserRole } from "@prisma/client";
import { getPrisma } from "@/lib/prisma";
import { getCurrentTenderUser } from "@/lib/admin-auth";
import { tenderHasCapability } from "@/lib/tender-permissions";
import {
  formatTenderCurrency,
  formatTenderDate,
  tenderStatusLabels,
  tenderStatusTone,
} from "@/lib/tender-format";
import { tenderUserRoleLabels } from "@/lib/tender-users";
import Link from "next/link";
import { TenderAnalysisQueueRunner } from "@/app/tender/_components/tender-analysis-queue-runner";

export const dynamic = "force-dynamic";

type QueueKey =
  | "all"
  | "analysis"
  | "pricing"
  | "manager"
  | "submission"
  | "fas"
  | "stop";

function getDefaultQueue(role: TenderUserRole): QueueKey {
  switch (role) {
    case TenderUserRole.OPERATOR:
      return "analysis";
    case TenderUserRole.ANALYST:
      return "pricing";
    case TenderUserRole.SUBMITTER:
      return "submission";
    case TenderUserRole.FAS_SPECIALIST:
    case TenderUserRole.FAS_MANAGER:
      return "fas";
    case TenderUserRole.MANAGER:
      return "manager";
    default:
      return "all";
  }
}

function getUrgencySignals(item: {
  deadline: Date | null;
  status: string;
  aiAnalysisStatus: string | null;
  decision: TenderDecision | null;
  technicalItems: Array<{
    status: string;
    pricingReady: boolean;
    approximateUnitPrice: unknown;
  }>;
  procurementDocuments: Array<{ status: string }>;
  sourceDocuments: Array<{
    status: string;
    autofillStatus: string;
    draftContent: string | null;
  }>;
  fasReview?: { status: TenderFasReviewStatus } | null;
  companyProfile?: { name: string } | null;
}) {
  const signals: Array<{
    label: string;
    tone: string;
  }> = [];

  const now = new Date();
  if (item.deadline) {
    const hoursToDeadline = (item.deadline.getTime() - now.getTime()) / (1000 * 60 * 60);
    if (hoursToDeadline <= 24) {
      signals.push({ label: "Срок горит", tone: "bg-rose-50 text-rose-700" });
    } else if (hoursToDeadline <= 72) {
      signals.push({ label: "Срок близко", tone: "bg-amber-50 text-amber-700" });
    }
  }

  const needsManualReview =
    item.technicalItems.some(
      (technicalItem) =>
        technicalItem.status === "REVIEW" ||
        (technicalItem.pricingReady && technicalItem.approximateUnitPrice == null)
    ) ||
    item.procurementDocuments.some(
      (document) => document.status === "MISSING" || document.status === "REVIEW"
    ) ||
    item.sourceDocuments.some(
      (document) =>
        document.status === "READY_FOR_ANALYSIS" &&
        (document.autofillStatus === "NOT_ANALYZED" ||
          document.autofillStatus === "MANUAL_ONLY" ||
          !document.draftContent)
    ) ||
    item.fasReview?.status === TenderFasReviewStatus.MANUAL_REVIEW;

  if (needsManualReview) {
    signals.push({
      label: "Нужна ручная проверка",
      tone: "bg-amber-50 text-amber-700",
    });
  }

  if (
    item.aiAnalysisStatus === "completed" &&
    item.decision == null &&
    item.status !== "STOPPED" &&
    !needsManualReview
  ) {
    signals.push({
      label: "Ждёт руководителя",
      tone: "bg-violet-50 text-violet-700",
    });
  }

  if (
    item.decision === TenderDecision.SUBMIT &&
    item.companyProfile != null &&
    !needsManualReview &&
    item.procurementDocuments.length > 0
  ) {
    signals.push({
      label: "Готово к подаче",
      tone: "bg-emerald-50 text-emerald-700",
    });
  }

  if (item.fasReview?.status === TenderFasReviewStatus.POTENTIAL_COMPLAINT) {
    signals.push({
      label: "Есть ФАС-ветка",
      tone: "bg-rose-50 text-rose-700",
    });
  }

  return signals.slice(0, 3);
}

export default async function TenderProcurementsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const currentUser = await getCurrentTenderUser();
  if (!currentUser || !tenderHasCapability(currentUser.role, "procurements_list")) {
    return null;
  }
  const resolvedSearchParams = (await searchParams) ?? {};
  const selectedQueueRaw = resolvedSearchParams.view;
  const queuedRaw = resolvedSearchParams.queued;
  const uploadedRaw = resolvedSearchParams.uploaded;
  const selectedQueue =
    typeof selectedQueueRaw === "string"
      ? (selectedQueueRaw as QueueKey)
      : getDefaultQueue(currentUser.role);
  const queuedProcurementId =
    typeof queuedRaw === "string" ? Number(queuedRaw) : null;
  const uploadedProcurementId =
    typeof uploadedRaw === "string" ? Number(uploadedRaw) : null;

  const prisma = getPrisma();
  const procurements = await prisma.tenderProcurement.findMany({
    orderBy: { updatedAt: "desc" },
    take: 100,
    include: {
      technicalItems: {
        select: {
          status: true,
          pricingReady: true,
          approximateUnitPrice: true,
        },
      },
      procurementDocuments: {
        select: {
          status: true,
        },
      },
      sourceDocuments: {
        select: {
          status: true,
          autofillStatus: true,
          draftContent: true,
        },
      },
      fasReview: {
        select: {
          status: true,
        },
      },
      companyProfile: {
        select: {
          name: true,
        },
      },
    },
  });

  function belongsToQueue(item: (typeof procurements)[number], queue: QueueKey) {
    const aiCompleted = item.aiAnalysisStatus === "completed";
    const hasStop = item.status === "STOPPED";
    const hasPendingTechnical = item.technicalItems.some(
      (technicalItem) =>
        technicalItem.status === "REVIEW" ||
        (technicalItem.pricingReady && technicalItem.approximateUnitPrice == null)
    );
    const hasPendingDocs = item.procurementDocuments.some(
      (document) => document.status === "MISSING" || document.status === "REVIEW"
    );
    const hasPendingForms = item.sourceDocuments.some(
      (document) =>
        document.status === "READY_FOR_ANALYSIS" &&
        (document.autofillStatus === "NOT_ANALYZED" ||
          document.autofillStatus === "MANUAL_ONLY" ||
          !document.draftContent)
    );
    const hasSubmitDecision = item.decision === TenderDecision.SUBMIT;
    const readyForManager =
      aiCompleted && !hasStop && !hasPendingTechnical && item.decision == null;
    const readyForSubmission =
      hasSubmitDecision &&
      item.companyProfile != null &&
      !hasPendingDocs &&
      !hasPendingForms &&
      !hasPendingTechnical &&
      item.procurementDocuments.length > 0;
    const fasStatus = item.fasReview?.status;
    const fasNeedsWork =
      fasStatus === TenderFasReviewStatus.POTENTIAL_COMPLAINT ||
      fasStatus === TenderFasReviewStatus.MANUAL_REVIEW;

    switch (queue) {
      case "analysis":
        return !aiCompleted || item.status === "ANALYSIS";
      case "pricing":
        return aiCompleted && !hasStop && (hasPendingTechnical || item.status === "PRICING");
      case "manager":
        return readyForManager || item.status === "APPROVED";
      case "submission":
        return hasSubmitDecision || readyForSubmission || item.status === "READY";
      case "fas":
        return fasNeedsWork || item.decision === TenderDecision.FAS_COMPLAINT;
      case "stop":
        return hasStop || item.decision === TenderDecision.DECLINE;
      default:
        return true;
    }
  }

  const queues: Array<{
    key: QueueKey;
    label: string;
    description: string;
  }> = [
    { key: "all", label: "Все", description: "Полный реестр закупок" },
    {
      key: "analysis",
      label: "Анализ",
      description: "Новые и требующие первичного разбора",
    },
    {
      key: "pricing",
      label: "Просчёт",
      description: "Закупки с ТЗ, ценами и предпросчётом",
    },
    {
      key: "manager",
      label: "Руководителю",
      description: "Закупки, где нужно принять решение",
    },
    {
      key: "submission",
      label: "Подача",
      description: "Закупки, дошедшие до комплекта и подачи",
    },
    {
      key: "fas",
      label: "ФАС",
      description: "Ветка жалоб и спорных ФАС-кейсов",
    },
    { key: "stop", label: "Стоп", description: "Остановленные и отклонённые" },
  ];

  const queueCounts = new Map(
    queues.map((queue) => [
      queue.key,
      procurements.filter((item) => belongsToQueue(item, queue.key)).length,
    ])
  );

  const filteredProcurements = procurements.filter((item) =>
    belongsToQueue(item, selectedQueue)
  );

  return (
    <main className="space-y-8">
      {queuedProcurementId && Number.isInteger(queuedProcurementId) && queuedProcurementId > 0 ? (
        <TenderAnalysisQueueRunner
          procurementId={queuedProcurementId}
          view={selectedQueue}
        />
      ) : null}

      <section className="rounded-[1.75rem] border border-slate-200 bg-white px-5 py-3 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
              Реестр закупок
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-[#081a4b]">
                Закупки в работе
              </h1>
              <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600">
                Моя роль: {tenderUserRoleLabels[currentUser.role]}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {tenderHasCapability(currentUser.role, "procurement_create") ? (
              <Link
                href="/procurements/new"
                className="rounded-2xl bg-[#0d5bd7] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0a4db7]"
              >
                Добавить ещё одну закупку
              </Link>
            ) : null}
          </div>
        </div>
      </section>

      {uploadedProcurementId && Number.isInteger(uploadedProcurementId) && uploadedProcurementId > 0 ? (
        <section className="rounded-[1.75rem] border border-emerald-200 bg-emerald-50 px-5 py-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-sm font-semibold text-emerald-900">
                Закупка принята в анализ.
              </div>
              <div className="mt-1 text-sm text-emerald-800">
                Первичный разбор уже идёт в фоне. Можно сразу загружать следующую закупку или открыть эту карточку, если хочешь проверить статус.
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              {tenderHasCapability(currentUser.role, "procurement_create") ? (
                <Link
                  href="/procurements/new"
                  className="rounded-2xl bg-white px-4 py-2.5 text-sm font-semibold text-emerald-900 ring-1 ring-emerald-200 transition hover:bg-emerald-100"
                >
                  Добавить ещё одну закупку
                </Link>
              ) : null}
              <Link
                href={`/procurements/${uploadedProcurementId}`}
                className="rounded-2xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                Открыть карточку
              </Link>
            </div>
          </div>
        </section>
      ) : null}

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
          <div className="text-sm font-medium uppercase tracking-[0.14em] text-slate-400">
            Очереди по ролям и этапам
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {queues.map((queue) => {
              const isActive = queue.key === selectedQueue;
              return (
                <Link
                  key={queue.key}
                  href={`/procurements?view=${queue.key}`}
                  className={`rounded-2xl border px-4 py-4 text-sm transition ${
                    isActive
                      ? "border-[#0d5bd7] bg-[#0d5bd7] text-white shadow-sm"
                      : "border-slate-200 bg-white text-slate-700 hover:border-[#0d5bd7] hover:text-[#0d5bd7]"
                  }`}
                >
                  <div className="font-semibold">{queue.label}</div>
                  <div
                    className={`mt-1 text-xs leading-5 ${
                      isActive ? "text-white/80" : "text-slate-500"
                    }`}
                  >
                    {queue.description}
                  </div>
                  <div
                    className={`mt-3 text-xs font-semibold ${
                      isActive ? "text-white" : "text-slate-700"
                    }`}
                  >
                    {queueCounts.get(queue.key) ?? 0} шт.
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-sm font-medium uppercase tracking-[0.14em] text-slate-400">
              Список карточек
            </div>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-[#081a4b]">
              {queues.find((queue) => queue.key === selectedQueue)?.label ?? "Актуальные записи"}
            </h2>
          </div>

          <div className="rounded-2xl bg-slate-100 px-4 py-2 text-sm text-slate-600">
            {queues.find((queue) => queue.key === selectedQueue)?.description ??
              "Можно открыть закупку и сразу перейти к её структурной карточке."}
          </div>
        </div>

        {filteredProcurements.length === 0 ? (
          <div className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-500">
            В этой очереди пока пусто. Когда закупка дойдёт до этого этапа, она появится здесь.
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
                  <th className="px-4 py-3 font-medium">Следующий шаг</th>
                  <th className="px-4 py-3 font-medium">Сигналы</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {filteredProcurements.map((item) => {
                  const signals = getUrgencySignals(item);
                  const nextStepLabel = belongsToQueue(item, "fas")
                    ? "Проверить ФАС-ветку"
                    : belongsToQueue(item, "submission")
                      ? "Готовить/подавать"
                      : belongsToQueue(item, "manager")
                        ? "Передать руководителю"
                        : belongsToQueue(item, "pricing")
                          ? "Просчитать"
                          : belongsToQueue(item, "analysis")
                            ? "Разобрать документацию"
                            : "Открыть карточку";

                  return (
                    <tr key={item.id} className="transition hover:bg-slate-50/80">
                      <td className="px-4 py-4 font-medium text-[#081a4b]">
                        <Link
                          href={`/procurements/${item.id}`}
                          className="transition hover:text-[#0d5bd7]"
                        >
                          {item.title}
                        </Link>
                      </td>
                      <td className="px-4 py-4 text-slate-600">
                        {item.customerName ?? "—"}
                      </td>
                      <td className="px-4 py-4 text-slate-600">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${tenderStatusTone[item.status]}`}
                        >
                          {tenderStatusLabels[item.status]}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-slate-600">
                        {formatTenderDate(item.deadline)}
                      </td>
                      <td className="px-4 py-4 text-slate-600">
                        {formatTenderCurrency(item.nmckWithoutVat?.toString())}
                      </td>
                      <td className="px-4 py-4 text-slate-600">
                        <Link
                          href={`/procurements/${item.id}`}
                          className="inline-flex rounded-xl px-2 py-1 font-medium text-[#081a4b] transition hover:bg-slate-100 hover:text-[#0d5bd7]"
                        >
                          {nextStepLabel}
                        </Link>
                      </td>
                      <td className="px-4 py-4 text-slate-600">
                        <div className="flex flex-wrap gap-2">
                          {signals.length > 0 ? (
                            signals.map((signal) => (
                              <Link
                                key={signal.label}
                                href={`/procurements/${item.id}`}
                                className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold transition hover:scale-[1.02] hover:opacity-90 ${signal.tone}`}
                              >
                                {signal.label}
                              </Link>
                            ))
                          ) : (
                            <span className="text-xs text-slate-400">Без срочных сигналов</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
