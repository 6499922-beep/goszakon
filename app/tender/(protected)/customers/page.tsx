import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentTenderUser } from "@/lib/admin-auth";
import { getPrisma } from "@/lib/prisma";
import { tenderHasCapability } from "@/lib/tender-permissions";
import {
  buildTenderCustomerHref,
  normalizeTenderCustomerInn,
  normalizeTenderCustomerName,
} from "@/lib/tender-customers";
import {
  formatTenderCurrency,
  formatTenderMoscowShortDateTime,
} from "@/lib/tender-format";

export const dynamic = "force-dynamic";

function getRecognitionTone(status: string | null) {
  switch (status) {
    case "completed":
      return "bg-emerald-50 text-emerald-700";
    case "failed":
      return "bg-rose-50 text-rose-700";
    case "needs_text":
      return "bg-amber-50 text-amber-700";
    case "running":
      return "bg-blue-50 text-blue-700";
    default:
      return "bg-slate-100 text-slate-600";
  }
}

function getRecognitionLabel(status: string | null) {
  switch (status) {
    case "completed":
      return "Распознано";
    case "failed":
      return "Ошибка";
    case "needs_text":
      return "Нужна ручная проверка";
    case "running":
      return "Идёт анализ";
    case "queued":
      return "В очереди";
    default:
      return "Не запускалось";
  }
}

export default async function TenderCustomerPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const currentUser = await getCurrentTenderUser();

  if (!currentUser || !tenderHasCapability(currentUser.role, "procurements_list")) {
    redirect("/procurements/new");
  }

  const resolvedSearchParams = (await searchParams) ?? {};
  const nameParam = typeof resolvedSearchParams.name === "string" ? resolvedSearchParams.name : null;
  const innParam = typeof resolvedSearchParams.inn === "string" ? resolvedSearchParams.inn : null;
  const customerName = normalizeTenderCustomerName(nameParam);
  const customerInn = normalizeTenderCustomerInn(innParam);

  if (!customerName && !customerInn) {
    redirect("/procurements/new");
  }

  const prisma = getPrisma();
  const whereClauses: Array<{ customerInn?: string; customerName?: string }> = [];

  if (customerInn) {
    whereClauses.push({ customerInn });
  }

  if (customerName) {
    whereClauses.push({ customerName });
  }

  const procurements = await prisma.tenderProcurement.findMany({
    where: {
      OR: whereClauses,
    },
    select: {
      id: true,
      title: true,
      procurementNumber: true,
      customerName: true,
      customerInn: true,
      createdAt: true,
      aiAnalysisStatus: true,
      status: true,
      stopFactorsSummary: true,
      nmckWithoutVat: true,
      purchaseType: true,
      itemsCount: true,
      deadline: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 100,
  });

  const resolvedName =
    procurements.find((item) => item.customerName)?.customerName ?? customerName ?? "Заказчик";
  const resolvedInn = procurements.find((item) => item.customerInn)?.customerInn ?? customerInn;
  const stopCount = procurements.filter(
    (item) => item.status === "STOPPED" || !!item.stopFactorsSummary?.trim()
  ).length;

  return (
    <main className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/procurements/new"
          className="inline-flex items-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-[#081a4b] transition hover:border-[#0d5bd7] hover:text-[#0d5bd7]"
        >
          Назад к заявкам
        </Link>
        <div className="text-sm text-slate-500">Позже сюда добавим и жалобы в ФАС по этому заказчику.</div>
      </div>

      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              Карточка заказчика
            </div>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#081a4b]">
              {resolvedName}
            </h1>
            <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-500">
              <span>ИНН: {resolvedInn ?? "не определён"}</span>
              <span>Закупок в базе: {procurements.length}</span>
              <span>Со стоп-факторами: {stopCount}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-400">
            Последняя закупка
          </div>
          <div className="mt-3 text-lg font-bold text-[#081a4b]">
            {procurements[0]?.procurementNumber ?? "Не определён"}
          </div>
          <div className="mt-2 text-sm text-slate-500">
            {procurements[0] ? formatTenderMoscowShortDateTime(procurements[0].createdAt) : "—"}
          </div>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-400">
            Последний вид закупки
          </div>
          <div className="mt-3 text-lg font-bold text-[#081a4b]">
            {procurements[0]?.purchaseType ?? "Не определён"}
          </div>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-400">
            Последняя НМЦ без НДС
          </div>
          <div className="mt-3 text-lg font-bold text-[#081a4b]">
            {formatTenderCurrency(procurements[0]?.nmckWithoutVat?.toString())}
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-5">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            История закупок
          </div>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-[#081a4b]">
            Последние тендеры заказчика
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-5 py-4 font-medium">Добавлена</th>
                <th className="px-5 py-4 font-medium">Номер закупки</th>
                <th className="px-5 py-4 font-medium">Закупка</th>
                <th className="px-5 py-4 font-medium">Распознавание</th>
                <th className="px-5 py-4 font-medium">Позиций</th>
                <th className="px-5 py-4 font-medium">НМЦ без НДС</th>
              </tr>
            </thead>
            <tbody>
              {procurements.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-slate-500">
                    По этому заказчику пока нет закупок в базе.
                  </td>
                </tr>
              ) : (
                procurements.map((item) => (
                  <tr key={item.id} className="border-t border-slate-100 hover:bg-slate-50/80">
                    <td className="px-5 py-4 text-slate-600">
                      <Link href={`/procurements/recognition/${item.id}`} className="block">
                        {formatTenderMoscowShortDateTime(item.createdAt)}
                      </Link>
                    </td>
                    <td className="px-5 py-4 font-semibold text-[#081a4b]">
                      <Link href={`/procurements/recognition/${item.id}`} className="block">
                        {item.procurementNumber ?? "Не определён"}
                      </Link>
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      <Link href={`/procurements/recognition/${item.id}`} className="block">
                        {item.title || `${resolvedName} — закупка`}
                      </Link>
                    </td>
                    <td className="px-5 py-4">
                      <Link href={`/procurements/recognition/${item.id}`} className="block">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getRecognitionTone(item.aiAnalysisStatus)}`}
                        >
                          {getRecognitionLabel(item.aiAnalysisStatus)}
                        </span>
                      </Link>
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      <Link href={`/procurements/recognition/${item.id}`} className="block">
                        {item.itemsCount ?? "—"}
                      </Link>
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      <Link href={`/procurements/recognition/${item.id}`} className="block">
                        {formatTenderCurrency(item.nmckWithoutVat?.toString())}
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
