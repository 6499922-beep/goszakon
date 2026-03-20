import { redirect } from "next/navigation";

export default function LegacyAdminNewPage() {
  redirect("/admin/cases/new");
}
