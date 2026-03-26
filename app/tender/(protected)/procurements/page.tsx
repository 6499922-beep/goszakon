import { redirect } from "next/navigation";
import { getCurrentTenderUser } from "@/lib/admin-auth";
import { tenderHasCapability } from "@/lib/tender-permissions";

export const dynamic = "force-dynamic";

export default async function TenderProcurementsPage() {
  const currentUser = await getCurrentTenderUser();

  if (currentUser && tenderHasCapability(currentUser.role, "procurement_create")) {
    redirect("/procurements/new");
  }

  if (currentUser && tenderHasCapability(currentUser.role, "procurement_pricing")) {
    redirect("/procurements/pricing");
  }

  if (currentUser && tenderHasCapability(currentUser.role, "procurement_decision")) {
    redirect("/procurements/approval");
  }

  if (currentUser && tenderHasCapability(currentUser.role, "procurement_submission")) {
    redirect("/procurements/submission");
  }

  redirect("/procurements/new");
}
