import {
  createTenderInnRegistryAction,
  deleteTenderInnRegistryAction,
  toggleTenderInnRegistryAction,
  updateTenderInnRegistryAction,
} from "@/app/tender/actions";
import { getCurrentTenderUser } from "@/lib/admin-auth";
import { tenderHasCapability } from "@/lib/tender-permissions";
import { getPrisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function TenderInnRegistryPage() {
  const currentUser = await getCurrentTenderUser();
  if (!currentUser || !tenderHasCapability(currentUser.role, "rules_manage")) {
    redirect("/procurements/new");
  }

  const prisma = getPrisma();
  const records = await prisma.tenderInnRegistry.findMany({
    orderBy: [{ isActive: "desc" }, { updatedAt: "desc" }],
    take: 100,
  });

  return (
    <main className="space-y-8">
      <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
        <div className="bg-[linear-gradient(135deg,#081a4b_0%,#143b8f_55%,#2f78ff_100%)] px-8 py-8 text-white">
          <div className="max-w-4xl">
            <div className="text-sm font-medium uppercase tracking-[0.16em] text-white/65">
              INN Registry
            </div>
            <h1 className="mt-3 text-4xl font-bold tracking-tight">
              Реестр ИНН компаний
            </h1>
            <p className="mt-4 text-base leading-7 text-white/80">
              Отдельный список компаний по ИНН, которые нужно подсвечивать в
              закупках. Это не стоп-фактор, а отдельный реестр для ручной
              настройки и будущей автоматизации.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-8 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="text-sm font-medium uppercase tracking-[0.14em] text-slate-400">
            Новая запись
          </div>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-[#081a4b]">
            Добавить ИНН в реестр
          </h2>

          <form action={createTenderInnRegistryAction} className="mt-6 space-y-4">
            <label className="block">
              <div className="mb-2 text-sm font-medium text-slate-700">ИНН</div>
              <input
                name="inn"
                required
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#0d5bd7] focus:ring-4 focus:ring-[#0d5bd7]/10"
                placeholder="Например: 7708503727"
              />
            </label>

            <label className="block">
              <div className="mb-2 text-sm font-medium text-slate-700">
                Короткая подпись
              </div>
              <input
                name="label"
                required
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#0d5bd7] focus:ring-4 focus:ring-[#0d5bd7]/10"
                placeholder='Например: "Мудаки" / "Проверять вручную"'
              />
            </label>

            <label className="block">
              <div className="mb-2 text-sm font-medium text-slate-700">
                Комментарий
              </div>
              <textarea
                name="description"
                className="min-h-24 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm leading-7 outline-none transition focus:border-[#0d5bd7] focus:ring-4 focus:ring-[#0d5bd7]/10"
                placeholder="Коротко поясни, почему компания в реестре и что важно помнить."
              />
            </label>

            <label className="inline-flex items-center gap-2 text-sm text-slate-600">
              <input type="checkbox" name="isActive" defaultChecked />
              Активно
            </label>

            <button
              type="submit"
              className="rounded-2xl bg-[#081a4b] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0d2568]"
            >
              Добавить запись
            </button>
          </form>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="text-sm font-medium uppercase tracking-[0.14em] text-slate-400">
            Активный список
          </div>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-[#081a4b]">
            Реестр по ИНН
          </h2>

          {records.length === 0 ? (
            <div className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-500">
              Пока в реестре нет ни одной компании.
            </div>
          ) : (
            <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200">
              <div className="divide-y divide-slate-200 bg-white">
                {records.map((record) => (
                  <details key={record.id} className="group">
                    <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-3 px-4 py-4">
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-[#081a4b]">
                          {record.label}
                        </div>
                        <div className="mt-1 text-sm text-slate-500">
                          ИНН: {record.inn}
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                            record.isActive
                              ? "bg-rose-50 text-rose-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {record.isActive ? "Подсвечивается" : "Отключено"}
                        </span>
                      </div>
                    </summary>

                    <div className="border-t border-slate-100 bg-slate-50 px-4 py-4">
                      <div className="space-y-4">
                        <form
                          action={updateTenderInnRegistryAction}
                          className="space-y-4"
                        >
                          <input type="hidden" name="recordId" value={record.id} />
                          <div className="grid gap-4 md:grid-cols-2">
                            <label className="block">
                              <div className="mb-2 text-sm font-medium text-slate-700">
                                ИНН
                              </div>
                              <input
                                name="inn"
                                defaultValue={record.inn}
                                required
                                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#0d5bd7] focus:ring-4 focus:ring-[#0d5bd7]/10"
                              />
                            </label>

                            <label className="block">
                              <div className="mb-2 text-sm font-medium text-slate-700">
                                Подпись
                              </div>
                              <input
                                name="label"
                                defaultValue={record.label}
                                required
                                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#0d5bd7] focus:ring-4 focus:ring-[#0d5bd7]/10"
                              />
                            </label>

                            <label className="block md:col-span-2">
                              <div className="mb-2 text-sm font-medium text-slate-700">
                                Комментарий
                              </div>
                              <textarea
                                name="description"
                                defaultValue={record.description ?? ""}
                                className="min-h-24 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm leading-7 outline-none transition focus:border-[#0d5bd7] focus:ring-4 focus:ring-[#0d5bd7]/10"
                              />
                            </label>
                          </div>

                          <label className="inline-flex items-center gap-2 text-sm text-slate-600">
                            <input
                              type="checkbox"
                              name="isActive"
                              defaultChecked={record.isActive}
                            />
                            Активно
                          </label>

                          <div className="flex flex-wrap items-center gap-3">
                            <button
                              type="submit"
                              className="rounded-2xl bg-[#081a4b] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0d2568]"
                            >
                              Сохранить
                            </button>
                          </div>
                        </form>

                        <div className="flex flex-wrap gap-3 pt-2">
                          <form action={toggleTenderInnRegistryAction}>
                            <input type="hidden" name="recordId" value={record.id} />
                            <input
                              type="hidden"
                              name="nextValue"
                              value={record.isActive ? "false" : "true"}
                            />
                            <button
                              type="submit"
                              className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                            >
                              {record.isActive ? "Выключить" : "Включить"}
                            </button>
                          </form>

                          <form action={deleteTenderInnRegistryAction}>
                            <input type="hidden" name="recordId" value={record.id} />
                            <button
                              type="submit"
                              className="rounded-2xl border border-rose-200 bg-white px-4 py-2.5 text-sm font-semibold text-rose-700 transition hover:bg-rose-50"
                            >
                              Удалить
                            </button>
                          </form>
                        </div>
                      </div>
                    </div>
                  </details>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
