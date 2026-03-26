import { renderTenderRecognitionDetailPage } from "@/app/tender/(protected)/procurements/_components/tender-procurement-detail-page";

export const dynamic = "force-dynamic";

export default async function TenderPricingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return renderTenderRecognitionDetailPage({ params, viewMode: "pricing" });
}
