import {
  createTenderRuleAction,
  toggleTenderRuleAction,
} from "@/app/tender/actions";
import { getCurrentTenderUser } from "@/lib/admin-auth";
import { tenderHasCapability } from "@/lib/tender-permissions";
import { getPrisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { TENDER_INTAKE_ONLY_MODE } from "@/lib/tender-stage-mode";

export const dynamic = "force-dynamic";

export default async function TenderRulesPage() {
  if (TENDER_INTAKE_ONLY_MODE) {
    redirect("/procurements/new");
  }
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
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Правило</th>
                <th className="px-4 py-3 font-medium">Тип</th>
                <th className="px-4 py-3 font-medium">Статус</th>
                <th className="px-4 py-3 font-medium">Условие</th>
                <th className="px-4 py-3 font-medium">Действие</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {rules.map((rule) => (
                <tr key={rule.id}>
                  <td className="px-4 py-3 font-medium text-[#081a4b]">
                    {rule.name}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{rule.kind}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                        rule.isActive
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {rule.isActive ? "Активно" : "Отключено"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {rule.customerInn ||
                      rule.manufacturerName ||
                      rule.brandName ||
                      rule.keyword ||
                      "—"}
                  </td>
                  <td className="px-4 py-3">
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
                          className="rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                        >
                          {rule.isActive ? "Выключить" : "Включить"}
                        </button>
                      </form>
                    ) : (
                      <span className="text-xs text-slate-400">Фиксированное</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
