export function normalizeTenderCustomerInn(value: string | null | undefined) {
  const normalized = String(value ?? "").replace(/\D+/g, "").trim();
  return normalized || null;
}

export function normalizeTenderCustomerName(value: string | null | undefined) {
  const normalized = String(value ?? "").trim();
  return normalized || null;
}

export function buildTenderCustomerHref(
  customerName: string | null | undefined,
  customerInn: string | null | undefined
) {
  const params = new URLSearchParams();
  const normalizedName = normalizeTenderCustomerName(customerName);
  const normalizedInn = normalizeTenderCustomerInn(customerInn);

  if (normalizedName) {
    params.set("name", normalizedName);
  }

  if (normalizedInn) {
    params.set("inn", normalizedInn);
  }

  const query = params.toString();
  return query ? `/customers?${query}` : "/customers";
}
