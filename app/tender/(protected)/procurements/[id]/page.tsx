import Link from "next/link";
import { notFound } from "next/navigation";
import { TenderProcurementStatus } from "@prisma/client";
import {
  analyzeTenderProcurementAction,
  importTenderTechnicalItemsAction,
  markTenderDocumentsPreparedAction,
  markTenderSubmittedAction,
  saveTenderTechnicalItemAction,
  saveTenderDecisionAction,
  saveTenderPricingReviewAction,
  updateTenderProcurementStatusAction,
} from "@/app/tender/actions";
import { getPrisma } from "@/lib/prisma";
import {
  formatTenderCurrency,
  formatTenderDate,
  formatTenderNumber,
  tenderDecisionTone,
  tenderStatusLabels,
  tenderStatusTone,
} from "@/lib/tender-format";
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
      companyProfile: true,
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

  const processingStages = getTenderProcessingStages(procurement);
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
      </section>

      <div className="grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
        <section className="space-y-8">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
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
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
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

          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
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

          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
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
        </section>

        <section className="space-y-8">
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

              <div className="rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-600">
                {procurement.aiAnalysisStatus ?? "not_started"}
              </div>
            </div>

            <p className="mt-3 text-sm leading-7 text-slate-600">
              Пока самый надёжный рабочий вариант для MVP: вставлять текст
              документации или выжимку из PDF/DOCX сюда, а система разложит её по
              вашей структуре и прогонит по стоп-факторам.
            </p>

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

          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
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

          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
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

          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="text-sm font-medium uppercase tracking-[0.14em] text-slate-400">
              Подача
            </div>
            <div className="mt-2 text-2xl font-bold tracking-tight text-[#081a4b]">
              Подготовка и подтверждение загрузки на площадку
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
