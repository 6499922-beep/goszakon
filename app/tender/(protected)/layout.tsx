import { ReactNode } from "react";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  ADMIN_COOKIE_NAME,
  getCurrentTenderUser,
  verifyAdminSession,
} from "@/lib/admin-auth";
import { isTenderChatHost, isTenderHost } from "@/lib/tender-host";
import { tenderUserRoleLabels } from "@/lib/tender-users";
import { tenderHasCapability } from "@/lib/tender-permissions";
import { TENDER_INTAKE_ONLY_MODE } from "@/lib/tender-stage-mode";
import { TenderProtectedShell } from "@/app/tender/_components/tender-protected-shell";

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
  const chatHost = isTenderChatHost(headerStore.get("host"));

  const links = chatHost
    ? [
        ...(tenderHasCapability(role, "procurement_comments")
          ? [{ title: "GPT-чат", href: "/chat" }]
          : []),
        ...(tenderHasCapability(role, "vpn_manage")
          ? [{ title: "VPN", href: "/vpn" }]
          : []),
        ...(tenderHasCapability(role, "procurements_list")
          ? [{ title: "Загрузка и распознавание", href: "/procurements/new" }]
          : []),
      ]
    : TENDER_INTAKE_ONLY_MODE
    ? [
        { title: "Загрузка и распознавание", href: "/procurements/new" },
        ...(tenderHasCapability(role, "procurement_comments")
          ? [{ title: "GPT-чат", href: "/chat" }]
          : []),
        ...(tenderHasCapability(role, "vpn_manage")
          ? [{ title: "VPN", href: "/vpn" }]
          : []),
        ...(tenderHasCapability(role, "procurements_list")
          ? [{ title: "Архив", href: "/procurements/archive" }]
          : []),
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
        ...(tenderHasCapability(role, "procurement_comments")
          ? [{ title: "GPT-чат", href: "/chat" }]
          : []),
        ...(tenderHasCapability(role, "vpn_manage")
          ? [{ title: "VPN", href: "/vpn" }]
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
    <TenderProtectedShell
      links={links}
      currentUserLabel={
        currentUser
          ? `${currentUser.name ?? currentUser.email} • ${tenderUserRoleLabels[currentUser.role]}`
          : "Тендерный кабинет"
      }
      role={currentUser?.role ?? null}
    >
      {children}
    </TenderProtectedShell>
  );
}
