import { redirect } from "next/navigation";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function LegacyAdminEditPage({ params }: PageProps) {
  const { id } = await params;
  redirect(`/admin/cases/${id}/edit`);
}
