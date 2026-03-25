import {
  TenderActionType,
  TenderFasReviewStatus,
  TenderProcurementStatus,
  TenderPromptConfigKey,
} from "@prisma/client";
import { getPrisma } from "@/lib/prisma";
import {
  evaluateTenderStopRules,
  runTenderAiAnalysis,
  runTenderFasAiAnalysis,
} from "@/lib/tender-analysis";
import { logTenderEvent } from "@/lib/tender-workflow";

export async function runTenderPrimaryAnalysis(input: {
  procurementId: number;
  sourceText: string;
}) {
  const prisma = getPrisma();
  const procurementId = input.procurementId;
  const sourceText = input.sourceText.trim();

  await prisma.tenderProcurement.update({
    where: { id: procurementId },
    data: {
      sourceText,
      aiAnalysisStatus: "running",
      aiAnalysisError: null,
      status: TenderProcurementStatus.ANALYSIS,
    },
  });

  const procurement = await prisma.tenderProcurement.findUnique({
    where: { id: procurementId },
  });

  if (!procurement) {
    throw new Error("Procurement not found");
  }

  const { model, result } = await runTenderAiAnalysis({
    title: procurement.title,
    customerName: procurement.customerName,
    customerInn: procurement.customerInn,
    procurementNumber: procurement.procurementNumber,
    platform: procurement.platform,
    itemsCount: procurement.itemsCount,
    nmckWithoutVat: procurement.nmckWithoutVat?.toString() ?? null,
    sourceText,
  });

  const fasPromptConfig = await prisma.tenderPromptConfig.findUnique({
    where: { key: TenderPromptConfigKey.FAS_POTENTIAL_COMPLAINT },
  });

  const fasPromptBody =
    fasPromptConfig?.body?.trim() ||
    [
      "Если явных нарушений с высокой вероятностью обоснования не выявлено — прямо укажи это и не выдумывай основания.",
      "Запрещено:",
      "придумывать нарушения при отсутствии прямых оснований;",
      "включать спорные/оценочные доводы без формальной доказуемости;",
      "рассуждать о целесообразности участия или коммерческих рисках;",
      "давать теорию без привязки к конкретному пункту документации.",
    ].join("\n");

  const { result: fasResult } = await runTenderFasAiAnalysis({
    title: procurement.title,
    customerName: procurement.customerName,
    customerInn: procurement.customerInn,
    procurementNumber: procurement.procurementNumber,
    platform: procurement.platform,
    sourceText,
    promptBody: fasPromptBody,
  });

  await prisma.tenderProcurement.update({
    where: { id: procurementId },
    data: {
      sourceText,
      aiAnalysis: result,
      aiAnalysisStatus: "completed",
      aiAnalysisError: null,
      aiAnalyzedAt: new Date(),
      aiModel: model,
      title:
        procurement.title === "Новая закупка" && result.summary?.trim()
          ? result.summary.trim().slice(0, 140)
          : procurement.title,
      summary: result.summary || null,
      selectionCriteria: result.selection_criteria || null,
      requiredDocuments: result.required_documents.length
        ? result.required_documents
        : undefined,
      nonstandardRequirements: result.nonstandard_requirements.length
        ? result.nonstandard_requirements
        : undefined,
      deliveryTerms: result.delivery_terms || null,
      paymentTerms: result.payment_terms || null,
      contractTerm: result.contract_term || null,
      penaltyTerms: result.penalty_terms || null,
      stopFactorsSummary: result.stop_factor_findings.length
        ? result.stop_factor_findings.map((item) => `${item.name}: ${item.reason}`).join("\n")
        : "Стоп-факторы в тексте не обнаружены",
    },
  });

  await prisma.tenderFasReview.upsert({
    where: { procurementId },
    update: {
      status: fasResult.status as TenderFasReviewStatus,
      findingTitle:
        fasResult.finding_title ||
        (fasResult.status === "NO_VIOLATION"
          ? "Нарушений для жалобы в ФАС не выявлено"
          : null),
      findingBasis: fasResult.finding_basis || null,
      confidenceNote: fasResult.confidence_note || null,
      promptSnapshot: fasPromptBody,
      lastAnalyzedAt: new Date(),
    },
    create: {
      procurementId,
      status: fasResult.status as TenderFasReviewStatus,
      findingTitle:
        fasResult.finding_title ||
        (fasResult.status === "NO_VIOLATION"
          ? "Нарушений для жалобы в ФАС не выявлено"
          : null),
      findingBasis: fasResult.finding_basis || null,
      confidenceNote: fasResult.confidence_note || null,
      promptSnapshot: fasPromptBody,
      lastAnalyzedAt: new Date(),
    },
  });

  await evaluateTenderStopRules(procurementId);

  await logTenderEvent({
    procurementId,
    actionType: TenderActionType.AI_ANALYZED,
    title: "AI-анализ выполнен",
    description: "Система автоматически разобрала документацию и заполнила карточку закупки.",
    actorName: "AI",
    metadata: {
      model,
      stopFactorFindings: result.stop_factor_findings.length,
      fasStatus: fasResult.status,
    },
  });

  await logTenderEvent({
    procurementId,
    actionType: TenderActionType.NOTE_ADDED,
    title: "ФАС-ветка проверена автоматически",
    description:
      fasResult.status === "POTENTIAL_COMPLAINT"
        ? `AI нашёл потенциальное нарушение: ${fasResult.finding_title || "см. карточку ФАС-ветки"}.`
        : fasResult.status === "MANUAL_REVIEW"
          ? "AI не уверен по ФАС-ветке и отправил её на ручную проверку."
          : "AI не нашёл явных нарушений для жалобы в ФАС.",
    actorName: "AI",
    metadata: {
      model,
      fasStatus: fasResult.status,
    },
  });

  return { model, result, fasResult };
}
