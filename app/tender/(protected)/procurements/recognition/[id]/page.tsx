import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentTenderUser } from "@/lib/admin-auth";
import { getPrisma } from "@/lib/prisma";
import { tenderHasCapability } from "@/lib/tender-permissions";

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

  return [...missing, ...extractionNotes].slice(0, 8);
}

export const dynamic = "force-dynamic";

export default async function TenderRecognitionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const currentUser = await getCurrentTenderUser();

  if (!currentUser || !tenderHasCapability(currentUser.role, "procurement_create")) {
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
  });

  if (!procurement) {
    redirect("/procurements/new");
  }

  const requiredDocuments = jsonListToStrings(procurement.requiredDocuments);
  const nonstandardRequirements = jsonListToStrings(procurement.nonstandardRequirements);
  const missingFields = buildMissingFields(procurement);
  const stopFactorState =
    procurement.ruleMatches.length > 0 ? "stop" : missingFields.length > 0 ? "review" : "ok";
  const stopFactorTitle =
    stopFactorState === "stop"
      ? "Выявлены стоп-факторы"
      : stopFactorState === "review"
        ? "Нужна ручная проверка"
        : "Стоп-факторы не выявлены";
  const stopFactorTone =
    stopFactorState === "stop"
      ? "border-rose-200 bg-rose-50 text-rose-800"
      : stopFactorState === "review"
        ? "border-amber-200 bg-amber-50 text-amber-800"
        : "border-emerald-200 bg-emerald-50 text-emerald-800";

  return (
    <main className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/procurements/new"
          className="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
        >
          Назад к заявкам
        </Link>
        <div className="text-sm text-slate-500">
          Добавлена: {formatDateTime(procurement.createdAt)}
        </div>
      </div>

      <section id="recognition-result" className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="text-2xl font-bold tracking-tight text-[#081a4b]">
          {procurement.procurementNumber
            ? `Закупка № ${procurement.procurementNumber}`
            : "Закупка без определённого номера"}
        </div>

        <div className="mt-5 space-y-4">
          <div className="grid gap-3 xl:grid-cols-4">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-sm font-semibold text-slate-500">Номер закупки</div>
              <div className="mt-1 text-2xl font-bold text-[#081a4b]">
                {procurement.procurementNumber ?? "Не удалось определить"}
              </div>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-sm font-semibold text-slate-500">Заказчик</div>
              <div className="mt-1 text-base font-semibold text-[#081a4b]">
                {procurement.customerName ?? "Не удалось определить"}
              </div>
              <div className="mt-2 text-sm text-slate-500">
                ИНН: {procurement.customerInn ?? "не определён"}
              </div>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-sm font-semibold text-slate-500">НМЦ без НДС</div>
              <div className="mt-1 text-base font-semibold text-[#081a4b]">
                {formatCurrency(procurement.nmckWithoutVat)}
              </div>
              <div className="mt-2 text-sm text-slate-500">
                НМЦ: {formatCurrency(procurement.nmck)}
              </div>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-sm font-semibold text-slate-500">Дополнительно</div>
              <div className="mt-1 text-sm leading-6 text-slate-700">
                <div>Площадка: {procurement.platform ?? "не определена"}</div>
                <div>Позиций: {procurement.itemsCount ?? "не определено"}</div>
                <div>Срок подачи: {formatDateTime(procurement.deadline)}</div>
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
                {procurement.ruleMatches.map((match) => {
                  const matchingDocuments = findMatchingDocumentsForRule(
                    match,
                    procurement.sourceDocuments
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
                {procurement.stopFactorsSummary ? <div>{procurement.stopFactorsSummary}</div> : null}
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
                {procurement.summary ?? "Не удалось определить автоматически"}
              </div>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-sm font-semibold text-slate-500">Критерии отбора</div>
              <div className="mt-3 text-sm leading-6 text-slate-700">
                {procurement.selectionCriteria ?? "Не удалось определить автоматически"}
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
                  {procurement.deliveryTerms ?? "не определено"}
                </div>
                <div>
                  <span className="font-medium text-[#081a4b]">Оплата:</span>{" "}
                  {procurement.paymentTerms ?? "не определено"}
                </div>
                <div>
                  <span className="font-medium text-[#081a4b]">Срок договора:</span>{" "}
                  {procurement.contractTerm ?? "не определено"}
                </div>
                <div>
                  <span className="font-medium text-[#081a4b]">Неустойка:</span>{" "}
                  {procurement.penaltyTerms ?? "не определено"}
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
      </section>
    </main>
  );
}
