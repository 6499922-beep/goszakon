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

  redirect("/procurements/new");
}
