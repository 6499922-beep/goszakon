"use server";

import {
  TenderRuleKind,
  TenderActionType,
  TenderCompanyDocumentType,
  TenderDecision,
  TenderProcurementStatus,
} from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getPrisma } from "@/lib/prisma";
import {
  evaluateTenderStopRules,
  runTenderAiAnalysis,
} from "@/lib/tender-analysis";
import {
  getDecisionStatus,
  logTenderEvent,
} from "@/lib/tender-workflow";

function normalizeString(value: FormDataEntryValue | null) {
  const normalized = String(value ?? "").trim();
  return normalized.length ? normalized : null;
}

function normalizeNumber(value: FormDataEntryValue | null) {
  const normalized = String(value ?? "")
    .trim()
    .replace(/\s+/g, "")
    .replace(",", ".");

  if (!normalized) return null;

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeDate(value: FormDataEntryValue | null) {
  const raw = String(value ?? "").trim();
  return raw ? new Date(raw) : null;
}

function splitLines(value: FormDataEntryValue | null) {
  const raw = String(value ?? "").trim();
  if (!raw) return undefined;

  return raw
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

const tenderTechnicalItemStatuses = [
  "EXPLICIT",
  "IDENTIFIED",
  "REVIEW",
  "REJECTED",
] as const;

type TenderTechnicalItemStatusValue = (typeof tenderTechnicalItemStatuses)[number];

function normalizeTenderTechnicalItemStatus(
  value: FormDataEntryValue | null
): TenderTechnicalItemStatusValue {
  const normalized = String(value ?? "REVIEW").trim().toUpperCase();

  return tenderTechnicalItemStatuses.includes(
    normalized as TenderTechnicalItemStatusValue
  )
    ? (normalized as TenderTechnicalItemStatusValue)
    : "REVIEW";
}

export async function createTenderProcurementAction(formData: FormData) {
  const prisma = getPrisma();

  const record = await prisma.tenderProcurement.create({
    data: {
      title: String(formData.get("title") ?? "").trim(),
      sourceUrl: normalizeString(formData.get("sourceUrl")),
      customerName: normalizeString(formData.get("customerName")),
      customerInn: normalizeString(formData.get("customerInn")),
      procurementNumber: normalizeString(formData.get("procurementNumber")),
      platform: normalizeString(formData.get("platform")),
      deadline: normalizeDate(formData.get("deadline")),
      nmck: normalizeNumber(formData.get("nmck")),
      nmckWithoutVat: normalizeNumber(formData.get("nmckWithoutVat")),
      itemsCount: normalizeNumber(formData.get("itemsCount")),
      purchaseType: normalizeString(formData.get("purchaseType")),
      summary: normalizeString(formData.get("summary")),
      selectionCriteria: normalizeString(formData.get("selectionCriteria")),
      requiredDocuments: splitLines(formData.get("requiredDocuments")),
      nonstandardRequirements: splitLines(formData.get("nonstandardRequirements")),
      deliveryTerms: normalizeString(formData.get("deliveryTerms")),
      paymentTerms: normalizeString(formData.get("paymentTerms")),
      contractTerm: normalizeString(formData.get("contractTerm")),
      penaltyTerms: normalizeString(formData.get("penaltyTerms")),
      stopFactorsSummary: normalizeString(formData.get("stopFactorsSummary")),
      assignedTo: normalizeString(formData.get("assignedTo")),
      status: TenderProcurementStatus.NEW,
    },
  });

  await logTenderEvent({
    procurementId: record.id,
    actionType: TenderActionType.CREATED,
    title: "Закупка создана",
    description: "Создана первичная карточка закупки.",
    actorName: normalizeString(formData.get("actorName")) ?? "Сотрудник",
  });

  revalidatePath("/");
  revalidatePath("/procurements");
  redirect(`/procurements/${record.id}`);
}

export async function analyzeTenderProcurementAction(formData: FormData) {
  const prisma = getPrisma();
  const procurementId = Number(formData.get("procurementId"));
  const sourceText = String(formData.get("sourceText") ?? "").trim();

  if (!Number.isInteger(procurementId) || procurementId <= 0) {
    throw new Error("Invalid procurement id");
  }

  await prisma.tenderProcurement.update({
    where: { id: procurementId },
    data: {
      sourceText,
      aiAnalysisStatus: "running",
      aiAnalysisError: null,
      status: TenderProcurementStatus.ANALYSIS,
    },
  });

  try {
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

    await prisma.tenderProcurement.update({
      where: { id: procurementId },
      data: {
        sourceText,
        aiAnalysis: result,
        aiAnalysisStatus: "completed",
        aiAnalysisError: null,
        aiAnalyzedAt: new Date(),
        aiModel: model,
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
          ? result.stop_factor_findings
              .map((item) => `${item.name}: ${item.reason}`)
              .join("\n")
          : "Стоп-факторы в тексте не обнаружены",
      },
    });

    await evaluateTenderStopRules(procurementId);

    await logTenderEvent({
      procurementId,
      actionType: TenderActionType.AI_ANALYZED,
      title: "AI-анализ выполнен",
      description: "Структурная выжимка сформирована и применена к карточке закупки.",
      actorName: "AI",
      metadata: {
        model,
        stopFactorFindings: result.stop_factor_findings.length,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Не удалось выполнить AI-анализ";

    await prisma.tenderProcurement.update({
      where: { id: procurementId },
      data: {
        sourceText,
        aiAnalysisStatus: "failed",
        aiAnalysisError: message,
      },
    });
  }

  revalidatePath(`/procurements/${procurementId}`);
  redirect(`/procurements/${procurementId}`);
}

export async function saveTenderPricingReviewAction(formData: FormData) {
  const prisma = getPrisma();
  const procurementId = Number(formData.get("procurementId"));
  const actorName = normalizeString(formData.get("actorName")) ?? "AI/Сотрудник";
  const pricingStatus = String(formData.get("pricingStatus") ?? "").trim() || null;
  const approximatePurchasePrice = normalizeNumber(
    formData.get("approximatePurchasePrice")
  );
  const sourceSummary = normalizeString(formData.get("sourceSummary"));
  const aiComment = normalizeString(formData.get("aiComment"));
  const sourceLinks = splitLines(formData.get("sourceLinks")) ?? [];

  await prisma.tenderPricingReview.create({
    data: {
      procurementId,
      approximatePurchasePrice,
      pricingStatus,
      sourceSummary,
      aiComment,
      sourceLinks,
      createdBy: actorName,
    },
  });

  await prisma.tenderProcurement.update({
    where: { id: procurementId },
    data: {
      approximatePurchasePrice,
      pricingComment: aiComment ?? sourceSummary,
      pricingStatus,
      pricingReviewedAt: new Date(),
      status:
        pricingStatus === "profitable"
          ? TenderProcurementStatus.PRICING
          : pricingStatus === "low_margin"
            ? TenderProcurementStatus.PRICING
            : TenderProcurementStatus.PRICING,
    },
  });

  await logTenderEvent({
    procurementId,
    actionType: TenderActionType.PRICING_UPDATED,
    title: "Предпросчёт обновлён",
    description:
      pricingStatus === "not_found"
        ? "Цены не найдены, закупка требует ручной проверки."
        : pricingStatus === "low_margin"
          ? "Найденные цены дают низкую рентабельность."
          : "Добавлен результат предпросчёта по закупке.",
    actorName,
    metadata: {
      pricingStatus,
      approximatePurchasePrice,
      sourceLinksCount: sourceLinks.length,
    },
  });

  revalidatePath(`/procurements/${procurementId}`);
}

export async function saveTenderDecisionAction(formData: FormData) {
  const prisma = getPrisma();
  const procurementId = Number(formData.get("procurementId"));
  const companyProfileId = Number(formData.get("companyProfileId"));
  const actorName = normalizeString(formData.get("actorName")) ?? "Руководитель";
  const decision = String(formData.get("decision") ?? "").trim() as TenderDecision;
  const approvedBidAmount = normalizeNumber(formData.get("approvedBidAmount"));
  const comment = normalizeString(formData.get("comment"));

  await prisma.tenderDecisionRecord.create({
    data: {
      procurementId,
      companyProfileId:
        Number.isInteger(companyProfileId) && companyProfileId > 0
          ? companyProfileId
          : null,
      decision,
      approvedBidAmount,
      comment,
      decidedBy: actorName,
    },
  });

  await prisma.tenderProcurement.update({
    where: { id: procurementId },
    data: {
      decision,
      companyProfileId:
        Number.isInteger(companyProfileId) && companyProfileId > 0
          ? companyProfileId
          : null,
      approvedBidAmount,
      decisionComment: comment,
      decisionMadeAt: new Date(),
      status: getDecisionStatus(decision),
      bidPrice: decision === TenderDecision.SUBMIT ? approvedBidAmount : undefined,
    },
  });

  await logTenderEvent({
    procurementId,
    actionType: TenderActionType.DECISION_MADE,
    title: "Решение руководителя зафиксировано",
    description: comment ?? null,
    actorName,
    metadata: {
      decision,
      companyProfileId:
        Number.isInteger(companyProfileId) && companyProfileId > 0
          ? companyProfileId
          : null,
      approvedBidAmount,
    },
  });

  revalidatePath(`/procurements/${procurementId}`);
}

export async function markTenderDocumentsPreparedAction(formData: FormData) {
  const prisma = getPrisma();
  const procurementId = Number(formData.get("procurementId"));
  const actorName = normalizeString(formData.get("actorName")) ?? "Ответственный сотрудник";
  const note = normalizeString(formData.get("note"));

  await prisma.tenderProcurement.update({
    where: { id: procurementId },
    data: {
      status: TenderProcurementStatus.READY,
    },
  });

  await logTenderEvent({
    procurementId,
    actionType: TenderActionType.DOCUMENTS_PREPARED,
    title: "Документы подготовлены",
    description: note ?? "Пакет документов готов к проверке и выгрузке на площадку.",
    actorName,
  });

  revalidatePath(`/procurements/${procurementId}`);
}

export async function markTenderSubmittedAction(formData: FormData) {
  const prisma = getPrisma();
  const procurementId = Number(formData.get("procurementId"));
  const actorName = normalizeString(formData.get("actorName")) ?? "Ответственный сотрудник";
  const note = normalizeString(formData.get("note"));

  await prisma.tenderProcurement.update({
    where: { id: procurementId },
    data: {
      status: TenderProcurementStatus.SUBMITTED,
    },
  });

  await logTenderEvent({
    procurementId,
    actionType: TenderActionType.SUBMITTED,
    title: "Заявка подана",
    description: note ?? "Сотрудник выгрузил документы на площадку и подтвердил подачу.",
    actorName,
  });

  revalidatePath(`/procurements/${procurementId}`);
}

export async function updateTenderProcurementStatusAction(formData: FormData) {
  const prisma = getPrisma();
  const procurementId = Number(formData.get("procurementId"));
  const actorName = normalizeString(formData.get("actorName")) ?? "Сотрудник";
  const status = String(formData.get("status") ?? "").trim() as TenderProcurementStatus;
  const note = normalizeString(formData.get("note"));

  await prisma.tenderProcurement.update({
    where: { id: procurementId },
    data: { status },
  });

  await logTenderEvent({
    procurementId,
    actionType: TenderActionType.STATUS_UPDATED,
    title: "Статус изменён вручную",
    description: note ?? `Статус переведён в "${status}".`,
    actorName,
    metadata: { status },
  });

  revalidatePath(`/procurements/${procurementId}`);
}

export async function createTenderRuleAction(formData: FormData) {
  const prisma = getPrisma();
  const name = String(formData.get("name") ?? "").trim();

  if (!name) {
    throw new Error("Rule name is required");
  }

  const code =
    String(formData.get("code") ?? "")
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9_]+/g, "_") || `RULE_${Date.now()}`;

  await prisma.tenderStopRule.create({
    data: {
      code,
      name,
      description: normalizeString(formData.get("description")),
      kind: (String(formData.get("kind") ?? "OTHER").trim() as TenderRuleKind) || "OTHER",
      sortOrder: normalizeNumber(formData.get("sortOrder")) ?? 100,
      isActive: String(formData.get("isActive") ?? "on") === "on",
      isToggleable: String(formData.get("isToggleable") ?? "on") === "on",
      requiresManualReview:
        String(formData.get("requiresManualReview") ?? "") === "on",
      customerInn: normalizeString(formData.get("customerInn")),
      manufacturerName: normalizeString(formData.get("manufacturerName")),
      brandName: normalizeString(formData.get("brandName")),
      keyword: normalizeString(formData.get("keyword")),
      thresholdPercent: normalizeNumber(formData.get("thresholdPercent")),
    },
  });

  revalidatePath("/rules");
}

export async function toggleTenderRuleAction(formData: FormData) {
  const prisma = getPrisma();
  const ruleId = Number(formData.get("ruleId"));
  const nextValue = String(formData.get("nextValue") ?? "") === "true";

  await prisma.tenderStopRule.update({
    where: { id: ruleId },
    data: { isActive: nextValue },
  });

  revalidatePath("/rules");
}

export async function saveTenderCompanyProfileAction(formData: FormData) {
  const prisma = getPrisma();
  const companyId = Number(formData.get("companyId"));

  const payload = {
    name: String(formData.get("name") ?? "").trim(),
    legalName: normalizeString(formData.get("legalName")),
    inn: normalizeString(formData.get("inn")),
    kpp: normalizeString(formData.get("kpp")),
    ogrn: normalizeString(formData.get("ogrn")),
    registrationDate: normalizeDate(formData.get("registrationDate")),
    directorName: normalizeString(formData.get("directorName")),
    email: normalizeString(formData.get("email")),
    phone: normalizeString(formData.get("phone")),
    legalAddress: normalizeString(formData.get("legalAddress")),
    postalAddress: normalizeString(formData.get("postalAddress")),
    okpo: normalizeString(formData.get("okpo")),
    oktmo: normalizeString(formData.get("oktmo")),
    activityCode: normalizeString(formData.get("activityCode")),
    activityDescription: normalizeString(formData.get("activityDescription")),
    bankName: normalizeString(formData.get("bankName")),
    bankBik: normalizeString(formData.get("bankBik")),
    bankAccount: normalizeString(formData.get("bankAccount")),
    correspondentAccount: normalizeString(formData.get("correspondentAccount")),
    notes: normalizeString(formData.get("notes")),
    isPrimary: String(formData.get("isPrimary") ?? "") === "on",
  };

  if (!payload.name) {
    throw new Error("Company name is required");
  }

  if (Number.isInteger(companyId) && companyId > 0) {
    await prisma.tenderCompanyProfile.update({
      where: { id: companyId },
      data: payload,
    });
  } else {
    await prisma.tenderCompanyProfile.upsert({
      where: {
        inn: payload.inn ?? `missing-inn-${Date.now()}`,
      },
      update: payload,
      create: payload,
    });
  }

  revalidatePath("/companies");
}

export async function saveTenderCompanyDocumentAction(formData: FormData) {
  const prisma = getPrisma();
  const companyId = Number(formData.get("companyId"));
  const title = String(formData.get("title") ?? "").trim();

  if (!Number.isInteger(companyId) || companyId <= 0) {
    throw new Error("Company is required");
  }

  if (!title) {
    throw new Error("Document title is required");
  }

  await prisma.tenderCompanyDocument.create({
    data: {
      companyId,
      title,
      documentType:
        (String(formData.get("documentType") ?? "OTHER").trim() as TenderCompanyDocumentType) ||
        TenderCompanyDocumentType.OTHER,
      fileName: normalizeString(formData.get("fileName")),
      notes: normalizeString(formData.get("notes")),
      storagePath: normalizeString(formData.get("storagePath")),
    },
  });

  revalidatePath("/companies");
}

export async function saveTenderTechnicalItemAction(formData: FormData) {
  const prisma = getPrisma();
  const procurementId = Number(formData.get("procurementId"));
  const requestedName = String(formData.get("requestedName") ?? "").trim();

  if (!Number.isInteger(procurementId) || procurementId <= 0) {
    throw new Error("Procurement is required");
  }

  if (!requestedName) {
    throw new Error("Requested item name is required");
  }

  const status = normalizeTenderTechnicalItemStatus(formData.get("status"));

  const confidence = normalizeNumber(formData.get("confidence"));
  const sourceLinks = splitLines(formData.get("sourceLinks")) ?? [];

  await prisma.tenderTechnicalItem.create({
    data: {
      procurementId,
      lineNumber: normalizeNumber(formData.get("lineNumber")),
      requestedName,
      quantity: normalizeString(formData.get("quantity")),
      unit: normalizeString(formData.get("unit")),
      rawCharacteristics: normalizeString(formData.get("rawCharacteristics")),
      identifiedProduct: normalizeString(formData.get("identifiedProduct")),
      identifiedBrand: normalizeString(formData.get("identifiedBrand")),
      identifiedModel: normalizeString(formData.get("identifiedModel")),
      identificationBasis: normalizeString(formData.get("identificationBasis")),
      approximateUnitPrice: normalizeNumber(formData.get("approximateUnitPrice")),
      sourceSummary: normalizeString(formData.get("sourceSummary")),
      sourceLinks,
      status,
      confidence,
      reviewQuestion: normalizeString(formData.get("reviewQuestion")),
      pricingReady: String(formData.get("pricingReady") ?? "") === "on",
    },
  });

  await logTenderEvent({
    procurementId,
    actionType: TenderActionType.NOTE_ADDED,
    title: "Добавлена позиция ТЗ",
    description: `В технический разбор добавлена позиция: ${requestedName}.`,
    actorName: normalizeString(formData.get("actorName")) ?? "Сотрудник",
    metadata: {
      requestedName,
      status,
      confidence,
    },
  });

  revalidatePath(`/procurements/${procurementId}`);
}
