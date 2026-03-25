import { redirect } from "next/navigation";
import { getCurrentTenderUser } from "@/lib/admin-auth";
import { tenderHasCapability } from "@/lib/tender-permissions";
import { TenderIntakeUploadForm } from "@/app/tender/_components/tender-intake-upload-form";
import { getPrisma } from "@/lib/prisma";

function formatDateTime(value: Date | null | undefined) {
  if (!value) return "Не удалось определить";
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}

function formatCurrency(value: { toString(): string } | null | undefined) {
  if (value == null) return "Не удалось определить";
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

function extractStoredDocumentPath(note: string | null | undefined) {
  const match = note?.match(/Файл сохранён:\s*(\/[^\s]+)/);
  return match?.[1] ?? null;
}

function normalizeSearchText(value: string | null | undefined) {
  return String(value ?? "").toLowerCase().replace(/\s+/g, " ").trim();
}

function findMatchingDocumentsForRule(
  match: {
    rule: {
      name: string;
      keyword?: string | null;
      brandName?: string | null;
      manufacturerName?: string | null;
      customerInn?: string | null;
    };
  },
  sourceDocuments: Array<{
    title: string;
    fileName: string | null;
    note: string | null;
    contentSnippet: string | null;
  }>
) {
  const terms = [
    match.rule.keyword,
    match.rule.brandName,
    match.rule.manufacturerName,
    match.rule.customerInn,
    match.rule.name,
  ]
    .filter(Boolean)
    .map((item) => String(item).toLowerCase().trim())
    .filter((item) => item.length >= 3);

  if (terms.length === 0) {
    return sourceDocuments.slice(0, 3);
  }

  const ranked = sourceDocuments.filter((document) => {
    const haystack = normalizeSearchText(
      `${document.title} ${document.fileName ?? ""} ${document.contentSnippet ?? ""} ${document.note ?? ""}`
    );
    return terms.some((term) => haystack.includes(term));
  });

  return ranked.length > 0 ? ranked.slice(0, 3) : sourceDocuments.slice(0, 3);
}

function buildMissingFields(procurement: {
  procurementNumber: string | null;
  customerName: string | null;
  customerInn: string | null;
  nmckWithoutVat: { toString(): string } | null;
  sourceDocuments: Array<{ note: string | null }>;
}) {
  const missing: string[] = [];
  if (!procurement.procurementNumber) missing.push("Не удалось определить номер закупки.");
  if (!procurement.customerName) missing.push("Не удалось определить заказчика.");
  if (!procurement.customerInn) missing.push("Не удалось определить ИНН заказчика.");
  if (!procurement.nmckWithoutVat) missing.push("Не удалось определить НМЦ без НДС.");

  const extractionNotes = procurement.sourceDocuments
    .map((item) => item.note?.trim())
    .filter(Boolean) as string[];

  return [...missing, ...extractionNotes].slice(0, 6);
}

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
  const selectedRaw = resolvedSearchParams.selected;
  const uploadedProcurementId =
    typeof uploadedRaw === "string" ? Number(uploadedRaw) : null;
  const selectedProcurementId =
    typeof selectedRaw === "string" ? Number(selectedRaw) : null;

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
  const resolvedSelectedProcurementId =
    selectedProcurementId && Number.isInteger(selectedProcurementId) && selectedProcurementId > 0
      ? selectedProcurementId
      : uploadedProcurementId && Number.isInteger(uploadedProcurementId) && uploadedProcurementId > 0
        ? uploadedProcurementId
        : recentProcurements[0]?.id ?? null;
  const uploadedProcurement =
    resolvedSelectedProcurementId &&
    Number.isInteger(resolvedSelectedProcurementId) &&
    resolvedSelectedProcurementId > 0
    ? await prisma.tenderProcurement.findUnique({
          where: { id: resolvedSelectedProcurementId },
          include: {
            sourceDocuments: {
              orderBy: { id: "asc" },
              select: {
                title: true,
                fileName: true,
                note: true,
                contentSnippet: true,
              },
            },
            ruleMatches: {
              include: {
                rule: {
                  select: {
                    name: true,
                    keyword: true,
                    brandName: true,
                    manufacturerName: true,
                    customerInn: true,
                  },
                },
              },
            },
          },
        })
      : null;
  const requiredDocuments = jsonListToStrings(uploadedProcurement?.requiredDocuments);
  const nonstandardRequirements = jsonListToStrings(
    uploadedProcurement?.nonstandardRequirements
  );

  const stopFactorState = uploadedProcurement
    ? uploadedProcurement.ruleMatches.length > 0
      ? "stop"
      : buildMissingFields(uploadedProcurement).length > 0
        ? "review"
        : "ok"
    : null;
  const stopFactorTitle =
    stopFactorState === "stop"
      ? "Выявлены стоп-факторы"
      : stopFactorState === "review"
        ? "Нужна ручная проверка"
        : stopFactorState === "ok"
          ? "Стоп-факторы не выявлены"
          : null;
  const stopFactorTone =
    stopFactorState === "stop"
      ? "border-rose-200 bg-rose-50 text-rose-800"
      : stopFactorState === "review"
        ? "border-amber-200 bg-amber-50 text-amber-800"
        : "border-emerald-200 bg-emerald-50 text-emerald-800";
  const missingFields = uploadedProcurement ? buildMissingFields(uploadedProcurement) : [];

  return (
    <main className="space-y-4">
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
          {uploadedProcurement
            ? "Добавить ещё одну закупку"
            : "Загрузить первую закупку на распознавание"}
        </div>
        <div className="mt-4">
          <TenderIntakeUploadForm
            actorName={actorName}
            compact={Boolean(uploadedProcurement || recentProcurements.length > 0)}
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
                  const isSelected = item.id === resolvedSelectedProcurementId;
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
                  const rowHref = `/procurements/new?selected=${item.id}#recognition-result`;
                  const stopHref =
                    item.status === "STOPPED"
                      ? `/procurements/new?selected=${item.id}#stop-factors-result`
                      : rowHref;

                  return (
                    <tr
                      key={item.id}
                      className={`${isSelected ? "bg-blue-50/50" : "hover:bg-slate-50/80"} cursor-pointer`}
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

      <section id="recognition-result" className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">

        {!uploadedProcurement ? (
          <div className="mt-5 rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm leading-7 text-slate-500">
            После загрузки пакета документов таблица выше покажет все закупки по дате добавления.
            Нажми на нужную строку, и здесь появится то, что система распознала и что не смогла определить автоматически.
          </div>
        ) : (
          <div className="mt-5 space-y-4">
            <div className="text-2xl font-bold tracking-tight text-[#081a4b]">
              {uploadedProcurement.procurementNumber
                ? `Закупка № ${uploadedProcurement.procurementNumber}`
                : "Закупка без определённого номера"}
            </div>
            <div className="grid gap-3 xl:grid-cols-4">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-sm font-semibold text-slate-500">Номер закупки</div>
                <div className="mt-1 text-2xl font-bold text-[#081a4b]">
                  {uploadedProcurement.procurementNumber ?? "Не удалось определить"}
                </div>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-sm font-semibold text-slate-500">Заказчик</div>
                <div className="mt-1 text-base font-semibold text-[#081a4b]">
                  {uploadedProcurement.customerName ?? "Не удалось определить"}
                </div>
                <div className="mt-2 text-sm text-slate-500">
                  ИНН: {uploadedProcurement.customerInn ?? "не определён"}
                </div>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-sm font-semibold text-slate-500">НМЦ без НДС</div>
                <div className="mt-1 text-base font-semibold text-[#081a4b]">
                  {formatCurrency(uploadedProcurement.nmckWithoutVat)}
                </div>
                <div className="mt-2 text-sm text-slate-500">
                  НМЦ: {formatCurrency(uploadedProcurement.nmck)}
                </div>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-sm font-semibold text-slate-500">Дополнительно</div>
                <div className="mt-1 text-sm leading-6 text-slate-700">
                  <div>Площадка: {uploadedProcurement.platform ?? "не определена"}</div>
                  <div>Позиций: {uploadedProcurement.itemsCount ?? "не определено"}</div>
                  <div>Срок подачи: {formatDateTime(uploadedProcurement.deadline)}</div>
                </div>
              </div>
            </div>

            <div id="stop-factors-result" className={`rounded-3xl border p-4 ${stopFactorTone}`}>
              <div className="text-sm font-semibold uppercase tracking-[0.12em]">
                Стоп-факторы
              </div>
              <div className="mt-2 text-lg font-bold">{stopFactorTitle}</div>
              {stopFactorState === "stop" ? (
                <div className="mt-3 space-y-2 text-sm leading-6">
                  {uploadedProcurement.ruleMatches.map((match) => {
                    const matchingDocuments = findMatchingDocumentsForRule(
                      match,
                      uploadedProcurement.sourceDocuments
                    );

                    return (
                      <div key={match.id} className="rounded-2xl border border-rose-200/70 bg-white/70 p-3">
                        <div className="font-semibold">Найдено: {match.rule.name}</div>
                        {matchingDocuments.length > 0 ? (
                          <div className="mt-2 space-y-1 text-sm">
                            {matchingDocuments.map((document) => {
                              const storedPath = extractStoredDocumentPath(document.note);
                              return (
                                <div key={`${match.id}-${document.title}`}>
                                  {storedPath ? (
                                    <a
                                      href={storedPath}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-[#9f1239] underline decoration-rose-300 underline-offset-2 hover:text-[#881337]"
                                    >
                                      {document.title}
                                    </a>
                                  ) : (
                                    <span>{document.title}</span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                  {uploadedProcurement.stopFactorsSummary ? (
                    <div>{uploadedProcurement.stopFactorsSummary}</div>
                  ) : null}
                </div>
              ) : stopFactorState === "review" ? (
                <div className="mt-3 space-y-2 text-sm leading-6">
                  {missingFields.map((item, index) => (
                    <div key={`${item}-${index}`}>{item}</div>
                  ))}
                </div>
              ) : (
                <div className="mt-3 text-sm leading-6">
                  Система не увидела явных стоп-факторов в загруженной документации.
                </div>
              )}
            </div>

            <div className="grid gap-4 xl:grid-cols-2">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-sm font-semibold text-slate-500">Краткая суть закупки</div>
                <div className="mt-3 text-sm leading-6 text-slate-700">
                  {uploadedProcurement.summary ?? "Не удалось определить автоматически"}
                </div>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-sm font-semibold text-slate-500">Критерии отбора</div>
                <div className="mt-3 text-sm leading-6 text-slate-700">
                  {uploadedProcurement.selectionCriteria ?? "Не удалось определить автоматически"}
                </div>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-sm font-semibold text-slate-500">Требуемая документация</div>
                {requiredDocuments.length > 0 ? (
                  <div className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
                    {requiredDocuments.map((item) => (
                      <div key={item}>{item}</div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-3 text-sm leading-6 text-slate-600">
                    Не удалось определить автоматически.
                  </div>
                )}
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-sm font-semibold text-slate-500">Нестандартные требования</div>
                {nonstandardRequirements.length > 0 ? (
                  <div className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
                    {nonstandardRequirements.map((item) => (
                      <div key={item}>{item}</div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-3 text-sm leading-6 text-slate-600">
                    Явных нестандартных требований автоматически не найдено.
                  </div>
                )}
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-sm font-semibold text-slate-500">Условия договора</div>
                <div className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
                  <div>
                    <span className="font-medium text-[#081a4b]">Поставка:</span>{" "}
                    {uploadedProcurement.deliveryTerms ?? "не определено"}
                  </div>
                  <div>
                    <span className="font-medium text-[#081a4b]">Оплата:</span>{" "}
                    {uploadedProcurement.paymentTerms ?? "не определено"}
                  </div>
                  <div>
                    <span className="font-medium text-[#081a4b]">Срок договора:</span>{" "}
                    {uploadedProcurement.contractTerm ?? "не определено"}
                  </div>
                  <div>
                    <span className="font-medium text-[#081a4b]">Неустойка:</span>{" "}
                    {uploadedProcurement.penaltyTerms ?? "не определено"}
                  </div>
                </div>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-sm font-semibold text-slate-500">
                  Что не удалось определить автоматически
                </div>
                {missingFields.length > 0 ? (
                  <div className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
                    {missingFields.map((item, index) => (
                      <div key={`${item}-${index}`}>{item}</div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-3 text-sm leading-6 text-slate-600">
                    По базовым полям система сработала уверенно.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
