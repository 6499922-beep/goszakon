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
      "customer_kpp",
      "customer_ogrn",
      "customer_address",
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
      "responsibility_terms",
      "penalty_terms",
      "termination_reasons",
      "stop_factor_findings",
    ],
    properties: {
      procurement_number: { type: "string" },
      customer_name: { type: "string" },
      customer_inn: { type: "string" },
      customer_kpp: { type: "string" },
      customer_ogrn: { type: "string" },
      customer_address: { type: "string" },
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
      responsibility_terms: { type: "string" },
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
      "customer_kpp",
      "customer_ogrn",
      "customer_address",
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
      "responsibility_terms",
      "penalty_terms",
      "termination_reasons",
      "stop_factor_findings",
      "unresolved_questions",
    ],
    properties: {
      procurement_number: { type: "string" },
      customer_name: { type: "string" },
      customer_inn: { type: "string" },
      customer_kpp: { type: "string" },
      customer_ogrn: { type: "string" },
      customer_address: { type: "string" },
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
      responsibility_terms: { type: "string" },
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
  customer_kpp: string;
  customer_ogrn: string;
  customer_address: string;
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
  responsibility_terms: string;
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
  customer_kpp: string;
  customer_ogrn: string;
  customer_address: string;
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
  responsibility_terms: string;
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

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function truncateAiError(value: string | null | undefined, limit = 1000) {
  const normalized = String(value ?? "").replace(/\s+/g, " ").trim();
  if (!normalized) return "Неизвестная ошибка AI-анализа";
  if (normalized.length <= limit) return normalized;
  return `${normalized.slice(0, limit - 3).trim()}...`;
}

function extractJsonObjectString(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) return trimmed;

  const firstBrace = trimmed.indexOf("{");
  const lastBrace = trimmed.lastIndexOf("}");
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    return trimmed.slice(firstBrace, lastBrace + 1);
  }

  const firstBracket = trimmed.indexOf("[");
  const lastBracket = trimmed.lastIndexOf("]");
  if (firstBracket >= 0 && lastBracket > firstBracket) {
    return trimmed.slice(firstBracket, lastBracket + 1);
  }

  return trimmed;
}

function parseStructuredJson<T>(outputText: string) {
  const candidate = extractJsonObjectString(outputText);
  if (!candidate) {
    throw new Error("OpenAI API returned empty JSON payload");
  }

  try {
    return JSON.parse(candidate) as T;
  } catch (error) {
    throw new Error(
      truncateAiError(
        `Не удалось разобрать JSON structured-ответа: ${
          error instanceof Error ? error.message : "unknown"
        }. Ответ: ${candidate.slice(0, 400)}`
      )
    );
  }
}

async function runStructuredResponse<T>({
  apiKey,
  model,
  prompt,
  schema,
  reasoningEffort = "high",
  attempts = 4,
  timeoutMs = 60_000,
}: {
  apiKey: string;
  model: string;
  prompt: string;
  schema: unknown;
  reasoningEffort?: "low" | "medium" | "high";
  attempts?: number;
  timeoutMs?: number;
}) {
  let lastError: unknown = null;

  const isRetryableStructuredError = (error: unknown) => {
    const message = error instanceof Error ? error.message : String(error ?? "");
    return /fetch failed|aborted due to timeout|timeout|OpenAI API error: (429|500|502|503|504)|server_error/i.test(
      message
    );
  };

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const signal =
        typeof AbortSignal !== "undefined" && "timeout" in AbortSignal
          ? AbortSignal.timeout(timeoutMs)
          : undefined;
      const response = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        signal,
        body: JSON.stringify({
          model,
          reasoning: {
            effort: reasoningEffort,
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
        throw new Error(`OpenAI API error: ${response.status} ${truncateAiError(errorText, 500)}`);
      }

      const data = await response.json();
      const outputText = extractOutputText(data);

      if (!outputText) {
        throw new Error("OpenAI API returned empty output");
      }

      return parseStructuredJson<T>(outputText);
    } catch (error) {
      lastError = error;
      if (attempt >= attempts) break;
      if (!isRetryableStructuredError(error)) break;
      await delay(Math.min(12_000, 1_500 * 2 ** (attempt - 1)));
    }
  }

  throw new Error(
    truncateAiError(
      lastError instanceof Error ? lastError.message : "Не удалось получить structured AI-ответ"
    )
  );
}

type TenderSourceSection = {
  title: string;
  body: string;
};

type TenderDocumentCategory =
  | "notice"
  | "spec"
  | "contract"
  | "pricing"
  | "forms"
  | "other";

type TenderDocumentScope = {
  id: number;
  category: TenderDocumentCategory;
  priority: number;
  normalizedTitle: string;
  hasMeaningfulBody: boolean;
  section: TenderSourceSection;
};

type TenderPackedScopeSelection = {
  text: string;
  includedIds: number[];
};

type TenderDocumentCoverageEntry = {
  id: number;
  title: string;
  category: TenderDocumentCategory;
  priority: number;
  has_meaningful_text: boolean;
  included_in_primary_pack: boolean;
  included_in_meta_pack: boolean;
  included_in_requisites_pack: boolean;
  included_in_pricing_pack: boolean;
  included_in_requirements_pack: boolean;
  included_in_contract_pack: boolean;
  included_in_equipment_pack: boolean;
  note: string;
};

const tenderMetaAnalysisSchema = {
  name: "tender_meta_analysis",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    required: [
      "procurement_number",
      "customer_name",
      "customer_inn",
      "customer_kpp",
      "customer_ogrn",
      "customer_address",
      "platform",
      "procurement_type",
      "summary",
      "stop_factor_findings",
    ],
    properties: {
      procurement_number: { type: "string" },
      customer_name: { type: "string" },
      customer_inn: { type: "string" },
      customer_kpp: { type: "string" },
      customer_ogrn: { type: "string" },
      customer_address: { type: "string" },
      platform: { type: "string" },
      procurement_type: { type: "string" },
      summary: { type: "string" },
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

const tenderPricingAnalysisSchema = {
  name: "tender_pricing_analysis",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    required: [
      "nmck_without_vat",
      "nmck_with_vat",
      "price_tax_note",
      "bid_security",
      "contract_security",
    ],
    properties: {
      nmck_without_vat: { type: "string" },
      nmck_with_vat: { type: "string" },
      price_tax_note: { type: "string" },
      bid_security: { type: "string" },
      contract_security: { type: "string" },
    },
  },
} as const;

const tenderRequirementsAnalysisSchema = {
  name: "tender_requirements_analysis",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    required: [
      "selection_criteria",
      "required_documents",
      "nonstandard_requirements",
      "rrep_rpp_requirements",
      "decree_1875_ban",
      "lot_structure",
      "military_acceptance",
    ],
    properties: {
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
      lot_structure: { type: "string" },
      military_acceptance: { type: "string" },
    },
  },
} as const;

const tenderContractAnalysisSchema = {
  name: "tender_contract_analysis",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    required: [
      "delivery_terms",
      "payment_terms",
      "contract_term",
      "responsibility_terms",
      "penalty_terms",
      "termination_reasons",
      "requires_commissioning",
    ],
    properties: {
      delivery_terms: { type: "string" },
      payment_terms: { type: "string" },
      contract_term: { type: "string" },
      responsibility_terms: { type: "string" },
      penalty_terms: { type: "string" },
      termination_reasons: {
        type: "array",
        items: { type: "string" },
      },
      requires_commissioning: { type: "string" },
    },
  },
} as const;

const tenderEquipmentAnalysisSchema = {
  name: "tender_equipment_analysis",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    required: ["items_count", "equipment_items"],
    properties: {
      items_count: { type: "number" },
      equipment_items: {
        type: "array",
        items: { type: "string" },
      },
    },
  },
} as const;

type TenderMetaAnalysis = {
  procurement_number: string;
  customer_name: string;
  customer_inn: string;
  customer_kpp: string;
  customer_ogrn: string;
  customer_address: string;
  platform: string;
  procurement_type: string;
  summary: string;
  stop_factor_findings: Array<{
    name: string;
    reason: string;
  }>;
};

type TenderPricingAnalysis = {
  nmck_without_vat: string;
  nmck_with_vat: string;
  price_tax_note: string;
  bid_security: string;
  contract_security: string;
};

type TenderRequirementsAnalysis = {
  selection_criteria: string;
  required_documents: string[];
  nonstandard_requirements: string[];
  rrep_rpp_requirements: string;
  decree_1875_ban: string;
  lot_structure: string;
  military_acceptance: string;
};

type TenderContractAnalysis = {
  delivery_terms: string;
  payment_terms: string;
  contract_term: string;
  responsibility_terms: string;
  penalty_terms: string;
  termination_reasons: string[];
  requires_commissioning: string;
};

type TenderEquipmentAnalysis = {
  items_count: number;
  equipment_items: string[];
};

function uniqueNonEmptyStrings(values: Array<string | null | undefined>) {
  return values
    .map((item) => String(item ?? "").trim())
    .filter(Boolean)
    .filter((item, index, list) => list.indexOf(item) === index);
}

function pickFirstNonEmptyString(...values: Array<string | null | undefined>) {
  return uniqueNonEmptyStrings(values)[0] ?? "";
}

function pickFirstNonZeroNumber(...values: Array<number | null | undefined>) {
  for (const value of values) {
    if (typeof value === "number" && Number.isFinite(value) && value > 0) {
      return value;
    }
  }

  return 0;
}

function mergeTenderStringLists(...lists: Array<Array<string> | null | undefined>) {
  return uniqueNonEmptyStrings(lists.flatMap((list) => list ?? []));
}

function normalizeTenderAnalysisResult(input: {
  result: TenderAnalysisResult;
  dossier: TenderSourceDossier;
  metaAnalysis: TenderMetaAnalysis;
  requisitesAnalysis: TenderMetaAnalysis;
  pricingAnalysis: TenderPricingAnalysis;
  requirementsAnalysis: TenderRequirementsAnalysis;
  contractAnalysis: TenderContractAnalysis;
  equipmentAnalysis: TenderEquipmentAnalysis;
  fallback: {
    title: string;
    customerName?: string | null;
    customerInn?: string | null;
    procurementNumber?: string | null;
    platform?: string | null;
    itemsCount?: number | null;
    nmckWithoutVat?: string | number | null;
  };
}) {
  const {
    result,
    dossier,
    metaAnalysis,
    requisitesAnalysis,
    pricingAnalysis,
    requirementsAnalysis,
    contractAnalysis,
    equipmentAnalysis,
    fallback,
  } = input;

  return {
    ...result,
    procurement_number: pickFirstNonEmptyString(
      result.procurement_number,
      metaAnalysis.procurement_number,
      dossier.procurement_number,
      fallback.procurementNumber ? String(fallback.procurementNumber) : ""
    ),
    customer_name: pickFirstNonEmptyString(
      result.customer_name,
      requisitesAnalysis.customer_name,
      metaAnalysis.customer_name,
      dossier.customer_name,
      fallback.customerName
    ),
    customer_inn: pickFirstNonEmptyString(
      result.customer_inn,
      requisitesAnalysis.customer_inn,
      metaAnalysis.customer_inn,
      dossier.customer_inn,
      fallback.customerInn
    ),
    customer_kpp: pickFirstNonEmptyString(
      result.customer_kpp,
      requisitesAnalysis.customer_kpp,
      metaAnalysis.customer_kpp,
      dossier.customer_kpp
    ),
    customer_ogrn: pickFirstNonEmptyString(
      result.customer_ogrn,
      requisitesAnalysis.customer_ogrn,
      metaAnalysis.customer_ogrn,
      dossier.customer_ogrn
    ),
    customer_address: pickFirstNonEmptyString(
      result.customer_address,
      requisitesAnalysis.customer_address,
      metaAnalysis.customer_address,
      dossier.customer_address
    ),
    platform: pickFirstNonEmptyString(
      result.platform,
      metaAnalysis.platform,
      dossier.platform,
      fallback.platform
    ),
    procurement_type: pickFirstNonEmptyString(
      result.procurement_type,
      metaAnalysis.procurement_type,
      dossier.procurement_type
    ),
    summary: pickFirstNonEmptyString(result.summary, metaAnalysis.summary),
    items_count: pickFirstNonZeroNumber(
      result.items_count,
      equipmentAnalysis.items_count,
      dossier.items_count,
      fallback.itemsCount ?? 0
    ),
    nmck_without_vat: pickFirstNonEmptyString(
      result.nmck_without_vat,
      pricingAnalysis.nmck_without_vat,
      fallback.nmckWithoutVat ? String(fallback.nmckWithoutVat) : ""
    ),
    nmck_with_vat: pickFirstNonEmptyString(
      result.nmck_with_vat,
      pricingAnalysis.nmck_with_vat
    ),
    price_tax_note: pickFirstNonEmptyString(
      result.price_tax_note,
      pricingAnalysis.price_tax_note
    ),
    bid_security: pickFirstNonEmptyString(
      result.bid_security,
      pricingAnalysis.bid_security
    ),
    contract_security: pickFirstNonEmptyString(
      result.contract_security,
      pricingAnalysis.contract_security
    ),
    selection_criteria: pickFirstNonEmptyString(
      result.selection_criteria,
      requirementsAnalysis.selection_criteria
    ),
    required_documents: mergeTenderStringLists(
      result.required_documents,
      requirementsAnalysis.required_documents,
      dossier.required_documents
    ),
    nonstandard_requirements: mergeTenderStringLists(
      result.nonstandard_requirements,
      requirementsAnalysis.nonstandard_requirements,
      dossier.nonstandard_requirements
    ),
    rrep_rpp_requirements: pickFirstNonEmptyString(
      result.rrep_rpp_requirements,
      requirementsAnalysis.rrep_rpp_requirements,
      dossier.rrep_rpp_requirements
    ),
    decree_1875_ban: pickFirstNonEmptyString(
      result.decree_1875_ban,
      requirementsAnalysis.decree_1875_ban,
      dossier.decree_1875_ban
    ),
    requires_commissioning: pickFirstNonEmptyString(
      result.requires_commissioning,
      contractAnalysis.requires_commissioning,
      dossier.requires_commissioning
    ),
    lot_structure: pickFirstNonEmptyString(
      result.lot_structure,
      requirementsAnalysis.lot_structure,
      dossier.lot_structure
    ),
    military_acceptance: pickFirstNonEmptyString(
      result.military_acceptance,
      requirementsAnalysis.military_acceptance,
      dossier.military_acceptance
    ),
    equipment_items: mergeTenderStringLists(
      result.equipment_items,
      equipmentAnalysis.equipment_items,
      dossier.equipment_items
    ),
    delivery_terms: pickFirstNonEmptyString(
      result.delivery_terms,
      contractAnalysis.delivery_terms,
      dossier.delivery_terms
    ),
    payment_terms: pickFirstNonEmptyString(
      result.payment_terms,
      contractAnalysis.payment_terms,
      dossier.payment_terms
    ),
    contract_term: pickFirstNonEmptyString(
      result.contract_term,
      contractAnalysis.contract_term,
      dossier.contract_term
    ),
    responsibility_terms: pickFirstNonEmptyString(
      result.responsibility_terms,
      contractAnalysis.responsibility_terms,
      dossier.responsibility_terms,
      result.penalty_terms,
      contractAnalysis.penalty_terms,
      dossier.penalty_terms
    ),
    penalty_terms: pickFirstNonEmptyString(
      result.penalty_terms,
      contractAnalysis.penalty_terms,
      dossier.penalty_terms
    ),
    termination_reasons: mergeTenderStringLists(
      result.termination_reasons,
      contractAnalysis.termination_reasons,
      dossier.termination_reasons
    ),
    stop_factor_findings:
      result.stop_factor_findings.length > 0
        ? result.stop_factor_findings
        : metaAnalysis.stop_factor_findings.length > 0
          ? metaAnalysis.stop_factor_findings
          : dossier.stop_factor_findings,
  };
}

function parseTenderSourceSections(sourceText: string) {
  const chunks = sourceText
    .split(/\n{2,}(?=Файл:\s*)/)
    .map((item) => item.trim())
    .filter(Boolean);

  const sections: TenderSourceSection[] = [];

  for (const chunk of chunks) {
    const match = chunk.match(/^Файл:\s*(.+?)\n([\s\S]*)$/);
    if (match) {
      sections.push({
        title: match[1].trim(),
        body: match[2].trim(),
      });
      continue;
    }

    sections.push({
      title: "Документация",
      body: chunk,
    });
  }

  return sections;
}

function getTenderSourcePriority(title: string) {
  const normalized = title.toLowerCase();

  if (
    /извещ|документац|информационн|карта|technical|технич.*задан|тз/.test(normalized)
  ) {
    return 5;
  }

  if (/договор|контракт|project contract/.test(normalized)) {
    return 4;
  }

  if (/нмц|цено|price|стоим|коммерч/.test(normalized)) {
    return 4;
  }

  if (/форма|заявк|анкета|соглас/i.test(normalized)) {
    return 2;
  }

  return 1;
}

function classifyTenderSection(section: TenderSourceSection): TenderDocumentCategory {
  const titleHaystack = section.title.toLowerCase();
  const bodyHaystack = section.body.slice(0, 1500).toLowerCase();
  const haystack = `${titleHaystack}\n${bodyHaystack}`;

  if (/договор|контракт|проект договора|условия договора/i.test(titleHaystack)) {
    return "contract";
  }

  if (/технич|тз|специфик|описан.*товар|характерист/i.test(titleHaystack)) {
    return "spec";
  }

  if (/извещ|документац|информационн|карта|закупк/i.test(titleHaystack)) {
    return "notice";
  }

  if (/нмц|цено|price|стоим|коммерч|обоснование|калькул|excel|xlsx/i.test(titleHaystack)) {
    return "pricing";
  }

  if (/договор|контракт|проект договора|условия договора/i.test(bodyHaystack)) {
    return "contract";
  }

  if (/технич|тз|специфик|описан.*товар|характерист/i.test(bodyHaystack)) {
    return "spec";
  }

  if (/извещ|документац|информационн|карта|закупк/i.test(bodyHaystack)) {
    return "notice";
  }

  if (/нмц|цено|price|стоим|коммерч|обоснование|калькул|excel|xlsx/i.test(bodyHaystack)) {
    return "pricing";
  }

  if (/форма|заявк|анкет|соглас|декларац/i.test(haystack)) {
    return "forms";
  }

  return "other";
}

function takeRelevantTenderSnippets(body: string) {
  const lines = body
    .split(/\n+/)
    .map((item) => item.replace(/\s+/g, " ").trim())
    .filter(Boolean);

  const importantPatterns = [
    /нмцк|нмцд|нмц|начальн|максимальн|цен[аы]|стоим|ндс|цена договора|цена лота/i,
    /обеспеч/i,
    /штраф|пен|неустой|ответственност|просроч|убытк|санкц/i,
    /расторж|односторон|отказ|уклонен/i,
    /срок|поставк|оплат|адрес|место/i,
    /ррэп|рпп|2013|1875/i,
    /пуско|налад/i,
    /военн|техприем/i,
    /лот|победител|позици/i,
  ];

  const matched = lines.filter((line) =>
    importantPatterns.some((pattern) => pattern.test(line))
  );

  return matched.slice(0, 40);
}

function takeEquipmentFocusedSnippets(body: string) {
  const compactTableMatch = body.match(/Компактная таблица позиций:\n([\s\S]*?)(?:\n(?:Лист:|Строки таблицы:|Позиции для анализа:|Файл:)|$)/i);
  const compactTableLines = compactTableMatch
    ? compactTableMatch[1]
        .split(/\n+/)
        .map((item) => item.replace(/\s+/g, " ").trim())
        .filter(Boolean)
    : [];

  const lines = body
    .split(/\n+/)
    .map((item) => item.replace(/\s+/g, " ").trim())
    .filter(Boolean);

  const matched = lines.filter((line) =>
    /позиц|наимен|товар|оборуд|материал|характер|марк|модел|артикул|ед\.? ?изм|колич|цена|сумм/i.test(
      line
    )
  );

  return uniqueNonEmptyStrings([...compactTableLines, ...matched]).slice(0, 160);
}

function takePricingFocusedSnippets(body: string) {
  const lines = body
    .split(/\n+/)
    .map((item) => item.replace(/\s+/g, " ").trim())
    .filter(Boolean);

  const matched = lines.filter((line) =>
    /нмцк|нмцд|нмц|начальн.*максимальн.*цен|начальн.*цен.*договор|цена договора|цена лота|цена|стоим|сумм|итого|без ндс|с ндс|включая ндс|ндс не облага|налог|обеспеч|коммерч|калькул|обоснование/i.test(
      line
    )
  );

  return matched.slice(0, 200);
}

function takeContractFocusedSnippets(body: string) {
  const lines = body
    .split(/\n+/)
    .map((item) => item.replace(/\s+/g, " ").trim())
    .filter(Boolean);

  const matched = lines.filter((line) =>
    /ответственност|штраф|пен|неустой|убытк|санкц|просроч|за каждый день|односторон|расторж|отказ от исполнения|отказ от договора|место поставк|срок поставк|срок оплат/i.test(
      line
    )
  );

  return matched.slice(0, 180);
}

function compressTenderSection(section: TenderSourceSection) {
  const priority = getTenderSourcePriority(section.title);
  const body = section.body.trim();
  const relevantSnippets = takeRelevantTenderSnippets(body);
  const maxLength = priority >= 4 ? 14000 : priority >= 2 ? 9000 : 4500;

  const parts: string[] = [];
  parts.push(`Файл: ${section.title}`);

  if (body.length <= maxLength) {
    parts.push(body);
    return {
      text: parts.join("\n"),
      priority,
    };
  }

  const head = body.slice(0, Math.min(5000, maxLength)).trim();
  parts.push(head);

  if (relevantSnippets.length > 0) {
    parts.push("Важные выдержки:");
    parts.push(relevantSnippets.join("\n"));
  }

  return {
    text: parts.join("\n\n").slice(0, maxLength + 2000),
    priority,
  };
}

function buildTenderAiSourcePack(sourceText: string) {
  const scopes = buildTenderDocumentScopes(sourceText);
  return buildPackedScopeSelection(scopes, {
    categories: ["notice", "spec", "contract", "pricing", "forms", "other"],
    maxTotalLength: 90000,
  });
}

function buildTenderDocumentScopes(sourceText: string) {
  return parseTenderSourceSections(sourceText).map((section, index) => {
    const normalizedTitle = section.title.toLowerCase().trim();
    const priority = getTenderSourcePriority(section.title);
    const compactBody = section.body.replace(/\s+/g, " ").trim();
    return {
      id: index + 1,
      section,
      category: classifyTenderSection(section),
      priority,
      normalizedTitle,
      hasMeaningfulBody: compactBody.length >= 80,
    };
  });
}

function buildPackedScopeSelection(
  scopes: TenderDocumentScope[],
  input: {
    categories: TenderDocumentCategory[];
    maxTotalLength: number;
    equipmentMode?: boolean;
  }
): TenderPackedScopeSelection {
  const selected = scopes.filter(
    (item) => input.categories.includes(item.category) && item.hasMeaningfulBody
  );
  const fallback = selected.length > 0 ? selected : scopes.filter((item) => item.hasMeaningfulBody);

  const packed = fallback
    .map((item) => ({
      ...item,
      compressed: input.equipmentMode
        ? {
            text: [
              `Файл: ${item.section.title}`,
              (() => {
                const lines = takeEquipmentFocusedSnippets(item.section.body);
                return lines.length > 0 ? `Позиции и строки:\n${lines.join("\n")}` : "";
              })(),
              item.section.body.slice(0, 3500).trim(),
            ]
              .filter(Boolean)
              .join("\n\n")
              .trim(),
            priority: item.priority,
          }
        : input.categories.includes("pricing") && item.category === "pricing"
          ? {
              text: [
                `Файл: ${item.section.title}`,
                (() => {
                  const lines = takePricingFocusedSnippets(item.section.body);
                  return lines.length > 0 ? `Ценовые и обеспечительные строки:\n${lines.join("\n")}` : "";
                })(),
                item.section.body.slice(0, 3500).trim(),
              ]
                .filter(Boolean)
                .join("\n\n")
                .trim(),
              priority: item.priority,
            }
        : input.categories.includes("contract") && item.category === "contract"
          ? {
              text: [
                `Файл: ${item.section.title}`,
                (() => {
                  const lines = takeContractFocusedSnippets(item.section.body);
                  return lines.length > 0 ? `Договорные условия и санкции:\n${lines.join("\n")}` : "";
                })(),
                item.section.body.slice(0, 4500).trim(),
              ]
                .filter(Boolean)
                .join("\n\n")
                .trim(),
              priority: item.priority,
            }
        : compressTenderSection(item.section),
    }))
    .sort((left, right) => right.priority - left.priority);

  const result: string[] = [];
  const includedIds: number[] = [];
  let currentLength = 0;
  const categorySeeded = new Set<TenderDocumentCategory>();
  const categorySeedBudget = Math.max(
    1600,
    Math.floor(input.maxTotalLength / Math.max(input.categories.length, 1))
  );

  for (const item of packed) {
    const chunk = item.compressed.text.trim().slice(0, categorySeedBudget);
    if (!chunk) continue;
    if (currentLength > 0 && currentLength + chunk.length > input.maxTotalLength) continue;
    if (categorySeeded.has(item.category)) continue;

    result.push(chunk);
    includedIds.push(item.id);
    currentLength += chunk.length + 2;
    categorySeeded.add(item.category);
  }

  for (const item of packed) {
    const chunk = item.compressed.text.trim();
    if (!chunk) continue;
    if (includedIds.includes(item.id)) continue;
    if (currentLength > 0 && currentLength + chunk.length > input.maxTotalLength) continue;
    result.push(chunk);
    includedIds.push(item.id);
    currentLength += chunk.length + 2;
  }

  return {
    text: result.join("\n\n").trim(),
    includedIds,
  };
}

function buildScopedSourcePack(
  scopes: TenderDocumentScope[],
  categories: TenderDocumentCategory[],
  maxTotalLength = 45000
) {
  return buildPackedScopeSelection(scopes, {
    categories,
    maxTotalLength,
  }).text;
}

function buildTenderDocumentCoverage(input: {
  scopes: TenderDocumentScope[];
  primaryPackIds: number[];
  metaPackIds: number[];
  requisitesPackIds: number[];
  pricingPackIds: number[];
  requirementsPackIds: number[];
  contractPackIds: number[];
  equipmentPackIds: number[];
}) {
  return input.scopes.map<TenderDocumentCoverageEntry>((scope) => {
    const included =
      input.primaryPackIds.includes(scope.id) ||
      input.metaPackIds.includes(scope.id) ||
      input.requisitesPackIds.includes(scope.id) ||
      input.pricingPackIds.includes(scope.id) ||
      input.requirementsPackIds.includes(scope.id) ||
      input.contractPackIds.includes(scope.id) ||
      input.equipmentPackIds.includes(scope.id);

    return {
      id: scope.id,
      title: scope.section.title,
      category: scope.category,
      priority: scope.priority,
      has_meaningful_text: scope.hasMeaningfulBody,
      included_in_primary_pack: input.primaryPackIds.includes(scope.id),
      included_in_meta_pack: input.metaPackIds.includes(scope.id),
      included_in_requisites_pack: input.requisitesPackIds.includes(scope.id),
      included_in_pricing_pack: input.pricingPackIds.includes(scope.id),
      included_in_requirements_pack: input.requirementsPackIds.includes(scope.id),
      included_in_contract_pack: input.contractPackIds.includes(scope.id),
      included_in_equipment_pack: input.equipmentPackIds.includes(scope.id),
      note: !scope.hasMeaningfulBody
        ? "Текст слишком короткий или пустой, поэтому документ не вошёл в AI-разбор."
        : included
          ? "Документ вошёл в один или несколько AI-проходов."
          : "Документ распознан, но не попал в приоритетный набор из-за лимита контекста.",
    };
  });
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
  const sourceLength = input.sourceText.length;
  const compactMode = sourceLength >= 20_000;
  const ultraCompactMode = sourceLength >= 35_000;
  const hyperCompactMode = sourceLength >= 70_000;
  const scopes = buildTenderDocumentScopes(input.sourceText);
  const primarySourcePack = buildTenderAiSourcePack(input.sourceText);
  const packedSourceText = primarySourcePack.text || input.sourceText.slice(0, 90000);
  const metaSourcePack = buildPackedScopeSelection(scopes, {
    categories: ["notice", "other"],
    maxTotalLength: hyperCompactMode ? 2500 : ultraCompactMode ? 4000 : compactMode ? 7000 : 28000,
  });
  const requisitesSourcePack = buildPackedScopeSelection(scopes, {
    categories: ["contract", "notice", "other"],
    maxTotalLength: hyperCompactMode ? 3000 : ultraCompactMode ? 5000 : compactMode ? 9000 : 32000,
  });
  const pricingOnlySourcePack = buildPackedScopeSelection(scopes, {
    categories: ["pricing"],
    maxTotalLength: hyperCompactMode ? 3500 : ultraCompactMode ? 5500 : compactMode ? 10000 : 36000,
  });
  const hasPricingOnlySource =
    pricingOnlySourcePack.includedIds.length > 0 && pricingOnlySourcePack.text.trim().length > 0;
  const pricingSourcePack = hasPricingOnlySource
    ? pricingOnlySourcePack
    : buildPackedScopeSelection(scopes, {
        categories: ["pricing", "forms", "notice"],
        maxTotalLength: hyperCompactMode ? 3000 : ultraCompactMode ? 5000 : compactMode ? 9000 : 32000,
      });
  const requirementsSourcePack = buildPackedScopeSelection(scopes, {
    categories: ["notice", "forms", "spec", "other"],
    maxTotalLength: hyperCompactMode ? 3500 : ultraCompactMode ? 6000 : compactMode ? 10000 : 36000,
  });
  const contractOnlySourcePack = buildPackedScopeSelection(scopes, {
    categories: ["contract"],
    maxTotalLength: hyperCompactMode ? 3000 : ultraCompactMode ? 5000 : compactMode ? 9000 : 32000,
  });
  const hasContractOnlySource =
    contractOnlySourcePack.includedIds.length > 0 && contractOnlySourcePack.text.trim().length > 0;
  const contractSourcePack = hasContractOnlySource
    ? contractOnlySourcePack
    : buildPackedScopeSelection(scopes, {
        categories: ["contract", "notice", "other"],
        maxTotalLength: hyperCompactMode ? 3000 : ultraCompactMode ? 5000 : compactMode ? 9000 : 32000,
      });
  const equipmentSourcePack = buildPackedScopeSelection(scopes, {
    categories: ["spec", "pricing", "notice", "forms"],
    maxTotalLength: hyperCompactMode ? 4500 : ultraCompactMode ? 7000 : compactMode ? 12000 : 55000,
    equipmentMode: true,
  });
  const metaSourceText = metaSourcePack.text || packedSourceText;
  const pricingSourceText = pricingSourcePack.text || packedSourceText;
  const requirementsSourceText = requirementsSourcePack.text || packedSourceText;
  const contractSourceText = contractSourcePack.text || packedSourceText;
  const equipmentSourceText = equipmentSourcePack.text || packedSourceText;
  const requisitesSourceText =
    requisitesSourcePack.text || contractSourceText || metaSourceText || packedSourceText;
  const documentCoverage = buildTenderDocumentCoverage({
    scopes,
    primaryPackIds: primarySourcePack.includedIds,
    metaPackIds: metaSourcePack.includedIds,
    requisitesPackIds: requisitesSourcePack.includedIds,
    pricingPackIds: pricingSourcePack.includedIds,
    requirementsPackIds: requirementsSourcePack.includedIds,
    contractPackIds: contractSourcePack.includedIds,
    equipmentPackIds: equipmentSourcePack.includedIds,
  });

  const metaPrompt = `
Ты разбираешь только общую идентификацию закупки и явные стоп-факторы.
Нужны только факты без воды и без ссылок на документы.
Если чего-то нет, верни пустую строку или пустой массив.

Определи:
- номер закупки
- заказчика
- ИНН заказчика
- КПП заказчика
- ОГРН заказчика
- адрес заказчика
- площадку
- вид закупки
- краткую выжимку в 2-4 коротких смысловых фразах
- только явные стоп-факторы, если они есть

Текст документов:
${metaSourceText}
`.trim();

  const requisitesPrompt = `
Ты разбираешь только реквизиты заказчика.
Нужны только факты без воды и без ссылок на документы.
Если данных нет, верни пустую строку.

Определи:
- полное наименование заказчика
- ИНН заказчика
- КПП заказчика
- ОГРН заказчика
- адрес заказчика

Правила:
- особенно доверяй разделам договора, проекта договора, реквизитам сторон, сведениям о заказчике и карточке организации;
- не бери ИНН, КПП и ОГРН поставщика, участника, исполнителя или подрядчика;
- если рядом явно указаны слова заказчик, покупатель, организатор закупки, сведения о заказчике — это приоритет.

Текст документов:
${requisitesSourceText}
`.trim();

  const pricingPrompt = `
Ты разбираешь только цену и обеспечение по закупке.
Ниже приоритетно даны ценовые документы и Excel/НМЦК-материалы. Не уходи в другие вопросы закупки.
Нужны только факты без воды и без ссылок на документы.
Если чего-то нет, верни пустую строку.
НДС = 22%, только если явно не указано иное и это приходится рассчитывать.
Внимательно проверь, входят ли налоги в цену.

Определи:
- НМЦ без НДС
- НМЦ с НДС
- как в цене учтены налоги
- обеспечение заявки
- обеспечение исполнения договора

Правила для цены:
- ищи НМЦК/НМЦД/начальную (максимальную) цену договора/цену лота;
- не путай общую цену закупки с ценой отдельной позиции;
- если в таблице есть итог/итого/всего по закупке, это важнее цены отдельной строки;
- если документ табличный, в первую очередь смотри строки с ИТОГО/ВСЕГО/НМЦК/НМЦД/Стоимость/Сумма договора;
- игнорируй даты, коды товаров, артикулы и номера строк, даже если они похожи на сумму;
- если есть обе суммы, верни отдельно "без НДС" и "с НДС";
- если явно указано только значение с НДС, можешь рассчитать без НДС по ставке 22%.

Текст документов:
${pricingSourceText}
`.trim();

  const requirementsPrompt = `
Ты разбираешь только требования к участнику и документацию до подачи.
Нужны только факты без воды и без ссылок на документы.
Если чего-то нет, верни пустую строку или пустой массив.

Определи:
- критерии отбора
- документацию до подачи
- нестандартные требования
- требования РРЭП/РПП
- есть ли запрет по 1875
- делимый лот / несколько победителей / попозиционность
- военная приемка / РТ-Техприемка

Текст документов:
${requirementsSourceText}
`.trim();

  const contractPrompt = `
Ты разбираешь только условия договора и исполнения.
Нужны только факты без воды и без ссылок на документы.
Если чего-то нет, верни пустую строку или пустой массив.

Определи:
- сроки и место поставки
- сроки оплаты
- срок действия договора
- ответственность по договору
- штрафы / пени / неустойки
- основания одностороннего расторжения
- требуются ли пуско-наладочные работы

Правила для договора:
- если в комплекте есть договор или проект договора, считай его главным источником;
- поле "ответственность по договору" заполняй только по разделу "Ответственность сторон" или ближайшему одноимённому разделу договора;
- не подставляй в "ответственность" общий текст закупки, вводные абзацы, реквизиты и описание предмета закупки;
- особенно ищи точные проценты, суммы и формулы штрафов/пеней;
- отдельно ищи фразы "за каждый день просрочки", "неустойка", "штраф", "ответственность сторон";
- отдельно ищи все основания одностороннего отказа / расторжения.

Текст документов:
${contractSourceText}
`.trim();

  const equipmentPrompt = `
Ты разбираешь только товарную часть закупки.
Нужны только факты без воды и без ссылок на документы.
Если чего-то нет, верни 0 или пустой массив.
Собирай максимально полный, но короткий перечень оборудования / товаров / позиций.

Определи:
- количество позиций
- список оборудования / товаров

Текст документов:
${equipmentSourceText}
`.trim();

  const [metaAnalysis, requisitesAnalysis, pricingAnalysis, requirementsAnalysis, contractAnalysis, equipmentAnalysis] =
    await Promise.all([
      runStructuredResponse<TenderMetaAnalysis>({
        apiKey,
        model,
        prompt: metaPrompt,
        schema: tenderMetaAnalysisSchema,
        reasoningEffort: "high",
        timeoutMs: hyperCompactMode ? 45_000 : ultraCompactMode ? 60_000 : compactMode ? 75_000 : 90_000,
      }),
      runStructuredResponse<TenderMetaAnalysis>({
        apiKey,
        model,
        prompt: requisitesPrompt,
        schema: tenderMetaAnalysisSchema,
        reasoningEffort: "high",
        timeoutMs: hyperCompactMode ? 45_000 : ultraCompactMode ? 60_000 : compactMode ? 75_000 : 90_000,
      }),
      runStructuredResponse<TenderPricingAnalysis>({
        apiKey,
        model,
        prompt: pricingPrompt,
        schema: tenderPricingAnalysisSchema,
        reasoningEffort: "high",
        timeoutMs: hyperCompactMode ? 60_000 : ultraCompactMode ? 80_000 : compactMode ? 100_000 : 120_000,
      }),
      runStructuredResponse<TenderRequirementsAnalysis>({
        apiKey,
        model,
        prompt: requirementsPrompt,
        schema: tenderRequirementsAnalysisSchema,
        reasoningEffort: "high",
        timeoutMs: hyperCompactMode ? 45_000 : ultraCompactMode ? 60_000 : compactMode ? 75_000 : 90_000,
      }),
      runStructuredResponse<TenderContractAnalysis>({
        apiKey,
        model,
        prompt: contractPrompt,
        schema: tenderContractAnalysisSchema,
        reasoningEffort: "high",
        timeoutMs: hyperCompactMode ? 60_000 : ultraCompactMode ? 80_000 : compactMode ? 100_000 : 120_000,
      }),
      runStructuredResponse<TenderEquipmentAnalysis>({
        apiKey,
        model,
        prompt: equipmentPrompt,
        schema: tenderEquipmentAnalysisSchema,
        reasoningEffort: "high",
        timeoutMs: hyperCompactMode ? 60_000 : ultraCompactMode ? 80_000 : compactMode ? 110_000 : 140_000,
      }),
    ]);

  const resolvedCustomerName =
    requisitesAnalysis.customer_name || metaAnalysis.customer_name || input.customerName || "";
  const resolvedCustomerInn =
    requisitesAnalysis.customer_inn || metaAnalysis.customer_inn || input.customerInn || "";
  const resolvedProcurementNumber =
    metaAnalysis.procurement_number || input.procurementNumber || "";
  const resolvedPlatform = metaAnalysis.platform || input.platform || "";
  const resolvedItemsCount =
    equipmentAnalysis.items_count || input.itemsCount || 0;
  const resolvedNmckWithoutVat =
    pricingAnalysis.nmck_without_vat || String(input.nmckWithoutVat ?? "");

  const synthesizedDossier: TenderSourceDossier = {
    procurement_number: resolvedProcurementNumber,
    customer_name: resolvedCustomerName,
    customer_inn: resolvedCustomerInn,
    customer_kpp: requisitesAnalysis.customer_kpp || metaAnalysis.customer_kpp,
    customer_ogrn: requisitesAnalysis.customer_ogrn || metaAnalysis.customer_ogrn,
    customer_address: requisitesAnalysis.customer_address || metaAnalysis.customer_address,
    platform: resolvedPlatform,
    items_count: resolvedItemsCount,
    procurement_type: metaAnalysis.procurement_type,
    nmck_mentions: uniqueNonEmptyStrings([
      pricingAnalysis.nmck_without_vat,
      pricingAnalysis.nmck_with_vat,
      pricingAnalysis.price_tax_note,
    ]),
    security_mentions: uniqueNonEmptyStrings([
      pricingAnalysis.bid_security,
      pricingAnalysis.contract_security,
    ]),
    criteria_points: uniqueNonEmptyStrings([requirementsAnalysis.selection_criteria]),
    required_documents: requirementsAnalysis.required_documents,
    nonstandard_requirements: requirementsAnalysis.nonstandard_requirements,
    rrep_rpp_requirements: requirementsAnalysis.rrep_rpp_requirements,
    decree_1875_ban: requirementsAnalysis.decree_1875_ban,
    requires_commissioning: contractAnalysis.requires_commissioning,
    lot_structure: requirementsAnalysis.lot_structure,
    military_acceptance: requirementsAnalysis.military_acceptance,
    equipment_items: equipmentAnalysis.equipment_items,
    delivery_terms: contractAnalysis.delivery_terms,
    payment_terms: contractAnalysis.payment_terms,
    contract_term: contractAnalysis.contract_term,
    responsibility_terms: contractAnalysis.responsibility_terms,
    penalty_terms: contractAnalysis.penalty_terms,
    termination_reasons: contractAnalysis.termination_reasons,
    stop_factor_findings: metaAnalysis.stop_factor_findings,
    unresolved_questions: [],
  };

  const synthesizedRawResult: TenderAnalysisResult = {
    procurement_number: resolvedProcurementNumber,
    customer_name: resolvedCustomerName,
    customer_inn: resolvedCustomerInn,
    customer_kpp: requisitesAnalysis.customer_kpp || metaAnalysis.customer_kpp,
    customer_ogrn: requisitesAnalysis.customer_ogrn || metaAnalysis.customer_ogrn,
    customer_address: requisitesAnalysis.customer_address || metaAnalysis.customer_address,
    platform: resolvedPlatform,
    items_count: resolvedItemsCount,
    procurement_type: metaAnalysis.procurement_type,
    nmck_without_vat: pricingAnalysis.nmck_without_vat,
    nmck_with_vat: pricingAnalysis.nmck_with_vat,
    price_tax_note: pricingAnalysis.price_tax_note,
    bid_security: pricingAnalysis.bid_security,
    contract_security: pricingAnalysis.contract_security,
    summary: metaAnalysis.summary,
    selection_criteria: requirementsAnalysis.selection_criteria,
    required_documents: requirementsAnalysis.required_documents,
    nonstandard_requirements: requirementsAnalysis.nonstandard_requirements,
    rrep_rpp_requirements: requirementsAnalysis.rrep_rpp_requirements,
    decree_1875_ban: requirementsAnalysis.decree_1875_ban,
    requires_commissioning: contractAnalysis.requires_commissioning,
    lot_structure: requirementsAnalysis.lot_structure,
    military_acceptance: requirementsAnalysis.military_acceptance,
    equipment_items: equipmentAnalysis.equipment_items,
    delivery_terms: contractAnalysis.delivery_terms,
    payment_terms: contractAnalysis.payment_terms,
    contract_term: contractAnalysis.contract_term,
    responsibility_terms: contractAnalysis.responsibility_terms,
    penalty_terms: contractAnalysis.penalty_terms,
    termination_reasons: contractAnalysis.termination_reasons,
    stop_factor_findings: metaAnalysis.stop_factor_findings,
  };

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
- Заказчик: ${resolvedCustomerName}
- ИНН заказчика: ${resolvedCustomerInn}
- КПП заказчика: ${requisitesAnalysis.customer_kpp || metaAnalysis.customer_kpp}
- ОГРН заказчика: ${requisitesAnalysis.customer_ogrn || metaAnalysis.customer_ogrn}
- Адрес заказчика: ${requisitesAnalysis.customer_address || metaAnalysis.customer_address}
- Номер закупки: ${resolvedProcurementNumber}
- Площадка: ${resolvedPlatform}
- Количество позиций: ${resolvedItemsCount}
- НМЦ без НДС: ${resolvedNmckWithoutVat}

Предварительные разборы:
${JSON.stringify(
  {
    meta: metaAnalysis,
    requisites: requisitesAnalysis,
    pricing: pricingAnalysis,
    requirements: requirementsAnalysis,
    contract: contractAnalysis,
    equipment: equipmentAnalysis,
  },
  null,
  2
)}

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
${compactMode ? [metaSourceText, pricingSourceText, requirementsSourceText, contractSourceText, equipmentSourceText].filter(Boolean).join("\n\n") : packedSourceText}
`.trim();

  const dossier = await runStructuredResponse<TenderSourceDossier>({
    apiKey,
    model,
    prompt: dossierPrompt,
    schema: tenderSourceDossierSchema,
    reasoningEffort: "high",
    timeoutMs: hyperCompactMode ? 180_000 : compactMode ? 150_000 : 120_000,
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
- Заказчик: ${resolvedCustomerName}
- ИНН заказчика: ${resolvedCustomerInn}
- КПП заказчика: ${requisitesAnalysis.customer_kpp || metaAnalysis.customer_kpp}
- ОГРН заказчика: ${requisitesAnalysis.customer_ogrn || metaAnalysis.customer_ogrn}
- Адрес заказчика: ${requisitesAnalysis.customer_address || metaAnalysis.customer_address}
- Номер закупки: ${resolvedProcurementNumber}
- Площадка: ${resolvedPlatform}
- Количество позиций: ${resolvedItemsCount}
- НМЦ без НДС: ${resolvedNmckWithoutVat}

Factual dossier:
${JSON.stringify(dossier, null, 2)}

Предварительные специализированные разборы:
${JSON.stringify(
  {
    meta: metaAnalysis,
    requisites: requisitesAnalysis,
    pricing: pricingAnalysis,
    requirements: requirementsAnalysis,
    contract: contractAnalysis,
    equipment: equipmentAnalysis,
  },
  null,
  2
)}
`.trim();

  const rawResult = await runStructuredResponse<TenderAnalysisResult>({
    apiKey,
    model,
    prompt,
    schema: tenderAnalysisSchema,
    reasoningEffort: "high",
    timeoutMs: hyperCompactMode ? 180_000 : compactMode ? 150_000 : 120_000,
  });

  const result = normalizeTenderAnalysisResult({
    result: rawResult,
    dossier,
    metaAnalysis,
    requisitesAnalysis,
    pricingAnalysis,
    requirementsAnalysis,
    contractAnalysis,
    equipmentAnalysis,
    fallback: input,
  });

  return {
    model,
    dossier,
    result,
    documentCoverage,
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
  const packedSourceText =
    buildTenderAiSourcePack(input.sourceText).text.slice(0, 18_000);

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
${packedSourceText}
`.trim();

  const result = await runStructuredResponse<TenderFasAnalysisResult>({
    apiKey,
    model,
    prompt,
    schema: tenderFasAnalysisSchema,
    reasoningEffort: "low",
    timeoutMs: 45_000,
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
