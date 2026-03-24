import { TenderProcurementStatus } from "@prisma/client";
import { getPrisma } from "@/lib/prisma";
export { tenderStatusLabels } from "@/lib/tender-format";

export async function getTenderDashboardData() {
  const prisma = getPrisma();

  const [procurementsTotal, activeProcurements, readyProcurements, rulesTotal, companiesTotal] =
    await Promise.all([
      prisma.tenderProcurement.count(),
      prisma.tenderProcurement.count({
        where: {
          status: {
            in: [
              TenderProcurementStatus.NEW,
              TenderProcurementStatus.ANALYSIS,
              TenderProcurementStatus.PRICING,
              TenderProcurementStatus.APPROVED,
              TenderProcurementStatus.IN_PREPARATION,
            ],
          },
        },
      }),
      prisma.tenderProcurement.count({
        where: {
          status: {
            in: [TenderProcurementStatus.READY, TenderProcurementStatus.SUBMITTED],
          },
        },
      }),
      prisma.tenderStopRule.count({
        where: { isActive: true },
      }),
      prisma.tenderCompanyProfile.count(),
    ]);

  const recentProcurements = await prisma.tenderProcurement.findMany({
    orderBy: { updatedAt: "desc" },
    take: 6,
    select: {
      id: true,
      title: true,
      customerName: true,
      status: true,
      deadline: true,
      updatedAt: true,
      itemsCount: true,
      nmckWithoutVat: true,
    },
  });

  return {
    procurementsTotal,
    activeProcurements,
    readyProcurements,
    rulesTotal,
    companiesTotal,
    recentProcurements,
  };
}
