import { redirect } from "next/navigation";
import { getCurrentTenderUser } from "@/lib/admin-auth";
import { tenderHasCapability } from "@/lib/tender-permissions";
import { TenderIntakeUploadForm } from "@/app/tender/_components/tender-intake-upload-form";
import { getPrisma } from "@/lib/prisma";

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
  const uploadedProcurementId =
    typeof uploadedRaw === "string" ? Number(uploadedRaw) : null;

  const actorName =
    currentUser.name?.trim() || currentUser.email?.trim() || "Сотрудник";
  const prisma = getPrisma();
  const uploadedProcurement =
    uploadedProcurementId && Number.isInteger(uploadedProcurementId) && uploadedProcurementId > 0
      ? await prisma.tenderProcurement.findUnique({
          where: { id: uploadedProcurementId },
          include: {
            sourceDocuments: {
              orderBy: { id: "asc" },
              select: {
                title: true,
                note: true,
              },
            },
            ruleMatches: {
              include: {
                rule: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        })
      : null;

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

      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
          <TenderIntakeUploadForm actorName={actorName} />
        </div>

        <aside className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-sm font-medium uppercase tracking-[0.14em] text-slate-400">
            Результат распознавания
          </div>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-[#081a4b]">
            {uploadedProcurement ? "Последняя загруженная закупка" : "Здесь появится результат"}
          </h2>

          {!uploadedProcurement ? (
            <div className="mt-5 rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm leading-7 text-slate-500">
              После загрузки пакета документов здесь сразу появятся:
              номер закупки, заказчик, НМЦ, стоп-факторы и список того, что система не смогла уверенно определить.
            </div>
          ) : (
            <div className="mt-5 space-y-4">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-sm font-semibold text-slate-500">Номер закупки</div>
                <div className="mt-1 text-2xl font-bold text-[#081a4b]">
                  {uploadedProcurement.procurementNumber ?? "Не удалось определить"}
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
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
                    Площадка: {uploadedProcurement.platform ?? "не определена"}
                  </div>
                </div>
              </div>

              <div className={`rounded-3xl border p-4 ${stopFactorTone}`}>
                <div className="text-sm font-semibold uppercase tracking-[0.12em]">
                  Стоп-факторы
                </div>
                <div className="mt-2 text-lg font-bold">{stopFactorTitle}</div>
                {stopFactorState === "stop" ? (
                  <div className="mt-3 space-y-2 text-sm leading-6">
                    {uploadedProcurement.ruleMatches.map((match) => (
                      <div key={match.id}>
                        Найдено: {match.rule.name}
                      </div>
                    ))}
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
          )}
        </aside>
      </section>
    </main>
  );
}
