"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";

type GeneralChatMessage = {
  id: number;
  role: "user" | "assistant";
  authorName: string;
  body: string;
  createdAt: string;
};

type TenderGeneralChatProps = {
  threadId: number;
  threadTitle: string;
  initialMessages: GeneralChatMessage[];
  userLabel: string;
};

const QUICK_PROMPTS = [
  "Помоги оценить риск участия в закупке.",
  "Как лучше анализировать договор по 223-ФЗ?",
  "Что проверить в НМЦК и Excel в первую очередь?",
  "Составь план проверки закупки перед подачей.",
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

export function TenderGeneralChat({
  threadId,
  threadTitle,
  initialMessages,
  userLabel,
}: TenderGeneralChatProps) {
  const [messages, setMessages] = useState(initialMessages);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [procurementOnlyMode, setProcurementOnlyMode] = useState(false);
  const [isPending, startTransition] = useTransition();
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);
  const storageKey = `general-chat-mode:${threadId}`;

  const sortedMessages = useMemo(
    () =>
      [...messages].sort(
        (left, right) => new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime()
      ),
    [messages]
  );

  useEffect(() => {
    const savedMode = window.localStorage.getItem(storageKey);
    if (savedMode === "procurement-only") {
      setProcurementOnlyMode(true);
    } else if (savedMode === "web-default") {
      setProcurementOnlyMode(false);
    }
  }, [storageKey]);

  useEffect(() => {
    window.localStorage.setItem(
      storageKey,
      procurementOnlyMode ? "procurement-only" : "web-default"
    );
  }, [procurementOnlyMode, storageKey]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [sortedMessages, isPending]);

  function askQuestion(question: string) {
    if (isPending) return;
    setDraft(question);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const question = draft.trim();
    if (!question || isPending) return;

    setError(null);
    const optimisticUserMessage: GeneralChatMessage = {
      id: -Date.now(),
      role: "user",
      authorName: userLabel,
      body: question,
      createdAt: new Date().toISOString(),
    };

    setDraft("");
    setMessages((current) => [...current, optimisticUserMessage]);

    startTransition(async () => {
      try {
        const response = await fetch("/api/tender/general-chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            threadId,
            message: question,
            useWebSearch: !procurementOnlyMode,
          }),
        });

        const payload = (await response.json().catch(() => null)) as
          | {
              ok?: boolean;
              error?: string;
              userMessage?: GeneralChatMessage;
              assistantMessage?: GeneralChatMessage;
            }
          | null;

        if (!response.ok || !payload?.ok || !payload.userMessage || !payload.assistantMessage) {
          throw new Error(payload?.error || "Не удалось получить ответ GPT.");
        }

        setMessages((current) => [
          ...current.filter((item) => item.id !== optimisticUserMessage.id),
          payload.userMessage as GeneralChatMessage,
          payload.assistantMessage as GeneralChatMessage,
        ]);
      } catch (submitError) {
        setMessages((current) =>
          current.filter((item) => item.id !== optimisticUserMessage.id)
        );
        setDraft(question);
        setError(
          submitError instanceof Error
            ? submitError.message
            : "Не удалось получить ответ GPT."
        );
      }
    });
  }

  return (
    <section className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="text-sm font-medium uppercase tracking-[0.16em] text-slate-400">
          GPT-чат
        </div>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#081a4b]">
          {threadTitle}
        </h1>
        <p className="mt-3 text-sm leading-7 text-slate-600">
          Полноценный рабочий чат для сотрудников GOSZAKON. Здесь можно работать со мной
          отдельно от жёсткого анализа закупок.
        </p>

        <div className="mt-6 inline-flex rounded-2xl border border-slate-200 bg-slate-50 p-1">
          <button
            type="button"
            onClick={() => setProcurementOnlyMode(false)}
            className={`rounded-2xl px-3 py-2 text-sm font-medium transition ${
              !procurementOnlyMode
                ? "bg-[#0d5bd7] text-white shadow-sm"
                : "text-slate-600 hover:bg-white"
            }`}
          >
            Интернет + GPT
          </button>
          <button
            type="button"
            onClick={() => setProcurementOnlyMode(true)}
            className={`rounded-2xl px-3 py-2 text-sm font-medium transition ${
              procurementOnlyMode
                ? "bg-[#0d5bd7] text-white shadow-sm"
                : "text-slate-600 hover:bg-white"
            }`}
          >
            Только GPT
          </button>
        </div>

        <div className="mt-6 space-y-2">
          {QUICK_PROMPTS.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => askQuestion(item)}
              className="w-full rounded-2xl border border-[#cfe0ff] bg-[#f7fbff] px-4 py-3 text-left text-sm font-medium text-[#0d5bd7] transition hover:border-[#0d5bd7] hover:bg-white"
            >
              {item}
            </button>
          ))}
        </div>
      </aside>

      <div className="flex min-h-[78vh] flex-col rounded-[2rem] border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-5">
          <div className="text-sm text-slate-500">
            История сохраняется на вашем сервере и доступна в этой личной ветке чата.
          </div>
        </div>

        <div
          ref={viewportRef}
          className="flex-1 space-y-4 overflow-y-auto px-6 py-6"
        >
          {sortedMessages.length > 0 ? (
            sortedMessages.map((message) => {
              const parsed = parseStoredSources(message.body);
              const isAssistant = message.role === "assistant";
              return (
                <article
                  key={message.id}
                  className={`max-w-[85%] rounded-3xl px-5 py-4 shadow-sm ${
                    isAssistant
                      ? "border border-slate-200 bg-slate-50 text-slate-800"
                      : "ml-auto bg-[#0d5bd7] text-white"
                  }`}
                >
                  <div
                    className={`text-xs font-semibold uppercase tracking-[0.14em] ${
                      isAssistant ? "text-slate-400" : "text-white/70"
                    }`}
                  >
                    {message.authorName}
                  </div>
                  <div className="mt-2 whitespace-pre-wrap text-sm leading-7">
                    {parsed.text}
                  </div>
                  {parsed.sources.length > 0 ? (
                    <div className="mt-4 space-y-2 rounded-2xl border border-slate-200 bg-white/70 p-3 text-sm text-slate-700">
                      <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                        Источники
                      </div>
                      {parsed.sources.map((source) => (
                        <a
                          key={source.url}
                          href={source.url}
                          target="_blank"
                          rel="noreferrer"
                          className="block text-[#0d5bd7] underline-offset-2 hover:underline"
                        >
                          {source.title}
                        </a>
                      ))}
                    </div>
                  ) : null}
                </article>
              );
            })
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center text-slate-500">
              История пока пустая. Можно сразу начать работать со мной как в обычном чате.
            </div>
          )}
          <div ref={endRef} />
        </div>

        <div className="border-t border-slate-200 px-6 py-5">
          <form onSubmit={handleSubmit} className="space-y-3">
            <textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  const form = event.currentTarget.form;
                  if (form) {
                    form.requestSubmit();
                  }
                }
              }}
              rows={4}
              placeholder="Напиши вопрос в GPT..."
              className="w-full rounded-3xl border border-slate-300 px-4 py-4 text-sm leading-7 text-slate-800 outline-none transition focus:border-[#0d5bd7]"
            />

            <div className="flex items-center justify-between gap-4">
              <div className="text-xs text-slate-400">
                Enter — отправить, Shift + Enter — новая строка
              </div>
              <button
                type="submit"
                disabled={isPending || !draft.trim()}
                className="rounded-2xl bg-[#081a4b] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0d2568] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isPending ? "Думаю..." : "Спросить"}
              </button>
            </div>

            {error ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}
          </form>
        </div>
      </div>
    </section>
  );
}
