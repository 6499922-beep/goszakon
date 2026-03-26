"use client";

import { useMemo, useRef, useState, useTransition } from "react";

type ChatMessage = {
  id: number;
  role: "user" | "assistant";
  authorName: string;
  body: string;
  createdAt: string;
};

type TenderProcurementChatProps = {
  procurementId: number;
  initialMessages: ChatMessage[];
  sourceDocuments?: Array<{
    title: string;
    href: string | null;
  }>;
};

const QUICK_PROMPTS = [
  "Что главное в этой закупке?",
  "Какие риски ты видишь по этой закупке?",
  "На что нужно обратить внимание в договоре?",
  "Какие документы до подачи самые важные?",
];

function parseStoredSources(body: string) {
  const marker = "\n\nИсточники:\n";
  const index = body.indexOf(marker);
  if (index === -1) {
    return {
      text: body,
      sources: [] as Array<{ title: string; url: string }>,
    };
  }

  const text = body.slice(0, index).trim();
  const sourcesBlock = body.slice(index + marker.length).trim();
  const sources = sourcesBlock
    .split("\n")
    .map((line) => line.replace(/^\d+\.\s*/, "").trim())
    .map((line) => {
      const parts = line.split(" — ");
      const url = parts.pop()?.trim() ?? "";
      const title = parts.join(" — ").trim() || url;
      if (!/^https?:\/\//i.test(url)) return null;
      return { title, url };
    })
    .filter((item): item is { title: string; url: string } => Boolean(item));

  return { text, sources };
}

function normalizeSearchText(value: string) {
  return value
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/[^a-zа-я0-9.\s_-]+/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function TenderProcurementChat({
  procurementId,
  initialMessages,
  sourceDocuments = [],
}: TenderProcurementChatProps) {
  const [messages, setMessages] = useState(initialMessages);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [useWebSearch, setUseWebSearch] = useState(false);
  const [isPending, startTransition] = useTransition();
  const viewportRef = useRef<HTMLDivElement | null>(null);

  const hasMessages = messages.length > 0;
  const sortedMessages = useMemo(
    () =>
      [...messages].sort(
        (left, right) => new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime()
      ),
    [messages]
  );
  const documentHints = useMemo(
    () =>
      sourceDocuments
        .filter((item) => item.href)
        .map((item) => ({
          title: item.title,
          href: item.href as string,
          normalized: normalizeSearchText(item.title),
        })),
    [sourceDocuments]
  );

  function askQuestion(question: string) {
    if (isPending) return;
    setDraft(question);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const question = draft.trim();
    if (!question || isPending) return;

    setError(null);

    startTransition(async () => {
      try {
        const response = await fetch("/api/tender/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            procurementId,
            message: question,
            useWebSearch,
          }),
        });

        const payload = (await response.json().catch(() => null)) as
          | {
              ok?: boolean;
              error?: string;
              userMessage?: ChatMessage;
              assistantMessage?: ChatMessage;
            }
          | null;

        if (!response.ok || !payload?.ok || !payload.userMessage || !payload.assistantMessage) {
          throw new Error(payload?.error || "Не удалось получить ответ по закупке.");
        }

        setDraft("");
        setMessages((current) => [
          ...current,
          payload.userMessage as ChatMessage,
          payload.assistantMessage as ChatMessage,
        ]);

        requestAnimationFrame(() => {
          viewportRef.current?.scrollTo({
            top: viewportRef.current.scrollHeight,
            behavior: "smooth",
          });
        });
      } catch (submitError) {
        setError(
          submitError instanceof Error
            ? submitError.message
            : "Не удалось получить ответ по закупке."
        );
      }
    });
  }

  return (
    <aside className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-base font-bold text-[#081a4b]">GPT по закупке</div>
          <div className="mt-1 text-sm text-slate-500">
            Можно спрашивать по документам и распознанным данным прямо отсюда.
          </div>
        </div>
        <div className="rounded-full bg-[#0d5bd7]/8 px-3 py-1 text-xs font-semibold text-[#0d5bd7]">
          История сохраняется
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between gap-3">
        <div className="text-xs text-slate-400">
          Можно писать по документам, условиям, рискам и стоп-факторам.
        </div>
        <button
          type="button"
          onClick={() => setIsCollapsed((current) => !current)}
          className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
        >
          {isCollapsed ? "Развернуть" : "Свернуть"}
        </button>
      </div>

      {!isCollapsed ? (
        <>
          <div className="mt-4 flex flex-wrap gap-2">
            {QUICK_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => askQuestion(prompt)}
                className="rounded-full border border-[#0d5bd7]/15 bg-[#0d5bd7]/5 px-3 py-2 text-xs font-medium text-[#0d5bd7] transition hover:border-[#0d5bd7]/30 hover:bg-[#0d5bd7]/10"
              >
                {prompt}
              </button>
            ))}
          </div>
          <label className="mt-3 flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={useWebSearch}
              onChange={(event) => setUseWebSearch(event.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-[#0d5bd7] focus:ring-[#0d5bd7]"
            />
            <span>Искать в интернете, если это нужно для ответа</span>
          </label>
          <div
            ref={viewportRef}
            className="mt-4 max-h-[60vh] space-y-3 overflow-y-auto rounded-2xl bg-slate-50 p-3"
          >
            {hasMessages ? (
              sortedMessages.map((message) => {
                const isAssistant = message.role === "assistant";
                const parsedMessage = parseStoredSources(message.body);
                const normalizedBody = normalizeSearchText(parsedMessage.text);
                const matchedDocuments = isAssistant
                  ? documentHints.filter(
                      (item) =>
                        item.normalized.length >= 4 &&
                        normalizedBody.includes(item.normalized)
                    )
                  : [];

                return (
                  <div
                    key={message.id}
                    className={`rounded-2xl px-4 py-3 text-sm leading-6 ${
                      isAssistant
                        ? "border border-[#0d5bd7]/15 bg-white text-slate-700"
                        : "bg-[#0d5bd7] text-white"
                    }`}
                  >
                    <div
                      className={`text-xs font-semibold uppercase tracking-[0.12em] ${
                        isAssistant ? "text-[#0d5bd7]" : "text-white/80"
                      }`}
                    >
                      {isAssistant ? "GPT" : message.authorName || "Сотрудник"}
                    </div>
                    <div className="mt-2 whitespace-pre-wrap">{parsedMessage.text}</div>
                    {matchedDocuments.length > 0 ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {matchedDocuments.map((item) => (
                          <a
                            key={`${message.id}-${item.href}`}
                            href={item.href}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-[#081a4b] transition hover:border-slate-300 hover:bg-slate-100"
                          >
                            {item.title}
                          </a>
                        ))}
                      </div>
                    ) : null}
                    {parsedMessage.sources.length > 0 ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {parsedMessage.sources.map((item) => (
                          <a
                            key={`${message.id}-${item.url}`}
                            href={item.url}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-[#081a4b] transition hover:border-slate-300 hover:bg-slate-100"
                          >
                            {item.title}
                          </a>
                        ))}
                      </div>
                    ) : null}
                  </div>
                );
              })
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-6 text-sm leading-6 text-slate-500">
                История по этой закупке пока пустая. Можно сразу спросить, что найдено в
                документах, почему сработал стоп-фактор или где искать нужное условие.
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="mt-4 space-y-3">
            <textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              rows={4}
              placeholder="Напиши вопрос по этой закупке..."
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm leading-6 text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#0d5bd7] focus:ring-2 focus:ring-[#0d5bd7]/10"
            />
            {error ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            ) : null}
            <div className="flex items-center justify-between gap-3">
              <div className="text-xs text-slate-400">
                GPT отвечает в контексте именно этой закупки и её файлов.
              </div>
              <button
                type="submit"
                disabled={isPending || !draft.trim()}
                className="inline-flex items-center rounded-full bg-[#0d5bd7] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0b4fc0] disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {isPending ? "Думаю..." : "Спросить"}
              </button>
            </div>
          </form>
        </>
      ) : (
        <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-500">
          Чат свёрнут. Разверни панель, чтобы задать вопрос по этой закупке.
        </div>
      )}
    </aside>
  );
}
