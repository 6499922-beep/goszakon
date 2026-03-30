const DEFAULT_TENDER_HOSTS = [
  "tender.goszakon.ru",
  "chat.goszakon.ru",
  "82.147.71.45",
  "138.124.118.116",
  "localhost",
  "127.0.0.1",
];

export function normalizeHost(host?: string | null) {
  return (host ?? "").split(":")[0].toLowerCase();
}

function getTenderHosts() {
  const extraHosts = (process.env.TENDER_ALLOWED_HOSTS ?? "")
    .split(",")
    .map((host) => normalizeHost(host))
    .filter(Boolean);

  return new Set([...DEFAULT_TENDER_HOSTS, ...extraHosts]);
}

export function isTenderHost(host?: string | null) {
  const normalized = normalizeHost(host);

  return getTenderHosts().has(normalized);
}

export function isTenderChatHost(host?: string | null) {
  return normalizeHost(host) === "chat.goszakon.ru";
}
