import { TenderDecision, TenderFasReviewStatus, TenderProcurementStatus } from "@prisma/client";
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

  const alertProcurements = await prisma.tenderProcurement.findMany({
    orderBy: [{ deadline: "asc" }, { updatedAt: "desc" }],
    take: 12,
    include: {
      technicalItems: {
        select: {
          status: true,
          pricingReady: true,
          approximateUnitPrice: true,
        },
      },
      procurementDocuments: {
        select: {
          status: true,
        },
      },
      sourceDocuments: {
        select: {
          status: true,
          autofillStatus: true,
          draftContent: true,
        },
      },
      fasReview: {
        select: {
          status: true,
        },
      },
    },
  });

  const now = new Date();
  const alerts = {
    deadlineHot: 0,
    manualReview: 0,
    waitingManager: 0,
    readyToSubmit: 0,
    fasCases: 0,
  };

  for (const item of alertProcurements) {
    if (item.deadline) {
      const hours = (item.deadline.getTime() - now.getTime()) / (1000 * 60 * 60);
      if (hours <= 24) alerts.deadlineHot += 1;
    }

    const needsManualReview =
      item.technicalItems.some(
        (technicalItem) =>
          technicalItem.status === "REVIEW" ||
          (technicalItem.pricingReady && technicalItem.approximateUnitPrice == null)
      ) ||
      item.procurementDocuments.some(
        (document) => document.status === "MISSING" || document.status === "REVIEW"
      ) ||
      item.sourceDocuments.some(
        (document) =>
          document.status === "READY_FOR_ANALYSIS" &&
          (document.autofillStatus === "NOT_ANALYZED" ||
            document.autofillStatus === "MANUAL_ONLY" ||
            !document.draftContent)
      ) ||
      item.fasReview?.status === TenderFasReviewStatus.MANUAL_REVIEW;

    if (needsManualReview) alerts.manualReview += 1;

    if (
      item.aiAnalysisStatus === "completed" &&
      item.decision == null &&
      item.status !== TenderProcurementStatus.STOPPED &&
      !needsManualReview
    ) {
      alerts.waitingManager += 1;
    }

    if (
      item.decision === TenderDecision.SUBMIT &&
      item.procurementDocuments.length > 0 &&
      !needsManualReview
    ) {
      alerts.readyToSubmit += 1;
    }

    if (item.fasReview?.status === TenderFasReviewStatus.POTENTIAL_COMPLAINT) {
      alerts.fasCases += 1;
    }
  }

  return {
    procurementsTotal,
    activeProcurements,
    readyProcurements,
    rulesTotal,
    companiesTotal,
    recentProcurements,
    alerts,
  };
}
