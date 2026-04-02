import { TenderUserRole } from "@prisma/client";

export type TenderCapability =
  | "overview"
  | "procurements_list"
  | "procurement_create"
  | "procurement_initial"
  | "procurement_pricing"
  | "procurement_decision"
  | "procurement_documents"
  | "procurement_submission"
  | "procurement_comments"
  | "vpn_access"
  | "vpn_manage"
  | "companies_manage"
  | "rules_manage"
  | "users_manage"
  | "fas_access"
  | "fas_manage";

const capabilityMatrix: Record<TenderUserRole, Set<TenderCapability>> = {
  [TenderUserRole.ADMIN]: new Set<TenderCapability>([
    "overview",
    "procurements_list",
    "procurement_create",
    "procurement_initial",
    "procurement_pricing",
    "procurement_decision",
    "procurement_documents",
    "procurement_submission",
    "procurement_comments",
    "vpn_access",
    "vpn_manage",
    "companies_manage",
    "rules_manage",
    "users_manage",
    "fas_access",
    "fas_manage",
  ]),
  [TenderUserRole.OPERATOR]: new Set<TenderCapability>([
    "procurements_list",
    "procurement_create",
    "procurement_initial",
    "procurement_comments",
    "vpn_access",
  ]),
  [TenderUserRole.ANALYST]: new Set<TenderCapability>([
    "procurements_list",
    "procurement_pricing",
    "procurement_comments",
    "vpn_access",
  ]),
  [TenderUserRole.MANAGER]: new Set<TenderCapability>([
    "overview",
    "procurements_list",
    "procurement_create",
    "procurement_initial",
    "procurement_pricing",
    "procurement_decision",
    "procurement_documents",
    "procurement_submission",
    "procurement_comments",
    "vpn_access",
    "vpn_manage",
    "companies_manage",
    "rules_manage",
    "users_manage",
    "fas_access",
    "fas_manage",
  ]),
  [TenderUserRole.SUBMITTER]: new Set<TenderCapability>([
    "procurements_list",
    "procurement_documents",
    "procurement_submission",
    "procurement_comments",
    "vpn_access",
  ]),
  [TenderUserRole.FAS_SPECIALIST]: new Set<TenderCapability>([
    "procurements_list",
    "procurement_comments",
    "vpn_access",
    "fas_access",
  ]),
  [TenderUserRole.FAS_MANAGER]: new Set<TenderCapability>([
    "procurements_list",
    "procurement_comments",
    "vpn_access",
    "fas_access",
    "fas_manage",
  ]),
};

export function tenderHasCapability(
  role: TenderUserRole | null | undefined,
  capability: TenderCapability
) {
  if (!role) return false;
  return capabilityMatrix[role]?.has(capability) ?? false;
}

export function tenderCanAny(
  role: TenderUserRole | null | undefined,
  capabilities: TenderCapability[]
) {
  return capabilities.some((capability) => tenderHasCapability(role, capability));
}
