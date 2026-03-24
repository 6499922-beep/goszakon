import { TenderUserRole } from "@prisma/client";
import { redirect } from "next/navigation";
import { saveTenderUserAction } from "@/app/tender/actions";
import { getCurrentTenderUser } from "@/lib/admin-auth";
import { tenderHasCapability } from "@/lib/tender-permissions";
import { getPrisma } from "@/lib/prisma";
import {
  tenderUserRoleDescriptions,
  tenderUserRoleLabels,
} from "@/lib/tender-users";

export const dynamic = "force-dynamic";

export default async function TenderUsersPage() {
  const currentUser = await getCurrentTenderUser();

  if (!currentUser || !tenderHasCapability(currentUser.role, "users_manage")) {
    redirect("/");
  }

  const prisma = getPrisma();
  const users = await prisma.admin.findMany({
    orderBy: [{ role: "asc" }, { createdAt: "asc" }],
  });

  return (
    <main className="space-y-8">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-sm font-medium uppercase tracking-[0.14em] text-slate-400">
              Доступы и роли
            </div>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#081a4b]">
              Пользователи тендерного кабинета
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
              Здесь можно сразу закладывать командную работу: у каждого свой логин,
              пароль и зона ответственности. Это база для большой CRM, а не общий
              кабинет на всех.
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
            Всего пользователей: <span className="font-semibold text-[#081a4b]">{users.length}</span>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {Object.values(TenderUserRole).map((role) => (
            <div
              key={role}
              className="rounded-3xl border border-slate-200 bg-slate-50 p-4"
            >
              <div className="text-sm font-semibold text-[#081a4b]">
                {tenderUserRoleLabels[role]}
              </div>
              <div className="mt-2 text-sm leading-6 text-slate-600">
                {tenderUserRoleDescriptions[role]}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="text-sm font-medium uppercase tracking-[0.14em] text-slate-400">
          Новый пользователь
        </div>
        <h2 className="mt-2 text-2xl font-bold tracking-tight text-[#081a4b]">
          Добавить сотрудника
        </h2>

        <form action={saveTenderUserAction} className="mt-6 grid gap-4 lg:grid-cols-2">
          <label className="block">
            <div className="mb-2 text-sm font-medium text-slate-700">Имя</div>
            <input
              name="name"
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-[#0d5bd7] focus:ring-4 focus:ring-[#0d5bd7]/10"
              placeholder="Например, Иван Петров"
            />
          </label>

          <label className="block">
            <div className="mb-2 text-sm font-medium text-slate-700">Email</div>
            <input
              type="email"
              name="email"
              required
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-[#0d5bd7] focus:ring-4 focus:ring-[#0d5bd7]/10"
              placeholder="operator@goszakon.ru"
            />
          </label>

          <label className="block">
            <div className="mb-2 text-sm font-medium text-slate-700">Роль</div>
            <select
              name="role"
              defaultValue={TenderUserRole.OPERATOR}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-[#0d5bd7] focus:ring-4 focus:ring-[#0d5bd7]/10"
            >
              {Object.values(TenderUserRole).map((role) => (
                <option key={role} value={role}>
                  {tenderUserRoleLabels[role]}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <div className="mb-2 text-sm font-medium text-slate-700">Пароль</div>
            <input
              type="password"
              name="password"
              required
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-[#0d5bd7] focus:ring-4 focus:ring-[#0d5bd7]/10"
              placeholder="Минимум для первого входа"
            />
          </label>

          <div className="lg:col-span-2">
            <button
              type="submit"
              className="rounded-2xl bg-[#081a4b] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0d2568]"
            >
              Создать пользователя
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="text-sm font-medium uppercase tracking-[0.14em] text-slate-400">
          Действующие учётки
        </div>
        <h2 className="mt-2 text-2xl font-bold tracking-tight text-[#081a4b]">
          Кто уже работает в системе
        </h2>

        <div className="mt-6 grid gap-4">
          {users.map((user) => (
            <div
              key={user.id}
              className="rounded-3xl border border-slate-200 bg-slate-50 p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-lg font-semibold text-[#081a4b]">
                    {user.name ?? user.email}
                  </div>
                  <div className="mt-1 text-sm text-slate-500">{user.email}</div>
                </div>

                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                  {tenderUserRoleLabels[user.role]}
                </span>
              </div>

              <form action={saveTenderUserAction} className="mt-4 grid gap-3 lg:grid-cols-[1fr_1fr_220px_auto]">
                <input type="hidden" name="userId" value={user.id} />
                <input
                  name="name"
                  defaultValue={user.name ?? ""}
                  className="rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-[#0d5bd7] focus:ring-4 focus:ring-[#0d5bd7]/10"
                  placeholder="Имя"
                />
                <input
                  name="email"
                  type="email"
                  defaultValue={user.email}
                  className="rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-[#0d5bd7] focus:ring-4 focus:ring-[#0d5bd7]/10"
                />
                <select
                  name="role"
                  defaultValue={user.role}
                  className="rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-[#0d5bd7] focus:ring-4 focus:ring-[#0d5bd7]/10"
                >
                  {Object.values(TenderUserRole).map((role) => (
                    <option key={role} value={role}>
                      {tenderUserRoleLabels[role]}
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  Сохранить
                </button>

                <input
                  name="password"
                  type="password"
                  className="lg:col-span-3 rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-[#0d5bd7] focus:ring-4 focus:ring-[#0d5bd7]/10"
                  placeholder="Новый пароль, если нужно сменить"
                />
              </form>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
