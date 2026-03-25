import {
  createTenderRuleAction,
  deleteTenderRuleAction,
  toggleTenderRuleAction,
  updateTenderRuleAction,
} from "@/app/tender/actions";
import { getCurrentTenderUser } from "@/lib/admin-auth";
import { tenderHasCapability } from "@/lib/tender-permissions";
import { getPrisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function TenderRulesPage() {
  const currentUser = await getCurrentTenderUser();
  if (!currentUser || !tenderHasCapability(currentUser.role, "rules_manage")) {
    redirect("/procurements");
  }

  const prisma = getPrisma();
  const rules = await prisma.tenderStopRule.findMany({
    orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }],
    take: 50,
  });

  return (
    <main className="space-y-8">
      <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
        <div className="bg-[linear-gradient(135deg,#081a4b_0%,#143b8f_55%,#2f78ff_100%)] px-8 py-8 text-white">
          <div className="max-w-4xl">
            <div className="text-sm font-medium uppercase tracking-[0.16em] text-white/65">
              Rule Engine
            </div>
            <h1 className="mt-3 text-4xl font-bold tracking-tight">
              Стоп-факторы и гибкие правила
            </h1>
            <p className="mt-4 text-base leading-7 text-white/80">
              Здесь администратор управляет правилами без программиста: включает
              и отключает стоп-факторы, добавляет новые условия по ИНН, брендам,
              производителям и ключевым словам.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-8 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="text-sm font-medium uppercase tracking-[0.14em] text-slate-400">
            Новое правило
          </div>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-[#081a4b]">
            Добавить стоп-фактор
          </h2>

          <form action={createTenderRuleAction} className="mt-6 space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <div className="mb-2 text-sm font-medium text-slate-700">
                  Название правила
                </div>
                <input
                  name="name"
                  required
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#0d5bd7] focus:ring-4 focus:ring-[#0d5bd7]/10"
                  placeholder="Например: Заказчик РЖД"
                />
              </label>

              <label className="block">
                <div className="mb-2 text-sm font-medium text-slate-700">Код</div>
                <input
                  name="code"
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#0d5bd7] focus:ring-4 focus:ring-[#0d5bd7]/10"
                  placeholder="RZD_CUSTOMER"
                />
              </label>

              <label className="block">
                <div className="mb-2 text-sm font-medium text-slate-700">Тип</div>
                <select
                  name="kind"
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#0d5bd7] focus:ring-4 focus:ring-[#0d5bd7]/10"
                  defaultValue="OTHER"
                >
                  <option value="CUSTOMER">Контрагент</option>
                  <option value="PROCUREMENT">Закупка</option>
                  <option value="CATEGORY">Категория</option>
                  <option value="BRAND">Бренд</option>
                  <option value="MANUFACTURER">Производитель</option>
                  <option value="REGULATORY">Регуляторика</option>
                  <option value="DELIVERY">Поставка</option>
                  <option value="OTHER">Другое</option>
                </select>
              </label>

              <label className="block">
                <div className="mb-2 text-sm font-medium text-slate-700">
                  Порядок
                </div>
                <input
                  name="sortOrder"
                  type="number"
                  defaultValue={100}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#0d5bd7] focus:ring-4 focus:ring-[#0d5bd7]/10"
                />
              </label>

              <label className="block">
                <div className="mb-2 text-sm font-medium text-slate-700">
                  ИНН заказчика
                </div>
                <input
                  name="customerInn"
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#0d5bd7] focus:ring-4 focus:ring-[#0d5bd7]/10"
                  placeholder="Например: 7708503727"
                />
              </label>

              <label className="block">
                <div className="mb-2 text-sm font-medium text-slate-700">
                  Ключевое слово
                </div>
                <input
                  name="keyword"
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#0d5bd7] focus:ring-4 focus:ring-[#0d5bd7]/10"
                  placeholder="Например: бумаж"
                />
              </label>

              <label className="block">
                <div className="mb-2 text-sm font-medium text-slate-700">Бренд</div>
                <input
                  name="brandName"
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#0d5bd7] focus:ring-4 focus:ring-[#0d5bd7]/10"
                  placeholder="Например: ELTEX"
                />
              </label>

              <label className="block">
                <div className="mb-2 text-sm font-medium text-slate-700">
                  Производитель
                </div>
                <input
                  name="manufacturerName"
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#0d5bd7] focus:ring-4 focus:ring-[#0d5bd7]/10"
                  placeholder="Например: ЮМЭК"
                />
              </label>

              <label className="block md:col-span-2">
                <div className="mb-2 text-sm font-medium text-slate-700">
                  Описание
                </div>
                <textarea
                  name="description"
                  className="min-h-24 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm leading-7 outline-none transition focus:border-[#0d5bd7] focus:ring-4 focus:ring-[#0d5bd7]/10"
                  placeholder="Короткое пояснение, почему это стоп-фактор."
                />
              </label>
            </div>

            <div className="flex flex-wrap gap-5 text-sm text-slate-600">
              <label className="inline-flex items-center gap-2">
                <input type="checkbox" name="isActive" defaultChecked />
                Активно
              </label>
              <label className="inline-flex items-center gap-2">
                <input type="checkbox" name="isToggleable" defaultChecked />
                Можно выключать
              </label>
              <label className="inline-flex items-center gap-2">
                <input type="checkbox" name="requiresManualReview" />
                Нужна ручная проверка
              </label>
            </div>

            <button
              type="submit"
              className="rounded-2xl bg-[#081a4b] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0d2568]"
            >
              Добавить правило
            </button>
          </form>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="text-sm font-medium uppercase tracking-[0.14em] text-slate-400">
            Активные правила
          </div>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-[#081a4b]">
            Реестр стоп-факторов
          </h2>

          {rules.length === 0 ? (
            <div className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-500">
              Пока правила не заведены.
            </div>
          ) : (
            <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200">
              <div className="divide-y divide-slate-200 bg-white">
                {rules.map((rule) => (
                  <details key={rule.id} className="group">
                    <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-3 px-4 py-4">
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-[#081a4b]">{rule.name}</div>
                        <div className="mt-1 text-sm text-slate-500">
                          {rule.customerInn ||
                            rule.manufacturerName ||
                            rule.brandName ||
                            rule.keyword ||
                            "Без отдельного условия"}
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                          {rule.kind}
                        </span>
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                            rule.isActive
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {rule.isActive ? "Активно" : "Отключено"}
                        </span>
                      </div>
                    </summary>

                    <div className="border-t border-slate-100 bg-slate-50 px-4 py-4">
                      <div className="space-y-4">
                        <form action={updateTenderRuleAction} className="space-y-4">
                        <input type="hidden" name="ruleId" value={rule.id} />
                        <div className="grid gap-4 md:grid-cols-2">
                          <label className="block">
                            <div className="mb-2 text-sm font-medium text-slate-700">
                              Название правила
                            </div>
                            <input
                              name="name"
                              defaultValue={rule.name}
                              required
                              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#0d5bd7] focus:ring-4 focus:ring-[#0d5bd7]/10"
                            />
                          </label>

                          <label className="block">
                            <div className="mb-2 text-sm font-medium text-slate-700">
                              Код
                            </div>
                            <input
                              name="code"
                              defaultValue={rule.code}
                              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#0d5bd7] focus:ring-4 focus:ring-[#0d5bd7]/10"
                            />
                          </label>

                          <label className="block">
                            <div className="mb-2 text-sm font-medium text-slate-700">
                              Тип
                            </div>
                            <select
                              name="kind"
                              defaultValue={rule.kind}
                              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#0d5bd7] focus:ring-4 focus:ring-[#0d5bd7]/10"
                            >
                              <option value="CUSTOMER">Контрагент</option>
                              <option value="PROCUREMENT">Закупка</option>
                              <option value="CATEGORY">Категория</option>
                              <option value="BRAND">Бренд</option>
                              <option value="MANUFACTURER">Производитель</option>
                              <option value="REGULATORY">Регуляторика</option>
                              <option value="DELIVERY">Поставка</option>
                              <option value="OTHER">Другое</option>
                            </select>
                          </label>

                          <label className="block">
                            <div className="mb-2 text-sm font-medium text-slate-700">
                              Порядок
                            </div>
                            <input
                              name="sortOrder"
                              type="number"
                              defaultValue={rule.sortOrder}
                              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#0d5bd7] focus:ring-4 focus:ring-[#0d5bd7]/10"
                            />
                          </label>

                          <label className="block">
                            <div className="mb-2 text-sm font-medium text-slate-700">
                              ИНН заказчика
                            </div>
                            <input
                              name="customerInn"
                              defaultValue={rule.customerInn ?? ""}
                              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#0d5bd7] focus:ring-4 focus:ring-[#0d5bd7]/10"
                            />
                          </label>

                          <label className="block">
                            <div className="mb-2 text-sm font-medium text-slate-700">
                              Ключевое слово
                            </div>
                            <input
                              name="keyword"
                              defaultValue={rule.keyword ?? ""}
                              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#0d5bd7] focus:ring-4 focus:ring-[#0d5bd7]/10"
                            />
                          </label>

                          <label className="block">
                            <div className="mb-2 text-sm font-medium text-slate-700">
                              Бренд
                            </div>
                            <input
                              name="brandName"
                              defaultValue={rule.brandName ?? ""}
                              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#0d5bd7] focus:ring-4 focus:ring-[#0d5bd7]/10"
                            />
                          </label>

                          <label className="block">
                            <div className="mb-2 text-sm font-medium text-slate-700">
                              Производитель
                            </div>
                            <input
                              name="manufacturerName"
                              defaultValue={rule.manufacturerName ?? ""}
                              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#0d5bd7] focus:ring-4 focus:ring-[#0d5bd7]/10"
                            />
                          </label>

                          <label className="block">
                            <div className="mb-2 text-sm font-medium text-slate-700">
                              Порог, %
                            </div>
                            <input
                              name="thresholdPercent"
                              type="number"
                              defaultValue={rule.thresholdPercent ?? ""}
                              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#0d5bd7] focus:ring-4 focus:ring-[#0d5bd7]/10"
                            />
                          </label>

                          <label className="block md:col-span-2">
                            <div className="mb-2 text-sm font-medium text-slate-700">
                              Описание
                            </div>
                            <textarea
                              name="description"
                              defaultValue={rule.description ?? ""}
                              className="min-h-24 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm leading-7 outline-none transition focus:border-[#0d5bd7] focus:ring-4 focus:ring-[#0d5bd7]/10"
                            />
                          </label>
                        </div>

                        <div className="flex flex-wrap gap-5 text-sm text-slate-600">
                          <label className="inline-flex items-center gap-2">
                            <input type="checkbox" name="isActive" defaultChecked={rule.isActive} />
                            Активно
                          </label>
                          <label className="inline-flex items-center gap-2">
                            <input
                              type="checkbox"
                              name="isToggleable"
                              defaultChecked={rule.isToggleable}
                            />
                            Можно выключать
                          </label>
                          <label className="inline-flex items-center gap-2">
                            <input
                              type="checkbox"
                              name="requiresManualReview"
                              defaultChecked={rule.requiresManualReview}
                            />
                            Нужна ручная проверка
                          </label>
                        </div>

                        <div className="flex flex-wrap gap-3">
                          <button
                            type="submit"
                            className="rounded-2xl bg-[#081a4b] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#0d2568]"
                          >
                            Сохранить изменения
                          </button>
                        </div>
                      </form>

                        <div className="flex flex-wrap gap-3">
                          {rule.isToggleable ? (
                            <form action={toggleTenderRuleAction}>
                              <input type="hidden" name="ruleId" value={rule.id} />
                              <input
                                type="hidden"
                                name="nextValue"
                                value={rule.isActive ? "false" : "true"}
                              />
                              <button
                                type="submit"
                                className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                              >
                                {rule.isActive ? "Выключить" : "Включить"}
                              </button>
                            </form>
                          ) : null}

                          <form action={deleteTenderRuleAction}>
                            <input type="hidden" name="ruleId" value={rule.id} />
                            <button
                              type="submit"
                              className="rounded-2xl border border-rose-200 bg-white px-4 py-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-50"
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
