function normalizeDashes(value: string) {
  return value.replace(/[—–−]/g, "-");
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
  const normalized = String(value || "").trim();
  return normalized || null;
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
