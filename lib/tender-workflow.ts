import {
  TenderActionType,
  TenderDecision,
  TenderProcurementStatus,
} from "@prisma/client";
import { getPrisma } from "@/lib/prisma";

export const pricingStatusLabels = {
  profitable: "Рентабельно",
  low_margin: "Низкая рентабельность",
  not_found: "Цены не найдены",
  manual_review: "Нужна проверка цен",
} as const;

export function getDecisionLabel(decision: TenderDecision) {
  switch (decision) {
    case TenderDecision.SUBMIT:
      return "Подаём";
    case TenderDecision.DECLINE:
      return "Не подаём";
    case TenderDecision.FAS_COMPLAINT:
      return "Жалоба в ФАС";
    case TenderDecision.REWORK:
      return "На доработку";
  }
}

export function getDecisionStatus(decision: TenderDecision) {
  switch (decision) {
    case TenderDecision.SUBMIT:
      return TenderProcurementStatus.APPROVED;
    case TenderDecision.DECLINE:
      return TenderProcurementStatus.ARCHIVED;
    case TenderDecision.FAS_COMPLAINT:
      return TenderProcurementStatus.ARCHIVED;
    case TenderDecision.REWORK:
      return TenderProcurementStatus.ANALYSIS;
  }
}

type RuleMatchLike = {
  matchedValue: string | null;
  rule: {
    name: string;
    requiresManualReview: boolean;
  };
};

type ProcurementStageInput = {
  sourceText?: string | null;
  itemsCount?: number | null;
  purchaseType?: string | null;
  summary?: string | null;
  stopFactorsSummary?: string | null;
  aiAnalysisStatus?: string | null;
  aiAnalysisError?: string | null;
  aiAnalysis?: unknown;
  pricingStatus?: string | null;
  pricingComment?: string | null;
  approximatePurchasePrice?: { toString(): string } | null;
  decision?: TenderDecision | null;
  approvedBidAmount?: { toString(): string } | null;
  companyProfile?: { name: string } | null;
  ruleMatches: RuleMatchLike[];
  technicalItems?: Array<{
    status: "EXPLICIT" | "IDENTIFIED" | "REVIEW" | "REJECTED";
    requestedName: string;
    pricingReady: boolean;
    identifiedModel: string | null;
    reviewQuestion: string | null;
    quantity: string | null;
    approximateUnitPrice: { toString(): string } | number | null;
    sourceSummary: string | null;
  }>;
};

export type TenderProcessingStage = {
  key: string;
  title: string;
  result: string;
  tone: "green" | "yellow" | "red" | "blue";
  findings: string[];
  questions: string[];
};

function parseAiStopFindings(aiAnalysis: unknown) {
  if (!aiAnalysis || typeof aiAnalysis !== "object") return [];

  const raw = (aiAnalysis as { stop_factor_findings?: unknown }).stop_factor_findings;
  if (!Array.isArray(raw)) return [];

  return raw
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const name = "name" in item ? String(item.name ?? "").trim() : "";
      const reason = "reason" in item ? String(item.reason ?? "").trim() : "";
      if (!name && !reason) return null;
      return { name, reason };
    })
    .filter(Boolean) as Array<{ name: string; reason: string }>;
}

function hasExplicitModelHints(sourceText: string) {
  const haystack = sourceText.toLowerCase();

  return [
    "модель",
    "марка",
    "тип, марка",
    "наименование производителя",
    "страна происхождения",
    "реестровый номер",
    "артикул",
  ].some((needle) => haystack.includes(needle));
}

export function getTenderProcessingStages(
  procurement: ProcurementStageInput
): TenderProcessingStage[] {
  const sourceText = procurement.sourceText?.trim() ?? "";
  const aiStopFindings = parseAiStopFindings(procurement.aiAnalysis);

  const stopFactorStage: TenderProcessingStage = {
    key: "stop-factors",
    title: "Проверка стоп-факторов",
    result: "Документация ещё не проверялась",
    tone: "blue",
    findings: [],
    questions: [],
  };

  if (!sourceText) {
    stopFactorStage.result = "Нужно загрузить документацию для проверки";
    stopFactorStage.questions.push(
      "Не вижу текста документации, поэтому не могу проверить стоп-факторы."
    );
  } else if (procurement.aiAnalysisStatus === "failed") {
    stopFactorStage.result = "Нужна ручная проверка";
    stopFactorStage.tone = "yellow";
    stopFactorStage.questions.push(
      procurement.aiAnalysisError ??
        "AI-анализ не завершился, поэтому стоп-факторы лучше проверить вручную."
    );
  } else if (procurement.ruleMatches.length > 0) {
    stopFactorStage.result = "Выявлен стоп-фактор";
    stopFactorStage.tone = "red";
    stopFactorStage.findings = procurement.ruleMatches.map((match) =>
      match.matchedValue
        ? `${match.rule.name}: ${match.matchedValue}`
        : match.rule.name
    );
    stopFactorStage.questions = procurement.ruleMatches
      .filter((match) => match.rule.requiresManualReview)
      .map((match) => `Проверь вручную: ${match.rule.name}.`);
  } else if (aiStopFindings.length > 0) {
    stopFactorStage.result = "Есть сомнения, нужна проверка";
    stopFactorStage.tone = "yellow";
    stopFactorStage.findings = aiStopFindings.map((item) =>
      item.reason ? `${item.name}: ${item.reason}` : item.name
    );
    stopFactorStage.questions.push(
      "AI увидел признаки стоп-фактора, но их лучше подтвердить вручную."
    );
  } else if (procurement.aiAnalysisStatus === "completed") {
    stopFactorStage.result = "Стоп-факторы не выявлены";
    stopFactorStage.tone = "green";
    stopFactorStage.findings.push(
      procurement.stopFactorsSummary?.trim() || "Документация прошла первичную проверку."
    );
  }

  const technicalStage: TenderProcessingStage = {
    key: "technical-task",
    title: "Разбор технического задания",
    result: "Техническое задание ещё не разобрано",
    tone: "blue",
    findings: [],
    questions: [],
  };

  if (!sourceText) {
    technicalStage.questions.push(
      "Не загружен текст ТЗ, поэтому нельзя понять, что именно заложил заказчик."
    );
  } else {
    const technicalItems = procurement.technicalItems ?? [];
    const explicitCount = technicalItems.filter((item) => item.status === "EXPLICIT").length;
    const identifiedCount = technicalItems.filter((item) => item.status === "IDENTIFIED").length;
    const reviewCount = technicalItems.filter((item) => item.status === "REVIEW").length;
    const rejectedCount = technicalItems.filter((item) => item.status === "REJECTED").length;
    const pricingReadyCount = technicalItems.filter((item) => item.pricingReady).length;

    if (procurement.summary?.trim()) {
      technicalStage.findings.push(procurement.summary.trim());
    }

    if (procurement.itemsCount != null) {
      technicalStage.findings.push(`Количество позиций: ${procurement.itemsCount}.`);
    }

    if (procurement.purchaseType) {
      technicalStage.findings.push(`Тип закупки: ${procurement.purchaseType}.`);
    }

    if (technicalItems.length > 0) {
      technicalStage.findings.push(`Позиции в разборе: ${technicalItems.length}.`);
      if (explicitCount > 0) {
        technicalStage.findings.push(`С явной моделью: ${explicitCount}.`);
      }
      if (identifiedCount > 0) {
        technicalStage.findings.push(`Подобрано по характеристикам: ${identifiedCount}.`);
      }
      if (pricingReadyCount > 0) {
        technicalStage.findings.push(
          `Уже готовы к проверке цен: ${pricingReadyCount}.`
        );
      }
      if (rejectedCount > 0) {
        technicalStage.findings.push(`Не подходят под профиль: ${rejectedCount}.`);
      }

      if (reviewCount > 0) {
        technicalStage.result = "Часть позиций ещё требует уточнения";
        technicalStage.tone = "yellow";
        technicalStage.questions.push(`Нужно проверить вручную ${reviewCount} позиций.`);
        technicalStage.questions.push(
          ...technicalItems
            .filter((item) => item.status === "REVIEW" && item.reviewQuestion)
            .slice(0, 3)
            .map((item) => item.reviewQuestion as string)
        );
      } else if (explicitCount + identifiedCount > 0) {
        technicalStage.result = "ТЗ по позициям разобрано";
        technicalStage.tone = "green";
      } else if (rejectedCount > 0) {
        technicalStage.result = "Позиции требуют отдельной оценки на соответствие профилю";
        technicalStage.tone = "yellow";
      } else if (hasExplicitModelHints(sourceText)) {
        technicalStage.result = "В ТЗ есть признаки конкретной модели или производителя";
        technicalStage.tone = "green";
        technicalStage.findings.push(
          "В тексте есть признаки конкретизации товара: модель, марка, производитель или реестровые номера."
        );
      } else {
        technicalStage.result = "Нужно понять, что именно заложено по характеристикам";
        technicalStage.tone = "yellow";
        technicalStage.questions.push(
          "Не увидел явного бренда или модели. Нужно определить оборудование по техническим характеристикам."
        );
      }
    } else if (hasExplicitModelHints(sourceText)) {
      technicalStage.result = "В ТЗ есть признаки конкретной модели или производителя";
      technicalStage.tone = "green";
      technicalStage.findings.push(
        "В тексте есть признаки конкретизации товара: модель, марка, производитель или реестровые номера."
      );
    } else {
      technicalStage.result = "Нужно понять, что именно заложено по характеристикам";
      technicalStage.tone = "yellow";
      technicalStage.questions.push(
        "Не увидел явного бренда или модели. Нужно определить оборудование по техническим характеристикам."
      );
    }
  }

  const pricingStage: TenderProcessingStage = {
    key: "pricing",
    title: "Проверка цен",
    result: "Проверка цен ещё не выполнялась",
    tone: "blue",
    findings: [],
    questions: [],
  };

  switch (procurement.pricingStatus) {
    case "profitable":
      pricingStage.result = "Цены найдены, можно двигаться дальше";
      pricingStage.tone = "green";
      if (procurement.approximatePurchasePrice) {
        pricingStage.findings.push(
          `Ориентир по закупочной цене: ${procurement.approximatePurchasePrice.toString()} руб.`
        );
      }
      break;
    case "low_margin":
      pricingStage.result = "Найденные цены дают низкую рентабельность";
      pricingStage.tone = "red";
      break;
    case "not_found":
      pricingStage.result = "Цены не найдены";
      pricingStage.tone = "yellow";
      pricingStage.questions.push(
        procurement.pricingComment?.trim() ||
          "Не удалось найти понятный ориентир по закупочной цене."
      );
      break;
    case "manual_review":
      pricingStage.result = "Нужна ручная проверка цен";
      pricingStage.tone = "yellow";
      pricingStage.questions.push(
        procurement.pricingComment?.trim() ||
          "Нужно проверить источники цены и подтвердить расчёт вручную."
      );
      break;
  }

  if (procurement.pricingComment && procurement.pricingStatus !== "not_found") {
    pricingStage.findings.push(procurement.pricingComment);
  }

  const pricingItems = (procurement.technicalItems ?? []).filter(
    (item) => item.approximateUnitPrice != null
  );
  const pricingReadyItems = (procurement.technicalItems ?? []).filter(
    (item) => item.pricingReady
  );
  const unresolvedPricingItems = (procurement.technicalItems ?? []).filter(
    (item) => item.pricingReady && item.approximateUnitPrice == null
  );

  if (pricingReadyItems.length > 0) {
    pricingStage.findings.push(
      `Позиции, которые уже можно считать: ${pricingReadyItems.length}.`
    );
  }

  if (pricingItems.length > 0) {
    pricingStage.findings.push(
      `Позиции с найденным ценовым ориентиром: ${pricingItems.length}.`
    );
  }

  if (unresolvedPricingItems.length > 0) {
    pricingStage.questions.push(
      `По ${unresolvedPricingItems.length} позициям уже пора искать цену, но ценовой ориентир ещё не сохранён.`
    );
  }

  const decisionStage: TenderProcessingStage = {
    key: "leader-decision",
    title: "Решение руководителя",
    result: "Ожидает решения руководителя",
    tone: "blue",
    findings: [],
    questions: [],
  };

  if (!procurement.decision) {
    decisionStage.questions.push(
      "Нужно выбрать: подаём, не подаём, жалоба в ФАС или на доработку."
    );
  } else {
    switch (procurement.decision) {
      case TenderDecision.SUBMIT:
        decisionStage.result = "Руководитель согласовал подачу";
        decisionStage.tone = "green";
        break;
      case TenderDecision.DECLINE:
        decisionStage.result = "Руководитель решил не подавать заявку";
        decisionStage.tone = "red";
        break;
      case TenderDecision.FAS_COMPLAINT:
        decisionStage.result = "Руководитель выбрал сценарий жалобы в ФАС";
        decisionStage.tone = "yellow";
        break;
      case TenderDecision.REWORK:
        decisionStage.result = "Руководитель отправил закупку на доработку";
        decisionStage.tone = "yellow";
        break;
    }

    if (procurement.companyProfile?.name) {
      decisionStage.findings.push(
        `Компания для участия: ${procurement.companyProfile.name}.`
      );
    } else {
      decisionStage.questions.push(
        "Не выбрана ваша компания, с которой нужно подавать заявку."
      );
    }

    if (procurement.approvedBidAmount) {
      decisionStage.findings.push(
        `Сумма участия: ${procurement.approvedBidAmount.toString()} руб.`
      );
    } else if (procurement.decision === TenderDecision.SUBMIT) {
      decisionStage.questions.push(
        "Решение «Подаём» есть, но сумма участия пока не указана."
      );
    }
  }

  return [stopFactorStage, technicalStage, pricingStage, decisionStage];
}

export async function logTenderEvent(input: {
  procurementId: number;
  actionType: TenderActionType;
  title: string;
  description?: string | null;
  actorName?: string | null;
  metadata?: unknown;
}) {
  const prisma = getPrisma();

  await prisma.tenderProcurementEvent.create({
    data: {
      procurementId: input.procurementId,
      actionType: input.actionType,
      title: input.title,
      description: input.description ?? null,
      actorName: input.actorName ?? null,
      metadata: input.metadata === undefined ? undefined : (input.metadata as never),
    },
  });
}
