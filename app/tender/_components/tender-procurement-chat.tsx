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
};

export function TenderProcurementChat({
  procurementId,
  initialMessages,
}: TenderProcurementChatProps) {
  const [messages, setMessages] = useState(initialMessages);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
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

      <div
        ref={viewportRef}
        className="mt-4 max-h-[60vh] space-y-3 overflow-y-auto rounded-2xl bg-slate-50 p-3"
      >
        {hasMessages ? (
          sortedMessages.map((message) => {
            const isAssistant = message.role === "assistant";
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
                <div className="mt-2 whitespace-pre-wrap">{message.body}</div>
              </div>
            );
          })
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-6 text-sm leading-6 text-slate-500">
            История по этой закупке пока пустая. Можно сразу спросить, что найдено в документах,
            почему сработал стоп-фактор или где искать нужное условие.
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
    </aside>
  );
}
