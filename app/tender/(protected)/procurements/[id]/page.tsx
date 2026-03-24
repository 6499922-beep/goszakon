import Link from "next/link";
import { notFound } from "next/navigation";
import {
  TenderFasReviewStatus,
  TenderProcurementStatus,
  TenderUserRole,
} from "@prisma/client";
import {
  analyzeTenderProcurementAction,
  analyzeTenderSourceDocumentAction,
  buildTenderProcurementChecklistAction,
  buildTenderSourceDocumentDraftAction,
  buildTenderSourceDocumentFieldsAction,
  importTenderTechnicalItemsAction,
  markTenderDocumentsPreparedAction,
  markTenderSubmittedAction,
  prepareTenderSourceDocumentsForFillingAction,
  saveTenderProcurementDocumentAction,
  saveTenderStageCommentAction,
  saveTenderSourceDocumentAction,
  saveTenderTechnicalItemAction,
  saveTenderDecisionAction,
  saveTenderFasReviewAction,
  saveTenderPricingReviewAction,
  updateTenderProcurementDocumentStatusAction,
  updateTenderSubmissionDeskAction,
  updateTenderSourceDocumentStatusAction,
  updateTenderProcurementStatusAction,
} from "@/app/tender/actions";
import { getPrisma } from "@/lib/prisma";
import { getCurrentTenderUser } from "@/lib/admin-auth";
import { tenderHasCapability } from "@/lib/tender-permissions";
import {
  formatTenderCurrency,
  formatTenderDate,
  formatTenderNumber,
  tenderDecisionTone,
  tenderStatusLabels,
  tenderStatusTone,
} from "@/lib/tender-format";
import { tenderUserRoleLabels } from "@/lib/tender-users";
import {
  getDecisionLabel,
  getTenderProcessingStages,
  pricingStatusLabels,
} from "@/lib/tender-workflow";

export const dynamic = "force-dynamic";

const stageToneClasses = {
  green: {
    badge: "bg-emerald-50 text-emerald-700",
    card: "border-emerald-200 bg-emerald-50/60",
    title: "text-emerald-800",
  },
  yellow: {
    badge: "bg-amber-50 text-amber-700",
    card: "border-amber-200 bg-amber-50/60",
    title: "text-amber-800",
  },
  red: {
    badge: "bg-rose-50 text-rose-700",
    card: "border-rose-200 bg-rose-50/60",
    title: "text-rose-800",
  },
  blue: {
    badge: "bg-sky-50 text-sky-700",
    card: "border-sky-200 bg-sky-50/60",
    title: "text-sky-800",
  },
} as const;

const technicalItemTone = {
  EXPLICIT: "bg-emerald-50 text-emerald-700",
  IDENTIFIED: "bg-sky-50 text-sky-700",
  REVIEW: "bg-amber-50 text-amber-700",
  REJECTED: "bg-rose-50 text-rose-700",
} as const;

const technicalItemLabel = {
  EXPLICIT: "Модель указана",
  IDENTIFIED: "Подобрано по характеристикам",
  REVIEW: "Нужно уточнение",
  REJECTED: "Не подходит",
} as const;

const procurementDocumentTone = {
  REQUIRED: "bg-slate-100 text-slate-700",
  READY: "bg-emerald-50 text-emerald-700",
  MISSING: "bg-rose-50 text-rose-700",
  REVIEW: "bg-amber-50 text-amber-700",
} as const;

const procurementDocumentLabel = {
  REQUIRED: "Нужно подготовить",
  READY: "Готово",
  MISSING: "Не хватает",
  REVIEW: "Проверить",
} as const;

const sourceDocumentTone = {
  UPLOADED: "bg-slate-100 text-slate-700",
  WAIT_DECISION: "bg-amber-50 text-amber-700",
  READY_FOR_ANALYSIS: "bg-sky-50 text-sky-700",
  ANALYZED: "bg-emerald-50 text-emerald-700",
} as const;

const sourceDocumentLabel = {
  UPLOADED: "Загружен",
  WAIT_DECISION: "Ждёт решения",
  READY_FOR_ANALYSIS: "Можно разбирать",
  ANALYZED: "Разобран",
} as const;

const sourceDocumentFormTypeLabel = {
  UNKNOWN: "Тип пока не понятен",
  APPLICATION_FORM: "Форма заявки / согласие",
  PRICE_FORM: "Ценовая форма",
  TECHNICAL_PROPOSAL: "Техническое предложение",
  QUESTIONNAIRE: "Анкета участника",
  DECLARATION: "Декларация / сведения",
  CONTRACT_DRAFT: "Проект договора",
  TECHNICAL_SPEC: "Техническое задание",
  OTHER_APPENDIX: "Приложение / прочий файл",
} as const;

const sourceDocumentAutofillLabel = {
  NOT_ANALYZED: "Ещё не анализировали",
  PARTIALLY_READY: "Частично готово к заполнению",
  MANUAL_ONLY: "Нужна ручная работа",
  READY_TO_FILL: "Хорошо подходит для автозаполнения",
} as const;

const sourceDocumentAutofillTone = {
  NOT_ANALYZED: "bg-slate-100 text-slate-700",
  PARTIALLY_READY: "bg-sky-50 text-sky-700",
  MANUAL_ONLY: "bg-amber-50 text-amber-700",
  READY_TO_FILL: "bg-emerald-50 text-emerald-700",
} as const;

function renderList(value: unknown) {
  if (!Array.isArray(value) || value.length === 0) return null;

  return (
    <div className="mt-4 space-y-2">
      {value.map((item, index) => (
        <div
          key={`${String(item)}-${index}`}
          className="rounded-2xl bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700"
        >
          {String(item)}
        </div>
      ))}
    </div>
  );
}

const statusOptions: Array<{
  value: TenderProcurementStatus;
  label: string;
}> = [
  { value: TenderProcurementStatus.NEW, label: "Загружено" },
  { value: TenderProcurementStatus.ANALYSIS, label: "На анализе" },
  { value: TenderProcurementStatus.STOPPED, label: "Стоп" },
  { value: TenderProcurementStatus.PRICING, label: "На предпросчёте" },
  { value: TenderProcurementStatus.APPROVED, label: "Согласовано" },
  { value: TenderProcurementStatus.IN_PREPARATION, label: "Подготовка документов" },
  { value: TenderProcurementStatus.READY, label: "Документы готовы" },
  { value: TenderProcurementStatus.SUBMITTED, label: "Подано" },
  { value: TenderProcurementStatus.ARCHIVED, label: "Архив" },
];

function InfoCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="text-xs font-medium uppercase tracking-[0.14em] text-slate-400">
        {label}
      </div>
      <div className="mt-3 text-lg font-semibold tracking-tight text-[#081a4b]">
        {value}
      </div>
    </div>
  );
}

export default async function TenderProcurementDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const prisma = getPrisma();
  const procurement = await prisma.tenderProcurement.findUnique({
    where: { id: Number(id) },
    include: {
      companyProfile: {
        include: {
          documents: {
            orderBy: [{ documentType: "asc" }, { createdAt: "desc" }],
          },
        },
      },
      pricingReviews: {
        orderBy: { createdAt: "desc" },
        take: 5,
      },
      decisions: {
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          companyProfile: true,
        },
      },
      events: {
        orderBy: { createdAt: "desc" },
        take: 12,
      },
      technicalItems: {
        orderBy: [{ lineNumber: "asc" }, { createdAt: "desc" }],
      },
      procurementDocuments: {
        include: {
          companyDocument: true,
        },
        orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      },
      sourceDocuments: {
        orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      },
      fasReview: true,
      stageComments: {
        include: {
          author: true,
        },
        orderBy: [{ createdAt: "desc" }],
      },
      ruleMatches: {
        include: {
          rule: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!procurement) {
    notFound();
  }

  const companies = await prisma.tenderCompanyProfile.findMany({
    orderBy: [{ isPrimary: "desc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      inn: true,
      isPrimary: true,
    },
  });
  const currentUser = await getCurrentTenderUser();
  const role = currentUser?.role ?? null;
  const canWorkInitial = tenderHasCapability(role, "procurement_initial");
  const canWorkPricing = tenderHasCapability(role, "procurement_pricing");
  const canWorkDecision = tenderHasCapability(role, "procurement_decision");
  const canWorkDocuments = tenderHasCapability(role, "procurement_documents");
  const canWorkSubmission = tenderHasCapability(role, "procurement_submission");
  const canWorkComments = tenderHasCapability(role, "procurement_comments");
  const canWorkFas = tenderHasCapability(role, "fas_access");
  const canWorkSourceDocs = canWorkInitial || canWorkDocuments;
  const promptConfig = await prisma.tenderPromptConfig.findUnique({
    where: { key: "FAS_POTENTIAL_COMPLAINT" },
  });

  const processingStages = getTenderProcessingStages(procurement);
  const stageCommentsByKey = new Map(
    processingStages.map((stage) => [
      stage.key,
      procurement.stageComments.filter((comment) => comment.stageKey === stage.key),
    ])
  );
  const technicalItemStats = {
    total: procurement.technicalItems.length,
    explicit: procurement.technicalItems.filter((item) => item.status === "EXPLICIT")
      .length,
    identified: procurement.technicalItems.filter((item) => item.status === "IDENTIFIED")
      .length,
    review: procurement.technicalItems.filter((item) => item.status === "REVIEW").length,
    ready: procurement.technicalItems.filter((item) => item.pricingReady).length,
  };
  const pricingByItems = procurement.technicalItems.reduce(
    (acc, item) => {
      const quantity = Number(String(item.quantity ?? "").replace(",", "."));
      const unitPrice =
        item.approximateUnitPrice != null ? Number(item.approximateUnitPrice) : null;
      const hasQuantity = Number.isFinite(quantity) && quantity > 0;
      const lineTotal =
        unitPrice != null && Number.isFinite(unitPrice) && hasQuantity
          ? unitPrice * quantity
          : null;

      if (item.pricingReady) acc.ready += 1;
      if (item.approximateUnitPrice != null) acc.withPrice += 1;
      if (item.pricingReady && item.approximateUnitPrice == null) acc.pending += 1;
      if (lineTotal != null) acc.total += lineTotal;

      return acc;
    },
    { ready: 0, withPrice: 0, pending: 0, total: 0 }
  );
  const companyLibraryDocuments = procurement.companyProfile?.documents ?? [];
  const procurementDocumentStats = {
    total: procurement.procurementDocuments.length,
    ready: procurement.procurementDocuments.filter((item) => item.status === "READY")
      .length,
    missing: procurement.procurementDocuments.filter((item) => item.status === "MISSING")
      .length,
    review: procurement.procurementDocuments.filter((item) => item.status === "REVIEW")
      .length,
  };
  const sourceDocumentStats = {
    total: procurement.sourceDocuments.length,
    waiting: procurement.sourceDocuments.filter((item) => item.status === "WAIT_DECISION")
      .length,
    ready: procurement.sourceDocuments.filter(
      (item) => item.status === "READY_FOR_ANALYSIS"
    ).length,
    analyzed: procurement.sourceDocuments.filter((item) => item.status === "ANALYZED")
      .length,
  };
  const sourceFormStats = {
    readyToFill: procurement.sourceDocuments.filter(
      (item) => item.autofillStatus === "READY_TO_FILL"
    ).length,
    partial: procurement.sourceDocuments.filter(
      (item) => item.autofillStatus === "PARTIALLY_READY"
    ).length,
    manual: procurement.sourceDocuments.filter(
      (item) => item.autofillStatus === "MANUAL_ONLY"
    ).length,
    notAnalyzed: procurement.sourceDocuments.filter(
      (item) => item.autofillStatus === "NOT_ANALYZED"
    ).length,
  };
  const sourceDocumentsBlocking = procurement.sourceDocuments.filter(
    (item) =>
      item.status === "READY_FOR_ANALYSIS" &&
      (item.autofillStatus === "NOT_ANALYZED" ||
        item.autofillStatus === "MANUAL_ONLY" ||
        !item.draftContent)
  );
  const procurementDocumentsBlocking = procurement.procurementDocuments.filter(
    (item) => item.status === "MISSING" || item.status === "REVIEW"
  );
  const technicalItemsBlocking = procurement.technicalItems.filter(
    (item) =>
      item.status === "REVIEW" ||
      (item.pricingReady && item.approximateUnitPrice == null)
  );
  const hasLeaderSubmitDecision = procurement.decisions.some(
    (item) => item.decision === "SUBMIT"
  );
  const readyProcurementDocuments = procurement.procurementDocuments.filter(
    (item) => item.status === "READY"
  );
  const readySourceDocuments = procurement.sourceDocuments.filter(
    (item) =>
      (item.autofillStatus === "READY_TO_FILL" ||
        item.autofillStatus === "PARTIALLY_READY") &&
      (item.draftContent || item.structuredFields)
  );
  const submissionEvents = procurement.events.filter((item) =>
    ["DOCUMENTS_PREPARED", "SUBMITTED", "NOTE_ADDED"].includes(item.actionType)
  );
  const hasSelectedCompany = Boolean(procurement.companyProfileId);
  const canMoveToSubmission =
    hasLeaderSubmitDecision &&
    hasSelectedCompany &&
    procurementDocumentsBlocking.length === 0 &&
    sourceDocumentsBlocking.length === 0 &&
    technicalItemsBlocking.length === 0 &&
    procurement.procurementDocuments.length > 0;
  const submissionReadinessLabel = canMoveToSubmission
    ? "Можно выгружать на площадку"
    : hasLeaderSubmitDecision
      ? "Пакет ещё не готов к подаче"
      : "Сначала нужно решение «Подаём»";
  const submissionReadinessTone = canMoveToSubmission
    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
    : hasLeaderSubmitDecision
      ? "border-amber-200 bg-amber-50 text-amber-800"
      : "border-slate-200 bg-slate-50 text-[#081a4b]";
  const submissionBlockers: string[] = [];

  if (!hasLeaderSubmitDecision) {
    submissionBlockers.push("Руководитель ещё не принял решение «Подаём».");
  }

  if (!hasSelectedCompany) {
    submissionBlockers.push(
      "Не выбрана ваша компания, от которой будет подаваться заявка."
    );
  }

  if (procurement.procurementDocuments.length === 0) {
    submissionBlockers.push(
      "Чек-лист комплекта пустой: в пакет ещё не добавлены файлы для подачи."
    );
  }

  submissionBlockers.push(
    ...procurementDocumentsBlocking.slice(0, 5).map((document) =>
      document.status === "MISSING"
        ? `В комплекте не хватает файла «${document.title}».`
        : `По файлу «${document.title}» нужна ручная проверка.`
    )
  );

  submissionBlockers.push(
    ...sourceDocumentsBlocking.slice(0, 5).map((document) => {
      if (document.autofillStatus === "NOT_ANALYZED") {
        return `Форма «${document.title}» ещё не анализировалась.`;
      }

      if (document.autofillStatus === "MANUAL_ONLY") {
        return `Форма «${document.title}» требует в основном ручного заполнения.`;
      }

      return `По форме «${document.title}» ещё не собран черновик заполнения.`;
    })
  );

  submissionBlockers.push(
    ...technicalItemsBlocking.slice(0, 5).map((item) =>
      item.status === "REVIEW"
        ? `По позиции ТЗ «${item.requestedName}» нужно уточнение перед подачей.`
        : `По позиции ТЗ «${item.requestedName}» нет цены для предпросчёта.`
    )
  );
  const nextActionSummary = !hasLeaderSubmitDecision
    ? {
        title: "Нужно решение руководителя",
        description:
          "Сначала зафиксируй итог: подаём, не подаём, жалоба в ФАС или на доработку.",
      }
    : !hasSelectedCompany
      ? {
          title: "Нужно выбрать компанию участия",
          description:
            "После решения «Подаём» выбери, от какой вашей компании будет подаваться заявка.",
        }
      : technicalItemsBlocking.length > 0
        ? {
            title: "Нужно закрыть ТЗ и предпросчёт",
            description:
              "По части позиций ещё есть вопросы или не хватает цены. Без этого рано идти в финальную подготовку.",
          }
        : procurementDocumentsBlocking.length > 0
          ? {
              title: "Нужно довести комплект документов",
              description:
                "В пакете ещё есть отсутствующие файлы или позиции, требующие ручной проверки.",
            }
          : sourceDocumentsBlocking.length > 0
            ? {
                title: "Нужно добрать формы заказчика",
                description:
                  "Часть форм ещё не разобрана или по ним не собраны рабочие черновики заполнения.",
              }
            : canMoveToSubmission
              ? {
                  title: "Можно переходить к подаче",
                  description:
                    "Пакет выглядит собранным: назначай ответственного, проверяй итоговые файлы и выгружай на площадку.",
                }
              : {
                  title: "Нужна ручная сверка",
                  description:
                    "По карточке нет критичных блокеров, но стоит быстро проверить комплект перед финальной подачей.",
                };
  const sectionLinks = [
    ...(canWorkComments ? [{ href: "#workflow", label: "Этапы" }] : []),
    ...(canWorkInitial ? [{ href: "#source-docs", label: "Анализ" }] : []),
    ...(canWorkDocuments ? [{ href: "#pricing", label: "Исходные файлы" }] : []),
    ...(canWorkPricing ? [{ href: "#technical-items", label: "ТЗ" }] : []),
    ...(canWorkPricing ? [{ href: "#pricing-review", label: "Предпросчёт" }] : []),
    ...(canWorkFas ? [{ href: "#fas-branch", label: "Жалоба в ФАС" }] : []),
    ...(canWorkDocuments ? [{ href: "#documents-checklist", label: "Комплект" }] : []),
    ...(canWorkSubmission ? [{ href: "#submission", label: "Подача" }] : []),
  ];
  const fasStatusLabel = {
    NOT_STARTED: "ФАС-ветка не запускалась",
    NO_VIOLATION: "Нарушений для жалобы в ФАС не выявлено",
    POTENTIAL_COMPLAINT: "Выявлено потенциальное нарушение",
    MANUAL_REVIEW: "Нужна ручная проверка по жалобе",
  } as const;
  const fasStatusTone = {
    NOT_STARTED: "bg-slate-100 text-slate-700",
    NO_VIOLATION: "bg-emerald-50 text-emerald-700",
    POTENTIAL_COMPLAINT: "bg-rose-50 text-rose-700",
    MANUAL_REVIEW: "bg-amber-50 text-amber-700",
  } as const;
  const aiStatusLabel: Record<string, string> = {
    not_started: "Ещё не запускали",
    running: "Идёт анализ",
    completed: "Анализ завершён",
    failed: "Ошибка анализа",
  };
  const aiStatusTone: Record<string, string> = {
    not_started: "bg-slate-100 text-slate-700",
    running: "bg-sky-50 text-sky-700",
    completed: "bg-emerald-50 text-emerald-700",
    failed: "bg-rose-50 text-rose-700",
  };
  const fasPromptEditors: TenderUserRole[] = [
    TenderUserRole.ADMIN,
    TenderUserRole.FAS_MANAGER,
  ];
  const canEditFasPrompt =
    !!currentUser && fasPromptEditors.includes(currentUser.role);

  return (
    <main className="space-y-8">
      <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
        <div className="bg-[radial-gradient(circle_at_top_left,#0d5bd7_0%,#081a4b_58%,#06112e_100%)] px-8 py-8 text-white">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="max-w-4xl">
              <div className="text-sm font-medium uppercase tracking-[0.16em] text-white/60">
                Карточка закупки
              </div>
              <h1 className="mt-3 text-4xl font-bold tracking-tight">
                {procurement.title}
              </h1>
              <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-white/75">
                <span>{procurement.customerName ?? "Заказчик не указан"}</span>
                <span>•</span>
                <span>{procurement.procurementNumber ?? "Номер не указан"}</span>
                <span>•</span>
                <span>{procurement.platform ?? "Площадка не указана"}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <span
                className={`inline-flex h-fit rounded-full px-4 py-2 text-sm font-semibold ${tenderStatusTone[procurement.status]} bg-white/95`}
              >
                {tenderStatusLabels[procurement.status]}
              </span>
              <Link
                href="/procurements"
                className="inline-flex h-fit rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                К реестру
              </Link>
            </div>
          </div>
        </div>

        <div className="grid gap-4 bg-slate-50 px-8 py-6 md:grid-cols-2 xl:grid-cols-5">
          <InfoCard label="Окончание подачи" value={formatTenderDate(procurement.deadline)} />
          <InfoCard
            label="НМЦ без НДС"
            value={formatTenderCurrency(procurement.nmckWithoutVat?.toString())}
          />
          <InfoCard label="Количество позиций" value={String(procurement.itemsCount ?? "—")} />
          <InfoCard label="Вид закупки" value={procurement.purchaseType ?? "—"} />
          <InfoCard
            label="Компания участия"
            value={procurement.companyProfile?.name ?? "Не выбрана"}
          />
        </div>

        <div className="border-t border-slate-200 bg-white px-8 py-5">
          <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                Что делать дальше
              </div>
              <div className="mt-2 text-xl font-bold tracking-tight text-[#081a4b]">
                {nextActionSummary.title}
              </div>
              <div className="mt-2 text-sm leading-7 text-slate-600">
                {nextActionSummary.description}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                Быстрый маршрут по карточке
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {sectionLinks.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-[#0d5bd7] hover:text-[#0d5bd7]"
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
        <section className="space-y-8">
          <div
            id="workflow"
            className="scroll-mt-24 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="text-sm font-medium uppercase tracking-[0.14em] text-slate-400">
                  Этапы обработки
                </div>
                <div className="mt-2 text-2xl font-bold tracking-tight text-[#081a4b]">
                  Что система уже увидела и что нужно проверить
                </div>
              </div>
              <div className="rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-600">
                Маршрут: пройти / отказ / проверить вручную
              </div>
            </div>

            <div className="mt-6 grid gap-4">
              {processingStages.map((stage) => {
                const tone = stageToneClasses[stage.tone];
                const stageComments = stageCommentsByKey.get(stage.key) ?? [];

                return (
                  <div
                    key={stage.key}
                    className={`rounded-[28px] border p-5 ${tone.card}`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className={`text-sm font-semibold ${tone.title}`}>
                          {stage.title}
                        </div>
                        <div className="mt-2 text-lg font-semibold text-[#081a4b]">
                          {stage.result}
                        </div>
                      </div>
                      <div
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${tone.badge}`}
                      >
                        {stage.result}
                      </div>
                    </div>

                    {stage.findings.length > 0 ? (
                      <div className="mt-4">
                        <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                          Что увидела система
                        </div>
                        <div className="mt-2 space-y-2">
                          {stage.findings.map((finding) => (
                            <div
                              key={finding}
                              className="rounded-2xl border border-white/70 bg-white/70 px-4 py-3 text-sm leading-6 text-slate-700"
                            >
                              {finding}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {stage.questions.length > 0 ? (
                      <div className="mt-4">
                        <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                          Что нужно проверить человеку
                        </div>
                        <div className="mt-2 space-y-2">
                          {stage.questions.map((question) => (
                            <div
                              key={question}
                              className="rounded-2xl border border-white/70 bg-white/70 px-4 py-3 text-sm leading-6 text-slate-700"
                            >
                              {question}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    <div className="mt-5 border-t border-white/70 pt-5">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                          Комментарии по этапу
                        </div>
                        <div className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-slate-600">
                          {stageComments.length > 0
                            ? `${stageComments.length} комм.`
                            : "Пока без комментариев"}
                        </div>
                      </div>

                      <form
                        action={saveTenderStageCommentAction}
                        className="mt-3 space-y-3"
                      >
                        <input
                          type="hidden"
                          name="procurementId"
                          value={procurement.id}
                        />
                        <input type="hidden" name="stageKey" value={stage.key} />
                        <input type="hidden" name="stageTitle" value={stage.title} />
                        <textarea
                          name="body"
                          rows={3}
                          className="w-full rounded-2xl border border-white/80 bg-white/90 px-4 py-3 text-sm leading-6 text-slate-700 outline-none focus:border-[#0d5bd7] focus:ring-4 focus:ring-[#0d5bd7]/10"
                          placeholder="Оставь комментарий по этому этапу: что проверить, что решили вручную, где есть риск."
                        />
                        <button
                          type="submit"
                          className="rounded-2xl border border-white/80 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                        >
                          Сохранить комментарий
                        </button>
                      </form>

                      {stageComments.length > 0 ? (
                        <div className="mt-4 space-y-3">
                          {stageComments.map((comment) => (
                            <div
                              key={comment.id}
                              className="rounded-2xl border border-white/80 bg-white/80 px-4 py-4"
                            >
                              <div className="flex flex-wrap items-center justify-between gap-3">
                                <div className="text-sm font-semibold text-[#081a4b]">
                                  {comment.authorName ??
                                    comment.author?.name ??
                                    comment.author?.email ??
                                    "Сотрудник"}
                                </div>
                                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                                  {comment.authorRole ? (
                                    <span className="rounded-full bg-slate-100 px-2 py-1 font-semibold text-slate-600">
                                      {tenderUserRoleLabels[comment.authorRole]}
                                    </span>
                                  ) : null}
                                  <span>
                                    {new Intl.DateTimeFormat("ru-RU", {
                                      dateStyle: "short",
                                      timeStyle: "short",
                                    }).format(comment.createdAt)}
                                  </span>
                                </div>
                              </div>
                              <div className="mt-2 text-sm leading-7 text-slate-700">
                                {comment.body}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {canWorkDecision ? (
            <div
              id="source-docs"
              className="scroll-mt-24 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"
            >
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-sm font-medium uppercase tracking-[0.14em] text-slate-400">
                  Статусный workflow
                </div>
                <div className="mt-2 text-2xl font-bold tracking-tight text-[#081a4b]">
                  Управление этапом закупки
                </div>
              </div>
              <span
                className={`inline-flex rounded-full px-4 py-2 text-sm font-semibold ${tenderStatusTone[procurement.status]}`}
              >
                {tenderStatusLabels[procurement.status]}
              </span>
            </div>

            <p className="mt-3 text-sm leading-7 text-slate-600">
              Здесь можно вручную перевести закупку на нужный этап. Каждый переход
              попадёт в историю действий, чтобы потом было видно, кто и почему
              изменил маршрут.
            </p>

            <form action={updateTenderProcurementStatusAction} className="mt-5 space-y-4">
              <input type="hidden" name="procurementId" value={procurement.id} />
              <input type="hidden" name="actorName" value="Сотрудник" />

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <div className="mb-2 text-sm font-medium text-slate-700">
                    Новый статус
                  </div>
                  <select
                    name="status"
                    defaultValue={procurement.status}
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#0d5bd7] focus:ring-4 focus:ring-[#0d5bd7]/10"
                  >
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <div className="mb-2 text-sm font-medium text-slate-700">
                    Комментарий
                  </div>
                  <input
                    name="note"
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#0d5bd7] focus:ring-4 focus:ring-[#0d5bd7]/10"
                    placeholder="Почему переводим на этот этап"
                  />
                </label>
              </div>

              <button
                type="submit"
                className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Обновить статус
              </button>
            </form>
            </div>
          ) : null}

          {canWorkInitial ? (
            <div
              id="documents-checklist"
              className="scroll-mt-24 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"
            >
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-sm font-medium uppercase tracking-[0.14em] text-slate-400">
                  Выжимка
                </div>
                <h2 className="mt-2 text-2xl font-bold tracking-tight text-[#081a4b]">
                  Первичный анализ закупки
                </h2>
              </div>
            </div>

            <div className="mt-5 rounded-3xl bg-slate-50 p-5 text-sm leading-7 text-slate-700">
              {procurement.summary ?? "Сводка пока не заполнена."}
            </div>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <div className="rounded-3xl border border-slate-200 p-5">
                <div className="text-sm font-semibold text-[#081a4b]">
                  Критерии отбора
                </div>
                <div className="mt-3 text-sm leading-7 text-slate-600">
                  {procurement.selectionCriteria ?? "Не заполнено"}
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 p-5">
                <div className="text-sm font-semibold text-[#081a4b]">
                  Стоп-факторы
                </div>
                <div className="mt-3 text-sm leading-7 text-slate-600">
                  {procurement.stopFactorsSummary ?? "Проверка пока не внесена"}
                </div>
              </div>
            </div>
            </div>
          ) : null}

          <div
            id="technical-items"
            className="scroll-mt-24 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="text-sm font-medium uppercase tracking-[0.14em] text-slate-400">
              Документы
            </div>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-[#081a4b]">
              Что нужно до подачи
            </h2>
            {renderList(procurement.requiredDocuments) ?? (
              <div className="mt-5 rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
                Список документов пока не заполнен.
              </div>
            )}
          </div>

          {canWorkSourceDocs ? (
            <div
              id="pricing"
              className="scroll-mt-24 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"
            >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="text-sm font-medium uppercase tracking-[0.14em] text-slate-400">
                  Исходная документация
                </div>
                <h2 className="mt-2 text-2xl font-bold tracking-tight text-[#081a4b]">
                  Файлы закупки, которые потом будем разбирать
                </h2>
              </div>
              <div className="rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-600">
                Анализ форм запускаем после решения «Подаём»
              </div>
            </div>

            <p className="mt-3 text-sm leading-7 text-slate-600">
              На этом этапе мы не пытаемся заранее заполнить формы заказчика. Мы
              просто фиксируем, какие исходные файлы пришли в составе закупки, и
              готовим их к разбору после согласования подачи.
            </p>

            <form action={prepareTenderSourceDocumentsForFillingAction} className="mt-4">
              <input type="hidden" name="procurementId" value={procurement.id} />
              <input type="hidden" name="actorName" value="Система" />
              <button
                type="submit"
                className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                После решения «Подаём» перевести формы в разбор
              </button>
            </form>

            <div className="mt-5 grid gap-3 md:grid-cols-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                  Всего файлов
                </div>
                <div className="mt-2 text-2xl font-bold tracking-tight text-[#081a4b]">
                  {sourceDocumentStats.total}
                </div>
              </div>
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4">
                <div className="text-xs font-semibold uppercase tracking-[0.12em] text-amber-700">
                  Ждут решения
                </div>
                <div className="mt-2 text-2xl font-bold tracking-tight text-amber-800">
                  {sourceDocumentStats.waiting}
                </div>
              </div>
              <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-4">
                <div className="text-xs font-semibold uppercase tracking-[0.12em] text-sky-700">
                  Можно разбирать
                </div>
                <div className="mt-2 text-2xl font-bold tracking-tight text-sky-800">
                  {sourceDocumentStats.ready}
                </div>
              </div>
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4">
                <div className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-700">
                  Уже разобраны
                </div>
                <div className="mt-2 text-2xl font-bold tracking-tight text-emerald-800">
                  {sourceDocumentStats.analyzed}
                </div>
              </div>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-4">
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4">
                <div className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-700">
                  Хорошо подходят
                </div>
                <div className="mt-2 text-2xl font-bold tracking-tight text-emerald-800">
                  {sourceFormStats.readyToFill}
                </div>
              </div>
              <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-4">
                <div className="text-xs font-semibold uppercase tracking-[0.12em] text-sky-700">
                  Частично готовы
                </div>
                <div className="mt-2 text-2xl font-bold tracking-tight text-sky-800">
                  {sourceFormStats.partial}
                </div>
              </div>
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4">
                <div className="text-xs font-semibold uppercase tracking-[0.12em] text-amber-700">
                  Нужна ручная работа
                </div>
                <div className="mt-2 text-2xl font-bold tracking-tight text-amber-800">
                  {sourceFormStats.manual}
                </div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                  Ещё не разобраны
                </div>
                <div className="mt-2 text-2xl font-bold tracking-tight text-[#081a4b]">
                  {sourceFormStats.notAnalyzed}
                </div>
              </div>
            </div>

            {sourceDocumentsBlocking.length > 0 ? (
              <div className="mt-5 rounded-3xl border border-amber-200 bg-amber-50 p-5">
                <div className="text-sm font-semibold text-amber-900">
                  Что сейчас ещё тормозит подготовку форм
                </div>
                <div className="mt-3 space-y-2">
                  {sourceDocumentsBlocking.slice(0, 5).map((document) => (
                    <div
                      key={document.id}
                      className="rounded-2xl border border-amber-100 bg-white px-4 py-3 text-sm leading-6 text-slate-700"
                    >
                      <span className="font-semibold text-slate-900">{document.title}.</span>{" "}
                      {document.autofillStatus === "NOT_ANALYZED"
                        ? "Файл ещё не анализировали как форму."
                        : document.autofillStatus === "MANUAL_ONLY"
                          ? "По файлу ожидается в основном ручная работа."
                          : "По файлу ещё не собран черновик заполнения."}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            <form action={saveTenderSourceDocumentAction} className="mt-6 space-y-4 rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <input type="hidden" name="procurementId" value={procurement.id} />
              <input type="hidden" name="actorName" value="Сотрудник" />

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <div className="mb-2 text-sm font-medium text-slate-700">Название файла</div>
                  <input
                    name="title"
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#0d5bd7] focus:ring-4 focus:ring-[#0d5bd7]/10"
                    placeholder="Например: Приложение №1. Форма заявки"
                  />
                </label>
                <label className="block">
                  <div className="mb-2 text-sm font-medium text-slate-700">Имя файла</div>
                  <input
                    name="fileName"
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#0d5bd7] focus:ring-4 focus:ring-[#0d5bd7]/10"
                    placeholder="Например: prilozhenie_1_zayavka.docx"
                  />
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <div className="mb-2 text-sm font-medium text-slate-700">Тип файла</div>
                  <input
                    name="documentKind"
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#0d5bd7] focus:ring-4 focus:ring-[#0d5bd7]/10"
                    placeholder="ТЗ / форма заявки / проект договора / таблица цен"
                  />
                </label>
                <label className="block">
                  <div className="mb-2 text-sm font-medium text-slate-700">Статус</div>
                  <select
                    name="status"
                    defaultValue="WAIT_DECISION"
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#0d5bd7] focus:ring-4 focus:ring-[#0d5bd7]/10"
                  >
                    <option value="UPLOADED">Загружен</option>
                    <option value="WAIT_DECISION">Ждёт решения</option>
                    <option value="READY_FOR_ANALYSIS">Можно разбирать</option>
                    <option value="ANALYZED">Разобран</option>
                  </select>
                </label>
              </div>

                <label className="block">
                  <div className="mb-2 text-sm font-medium text-slate-700">Комментарий</div>
                  <textarea
                    name="note"
                    className="min-h-24 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm leading-7 outline-none transition focus:border-[#0d5bd7] focus:ring-4 focus:ring-[#0d5bd7]/10"
                    placeholder="Например: форму заполняем только после решения руководителя о подаче."
                  />
                </label>

                <label className="block">
                  <div className="mb-2 text-sm font-medium text-slate-700">
                    Текст или фрагмент формы
                  </div>
                  <textarea
                    name="contentSnippet"
                    className="min-h-28 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm leading-7 outline-none transition focus:border-[#0d5bd7] focus:ring-4 focus:ring-[#0d5bd7]/10"
                    placeholder="Сюда можно вставить кусок формы заказчика: названия полей, таблицу или фрагмент текста, чтобы система поняла, что именно можно заполнять автоматически."
                  />
                </label>

              <button
                type="submit"
                className="rounded-2xl bg-[#081a4b] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0d2568]"
              >
                Добавить исходный файл
              </button>
            </form>

            {procurement.sourceDocuments.length > 0 ? (
              <div className="mt-6 space-y-4">
                {procurement.sourceDocuments.map((document) => (
                  <div
                    key={document.id}
                    className="rounded-3xl border border-slate-200 bg-slate-50 p-5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold text-[#081a4b]">
                          {document.title}
                        </div>
                        <div className="mt-2 text-sm text-slate-500">
                          {document.documentKind ?? "Тип не указан"}
                          {document.fileName ? ` • ${document.fileName}` : ""}
                        </div>
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${sourceDocumentTone[document.status]}`}
                      >
                        {sourceDocumentLabel[document.status]}
                      </span>
                    </div>

                    {document.note ? (
                      <div className="mt-4 rounded-2xl bg-white px-4 py-3 text-sm leading-6 text-slate-700">
                        <span className="font-semibold text-slate-900">Комментарий:</span>{" "}
                        {document.note}
                      </div>
                    ) : null}

                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                      <div className="rounded-2xl bg-white px-4 py-3 text-sm leading-6 text-slate-700">
                        <span className="font-semibold text-slate-900">Что это за файл:</span>{" "}
                        {
                          sourceDocumentFormTypeLabel[
                            document.formType as keyof typeof sourceDocumentFormTypeLabel
                          ]
                        }
                      </div>
                      <div
                        className={`rounded-2xl px-4 py-3 text-sm leading-6 ${
                          sourceDocumentAutofillTone[
                            document.autofillStatus as keyof typeof sourceDocumentAutofillTone
                          ]
                        }`}
                      >
                        <span className="font-semibold">Готовность к автозаполнению:</span>{" "}
                        {
                          sourceDocumentAutofillLabel[
                            document.autofillStatus as keyof typeof sourceDocumentAutofillLabel
                          ]
                        }
                      </div>
                    </div>

                    {document.extractedSummary ? (
                      <div className="mt-4 rounded-2xl bg-white px-4 py-3 text-sm leading-6 text-slate-700">
                        <span className="font-semibold text-slate-900">Что поняла система:</span>{" "}
                        {document.extractedSummary}
                      </div>
                    ) : null}

                    {Array.isArray(document.extractedFields) &&
                    document.extractedFields.length > 0 ? (
                      <div className="mt-4 rounded-2xl bg-white px-4 py-4">
                        <div className="text-sm font-semibold text-slate-900">
                          Что можно подставить автоматически
                        </div>
                        <div className="mt-3 space-y-3">
                          {document.extractedFields.map((field, index) => {
                            const item =
                              typeof field === "object" && field !== null
                                ? (field as Record<string, unknown>)
                                : null;
                            if (!item) return null;

                            return (
                              <div
                                key={`${String(item.label)}-${index}`}
                                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700"
                              >
                                <div className="font-semibold text-slate-900">
                                  {String(item.label ?? "Поле")}
                                </div>
                                <div className="mt-1">{String(item.value ?? "—")}</div>
                                <div className="mt-1 text-xs text-slate-500">
                                  Источник: {String(item.source ?? "система")}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : null}

                    {document.reviewQuestion ? (
                      <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
                        <span className="font-semibold">Что нужно проверить человеку:</span>{" "}
                        {document.reviewQuestion}
                      </div>
                    ) : null}

                    {document.autofillStatus === "READY_TO_FILL" &&
                    document.draftContent &&
                    Array.isArray(document.structuredFields) &&
                    document.structuredFields.length > 0 ? (
                      <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-900">
                        Форма доведена до рабочего черновика: можно открывать документ
                        заказчика и переносить значения по таблице полей.
                      </div>
                    ) : null}

                    <form action={analyzeTenderSourceDocumentAction} className="mt-4">
                      <input type="hidden" name="procurementId" value={procurement.id} />
                      <input type="hidden" name="sourceDocumentId" value={document.id} />
                      <input type="hidden" name="actorName" value="Система" />
                      <button
                        type="submit"
                        className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                      >
                        Проанализировать файл как форму заказчика
                      </button>
                    </form>

                    <form action={buildTenderSourceDocumentDraftAction} className="mt-3">
                      <input type="hidden" name="procurementId" value={procurement.id} />
                      <input type="hidden" name="sourceDocumentId" value={document.id} />
                      <input type="hidden" name="actorName" value="Система" />
                      <button
                        type="submit"
                        className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                      >
                        Собрать черновик заполнения
                      </button>
                    </form>

                    <form action={buildTenderSourceDocumentFieldsAction} className="mt-3">
                      <input type="hidden" name="procurementId" value={procurement.id} />
                      <input type="hidden" name="sourceDocumentId" value={document.id} />
                      <input type="hidden" name="actorName" value="Система" />
                      <button
                        type="submit"
                        className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                      >
                        Собрать таблицу полей формы
                      </button>
                    </form>

                    {Array.isArray(document.structuredFields) &&
                    document.structuredFields.length > 0 ? (
                      <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200">
                        <div className="bg-slate-900 px-4 py-3 text-sm font-semibold text-white">
                          Поля формы для переноса
                        </div>
                        <div className="divide-y divide-slate-200 bg-white">
                          {document.structuredFields.map((field, index) => {
                            const item =
                              typeof field === "object" && field !== null
                                ? (field as Record<string, unknown>)
                                : null;
                            if (!item) return null;

                            return (
                              <div
                                key={`${String(item.fieldName)}-${index}`}
                                className="grid gap-3 px-4 py-4 md:grid-cols-[0.9fr_1.2fr_0.7fr]"
                              >
                                <div>
                                  <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                                    Поле
                                  </div>
                                  <div className="mt-1 text-sm font-semibold text-slate-900">
                                    {String(item.fieldName ?? "—")}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                                    Значение
                                  </div>
                                  <div className="mt-1 text-sm leading-6 text-slate-700">
                                    {String(item.suggestedValue ?? "—")}
                                  </div>
                                  <div className="mt-1 text-xs text-slate-500">
                                    Источник: {String(item.source ?? "система")}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                                    Режим
                                  </div>
                                  <div className="mt-1 text-sm font-semibold text-slate-900">
                                    {String(item.fillMode ?? "—")}
                                  </div>
                                  <div className="mt-1 text-xs leading-5 text-slate-500">
                                    {String(item.comment ?? "")}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : null}

                    {document.draftContent ? (
                      <div className="mt-4 rounded-2xl bg-[#081a4b] px-4 py-4 text-sm leading-7 text-white">
                        <div className="text-sm font-semibold text-white">
                          Черновик заполнения формы
                        </div>
                        <pre className="mt-3 whitespace-pre-wrap font-sans text-sm leading-7 text-white/90">
                          {document.draftContent}
                        </pre>
                      </div>
                    ) : null}

                    <form
                      action={updateTenderSourceDocumentStatusAction}
                      className="mt-4 grid gap-4 md:grid-cols-[0.8fr_1.2fr_auto]"
                    >
                      <input type="hidden" name="procurementId" value={procurement.id} />
                      <input type="hidden" name="sourceDocumentId" value={document.id} />
                      <input type="hidden" name="actorName" value="Сотрудник" />

                      <select
                        name="status"
                        defaultValue={document.status}
                        className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#0d5bd7] focus:ring-4 focus:ring-[#0d5bd7]/10"
                      >
                        <option value="UPLOADED">Загружен</option>
                        <option value="WAIT_DECISION">Ждёт решения</option>
                        <option value="READY_FOR_ANALYSIS">Можно разбирать</option>
                        <option value="ANALYZED">Разобран</option>
                      </select>

                      <input
                        name="note"
                        defaultValue={document.note ?? ""}
                        className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#0d5bd7] focus:ring-4 focus:ring-[#0d5bd7]/10"
                        placeholder="Что делать с этим файлом дальше"
                      />

                      <button
                        type="submit"
                        className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                      >
                        Обновить
                      </button>
                    </form>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm leading-7 text-slate-500">
                Пока сюда не занесены исходные файлы закупки. Следующий рабочий шаг
                для сотрудника — отмечать здесь формы, ТЗ, проект договора и прочие
                приложения, которые позже будут идти в разбор после решения о подаче.
              </div>
            )}
            </div>
          ) : null}

          {canWorkFas ? (
            <div
              id="fas-branch"
              className="scroll-mt-24 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"
            >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="text-sm font-medium uppercase tracking-[0.14em] text-slate-400">
                  Параллельная ветка
                </div>
                <h2 className="mt-2 text-2xl font-bold tracking-tight text-[#081a4b]">
                  Потенциальная жалоба в ФАС
                </h2>
              </div>
              <span
                className={`rounded-full px-4 py-2 text-xs font-semibold ${
                  fasStatusTone[
                    procurement.fasReview?.status ?? TenderFasReviewStatus.NOT_STARTED
                  ]
                }`}
              >
                {fasStatusLabel[
                  procurement.fasReview?.status ?? TenderFasReviewStatus.NOT_STARTED
                ]}
              </span>
            </div>

            <p className="mt-3 text-sm leading-7 text-slate-600">
              Эта ветка работает на той же документации, но по отдельному ФАС-промту.
              Если явных нарушений с высокой вероятностью обоснования нет, система
              должна прямо это сказать и не выдумывать основания. Если есть сомнения,
              кейс уходит специалисту по жалобам ФАС.
            </p>

            <div className="mt-5 grid gap-4 xl:grid-cols-[1fr_1.1fr]">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                  ФАС-промт для этого анализа
                </div>
                <pre className="mt-3 whitespace-pre-wrap font-sans text-sm leading-7 text-slate-700">
                  {promptConfig?.body ??
                    "ФАС-промт ещё не настроен. Его может задать Руководитель ФАС или администратор."}
                </pre>

                {canEditFasPrompt ? (
                  <a
                    href="/fas"
                    className="mt-4 inline-flex rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                  >
                    Открыть настройки ФАС-ветки
                  </a>
                ) : null}
              </div>

              <div className="rounded-3xl border border-slate-200 p-5">
                <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                  Результат по этой закупке
                </div>

                <form action={saveTenderFasReviewAction} className="mt-4 space-y-4">
                  <input type="hidden" name="procurementId" value={procurement.id} />

                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="block">
                      <div className="mb-2 text-sm font-medium text-slate-700">
                        Итог ФАС-проверки
                      </div>
                      <select
                        name="status"
                        defaultValue={
                          procurement.fasReview?.status ??
                          TenderFasReviewStatus.NOT_STARTED
                        }
                        className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-[#0d5bd7] focus:ring-4 focus:ring-[#0d5bd7]/10"
                      >
                        <option value="NOT_STARTED">Ещё не запускали</option>
                        <option value="NO_VIOLATION">
                          Нарушений для жалобы не выявлено
                        </option>
                        <option value="POTENTIAL_COMPLAINT">
                          Есть потенциальная жалоба в ФАС
                        </option>
                        <option value="MANUAL_REVIEW">
                          Нужна ручная проверка по жалобе
                        </option>
                      </select>
                    </label>

                    <label className="block">
                      <div className="mb-2 text-sm font-medium text-slate-700">
                        Ответственный по ФАС
                      </div>
                      <input
                        name="assignedTo"
                        defaultValue={procurement.fasReview?.assignedTo ?? ""}
                        className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-[#0d5bd7] focus:ring-4 focus:ring-[#0d5bd7]/10"
                        placeholder="Например, специалист по жалобам ФАС"
                      />
                    </label>
                  </div>

                  <label className="block">
                    <div className="mb-2 text-sm font-medium text-slate-700">
                      Какое нарушение найдено
                    </div>
                    <input
                      name="findingTitle"
                      defaultValue={procurement.fasReview?.findingTitle ?? ""}
                      className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-[#0d5bd7] focus:ring-4 focus:ring-[#0d5bd7]/10"
                      placeholder="Например, ограничение конкуренции, товарный знак, дискриминационное требование"
                    />
                  </label>

                  <label className="block">
                    <div className="mb-2 text-sm font-medium text-slate-700">
                      Основание и привязка к документации
                    </div>
                    <textarea
                      name="findingBasis"
                      rows={4}
                      defaultValue={procurement.fasReview?.findingBasis ?? ""}
                      className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm leading-7 outline-none focus:border-[#0d5bd7] focus:ring-4 focus:ring-[#0d5bd7]/10"
                      placeholder="Укажи конкретный пункт документации и почему это выглядит как нарушение."
                    />
                  </label>

                  <label className="block">
                    <div className="mb-2 text-sm font-medium text-slate-700">
                      Почему уверены или в чём сомнение
                    </div>
                    <textarea
                      name="confidenceNote"
                      rows={3}
                      defaultValue={procurement.fasReview?.confidenceNote ?? ""}
                      className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm leading-7 outline-none focus:border-[#0d5bd7] focus:ring-4 focus:ring-[#0d5bd7]/10"
                      placeholder="Например: явное нарушение, либо есть сомнение и что именно нужно проверить сотруднику ФАС."
                    />
                  </label>

                  <label className="block">
                    <div className="mb-2 text-sm font-medium text-slate-700">
                      Комментарий по ветке ФАС
                    </div>
                    <textarea
                      name="reviewComment"
                      rows={3}
                      defaultValue={procurement.fasReview?.reviewComment ?? ""}
                      className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm leading-7 outline-none focus:border-[#0d5bd7] focus:ring-4 focus:ring-[#0d5bd7]/10"
                      placeholder="Что делать дальше: запускать жалобу, проверить вручную, ничего не делать."
                    />
                  </label>

                  <button
                    type="submit"
                    className="rounded-2xl bg-[#081a4b] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0d2568]"
                  >
                    Сохранить ФАС-ветку
                  </button>
                </form>
              </div>
            </div>
            </div>
          ) : null}

          {canWorkDocuments ? (
            <div
              id="submission"
              className="scroll-mt-24 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"
            >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="text-sm font-medium uppercase tracking-[0.14em] text-slate-400">
                  Комплект заявки
                </div>
                <h2 className="mt-2 text-2xl font-bold tracking-tight text-[#081a4b]">
                  Чек-лист подготовки документов
                </h2>
              </div>
              <div className="rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-600">
                Компания: {procurement.companyProfile?.name ?? "ещё не выбрана"}
              </div>
            </div>

            <p className="mt-3 text-sm leading-7 text-slate-600">
              Здесь собираем не архив, а понятный рабочий комплект: что уже есть в
              библиотеке компании, что добавлено под эту закупку и чего пока не
              хватает для подачи.
            </p>

            <div className="mt-5 grid gap-3 md:grid-cols-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                  Всего в комплекте
                </div>
                <div className="mt-2 text-2xl font-bold tracking-tight text-[#081a4b]">
                  {procurementDocumentStats.total}
                </div>
              </div>
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4">
                <div className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-700">
                  Готово
                </div>
                <div className="mt-2 text-2xl font-bold tracking-tight text-emerald-800">
                  {procurementDocumentStats.ready}
                </div>
              </div>
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-4">
                <div className="text-xs font-semibold uppercase tracking-[0.12em] text-rose-700">
                  Не хватает
                </div>
                <div className="mt-2 text-2xl font-bold tracking-tight text-rose-800">
                  {procurementDocumentStats.missing}
                </div>
              </div>
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4">
                <div className="text-xs font-semibold uppercase tracking-[0.12em] text-amber-700">
                  Проверить
                </div>
                <div className="mt-2 text-2xl font-bold tracking-tight text-amber-800">
                  {procurementDocumentStats.review}
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <div className="text-sm font-semibold text-[#081a4b]">
                  Что уже есть в библиотеке выбранной компании
                </div>
                {companyLibraryDocuments.length > 0 ? (
                  <div className="mt-4 space-y-3">
                    {companyLibraryDocuments.map((document) => (
                      <div
                        key={document.id}
                        className="rounded-2xl border border-white bg-white px-4 py-3 text-sm leading-6 text-slate-700"
                      >
                        <div className="font-semibold text-slate-900">{document.title}</div>
                        <div className="mt-1 text-xs text-slate-500">
                          {document.fileName ?? "Файл ещё не привязан"}{" "}
                          {document.notes ? `• ${document.notes}` : ""}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-4 text-sm text-slate-500">
                    У выбранной компании библиотека документов пока пустая или компания
                    для участия ещё не выбрана.
                  </div>
                )}
              </div>

              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <div className="text-sm font-semibold text-[#081a4b]">
                  Добавить документ в комплект заявки
                </div>
                <form action={buildTenderProcurementChecklistAction} className="mt-4">
                  <input type="hidden" name="procurementId" value={procurement.id} />
                  <input type="hidden" name="actorName" value="Сотрудник" />
                  <button
                    type="submit"
                    className="w-full rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                  >
                    Собрать черновой чек-лист из выжимки закупки
                  </button>
                </form>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Система возьмёт список обязательных документов из анализа закупки,
                  попробует сопоставить его с библиотекой выбранной компании и сама
                  создаст черновой комплект для проверки.
                </p>
                <form action={saveTenderProcurementDocumentAction} className="mt-4 space-y-4">
                  <input type="hidden" name="procurementId" value={procurement.id} />
                  <input type="hidden" name="actorName" value="Сотрудник" />

                  <label className="block">
                    <div className="mb-2 text-sm font-medium text-slate-700">
                      Документ из библиотеки компании
                    </div>
                    <select
                      name="companyDocumentId"
                      className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#0d5bd7] focus:ring-4 focus:ring-[#0d5bd7]/10"
                      defaultValue=""
                    >
                      <option value="">Выбрать из библиотеки или оставить пустым</option>
                      {companyLibraryDocuments.map((document) => (
                        <option key={document.id} value={document.id}>
                          {document.title}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="block">
                    <div className="mb-2 text-sm font-medium text-slate-700">Название</div>
                    <input
                      name="title"
                      className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#0d5bd7] focus:ring-4 focus:ring-[#0d5bd7]/10"
                      placeholder="Например: Анкета участника"
                    />
                  </label>

                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="block">
                      <div className="mb-2 text-sm font-medium text-slate-700">Категория</div>
                      <input
                        name="category"
                        className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#0d5bd7] focus:ring-4 focus:ring-[#0d5bd7]/10"
                        placeholder="Компания / Форма / Декларация"
                      />
                    </label>
                    <label className="block">
                      <div className="mb-2 text-sm font-medium text-slate-700">
                        Статус
                      </div>
                      <select
                        name="status"
                        defaultValue="REQUIRED"
                        className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#0d5bd7] focus:ring-4 focus:ring-[#0d5bd7]/10"
                      >
                        <option value="REQUIRED">Нужно подготовить</option>
                        <option value="READY">Готово</option>
                        <option value="MISSING">Не хватает</option>
                        <option value="REVIEW">Проверить</option>
                      </select>
                    </label>
                  </div>

                  <label className="block">
                    <div className="mb-2 text-sm font-medium text-slate-700">Имя файла</div>
                    <input
                      name="fileName"
                      className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#0d5bd7] focus:ring-4 focus:ring-[#0d5bd7]/10"
                      placeholder="Например: 03_Анкета_участника.docx"
                    />
                  </label>

                  <label className="block">
                    <div className="mb-2 text-sm font-medium text-slate-700">Комментарий</div>
                    <textarea
                      name="note"
                      className="min-h-24 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm leading-7 outline-none transition focus:border-[#0d5bd7] focus:ring-4 focus:ring-[#0d5bd7]/10"
                      placeholder="Например: взять из базы Вега, обновить дату, проверить подпись."
                    />
                  </label>

                  <button
                    type="submit"
                    className="rounded-2xl bg-[#081a4b] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0d2568]"
                  >
                    Добавить в комплект
                  </button>
                </form>
              </div>
            </div>

            {procurement.procurementDocuments.length > 0 ? (
              <div className="mt-6 space-y-4">
                {procurement.procurementDocuments.map((document) => (
                  <div
                    key={document.id}
                    className="rounded-3xl border border-slate-200 bg-slate-50 p-5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold text-[#081a4b]">
                          {document.title}
                        </div>
                        <div className="mt-2 text-sm text-slate-500">
                          {document.category ?? "Категория не указана"}
                          {document.fileName ? ` • ${document.fileName}` : ""}
                        </div>
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${procurementDocumentTone[document.status]}`}
                      >
                        {procurementDocumentLabel[document.status]}
                      </span>
                    </div>

                    {document.companyDocument ? (
                      <div className="mt-4 rounded-2xl bg-white px-4 py-3 text-sm leading-6 text-slate-700">
                        <span className="font-semibold text-slate-900">
                          Источник из библиотеки:
                        </span>{" "}
                        {document.companyDocument.title}
                      </div>
                    ) : null}

                    {document.note ? (
                      <div className="mt-4 rounded-2xl bg-white px-4 py-3 text-sm leading-6 text-slate-700">
                        <span className="font-semibold text-slate-900">Комментарий:</span>{" "}
                        {document.note}
                      </div>
                    ) : null}

                    <form
                      action={updateTenderProcurementDocumentStatusAction}
                      className="mt-4 grid gap-4 md:grid-cols-[0.8fr_1.2fr_auto]"
                    >
                      <input type="hidden" name="procurementId" value={procurement.id} />
                      <input type="hidden" name="procurementDocumentId" value={document.id} />
                      <input type="hidden" name="actorName" value="Сотрудник" />

                      <select
                        name="status"
                        defaultValue={document.status}
                        className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#0d5bd7] focus:ring-4 focus:ring-[#0d5bd7]/10"
                      >
                        <option value="REQUIRED">Нужно подготовить</option>
                        <option value="READY">Готово</option>
                        <option value="MISSING">Не хватает</option>
                        <option value="REVIEW">Проверить</option>
                      </select>

                      <input
                        name="note"
                        defaultValue={document.note ?? ""}
                        className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#0d5bd7] focus:ring-4 focus:ring-[#0d5bd7]/10"
                        placeholder="Что осталось сделать по этому файлу"
                      />

                      <button
                        type="submit"
                        className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                      >
                        Обновить
                      </button>
                    </form>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm leading-7 text-slate-500">
                Чек-лист пакета пока пустой. Следующий рабочий шаг для сотрудника —
                добавлять сюда формы заказчика, документы компании и декларации,
                чтобы видно было, что уже готово к подаче, а чего ещё не хватает.
              </div>
            )}
            </div>
          ) : null}

          {canWorkInitial ? (
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="text-sm font-medium uppercase tracking-[0.14em] text-slate-400">
              Нестандартные условия
            </div>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-[#081a4b]">
              Особые требования заказчика
            </h2>
            {renderList(procurement.nonstandardRequirements) ?? (
              <div className="mt-5 rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
                Особые требования пока не заполнены.
              </div>
            )}
            </div>
          ) : null}

          {canWorkComments ? (
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="text-sm font-medium uppercase tracking-[0.14em] text-slate-400">
              История
            </div>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-[#081a4b]">
              Лента действий по закупке
            </h2>
            <div className="mt-6 space-y-4">
              {procurement.events.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
                  История пока не сформирована.
                </div>
              ) : (
                procurement.events.map((event) => (
                  <div
                    key={event.id}
                    className="rounded-3xl border border-slate-200 bg-slate-50 p-5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="text-sm font-semibold text-[#081a4b]">
                        {event.title}
                      </div>
                      <div className="text-xs text-slate-400">
                        {formatTenderDate(event.createdAt)}
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-slate-500">
                      {event.actorName ?? "Система"}
                    </div>
                    {event.description ? (
                      <div className="mt-3 text-sm leading-7 text-slate-700">
                        {event.description}
                      </div>
                    ) : null}
                  </div>
                ))
              )}
            </div>
            </div>
          ) : null}
        </section>

        <section className="space-y-8">
          {canWorkInitial ? (
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-sm font-medium uppercase tracking-[0.14em] text-slate-400">
                  AI-анализ документации
                </div>
                <div className="mt-2 text-2xl font-bold tracking-tight text-[#081a4b]">
                  Загрузка текста для разбора
                </div>
              </div>

              <span
                className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] ${
                  aiStatusTone[procurement.aiAnalysisStatus ?? "not_started"] ??
                  aiStatusTone.not_started
                }`}
              >
                {aiStatusLabel[procurement.aiAnalysisStatus ?? "not_started"] ??
                  procurement.aiAnalysisStatus ??
                  "Ещё не запускали"}
              </span>
            </div>

            <p className="mt-3 text-sm leading-7 text-slate-600">
              Пока самый надёжный рабочий вариант для MVP: вставлять текст
              документации или выжимку из PDF/DOCX сюда, а система разложит её по
              вашей структуре, прогонит по стоп-факторам и параллельно даст
              отдельный вывод по потенциальной жалобе в ФАС.
            </p>

            <div className="mt-5 grid gap-4 xl:grid-cols-2">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                  Основной вывод по закупке
                </div>
                <div className="mt-3 text-base font-semibold text-[#081a4b]">
                  {procurement.summary?.trim()
                    ? procurement.summary
                    : "После запуска анализа здесь появится краткая выжимка по закупке."}
                </div>
                <div className="mt-4 text-sm leading-7 text-slate-600">
                  {procurement.stopFactorsSummary?.trim()
                    ? procurement.stopFactorsSummary
                    : "Стоп-факторы ещё не проверялись автоматически."}
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                    Потенциальная жалоба в ФАС
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      fasStatusTone[
                        procurement.fasReview?.status ?? TenderFasReviewStatus.NOT_STARTED
                      ]
                    }`}
                  >
                    {fasStatusLabel[
                      procurement.fasReview?.status ?? TenderFasReviewStatus.NOT_STARTED
                    ]}
                  </span>
                </div>
                <div className="mt-3 text-base font-semibold text-[#081a4b]">
                  {procurement.fasReview?.findingTitle?.trim()
                    ? procurement.fasReview.findingTitle
                    : "После запуска анализа здесь появится отдельный вывод по ФАС-ветке."}
                </div>
                <div className="mt-4 text-sm leading-7 text-slate-600">
                  {procurement.fasReview?.confidenceNote?.trim()
                    ? procurement.fasReview.confidenceNote
                    : "Если AI не найдёт явных нарушений, он прямо это укажет. Если будет сомневаться, отправит ветку на ручную проверку."}
                </div>
              </div>
            </div>

            {procurement.aiAnalysisError ? (
              <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {procurement.aiAnalysisError}
              </div>
            ) : null}

            <form action={analyzeTenderProcurementAction} className="mt-5 space-y-4">
              <input type="hidden" name="procurementId" value={procurement.id} />
              <textarea
                name="sourceText"
                defaultValue={procurement.sourceText ?? ""}
                className="min-h-72 w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-4 text-sm leading-7 text-slate-800 outline-none transition focus:border-[#0d5bd7] focus:ring-4 focus:ring-[#0d5bd7]/10"
                placeholder="Вставь сюда текст документации: критерии отбора, перечень документов, сроки поставки, оплату, штрафы, требования к товару и особые условия..."
              />
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="submit"
                  className="rounded-2xl bg-[#081a4b] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0d2568]"
                >
                  Запустить AI-анализ
                </button>
                <div className="text-xs leading-6 text-slate-500">
                  Модель: {procurement.aiModel ?? process.env.OPENAI_MODEL ?? "gpt-4o-mini"}.
                  После анализа карточка обновится автоматически.
                </div>
              </div>
            </form>
            </div>
          ) : null}

          {canWorkPricing ? (
            <div
              id="pricing-review"
              className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"
            >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="text-sm font-medium uppercase tracking-[0.14em] text-slate-400">
                  Разбор ТЗ по позициям
                </div>
                <div className="mt-2 text-2xl font-bold tracking-tight text-[#081a4b]">
                  Определить, что именно заложил заказчик
                </div>
              </div>
              <div className="rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-600">
                Понять товар → потом искать цену
              </div>
            </div>

            <p className="mt-3 text-sm leading-7 text-slate-600">
              Здесь разбираем позиции технического задания. Если модель указана
              прямо, позиция сразу готова к просчёту. Если даны только
              характеристики, сначала фиксируем, что, по нашему мнению, заложено
              заказчиком, и только после этого идём в цену.
            </p>

            <form action={importTenderTechnicalItemsAction} className="mt-5 space-y-4 rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <input type="hidden" name="procurementId" value={procurement.id} />
              <input type="hidden" name="actorName" value="Сотрудник" />
              <div className="text-sm font-semibold text-[#081a4b]">
                Полуавтоматический импорт позиций из текста ТЗ
              </div>
              <p className="text-sm leading-6 text-slate-600">
                Вставь фрагмент ТЗ со списком позиций. Система попробует сама
                выделить строки номенклатуры и черновиком занесёт их в разбор.
                Явные модели пометим как готовые к просчёту, спорные — как
                требующие проверки.
              </p>
              <textarea
                name="sourceText"
                defaultValue={procurement.sourceText ?? ""}
                className="min-h-40 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm leading-7 outline-none transition focus:border-[#0d5bd7] focus:ring-4 focus:ring-[#0d5bd7]/10"
                placeholder="Вставь сюда блок с позициями ТЗ"
              />
              <button
                type="submit"
                className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Импортировать позиции черновиком
              </button>
            </form>

            <form action={saveTenderTechnicalItemAction} className="mt-5 space-y-4">
              <input type="hidden" name="procurementId" value={procurement.id} />
              <input type="hidden" name="actorName" value="Сотрудник" />

              <div className="grid gap-4 md:grid-cols-4">
                <label className="block">
                  <div className="mb-2 text-sm font-medium text-slate-700">
                    № позиции
                  </div>
                  <input
                    name="lineNumber"
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#0d5bd7] focus:ring-4 focus:ring-[#0d5bd7]/10"
                    placeholder="1"
                  />
                </label>
                <label className="block md:col-span-2">
                  <div className="mb-2 text-sm font-medium text-slate-700">
                    Как позиция названа в ТЗ
                  </div>
                  <input
                    name="requestedName"
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#0d5bd7] focus:ring-4 focus:ring-[#0d5bd7]/10"
                    placeholder="Например: Наконечник ТА 25-8-7 или эквивалент"
                  />
                </label>
                <div className="grid gap-4 md:grid-cols-2 md:col-span-1">
                  <label className="block">
                    <div className="mb-2 text-sm font-medium text-slate-700">Кол-во</div>
                    <input
                      name="quantity"
                      className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#0d5bd7] focus:ring-4 focus:ring-[#0d5bd7]/10"
                    />
                  </label>
                  <label className="block">
                    <div className="mb-2 text-sm font-medium text-slate-700">Ед.</div>
                    <input
                      name="unit"
                      className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#0d5bd7] focus:ring-4 focus:ring-[#0d5bd7]/10"
                    />
                  </label>
                </div>
              </div>

              <label className="block">
                <div className="mb-2 text-sm font-medium text-slate-700">
                  Характеристики из ТЗ
                </div>
                <textarea
                  name="rawCharacteristics"
                  className="min-h-24 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm leading-7 outline-none transition focus:border-[#0d5bd7] focus:ring-4 focus:ring-[#0d5bd7]/10"
                  placeholder="Материал, размеры, ток, напряжение, ГОСТ, диапазон сечений и другие признаки позиции."
                />
              </label>

              <div className="grid gap-4 md:grid-cols-3">
                <label className="block">
                  <div className="mb-2 text-sm font-medium text-slate-700">
                    Что считаем заложенным
                  </div>
                  <input
                    name="identifiedProduct"
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#0d5bd7] focus:ring-4 focus:ring-[#0d5bd7]/10"
                    placeholder="Например: алюминиевый наконечник"
                  />
                </label>
                <label className="block">
                  <div className="mb-2 text-sm font-medium text-slate-700">Бренд</div>
                  <input
                    name="identifiedBrand"
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#0d5bd7] focus:ring-4 focus:ring-[#0d5bd7]/10"
                    placeholder="Если понятен"
                  />
                </label>
                <label className="block">
                  <div className="mb-2 text-sm font-medium text-slate-700">Модель</div>
                  <input
                    name="identifiedModel"
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#0d5bd7] focus:ring-4 focus:ring-[#0d5bd7]/10"
                    placeholder="Если понятна"
                  />
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <label className="block">
                  <div className="mb-2 text-sm font-medium text-slate-700">
                    Итог по позиции
                  </div>
                  <select
                    name="status"
                    defaultValue="REVIEW"
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#0d5bd7] focus:ring-4 focus:ring-[#0d5bd7]/10"
                  >
                    <option value="EXPLICIT">Модель указана</option>
                    <option value="IDENTIFIED">Подобрано по характеристикам</option>
                    <option value="REVIEW">Нужно уточнение</option>
                    <option value="REJECTED">Не подходит</option>
                  </select>
                </label>
                <label className="block">
                  <div className="mb-2 text-sm font-medium text-slate-700">
                    Уверенность, %
                  </div>
                  <input
                    name="confidence"
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#0d5bd7] focus:ring-4 focus:ring-[#0d5bd7]/10"
                    placeholder="85"
                  />
                </label>
                <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 md:self-end">
                  <input type="checkbox" name="pricingReady" className="size-4 rounded border-slate-300" />
                  Можно сразу в просчёт
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <div className="mb-2 text-sm font-medium text-slate-700">
                    Ориентир цены за единицу
                  </div>
                  <input
                    name="approximateUnitPrice"
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#0d5bd7] focus:ring-4 focus:ring-[#0d5bd7]/10"
                    placeholder="Например: 27.06"
                  />
                </label>
                <label className="block">
                  <div className="mb-2 text-sm font-medium text-slate-700">
                    Где найдена цена
                  </div>
                  <input
                    name="sourceSummary"
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#0d5bd7] focus:ring-4 focus:ring-[#0d5bd7]/10"
                    placeholder="Например: Электрик для монтажа и сборки"
                  />
                </label>
              </div>

              <label className="block">
                <div className="mb-2 text-sm font-medium text-slate-700">
                  Почему так решили
                </div>
                <textarea
                  name="identificationBasis"
                  className="min-h-24 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm leading-7 outline-none transition focus:border-[#0d5bd7] focus:ring-4 focus:ring-[#0d5bd7]/10"
                  placeholder="Например: в названии есть ТА 25-8-7, характеристики совпадают, найден товар с теми же размерами и типом."
                />
              </label>

              <label className="block">
                <div className="mb-2 text-sm font-medium text-slate-700">
                  Что нужно проверить человеку
                </div>
                <textarea
                  name="reviewQuestion"
                  className="min-h-24 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm leading-7 outline-none transition focus:border-[#0d5bd7] focus:ring-4 focus:ring-[#0d5bd7]/10"
                  placeholder="Например: не уверен в эквивалентности, не указан производитель, нужно проверить страну происхождения."
                />
              </label>

              <label className="block">
                <div className="mb-2 text-sm font-medium text-slate-700">
                  Ссылки на найденные товары
                </div>
                <textarea
                  name="sourceLinks"
                  className="min-h-24 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm leading-7 outline-none transition focus:border-[#0d5bd7] focus:ring-4 focus:ring-[#0d5bd7]/10"
                  placeholder={"https://...\nhttps://..."}
                />
              </label>

              <button
                type="submit"
                className="rounded-2xl bg-[#081a4b] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0d2568]"
              >
                Добавить позицию
              </button>
            </form>

            {procurement.technicalItems.length > 0 ? (
              <div className="mt-6 space-y-4">
                <div className="grid gap-3 md:grid-cols-4">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                    <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                      Всего позиций
                    </div>
                    <div className="mt-2 text-2xl font-bold tracking-tight text-[#081a4b]">
                      {technicalItemStats.total}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4">
                    <div className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-700">
                      Модель указана
                    </div>
                    <div className="mt-2 text-2xl font-bold tracking-tight text-emerald-800">
                      {technicalItemStats.explicit}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-4">
                    <div className="text-xs font-semibold uppercase tracking-[0.12em] text-sky-700">
                      Подобрано
                    </div>
                    <div className="mt-2 text-2xl font-bold tracking-tight text-sky-800">
                      {technicalItemStats.identified}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4">
                    <div className="text-xs font-semibold uppercase tracking-[0.12em] text-amber-700">
                      Нужно уточнить
                    </div>
                    <div className="mt-2 text-2xl font-bold tracking-tight text-amber-800">
                      {technicalItemStats.review}
                    </div>
                  </div>
                </div>

                {procurement.technicalItems.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-3xl border border-slate-200 bg-slate-50 p-5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold text-[#081a4b]">
                          {item.lineNumber ? `Позиция ${item.lineNumber}. ` : ""}
                          {item.requestedName}
                        </div>
                        <div className="mt-2 text-sm text-slate-500">
                          {item.quantity ?? "—"} {item.unit ?? ""}
                        </div>
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${technicalItemTone[item.status]}`}
                      >
                        {technicalItemLabel[item.status]}
                      </span>
                    </div>

                    {item.rawCharacteristics ? (
                      <div className="mt-4 rounded-2xl bg-white px-4 py-3 text-sm leading-6 text-slate-700">
                        <span className="font-semibold text-slate-900">Характеристики:</span>{" "}
                        {item.rawCharacteristics}
                      </div>
                    ) : null}

                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                      <div className="rounded-2xl bg-white px-4 py-3 text-sm leading-6 text-slate-700">
                        <span className="font-semibold text-slate-900">
                          Что считаем заложенным:
                        </span>{" "}
                        {item.identifiedProduct ?? "Пока не определено"}
                        {(item.identifiedBrand || item.identifiedModel) && (
                          <>
                            {" • "}
                            {[item.identifiedBrand, item.identifiedModel]
                              .filter(Boolean)
                              .join(" / ")}
                          </>
                        )}
                      </div>
                      <div className="rounded-2xl bg-white px-4 py-3 text-sm leading-6 text-slate-700">
                        <span className="font-semibold text-slate-900">Уверенность:</span>{" "}
                        {item.confidence != null ? `${item.confidence}%` : "—"}
                        {" • "}
                        {item.pricingReady
                          ? "Можно передавать в просчёт"
                          : "Пока рано считать цену"}
                      </div>
                    </div>

                    {(item.approximateUnitPrice || item.sourceSummary) && (
                      <div className="mt-4 grid gap-4 md:grid-cols-2">
                        <div className="rounded-2xl bg-white px-4 py-3 text-sm leading-6 text-slate-700">
                          <span className="font-semibold text-slate-900">
                            Цена за единицу:
                          </span>{" "}
                          {item.approximateUnitPrice != null
                            ? `${formatTenderNumber(item.approximateUnitPrice.toString())} руб.`
                            : "—"}
                        </div>
                        <div className="rounded-2xl bg-white px-4 py-3 text-sm leading-6 text-slate-700">
                          <span className="font-semibold text-slate-900">
                            Источник цены:
                          </span>{" "}
                          {item.sourceSummary ?? "—"}
                        </div>
                      </div>
                    )}

                    {item.approximateUnitPrice != null &&
                    item.quantity &&
                    Number.isFinite(Number(String(item.quantity).replace(",", "."))) ? (
                      <div className="mt-4 rounded-2xl bg-white px-4 py-3 text-sm leading-6 text-slate-700">
                        <span className="font-semibold text-slate-900">
                          Сумма по позиции:
                        </span>{" "}
                        {formatTenderCurrency(
                          Number(item.approximateUnitPrice) *
                            Number(String(item.quantity).replace(",", "."))
                        )}
                      </div>
                    ) : null}

                    {item.identificationBasis ? (
                      <div className="mt-4 rounded-2xl bg-white px-4 py-3 text-sm leading-6 text-slate-700">
                        <span className="font-semibold text-slate-900">
                          Почему так решили:
                        </span>{" "}
                        {item.identificationBasis}
                      </div>
                    ) : null}

                    {item.reviewQuestion ? (
                      <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
                        <span className="font-semibold">Нужно проверить:</span>{" "}
                        {item.reviewQuestion}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm leading-7 text-slate-500">
                Позиции ТЗ пока не занесены. Это следующий рабочий слой системы:
                отдельно разложить номенклатуру, понять, где модель уже указана, а
                где сначала нужен подбор по характеристикам.
              </div>
            )}
            </div>
          ) : null}

          {canWorkDecision ? (
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-sm font-medium uppercase tracking-[0.14em] text-slate-400">
                  Предпросчёт
                </div>
                <div className="mt-2 text-2xl font-bold tracking-tight text-[#081a4b]">
                  Приблизительная закупочная цена
                </div>
              </div>
              <div className="rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-600">
                {procurement.pricingStatus
                  ? pricingStatusLabels[
                      procurement.pricingStatus as keyof typeof pricingStatusLabels
                    ] ?? procurement.pricingStatus
                  : "Нет предпросчёта"}
              </div>
            </div>

            <p className="mt-3 text-sm leading-7 text-slate-600">
              Здесь фиксируется твоя логика предпросчёта: найдены ли ориентиры по
              цене закупки товара, где именно они найдены, и нужен ли ручной
              разбор.
            </p>

            {procurement.technicalItems.length > 0 ? (
              <div className="mt-5 grid gap-3 md:grid-cols-4">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                    Готово к цене
                  </div>
                  <div className="mt-2 text-2xl font-bold tracking-tight text-[#081a4b]">
                    {pricingByItems.ready}
                  </div>
                </div>
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-700">
                    С ценовым ориентиром
                  </div>
                  <div className="mt-2 text-2xl font-bold tracking-tight text-emerald-800">
                    {pricingByItems.withPrice}
                  </div>
                </div>
                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.12em] text-amber-700">
                    Ждут поиска цены
                  </div>
                  <div className="mt-2 text-2xl font-bold tracking-tight text-amber-800">
                    {pricingByItems.pending}
                  </div>
                </div>
                <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.12em] text-sky-700">
                    Ориентир по сумме
                  </div>
                  <div className="mt-2 text-xl font-bold tracking-tight text-sky-800">
                    {pricingByItems.total > 0
                      ? formatTenderCurrency(pricingByItems.total)
                      : "—"}
                  </div>
                </div>
              </div>
            ) : null}

            <form action={saveTenderPricingReviewAction} className="mt-5 space-y-4">
              <input type="hidden" name="procurementId" value={procurement.id} />
              <input type="hidden" name="actorName" value="AI/Сотрудник" />

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <div className="mb-2 text-sm font-medium text-slate-700">
                    Статус предпросчёта
                  </div>
                  <select
                    name="pricingStatus"
                    defaultValue={procurement.pricingStatus ?? "manual_review"}
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#0d5bd7] focus:ring-4 focus:ring-[#0d5bd7]/10"
                  >
                    <option value="profitable">Рентабельно</option>
                    <option value="low_margin">Низкая рентабельность</option>
                    <option value="not_found">Цены не найдены</option>
                    <option value="manual_review">На ручной просчёт</option>
                  </select>
                </label>

                <label className="block">
                  <div className="mb-2 text-sm font-medium text-slate-700">
                    Приблизительная закупочная цена
                  </div>
                  <input
                    name="approximatePurchasePrice"
                    defaultValue={procurement.approximatePurchasePrice?.toString() ?? ""}
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#0d5bd7] focus:ring-4 focus:ring-[#0d5bd7]/10"
                    placeholder="Например: 215000"
                  />
                </label>
              </div>

              <label className="block">
                <div className="mb-2 text-sm font-medium text-slate-700">
                  Где найдены цены
                </div>
                <textarea
                  name="sourceSummary"
                  defaultValue={procurement.pricingReviews[0]?.sourceSummary ?? ""}
                  className="min-h-24 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm leading-7 text-slate-900 outline-none transition focus:border-[#0d5bd7] focus:ring-4 focus:ring-[#0d5bd7]/10"
                  placeholder="Например: цены найдены на сайтах поставщиков, маркетплейсах или в каталоге производителя..."
                />
              </label>

              <label className="block">
                <div className="mb-2 text-sm font-medium text-slate-700">
                  Ссылки на источники
                </div>
                <textarea
                  name="sourceLinks"
                  defaultValue={
                    Array.isArray(procurement.pricingReviews[0]?.sourceLinks)
                      ? procurement.pricingReviews[0]?.sourceLinks.join("\n")
                      : ""
                  }
                  className="min-h-24 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm leading-7 text-slate-900 outline-none transition focus:border-[#0d5bd7] focus:ring-4 focus:ring-[#0d5bd7]/10"
                  placeholder={"https://...\nhttps://..."}
                />
              </label>

              <label className="block">
                <div className="mb-2 text-sm font-medium text-slate-700">
                  Комментарий
                </div>
                <textarea
                  name="aiComment"
                  defaultValue={procurement.pricingComment ?? ""}
                  className="min-h-24 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm leading-7 text-slate-900 outline-none transition focus:border-[#0d5bd7] focus:ring-4 focus:ring-[#0d5bd7]/10"
                  placeholder="Если цены не найдены, прямо напиши в чем сложность: нет артикула, неясная номенклатура, отсутствует бренд и т.д."
                />
              </label>

              <button
                type="submit"
                className="rounded-2xl bg-[#081a4b] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0d2568]"
              >
                Сохранить предпросчёт
              </button>
            </form>

            {procurement.pricingReviews.length > 0 ? (
              <div className="mt-6 space-y-3">
                {procurement.pricingReviews.map((review) => (
                  <div
                    key={review.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="text-sm font-semibold text-[#081a4b]">
                        {review.pricingStatus
                          ? pricingStatusLabels[
                              review.pricingStatus as keyof typeof pricingStatusLabels
                            ] ?? review.pricingStatus
                          : "Предпросчёт"}
                      </div>
                      <div className="text-xs text-slate-400">
                        {formatTenderDate(review.createdAt)}
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-slate-500">
                      {review.createdBy ?? "Система"} •{" "}
                      {formatTenderCurrency(review.approximatePurchasePrice?.toString())}
                    </div>
                    {review.aiComment ? (
                      <div className="mt-3 text-sm leading-7 text-slate-700">
                        {review.aiComment}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : null}
            </div>
          ) : null}

          {canWorkSubmission ? (
            <div
              id="submission-readiness"
              className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"
            >
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-sm font-medium uppercase tracking-[0.14em] text-slate-400">
                  Решение руководителя
                </div>
                <div className="mt-2 text-2xl font-bold tracking-tight text-[#081a4b]">
                  Идём дальше, с какой компании участвуем
                </div>
              </div>
              {procurement.decision ? (
                <div
                  className={`rounded-full px-4 py-2 text-xs font-semibold ${tenderDecisionTone[procurement.decision]}`}
                >
                  {getDecisionLabel(procurement.decision)}
                </div>
              ) : null}
            </div>

            <form action={saveTenderDecisionAction} className="mt-5 space-y-4">
              <input type="hidden" name="procurementId" value={procurement.id} />
              <input type="hidden" name="actorName" value="Руководитель" />

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <div className="mb-2 text-sm font-medium text-slate-700">
                    Решение
                  </div>
                  <select
                    name="decision"
                    defaultValue={procurement.decision ?? "SUBMIT"}
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#0d5bd7] focus:ring-4 focus:ring-[#0d5bd7]/10"
                  >
                    <option value="SUBMIT">Подаём</option>
                    <option value="DECLINE">Не подаём</option>
                    <option value="FAS_COMPLAINT">Жалоба в ФАС</option>
                    <option value="REWORK">На доработку</option>
                  </select>
                </label>

                <label className="block">
                  <div className="mb-2 text-sm font-medium text-slate-700">
                    Сумма участия
                  </div>
                  <input
                    name="approvedBidAmount"
                    defaultValue={procurement.approvedBidAmount?.toString() ?? ""}
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#0d5bd7] focus:ring-4 focus:ring-[#0d5bd7]/10"
                    placeholder="Например: 358000"
                  />
                </label>
              </div>

              <label className="block">
                <div className="mb-2 text-sm font-medium text-slate-700">
                  Наша компания для участия
                </div>
                <select
                  name="companyProfileId"
                  defaultValue={procurement.companyProfileId?.toString() ?? ""}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#0d5bd7] focus:ring-4 focus:ring-[#0d5bd7]/10"
                >
                  <option value="">Пока не выбрана</option>
                  {companies.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                      {company.inn ? ` • ИНН ${company.inn}` : ""}
                      {company.isPrimary ? " • основная" : ""}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <div className="mb-2 text-sm font-medium text-slate-700">
                  Комментарий руководителя
                </div>
                <textarea
                  name="comment"
                  defaultValue={procurement.decisionComment ?? ""}
                  className="min-h-24 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm leading-7 text-slate-900 outline-none transition focus:border-[#0d5bd7] focus:ring-4 focus:ring-[#0d5bd7]/10"
                  placeholder="Почему подаём / не подаём / что доработать..."
                />
              </label>

              <button
                type="submit"
                className="rounded-2xl bg-[#081a4b] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0d2568]"
              >
                Зафиксировать решение
              </button>
            </form>

            {procurement.decisions.length > 0 ? (
              <div className="mt-6 space-y-3">
                {procurement.decisions.map((decision) => (
                  <div
                    key={decision.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${tenderDecisionTone[decision.decision]}`}
                      >
                        {getDecisionLabel(decision.decision)}
                      </div>
                      <div className="text-xs text-slate-400">
                        {formatTenderDate(decision.createdAt)}
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-slate-500">
                      {decision.decidedBy ?? "Руководитель"} •{" "}
                      {formatTenderCurrency(decision.approvedBidAmount?.toString())}
                    </div>
                    <div className="mt-1 text-sm text-slate-500">
                      Компания участия: {decision.companyProfile?.name ?? "Не выбрана"}
                    </div>
                    {decision.comment ? (
                      <div className="mt-3 text-sm leading-7 text-slate-700">
                        {decision.comment}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : null}
            </div>
          ) : null}

          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="text-sm font-medium uppercase tracking-[0.14em] text-slate-400">
              Подача
            </div>
            <div className="mt-2 text-2xl font-bold tracking-tight text-[#081a4b]">
              Подготовка и подтверждение загрузки на площадку
            </div>

            <div className={`mt-5 rounded-3xl border p-5 ${submissionReadinessTone}`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold uppercase tracking-[0.12em]">
                    Готовность к подаче
                  </div>
                  <div className="mt-2 text-2xl font-bold tracking-tight">
                    {submissionReadinessLabel}
                  </div>
                </div>
                <div className="grid min-w-[260px] gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-white/80 px-4 py-3">
                    <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                      Файлы в комплекте
                    </div>
                    <div className="mt-2 text-xl font-bold text-[#081a4b]">
                      {procurementDocumentStats.ready}/{procurementDocumentStats.total}
                    </div>
                  </div>
                  <div className="rounded-2xl bg-white/80 px-4 py-3">
                    <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                      Формы без блокеров
                    </div>
                    <div className="mt-2 text-xl font-bold text-[#081a4b]">
                      {sourceFormStats.readyToFill + sourceFormStats.partial}/
                      {sourceDocumentStats.total}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-3">
                <div className="rounded-2xl bg-white/80 px-4 py-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                    Решение руководителя
                  </div>
                  <div className="mt-2 text-sm font-semibold text-[#081a4b]">
                    {hasLeaderSubmitDecision
                      ? "Подаём"
                      : "Решение на подачу пока не зафиксировано"}
                  </div>
                </div>
                <div className="rounded-2xl bg-white/80 px-4 py-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                    Компания участия
                  </div>
                  <div className="mt-2 text-sm font-semibold text-[#081a4b]">
                    {procurement.companyProfile?.name ?? "Не выбрана"}
                  </div>
                </div>
                <div className="rounded-2xl bg-white/80 px-4 py-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                    Позиции без вопросов
                  </div>
                  <div className="mt-2 text-sm font-semibold text-[#081a4b]">
                    {pricingByItems.withPrice}/{technicalItemStats.total || 0} с ценовым ориентиром
                  </div>
                </div>
              </div>

              {submissionBlockers.length > 0 ? (
                <div className="mt-5 rounded-2xl bg-white/80 p-4">
                  <div className="text-sm font-semibold text-[#081a4b]">
                    Что ещё мешает нажать «Подано»
                  </div>
                  <div className="mt-3 space-y-2">
                    {submissionBlockers.map((item, index) => (
                      <div
                        key={`${item}-${index}`}
                        className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-700"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="mt-5 rounded-2xl bg-white/80 px-4 py-4 text-sm leading-7 text-slate-700">
                  Пакет выглядит собранным: формы разобраны, критичных вопросов по комплекту нет,
                  можно проверять финальные файлы и выгружать заявку на площадку.
                </div>
              )}
            </div>

            <div className="mt-5 rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="text-sm font-semibold text-[#081a4b]">
                    Рабочее место подающего
                  </div>
                  <div className="mt-2 max-w-3xl text-sm leading-7 text-slate-600">
                    Здесь видно, кому передана выгрузка, какие файлы уже можно брать в работу
                    и какие финальные проверки сотрудник должен пройти перед отправкой заявки.
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                  <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                    Ответственный за подачу
                  </div>
                  <div className="mt-2 text-sm font-semibold text-[#081a4b]">
                    {procurement.assignedTo ?? "Пока не назначен"}
                  </div>
                </div>
              </div>

              <form
                action={updateTenderSubmissionDeskAction}
                className="mt-5 grid gap-4 md:grid-cols-[0.8fr_1.2fr_auto]"
              >
                <input type="hidden" name="procurementId" value={procurement.id} />
                <input
                  type="hidden"
                  name="actorName"
                  value="Руководитель или координатор"
                />
                <input
                  name="assignedTo"
                  defaultValue={procurement.assignedTo ?? ""}
                  className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#0d5bd7] focus:ring-4 focus:ring-[#0d5bd7]/10"
                  placeholder="Кому передана выгрузка на площадку"
                />
                <input
                  name="note"
                  className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#0d5bd7] focus:ring-4 focus:ring-[#0d5bd7]/10"
                  placeholder="Например: проверяет финальные файлы и подаёт до 17:00"
                />
                <button
                  type="submit"
                  className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  Обновить
                </button>
              </form>

              <div className="mt-5 grid gap-4 xl:grid-cols-2">
                <div className="rounded-3xl border border-slate-200 bg-white p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-semibold text-[#081a4b]">
                      Отдельные файлы, которые уже готовы
                    </div>
                    <div className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                      {readyProcurementDocuments.length}
                    </div>
                  </div>
                  {readyProcurementDocuments.length > 0 ? (
                    <div className="mt-4 space-y-2">
                      {readyProcurementDocuments.slice(0, 8).map((document) => (
                        <div
                          key={document.id}
                          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700"
                        >
                          <span className="font-semibold text-slate-900">{document.title}</span>
                          {document.fileName ? ` • ${document.fileName}` : ""}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-4 rounded-2xl bg-slate-50 px-4 py-3 text-sm leading-7 text-slate-500">
                      Пока нет файлов со статусом `Готово`. Сначала доведи комплект заявки до
                      состояния, пригодного для выгрузки.
                    </div>
                  )}
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-semibold text-[#081a4b]">
                      Формы, которые уже можно переносить
                    </div>
                    <div className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
                      {readySourceDocuments.length}
                    </div>
                  </div>
                  {readySourceDocuments.length > 0 ? (
                    <div className="mt-4 space-y-2">
                      {readySourceDocuments.slice(0, 8).map((document) => (
                        <div
                          key={document.id}
                          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700"
                        >
                          <div className="font-semibold text-slate-900">{document.title}</div>
                          <div className="mt-1 text-xs uppercase tracking-[0.12em] text-slate-400">
                            {sourceDocumentFormTypeLabel[document.formType]}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-4 rounded-2xl bg-slate-50 px-4 py-3 text-sm leading-7 text-slate-500">
                      Пока нет форм, доведённых до состояния переноса. Сначала разберите файлы
                      заказчика и соберите по ним черновики.
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-5 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
                <div className="rounded-3xl border border-slate-200 bg-white p-5">
                  <div className="text-sm font-semibold text-[#081a4b]">
                    Финальная памятка сотруднику
                  </div>
                  <div className="mt-4 space-y-2">
                    {[
                      hasLeaderSubmitDecision
                        ? "Проверь, что решение руководителя на подачу уже зафиксировано."
                        : "Подачу нельзя начинать, пока нет решения «Подаём».",
                      hasSelectedCompany
                        ? `Убедись, что выбрана правильная компания участия: ${procurement.companyProfile?.name}.`
                        : "Сначала выбери компанию, от которой будет подаваться заявка.",
                      readyProcurementDocuments.length > 0
                        ? "Проверь имена готовых файлов и их порядок перед выгрузкой."
                        : "В комплекте пока нет готовых отдельных файлов.",
                      readySourceDocuments.length > 0
                        ? "Сверь готовые черновики форм с оригиналами заказчика."
                        : "По формам заказчика пока нечего переносить в финальные файлы.",
                      sourceDocumentsBlocking.length > 0
                        ? "Закрой оставшиеся вопросы по формам перед выгрузкой."
                        : "Критичных блокеров по формам сейчас не видно.",
                    ].map((item, index) => (
                      <div
                        key={`${item}-${index}`}
                        className="rounded-2xl bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-5">
                  <div className="text-sm font-semibold text-[#081a4b]">
                    Последние события по подаче
                  </div>
                  {submissionEvents.length > 0 ? (
                    <div className="mt-4 space-y-3">
                      {submissionEvents.slice(0, 6).map((event) => (
                        <div
                          key={event.id}
                          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                        >
                          <div className="text-sm font-semibold text-slate-900">
                            {event.title}
                          </div>
                          <div className="mt-1 text-xs text-slate-400">
                            {formatTenderDate(event.createdAt)} • {event.actorName ?? "Система"}
                          </div>
                          {event.description ? (
                            <div className="mt-2 text-sm leading-6 text-slate-600">
                              {event.description}
                            </div>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-4 rounded-2xl bg-slate-50 px-4 py-3 text-sm leading-7 text-slate-500">
                      По зоне подачи пока нет действий. Здесь будет видно, кто готовил
                      выгрузку и как двигалась заявка перед отправкой.
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <form action={markTenderDocumentsPreparedAction} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <input type="hidden" name="procurementId" value={procurement.id} />
                <input type="hidden" name="actorName" value="Ответственный сотрудник" />
                <div className="text-sm font-semibold text-[#081a4b]">
                  Документы готовы
                </div>
                <textarea
                  name="note"
                  className="mt-4 min-h-24 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm leading-7 text-slate-900 outline-none transition focus:border-[#0d5bd7] focus:ring-4 focus:ring-[#0d5bd7]/10"
                  placeholder="Например: файлы подготовлены отдельно, названия проверены, можно загружать на площадку."
                />
                <button
                  type="submit"
                  className="mt-4 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  Отметить «Документы подготовлены»
                </button>
              </form>

              <form action={markTenderSubmittedAction} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <input type="hidden" name="procurementId" value={procurement.id} />
                <input type="hidden" name="actorName" value="Ответственный сотрудник" />
                <div className="text-sm font-semibold text-[#081a4b]">
                  Заявка подана
                </div>
                <textarea
                  name="note"
                  className="mt-4 min-h-24 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm leading-7 text-slate-900 outline-none transition focus:border-[#0d5bd7] focus:ring-4 focus:ring-[#0d5bd7]/10"
                  placeholder="Например: выгружено на площадку, комплект проверен вручную, подача подтверждена."
                />
                <button
                  type="submit"
                  className="mt-4 rounded-2xl bg-[#081a4b] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#0d2568]"
                >
                  Отметить «Подано»
                </button>
              </form>
            </div>
          </div>

          {procurement.ruleMatches.length > 0 ? (
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="text-sm font-medium uppercase tracking-[0.14em] text-slate-400">
                Найденные стоп-факторы
              </div>
              <div className="mt-5 space-y-3">
                {procurement.ruleMatches.map((match) => (
                  <div
                    key={match.id}
                    className="rounded-2xl border border-rose-200 bg-rose-50 p-4"
                  >
                    <div className="text-sm font-semibold text-rose-700">
                      {match.rule.name}
                    </div>
                    <div className="mt-2 text-sm text-rose-600">
                      Основание: {match.matchedValue ?? "сработало правило"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="text-sm font-medium uppercase tracking-[0.14em] text-slate-400">
              Условия договора
            </div>
            <div className="mt-5 space-y-5">
              <div className="rounded-3xl bg-slate-50 p-5">
                <div className="text-sm font-semibold text-[#081a4b]">
                  Сроки и место поставки
                </div>
                <div className="mt-3 text-sm leading-7 text-slate-600">
                  {procurement.deliveryTerms ?? "Не заполнено"}
                </div>
              </div>

              <div className="rounded-3xl bg-slate-50 p-5">
                <div className="text-sm font-semibold text-[#081a4b]">Оплата</div>
                <div className="mt-3 text-sm leading-7 text-slate-600">
                  {procurement.paymentTerms ?? "Не заполнено"}
                </div>
              </div>

              <div className="rounded-3xl bg-slate-50 p-5">
                <div className="text-sm font-semibold text-[#081a4b]">
                  Срок действия договора
                </div>
                <div className="mt-3 text-sm leading-7 text-slate-600">
                  {procurement.contractTerm ?? "Не заполнено"}
                </div>
              </div>

              <div className="rounded-3xl bg-slate-50 p-5">
                <div className="text-sm font-semibold text-[#081a4b]">
                  Штрафы и неустойка
                </div>
                <div className="mt-3 text-sm leading-7 text-slate-600">
                  {procurement.penaltyTerms ?? "Не заполнено"}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-[#081a4b]/10 bg-[linear-gradient(180deg,#f7fbff_0%,#eef4ff_100%)] p-6">
            <div className="text-sm font-medium uppercase tracking-[0.14em] text-[#0d5bd7]">
              AI и правила
            </div>
            <div className="mt-3 text-2xl font-bold tracking-tight text-[#081a4b]">
              После анализа система заполнит summary и автоматически прогонит закупку по активным стоп-факторам.
            </div>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Уже сейчас заложен первый проход по правилам: бумажная подача,
              закрытая закупка, лицензии, КСО, монтаж, несколько победителей,
              военная приемка и правило по количеству позиций.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
