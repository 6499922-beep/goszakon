import Link from "next/link";
import { getCurrentTenderUser } from "@/lib/admin-auth";
import { tenderHasCapability } from "@/lib/tender-permissions";
import { getPrisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function TenderInnRegistryRecordPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const currentUser = await getCurrentTenderUser();
  if (!currentUser || !tenderHasCapability(currentUser.role, "rules_manage")) {
    redirect("/procurements/new");
  }

  const { id } = await params;
  const recordId = Number(id);
  if (!Number.isInteger(recordId) || recordId <= 0) {
    notFound();
  }

  const prisma = getPrisma();
  const record = await prisma.tenderInnRegistry.findUnique({
    where: { id: recordId },
  });

  if (!record) {
    notFound();
  }

  const procurements = await prisma.tenderProcurement.findMany({
    where: {
      customerInn: record.inn,
    },
    orderBy: [{ createdAt: "desc" }],
    take: 30,
    select: {
      id: true,
      procurementNumber: true,
      customerName: true,
      createdAt: true,
      status: true,
    },
  });

  return (
    <main className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/registry"
          className="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
        >
          Назад к ТВАРЯМ
        </Link>
      </div>

      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-sm font-medium uppercase tracking-[0.14em] text-slate-400">
              Запись реестра
            </div>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#081a4b]">
              {record.label}
            </h1>
            <div className="mt-3 inline-flex rounded-full bg-rose-50 px-3 py-1 text-sm font-semibold text-rose-700">
              ИНН: {record.inn}
            </div>
          </div>
          <div
            className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${
              record.isActive
                ? "bg-rose-50 text-rose-700"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            {record.isActive ? "Подсвечивается в закупках" : "Отключено"}
          </div>
        </div>

        {record.description ? (
          <div className="mt-5 rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm leading-7 text-slate-700">
            {record.description}
          </div>
        ) : null}
      </section>

      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="text-sm font-medium uppercase tracking-[0.14em] text-slate-400">
          Связанные закупки
        </div>
        <h2 className="mt-2 text-2xl font-bold tracking-tight text-[#081a4b]">
          Последние закупки по этому ИНН
        </h2>

        {procurements.length === 0 ? (
          <div className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-500">
            По этому ИНН пока нет закупок в системе.
          </div>
        ) : (
          <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Дата</th>
                  <th className="px-4 py-3 font-medium">Номер закупки</th>
                  <th className="px-4 py-3 font-medium">Заказчик</th>
                  <th className="px-4 py-3 font-medium">Статус</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {procurements.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80">
                    <td className="px-4 py-4 text-slate-600">
                      {new Intl.DateTimeFormat("ru-RU", {
                        timeZone: "Europe/Moscow",
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      }).format(item.createdAt)}
                    </td>
                    <td className="px-4 py-4 font-semibold text-[#081a4b]">
                      <Link
                        href={`/procurements/recognition/${item.id}`}
                        className="transition hover:text-[#0d5bd7]"
                      >
                        {item.procurementNumber ?? "Не определён"}
                      </Link>
                    </td>
                    <td className="px-4 py-4 text-slate-600">
                      {item.customerName ?? "Не определён"}
                    </td>
                    <td className="px-4 py-4 text-slate-600">{item.status}</td>
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
