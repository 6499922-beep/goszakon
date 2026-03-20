export function getCasePath(item: {
  id: number;
  slug?: string | null;
}) {
  const slug = item.slug?.trim();

  if (slug) {
    return `/cases/${item.id}-${slug}`;
  }

  return `/cases/${item.id}`;
}

export function parseCaseParam(value: string) {
  const raw = String(value || "").trim();
  const idPart = raw.split("-")[0];
  const numericId = Number(idPart);

  if (!Number.isInteger(numericId) || numericId <= 0) {
    return null;
  }

  return {
    raw,
    numericId,
  };
}