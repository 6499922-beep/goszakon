import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function TenderProcurementLegacyRedirectPage({
  params: _params,
}: {
  params: Promise<{ id: string }>;
}) {
  notFound();
}
