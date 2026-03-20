function normalizeDashes(value: string) {
  return value.replace(/[—–−]/g, "-");
}

function normalizeWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

export function slugifyCase(value: string) {
  return normalizeDashes(value)
    .toLowerCase()
    .trim()
    .replace(/["'`]/g, "")
    .replace(/[^\p{L}\p{N}\s-]+/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function parseCaseDecisionDate(value: string) {
  const raw = value.trim();

  if (!raw) return null;

  const isoMatch = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    const [, year, month, day] = isoMatch;
    const parsed = new Date(`${year}-${month}-${day}T00:00:00`);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  const ruMatch = raw.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (ruMatch) {
    const [, day, month, year] = ruMatch;
    const parsed = new Date(`${year}-${month}-${day}T00:00:00`);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  return null;
}

export function normalizeOptionalString(value: FormDataEntryValue | null) {
  const normalized = normalizeWhitespace(String(value || ""));
  return normalized || null;
}

export function normalizeCustomerName(value: FormDataEntryValue | null) {
  const normalized = normalizeOptionalString(value);
  return normalized || null;
}

export function normalizeDigits(value: FormDataEntryValue | null) {
  const normalized = String(value || "").replace(/\D/g, "").trim();
  return normalized || null;
}

export function isValidCustomerInn(value: string | null) {
  if (!value) return true;
  return value.length === 10 || value.length === 12;
}

export function isValidCustomerKpp(value: string | null) {
  if (!value) return true;
  return value.length === 9;
}

export function parseOptionalCategoryId(value: FormDataEntryValue | null) {
  const raw = String(value || "").trim();

  if (!raw) return null;

  const parsed = Number(raw);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
}
