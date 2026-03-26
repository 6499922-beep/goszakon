import { notFound, redirect } from "next/navigation";
import { TenderProcurementStatus } from "@prisma/client";
import { getPrisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function TenderProcurementLegacyRedirectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const procurementId = Number(id);

  if (!Number.isInteger(procurementId) || procurementId <= 0) {
    notFound();
  }

  const prisma = getPrisma();
  const procurement = await prisma.tenderProcurement.findUnique({
    where: { id: procurementId },
    select: {
      id: true,
      status: true,
    },
  });

  if (!procurement) {
    notFound();
  }

  if (procurement.status === TenderProcurementStatus.PRICING) {
    redirect(`/procurements/recognition/${procurement.id}?stage=pricing`);
  }

  redirect(`/procurements/recognition/${procurement.id}`);
}
