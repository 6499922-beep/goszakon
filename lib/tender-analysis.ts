import { TenderProcurementStatus, TenderRuleKind } from "@prisma/client";
import { getPrisma } from "@/lib/prisma";

export const tenderAnalysisSchema = {
  name: "tender_procurement_analysis",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    required: [
      "procurement_number",
      "customer_name",
      "customer_inn",
      "platform",
      "items_count",
      "nmck_without_vat",
      "summary",
      "selection_criteria",
      "required_documents",
      "nonstandard_requirements",
      "delivery_terms",
      "payment_terms",
      "contract_term",
      "penalty_terms",
      "stop_factor_findings",
    ],
    properties: {
      procurement_number: { type: "string" },
      customer_name: { type: "string" },
      customer_inn: { type: "string" },
      platform: { type: "string" },
      items_count: { type: "number" },
      nmck_without_vat: { type: "string" },
      summary: { type: "string" },
      selection_criteria: { type: "string" },
      required_documents: {
        type: "array",
        items: { type: "string" },
      },
      nonstandard_requirements: {
        type: "array",
        items: { type: "string" },
      },
      delivery_terms: { type: "string" },
      payment_terms: { type: "string" },
      contract_term: { type: "string" },
      penalty_terms: { type: "string" },
      stop_factor_findings: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["name", "reason"],
          properties: {
            name: { type: "string" },
            reason: { type: "string" },
          },
        },
      },
    },
  },
} as const;

export const tenderFasAnalysisSchema = {
  name: "tender_fas_potential_complaint_analysis",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    required: ["status", "finding_title", "finding_basis", "confidence_note"],
    properties: {
      status: {
        type: "string",
        enum: ["NO_VIOLATION", "POTENTIAL_COMPLAINT", "MANUAL_REVIEW"],
      },
      finding_title: { type: "string" },
      finding_basis: { type: "string" },
      confidence_note: { type: "string" },
    },
  },
} as const;

type TenderAnalysisResult = {
  procurement_number: string;
  customer_name: string;
  customer_inn: string;
  platform: string;
  items_count: number;
  nmck_without_vat: string;
  summary: string;
  selection_criteria: string;
  required_documents: string[];
  nonstandard_requirements: string[];
  delivery_terms: string;
  payment_terms: string;
  contract_term: string;
  penalty_terms: string;
  stop_factor_findings: Array<{
    name: string;
    reason: string;
  }>;
};

type TenderFasAnalysisResult = {
  status: "NO_VIOLATION" | "POTENTIAL_COMPLAINT" | "MANUAL_REVIEW";
  finding_title: string;
  finding_basis: string;
  confidence_note: string;
};

function extractOutputText(response: any) {
  const outputs = Array.isArray(response?.output) ? response.output : [];
  const parts: string[] = [];

  for (const item of outputs) {
    if (!Array.isArray(item?.content)) continue;

    for (const content of item.content) {
      if (content?.type === "output_text" && typeof content?.text === "string") {
        parts.push(content.text);
      }
    }
  }

  return parts.join("\n").trim();
}

export async function runTenderAiAnalysis(input: {
  title: string;
  customerName?: string | null;
  customerInn?: string | null;
  procurementNumber?: string | null;
  platform?: string | null;
  itemsCount?: number | null;
  nmckWithoutVat?: string | number | null;
  sourceText: string;
}) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not set");
  }

  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

  const prompt = `
Ты анализируешь документацию закупки по 223-ФЗ для внутреннего тендерного кабинета поставщика.

Верни только структурированный JSON по схеме.
Нужно быть очень приземленным и деловым.
Не придумывай факты, которых нет в тексте.
Если данных не хватает, верни пустую строку или пустой массив.

Карточка закупки:
- Название: ${input.title}
- Заказчик: ${input.customerName ?? ""}
- ИНН заказчика: ${input.customerInn ?? ""}
- Номер закупки: ${input.procurementNumber ?? ""}
- Площадка: ${input.platform ?? ""}
- Количество позиций: ${input.itemsCount ?? ""}
- НМЦ без НДС: ${input.nmckWithoutVat ?? ""}

Нужно извлечь:
0. Номер закупки, заказчика, ИНН заказчика, площадку, количество позиций и НМЦ без НДС, если они явно читаются в документации.
1. Краткую выжимку сути закупки.
2. Критерии отбора.
3. Требуемую документацию до подачи.
4. Нестандартные требования.
5. Сроки и место поставки.
6. Сроки оплаты.
7. Срок действия договора.
8. Штрафы, неустойку и чувствительные условия по ответственности.
9. Явно перечисленные в тексте признаки стоп-факторов.

Текст документации:
${input.sourceText}
`.trim();

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      input: [
        {
          role: "user",
          content: [{ type: "input_text", text: prompt }],
        },
      ],
      text: {
        format: {
          type: "json_schema",
          ...tenderAnalysisSchema,
        },
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI API error: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  const outputText = extractOutputText(data);

  if (!outputText) {
    throw new Error("OpenAI API returned empty output");
  }

  return {
    model,
    result: JSON.parse(outputText) as TenderAnalysisResult,
  };
}

export async function runTenderFasAiAnalysis(input: {
  title: string;
  customerName?: string | null;
  customerInn?: string | null;
  procurementNumber?: string | null;
  platform?: string | null;
  sourceText: string;
  promptBody: string;
}) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not set");
  }

  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

  const prompt = `
Ты анализируешь документацию закупки по 223-ФЗ только на предмет потенциальной жалобы в ФАС.

Работай строго по инструкции ниже. Верни только структурированный JSON по схеме.

Инструкция для ФАС-ветки:
${input.promptBody}

Карточка закупки:
- Название: ${input.title}
- Заказчик: ${input.customerName ?? ""}
- ИНН заказчика: ${input.customerInn ?? ""}
- Номер закупки: ${input.procurementNumber ?? ""}
- Площадка: ${input.platform ?? ""}

Правила результата:
1. Если явных нарушений с высокой вероятностью обоснования нет, выбери статус NO_VIOLATION.
2. Если есть формально считываемое нарушение с хорошей привязкой к документации, выбери POTENTIAL_COMPLAINT.
3. Если нарушение может быть, но ты не уверен и нужна проверка человеком, выбери MANUAL_REVIEW.
4. Не придумывай нарушение. Не рассуждай о коммерческой невыгодности или целесообразности участия.
5. Если нарушение найдено, обязательно укажи, в каком месте документации оно проявляется.
6. Если нарушений нет, прямо так и напиши в finding_title или confidence_note.

Текст документации:
${input.sourceText}
  `.trim();

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      input: [
        {
          role: "user",
          content: [{ type: "input_text", text: prompt }],
        },
      ],
      text: {
        format: {
          type: "json_schema",
          ...tenderFasAnalysisSchema,
        },
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI API error: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  const outputText = extractOutputText(data);

  if (!outputText) {
    throw new Error("OpenAI API returned empty output");
  }

  return {
    model,
    result: JSON.parse(outputText) as TenderFasAnalysisResult,
  };
}

export async function evaluateTenderStopRules(procurementId: number) {
  const prisma = getPrisma();
  const procurement = await prisma.tenderProcurement.findUnique({
    where: { id: procurementId },
    include: {
      ruleMatches: true,
    },
  });

  if (!procurement) {
    throw new Error("Procurement not found");
  }

  const rules = await prisma.tenderStopRule.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }],
  });

  const haystack = [
    procurement.title,
    procurement.summary,
    procurement.selectionCriteria,
    procurement.deliveryTerms,
    procurement.paymentTerms,
    procurement.contractTerm,
    procurement.penaltyTerms,
    procurement.stopFactorsSummary,
    procurement.sourceText,
    ...(Array.isArray(procurement.requiredDocuments)
      ? procurement.requiredDocuments.map(String)
      : []),
    ...(Array.isArray(procurement.nonstandardRequirements)
      ? procurement.nonstandardRequirements.map(String)
      : []),
  ]
    .filter(Boolean)
    .join("\n")
    .toLowerCase();

  const matches = rules
    .map((rule) => {
      if (rule.code === "LESS_THAN_TWO_POSITIONS" && (procurement.itemsCount ?? 0) < 2) {
        return {
          ruleId: rule.id,
          matchedValue: `items_count=${procurement.itemsCount ?? 0}`,
          confidence: 1,
          isConfirmed: !rule.requiresManualReview,
        };
      }

      if (rule.customerInn && procurement.customerInn === rule.customerInn) {
        return {
          ruleId: rule.id,
          matchedValue: procurement.customerInn,
          confidence: 1,
          isConfirmed: !rule.requiresManualReview,
        };
      }

      if (rule.keyword && haystack.includes(rule.keyword.toLowerCase())) {
        return {
          ruleId: rule.id,
          matchedValue: rule.keyword,
          confidence: 0.9,
          isConfirmed: !rule.requiresManualReview,
        };
      }

      return null;
    })
    .filter(Boolean) as Array<{
    ruleId: number;
    matchedValue: string;
    confidence: number;
    isConfirmed: boolean;
  }>;

  await prisma.tenderProcurementRuleMatch.deleteMany({
    where: { procurementId },
  });

  if (matches.length) {
    await prisma.tenderProcurementRuleMatch.createMany({
      data: matches.map((match) => ({
        procurementId,
        ruleId: match.ruleId,
        matchedValue: match.matchedValue,
        confidence: match.confidence,
        isConfirmed: match.isConfirmed,
      })),
    });
  }

  const matchedRules = matches.length
    ? await prisma.tenderStopRule.findMany({
        where: { id: { in: matches.map((item) => item.ruleId) } },
        orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }],
      })
    : [];

  const stopSummary = matchedRules.length
    ? `Выявлены стоп-факторы: ${matchedRules.map((item) => item.name).join(", ")}`
    : "Стоп-факторы не выявлены";

  await prisma.tenderProcurement.update({
    where: { id: procurementId },
    data: {
      stopFactorsSummary: stopSummary,
      status: matchedRules.length
        ? TenderProcurementStatus.STOPPED
        : TenderProcurementStatus.ANALYSIS,
    },
  });

  return matchedRules;
}
