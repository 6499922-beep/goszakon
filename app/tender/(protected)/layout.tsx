import Link from "next/link";
import { ReactNode } from "react";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  ADMIN_COOKIE_NAME,
  getCurrentTenderUser,
  verifyAdminSession,
} from "@/lib/admin-auth";
import { isTenderHost } from "@/lib/tender-host";
import { TenderUserRole } from "@prisma/client";
import { tenderUserRoleLabels } from "@/lib/tender-users";

export const dynamic = "force-dynamic";

export default async function TenderProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  const headerStore = await headers();

  if (!isTenderHost(headerStore.get("host"))) {
    redirect("/");
  }

  const cookieStore = await cookies();
  const session = await verifyAdminSession(
    cookieStore.get(ADMIN_COOKIE_NAME)?.value
  );

  if (!session) {
    redirect("/signin");
  }

  const currentUser = await getCurrentTenderUser();
  const fasRoles = new Set<TenderUserRole>([
    TenderUserRole.ADMIN,
    TenderUserRole.FAS_MANAGER,
    TenderUserRole.FAS_SPECIALIST,
  ]);

  const links = [
    { title: "Обзор", href: "/" },
    { title: "Закупки", href: "/procurements" },
    { title: "Компании", href: "/companies" },
    { title: "Стоп-факторы", href: "/rules" },
    ...(fasRoles.has(currentUser?.role as TenderUserRole)
      ? [{ title: "Жалобы в ФАС", href: "/fas" }]
      : []),
    ...(currentUser?.role === TenderUserRole.ADMIN
      ? [{ title: "Пользователи", href: "/users" }]
      : []),
  ];

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-5">
          <div>
            <div className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
              GOSZAKON Tender Desk
            </div>
            <div className="mt-1 text-2xl font-bold tracking-tight text-[#081a4b]">
              Кабинет подготовки заявок
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600 md:block">
              {currentUser
                ? `${currentUser.name ?? currentUser.email} • ${tenderUserRoleLabels[currentUser.role]}`
                : "MVP: анализ, предпросчет и сборка пакета"}
            </div>

            <form action="/logout" method="POST">
              <button
                type="submit"
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-50"
              >
                Выйти
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-8 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-4 rounded-2xl bg-[#081a4b] px-4 py-4 text-sm text-white">
            Основной сценарий: загрузить закупку, проверить стоп-факторы,
            передать на предпросчет и собрать комплект документов.
          </div>

          <nav className="space-y-2">
            {links.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                {item.title}
              </Link>
            ))}
          </nav>
        </aside>

        <section>{children}</section>
      </div>
    </div>
  );
}
