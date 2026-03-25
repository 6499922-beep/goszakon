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
      "procurement_type",
      "nmck_without_vat",
      "nmck_with_vat",
      "price_tax_note",
      "bid_security",
      "contract_security",
      "summary",
      "selection_criteria",
      "required_documents",
      "nonstandard_requirements",
      "rrep_rpp_requirements",
      "decree_1875_ban",
      "requires_commissioning",
      "lot_structure",
      "military_acceptance",
      "equipment_items",
      "delivery_terms",
      "payment_terms",
      "contract_term",
      "penalty_terms",
      "termination_reasons",
      "stop_factor_findings",
    ],
    properties: {
      procurement_number: { type: "string" },
      customer_name: { type: "string" },
      customer_inn: { type: "string" },
      platform: { type: "string" },
      items_count: { type: "number" },
      procurement_type: { type: "string" },
      nmck_without_vat: { type: "string" },
      nmck_with_vat: { type: "string" },
      price_tax_note: { type: "string" },
      bid_security: { type: "string" },
      contract_security: { type: "string" },
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
      rrep_rpp_requirements: { type: "string" },
      decree_1875_ban: { type: "string" },
      requires_commissioning: { type: "string" },
      lot_structure: { type: "string" },
      military_acceptance: { type: "string" },
      equipment_items: {
        type: "array",
        items: { type: "string" },
      },
      delivery_terms: { type: "string" },
      payment_terms: { type: "string" },
      contract_term: { type: "string" },
      penalty_terms: { type: "string" },
      termination_reasons: {
        type: "array",
        items: { type: "string" },
      },
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

export const tenderSourceDossierSchema = {
  name: "tender_source_dossier",
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
      "procurement_type",
      "nmck_mentions",
      "security_mentions",
      "criteria_points",
      "required_documents",
      "nonstandard_requirements",
      "rrep_rpp_requirements",
      "decree_1875_ban",
      "requires_commissioning",
      "lot_structure",
      "military_acceptance",
      "equipment_items",
      "delivery_terms",
      "payment_terms",
      "contract_term",
      "penalty_terms",
      "termination_reasons",
      "stop_factor_findings",
      "unresolved_questions",
    ],
    properties: {
      procurement_number: { type: "string" },
      customer_name: { type: "string" },
      customer_inn: { type: "string" },
      platform: { type: "string" },
      items_count: { type: "number" },
      procurement_type: { type: "string" },
      nmck_mentions: {
        type: "array",
        items: { type: "string" },
      },
      security_mentions: {
        type: "array",
        items: { type: "string" },
      },
      criteria_points: {
        type: "array",
        items: { type: "string" },
      },
      required_documents: {
        type: "array",
        items: { type: "string" },
      },
      nonstandard_requirements: {
        type: "array",
        items: { type: "string" },
      },
      rrep_rpp_requirements: { type: "string" },
      decree_1875_ban: { type: "string" },
      requires_commissioning: { type: "string" },
      lot_structure: { type: "string" },
      military_acceptance: { type: "string" },
      equipment_items: {
        type: "array",
        items: { type: "string" },
      },
      delivery_terms: { type: "string" },
      payment_terms: { type: "string" },
      contract_term: { type: "string" },
      penalty_terms: { type: "string" },
      termination_reasons: {
        type: "array",
        items: { type: "string" },
      },
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
      unresolved_questions: {
        type: "array",
        items: { type: "string" },
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
  procurement_type: string;
  nmck_without_vat: string;
  nmck_with_vat: string;
  price_tax_note: string;
  bid_security: string;
  contract_security: string;
  summary: string;
  selection_criteria: string;
  required_documents: string[];
  nonstandard_requirements: string[];
  rrep_rpp_requirements: string;
  decree_1875_ban: string;
  requires_commissioning: string;
  lot_structure: string;
  military_acceptance: string;
  equipment_items: string[];
  delivery_terms: string;
  payment_terms: string;
  contract_term: string;
  penalty_terms: string;
  termination_reasons: string[];
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

type TenderSourceDossier = {
  procurement_number: string;
  customer_name: string;
  customer_inn: string;
  platform: string;
  items_count: number;
  procurement_type: string;
  nmck_mentions: string[];
  security_mentions: string[];
  criteria_points: string[];
  required_documents: string[];
  nonstandard_requirements: string[];
  rrep_rpp_requirements: string;
  decree_1875_ban: string;
  requires_commissioning: string;
  lot_structure: string;
  military_acceptance: string;
  equipment_items: string[];
  delivery_terms: string;
  payment_terms: string;
  contract_term: string;
  penalty_terms: string;
  termination_reasons: string[];
  stop_factor_findings: Array<{
    name: string;
    reason: string;
  }>;
  unresolved_questions: string[];
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

async function runStructuredResponse<T>({
  apiKey,
  model,
  prompt,
  schema,
}: {
  apiKey: string;
  model: string;
  prompt: string;
  schema: unknown;
}) {
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      reasoning: {
        effort: "high",
      },
      input: [
        {
          role: "user",
          content: [{ type: "input_text", text: prompt }],
        },
      ],
      text: {
        format: {
          type: "json_schema",
          ...(schema as object),
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

  return JSON.parse(outputText) as T;
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

  const model = process.env.OPENAI_MODEL || "gpt-5";

  const dossierPrompt = `
Ты анализируешь документацию закупки по 223-ФЗ для внутреннего тендерного кабинета поставщика.

Первый проход: собери только фактическое досье по документам.
Не придумывай факты.
Если данных не хватает, верни пустую строку, 0 или пустой массив.
Нужны короткие factual snippets из документации, а не красивые формулировки.
Не пиши ссылки на документы.
Не пересказывай весь текст. Бери только то, что поможет заполнить итоговый шаблон.
Если видишь перечень товаров/оборудования, собирай его максимально полно и кратко.
Особенно внимательно собирай:
- все упоминания НМЦ/цены/НДС;
- все упоминания обеспечений;
- все упоминания штрафов, пеней, неустоек;
- все упоминания одностороннего отказа и расторжения;
- все требования к товару, стране происхождения, РРЭП/РПП, 1875;
- все признаки делимого лота / нескольких победителей / попозиционности;
- все признаки пуско-наладки, военной приемки и РТ-Техприемки.

Карточка закупки:
- Название: ${input.title}
- Заказчик: ${input.customerName ?? ""}
- ИНН заказчика: ${input.customerInn ?? ""}
- Номер закупки: ${input.procurementNumber ?? ""}
- Площадка: ${input.platform ?? ""}
- Количество позиций: ${input.itemsCount ?? ""}
- НМЦ без НДС: ${input.nmckWithoutVat ?? ""}

Собери:
- номер закупки
- заказчика и ИНН
- площадку
- вид закупки
- количество позиций
- все упоминания цены/НМЦ/налогов
- все упоминания обеспечений
- критерии отбора
- документацию до подачи
- нестандартные требования
- требования РРЭП/РПП
- запрет 1875
- пуско-наладку
- делимость лота / несколько победителей
- военную приемку / РТ-Техприемку
- список оборудования
- условия поставки, оплаты, срока договора
- штрафы/пени/неустойки
- основания расторжения
- только явные стоп-факторы
- что осталось неясным

Текст документации:
${input.sourceText}
`.trim();

  const dossier = await runStructuredResponse<TenderSourceDossier>({
    apiKey,
    model,
    prompt: dossierPrompt,
    schema: tenderSourceDossierSchema,
  });

  const prompt = `
Ты анализируешь документацию закупки по 223-ФЗ для внутреннего тендерного кабинета поставщика.

Второй проход: на основе factual dossier аккуратно заполни только структурированный JSON по схеме.
Не придумывай факты, которых нет в dossier.
Если данных не хватает, верни пустую строку, 0 или пустой массив.
Ответ должен быть кратким, деловым и пригодным для отображения в CRM.

Работай как по этому шаблону анализа:
1. Сведения о начальной (максимальной) цене договора без НДС / с НДС и как в цене учтены налоги.
2. Есть ли обеспечение заявки и обеспечение исполнения договора.
3. Какое количество позиций и какой вид закупки.
4. Критерии отбора.
5. Требуемая документация до подачи заявки.
6. Нестандартные требования.
7. Требования РРЭП/РПП.
8. Сроки поставки, место поставки, сроки оплаты, ответственность за просрочку, основания одностороннего расторжения, срок действия договора.
9. Есть ли запрет по постановлению 1875.
10. Требуются ли пуско-наладочные работы.
11. Делимый лот / попозиционная закупка / несколько победителей.
12. Есть ли военная приемка или РТ-Техприемка.

Жесткие правила:
- НДС = 22%, если в документации явно не указано иное.
- Внимательно проверяй цену: смотри, указано ли, что в цену входят налоги или нет.
- Для обеспечений, штрафов, пеней, неустоек и расторжения фиксируй конкретные проценты, суммы и основания, если они указаны.
- Не пиши ссылки на документы.
- Если есть перечень оборудования, верни его в equipment_items краткими строками без воды.
- Если чего-то нет в dossier, не выдумывай.

Карточка закупки:
- Название: ${input.title}
- Заказчик: ${input.customerName ?? ""}
- ИНН заказчика: ${input.customerInn ?? ""}
- Номер закупки: ${input.procurementNumber ?? ""}
- Площадка: ${input.platform ?? ""}
- Количество позиций: ${input.itemsCount ?? ""}
- НМЦ без НДС: ${input.nmckWithoutVat ?? ""}

Factual dossier:
${JSON.stringify(dossier, null, 2)}
`.trim();

  const result = await runStructuredResponse<TenderAnalysisResult>({
    apiKey,
    model,
    prompt,
    schema: tenderAnalysisSchema,
  });

  return {
    model,
    dossier,
    result,
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

  const model = process.env.OPENAI_FAS_MODEL || process.env.OPENAI_MODEL || "gpt-5";

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

  const result = await runStructuredResponse<TenderFasAnalysisResult>({
    apiKey,
    model,
    prompt,
    schema: tenderFasAnalysisSchema,
  });

  return {
    model,
    result,
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
