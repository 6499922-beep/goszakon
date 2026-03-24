import { TenderPromptConfigKey, TenderUserRole } from "@prisma/client";
import { redirect } from "next/navigation";
import { saveTenderFasPromptAction } from "@/app/tender/actions";
import { getCurrentTenderUser } from "@/lib/admin-auth";
import { tenderHasCapability } from "@/lib/tender-permissions";
import { getPrisma } from "@/lib/prisma";
import { tenderUserRoleLabels } from "@/lib/tender-users";

export const dynamic = "force-dynamic";

export default async function TenderFasPage() {
  const currentUser = await getCurrentTenderUser();
  const prisma = getPrisma();
  if (!currentUser || !tenderHasCapability(currentUser.role, "fas_access")) {
    redirect("/");
  }

  const promptConfig = await prisma.tenderPromptConfig.findUnique({
    where: { key: TenderPromptConfigKey.FAS_POTENTIAL_COMPLAINT },
    include: { updatedBy: true },
  });

  const fasItems = await prisma.tenderProcurement.findMany({
    where: {
      fasReview: {
        isNot: null,
      },
    },
    include: {
      fasReview: true,
    },
    orderBy: [{ updatedAt: "desc" }],
    take: 20,
  });

  const canEditPrompt = tenderHasCapability(currentUser.role, "fas_manage");

  const fasStatusLabel = {
    NOT_STARTED: "Ещё не запускали",
    NO_VIOLATION: "Нарушений не выявлено",
    POTENTIAL_COMPLAINT: "Есть основание для жалобы",
    MANUAL_REVIEW: "Нужна ручная проверка",
  } as const;

  const fasStatusTone = {
    NOT_STARTED: "bg-slate-100 text-slate-700",
    NO_VIOLATION: "bg-emerald-50 text-emerald-700",
    POTENTIAL_COMPLAINT: "bg-rose-50 text-rose-700",
    MANUAL_REVIEW: "bg-amber-50 text-amber-700",
  } as const;

  return (
    <main className="space-y-8">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="text-sm font-medium uppercase tracking-[0.14em] text-slate-400">
          Параллельная ветка
        </div>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#081a4b]">
          Потенциальные жалобы в ФАС
        </h1>
        <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-600">
          Эта ветка работает на той же документации, что и основной сценарий закупки.
          Если нарушения не выявлены с высокой вероятностью обоснования, система не
          должна выдумывать основания. Если есть сомнения, вопрос уходит сотруднику
          по жалобам ФАС.
        </p>
      </section>

      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-sm font-medium uppercase tracking-[0.14em] text-slate-400">
              ФАС-промт
            </div>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-[#081a4b]">
              Редактируемый промт для проверки жалоб
            </h2>
          </div>

          <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
            {promptConfig?.updatedBy
              ? `Последнее изменение: ${promptConfig.updatedBy.name ?? promptConfig.updatedBy.email}`
              : "Пока без истории изменений"}
          </div>
        </div>

        <form action={saveTenderFasPromptAction} className="mt-6 space-y-4">
          <textarea
            name="body"
            rows={12}
            defaultValue={promptConfig?.body ?? ""}
            readOnly={!canEditPrompt}
            className="w-full rounded-3xl border border-slate-300 px-5 py-4 text-sm leading-7 text-slate-700 outline-none focus:border-[#0d5bd7] focus:ring-4 focus:ring-[#0d5bd7]/10"
          />

          {canEditPrompt ? (
            <button
              type="submit"
              className="rounded-2xl bg-[#081a4b] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0d2568]"
            >
              Сохранить ФАС-промт
            </button>
          ) : (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Редактировать этот промт могут только {tenderUserRoleLabels[TenderUserRole.ADMIN]} и {tenderUserRoleLabels[TenderUserRole.FAS_MANAGER]}.
            </div>
          )}
        </form>
      </section>

      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="text-sm font-medium uppercase tracking-[0.14em] text-slate-400">
          Последние кейсы
        </div>
        <h2 className="mt-2 text-2xl font-bold tracking-tight text-[#081a4b]">
          Что уже ушло в ФАС-контур
        </h2>

        <div className="mt-6 space-y-4">
          {fasItems.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
              Пока нет закупок, которые были заведены в ветку жалобы в ФАС.
            </div>
          ) : (
            fasItems.map((item) => (
              <a
                key={item.id}
                href={`/procurements/${item.id}`}
                className="block rounded-3xl border border-slate-200 bg-slate-50 p-5 transition hover:border-[#0d5bd7]"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="text-lg font-semibold text-[#081a4b]">
                      {item.title}
                    </div>
                    <div className="mt-1 text-sm text-slate-500">
                      {item.customerName ?? "Заказчик не указан"} • {item.procurementNumber ?? "Номер не указан"}
                    </div>
                  </div>

                  {item.fasReview ? (
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${fasStatusTone[item.fasReview.status]}`}
                    >
                      {fasStatusLabel[item.fasReview.status]}
                    </span>
                  ) : null}
                </div>

                {item.fasReview?.findingTitle ? (
                  <div className="mt-3 text-sm leading-7 text-slate-700">
                    Нарушение: {item.fasReview.findingTitle}
                  </div>
                ) : null}
              </a>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
