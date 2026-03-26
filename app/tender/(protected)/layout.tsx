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
import { tenderHasCapability } from "@/lib/tender-permissions";
import { TENDER_INTAKE_ONLY_MODE } from "@/lib/tender-stage-mode";
import { TenderStageSwitcher } from "@/app/tender/_components/tender-stage-switcher";

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
  const role = currentUser?.role;

  const links = TENDER_INTAKE_ONLY_MODE
    ? [
        { title: "Загрузка и распознавание", href: "/procurements/new" },
        ...(tenderHasCapability(role, "rules_manage")
          ? [{ title: "ТВАРИ!", href: "/registry" }]
          : []),
        ...(tenderHasCapability(role, "rules_manage")
          ? [{ title: "Стоп-факторы", href: "/rules" }]
          : []),
      ]
    : [
        ...(tenderHasCapability(role, "overview")
          ? [{ title: "Обзор", href: "/" }]
          : []),
        ...(tenderHasCapability(role, "procurements_list")
          ? [{ title: "Закупки", href: "/procurements" }]
          : []),
        ...(tenderHasCapability(role, "companies_manage")
          ? [{ title: "Компании", href: "/companies" }]
          : []),
        ...(tenderHasCapability(role, "rules_manage")
          ? [{ title: "Стоп-факторы", href: "/rules" }]
          : []),
        ...(tenderHasCapability(role, "rules_manage")
          ? [{ title: "ТВАРИ!", href: "/registry" }]
          : []),
        ...(tenderHasCapability(role, "fas_access")
          ? [{ title: "Жалобы в ФАС", href: "/fas" }]
          : []),
        ...(tenderHasCapability(role, "users_manage")
          ? [{ title: "Пользователи", href: "/users" }]
          : []),
      ];

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-6 px-6 py-4">
          <div>
            <div className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
              GOSZAKON Tender Desk
            </div>
            <div className="mt-1 text-xl font-bold tracking-tight text-[#081a4b]">
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

      <div className="mx-auto max-w-[1500px] px-6 py-5">
        <section className="mb-5 rounded-[1.75rem] border border-slate-200 bg-white px-5 py-4 shadow-sm">
          <nav className="flex flex-wrap gap-2">
            {links.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="inline-flex rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-[#0d5bd7] hover:bg-white hover:text-[#0d5bd7]"
              >
                {item.title}
              </Link>
            ))}
          </nav>
        </section>

        {currentUser?.role === TenderUserRole.ADMIN ? (
          <section className="mb-5 rounded-[1.75rem] border border-slate-200 bg-white px-5 py-4 shadow-sm">
            <div className="text-sm font-medium uppercase tracking-[0.14em] text-slate-400">
              Этапы работы
            </div>
            <TenderStageSwitcher />
          </section>
        ) : null}

        <section>{children}</section>
      </div>
    </div>
  );
}
