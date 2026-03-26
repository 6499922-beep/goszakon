import { renderTenderRecognitionEquipmentPage } from "@/app/tender/(protected)/procurements/_components/tender-procurement-equipment-page";

export const dynamic = "force-dynamic";

export default async function TenderSubmissionEquipmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return renderTenderRecognitionEquipmentPage({ params, viewMode: "submission" });
}
