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
  const selectedQueue =
    typeof selectedQueueRaw === "string"
      ? (selectedQueueRaw as QueueKey)
      : getDefaultQueue(currentUser.role);

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
              <div className="mt-4 inline-flex rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white/90">
                Моя роль: {tenderUserRoleLabels[currentUser.role]}
              </div>
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
      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
        <div className="text-sm font-medium uppercase tracking-[0.14em] text-slate-400">
          Очереди по ролям и этапам
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          {queues.map((queue) => {
            const isActive = queue.key === selectedQueue;
            return (
              <Link
                key={queue.key}
                href={`/procurements?view=${queue.key}`}
                className={`rounded-2xl border px-4 py-3 text-sm transition ${
                  isActive
                    ? "border-[#0d5bd7] bg-[#0d5bd7] text-white"
                    : "border-slate-200 bg-white text-slate-700 hover:border-[#0d5bd7] hover:text-[#0d5bd7]"
                }`}
              >
                <div className="font-semibold">{queue.label}</div>
                <div className={`mt-1 text-xs ${isActive ? "text-white/80" : "text-slate-500"}`}>
                  {queue.description}
                </div>
                <div className={`mt-2 text-xs font-semibold ${isActive ? "text-white" : "text-slate-700"}`}>
                  {queueCounts.get(queue.key) ?? 0} шт.
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-sm font-medium uppercase tracking-[0.14em] text-slate-400">
            Список карточек
          </div>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-[#081a4b]">
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
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {filteredProcurements.map((item) => (
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
                  <td className="px-4 py-3 text-slate-600">
                    {belongsToQueue(item, "fas")
                      ? "Проверить ФАС-ветку"
                      : belongsToQueue(item, "submission")
                        ? "Готовить/подавать"
                        : belongsToQueue(item, "manager")
                          ? "Передать руководителю"
                          : belongsToQueue(item, "pricing")
                            ? "Просчитать"
                            : belongsToQueue(item, "analysis")
                              ? "Разобрать документацию"
                              : "Открыть карточку"}
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
