const TENDER_HOSTNAME = "tender.goszakon.ru";

export function normalizeHost(host?: string | null) {
  return (host ?? "").split(":")[0].toLowerCase();
}

export function isTenderHost(host?: string | null) {
  const normalized = normalizeHost(host);

  return normalized === TENDER_HOSTNAME;
}
