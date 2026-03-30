"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";

type GeneralChatMessage = {
  id: number;
  role: "user" | "assistant";
  authorName: string;
  body: string;
  createdAt: string;
};

type TenderGeneralChatProps = {
  threadId: number;
  currentThreadId: number;
  threadTitle: string;
  initialMessages: GeneralChatMessage[];
  userLabel: string;
  threadOptions: Array<{
    id: number;
    title: string;
    messageCount: number;
  }>;
};

type SelectedFilePreview = {
  fileName: string;
  fileType: string;
  documentKind?: string;
  extracted?: boolean;
  statusLabel?: string;
  note: string;
  text: string;
};

const QUICK_PROMPTS = [
  "Помоги оценить риск участия в закупке.",
  "Как лучше анализировать договор по 223-ФЗ?",
  "Что проверить в НМЦК и Excel в первую очередь?",
  "Составь план проверки закупки перед подачей.",
];

const ARCHIVE_FILE_PATTERN = /\.(zip|rar|7z)$/i;

function getFileTypePriority(file: File) {
  const name = file.name.toLowerCase();
  if (name.endsWith(".pdf")) return 1;
  if (name.endsWith(".docx") || name.endsWith(".doc")) return 2;
  if (name.endsWith(".xlsx") || name.endsWith(".xls")) return 3;
  if (name.endsWith(".txt") || name.endsWith(".md") || name.endsWith(".csv")) return 4;
  if (file.type.startsWith("image/")) return 5;
  return 9;
}

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

function renderInlineMarkdown(text: string) {
  const nodes: ReactNode[] = [];
  const pattern = /(\*\*[^*]+\*\*|\[[^\]]+\]\((https?:\/\/[^\s)]+)\))/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null = null;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }

    const token = match[0];
    if (token.startsWith("**") && token.endsWith("**")) {
      nodes.push(
        <strong key={`${match.index}-bold`} className="font-semibold text-[#081a4b]">
          {token.slice(2, -2)}
        </strong>
      );
    } else {
      const linkMatch = token.match(/^\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)$/);
      if (linkMatch) {
        nodes.push(
          <a
            key={`${match.index}-link`}
            href={linkMatch[2]}
            target="_blank"
            rel="noreferrer"
            className="text-[#0d5bd7] underline underline-offset-2"
          >
            {linkMatch[1]}
          </a>
        );
      } else {
        nodes.push(token);
      }
    }

    lastIndex = match.index + token.length;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
}

function renderAssistantMarkdown(text: string) {
  const lines = text.split("\n");
  const blocks: ReactNode[] = [];
  let paragraphLines: string[] = [];
  let listItems: string[] = [];

  const flushParagraph = () => {
    if (paragraphLines.length === 0) return;
    const paragraphText = paragraphLines.join(" ").trim();
    if (!paragraphText) {
      paragraphLines = [];
      return;
    }

    blocks.push(
      <p key={`p-${blocks.length}`} className="text-[15px] leading-8 text-slate-700">
        {renderInlineMarkdown(paragraphText)}
      </p>
    );
    paragraphLines = [];
  };

  const flushList = () => {
    if (listItems.length === 0) return;
    blocks.push(
      <ul key={`ul-${blocks.length}`} className="space-y-2 pl-5 text-[15px] leading-8 text-slate-700 list-disc">
        {listItems.map((item, index) => (
          <li key={`li-${index}`}>{renderInlineMarkdown(item)}</li>
        ))}
      </ul>
    );
    listItems = [];
  };

  lines.forEach((rawLine) => {
    const line = rawLine.trim();

    if (!line) {
      flushParagraph();
      flushList();
      return;
    }

    if (/^#{1,4}\s+/.test(line)) {
      flushParagraph();
      flushList();
      const level = Math.min(4, (line.match(/^#+/)?.[0].length ?? 1));
      const content = line.replace(/^#{1,4}\s+/, "");
      const className =
        level === 1
          ? "text-2xl font-bold text-[#081a4b]"
          : level === 2
            ? "text-xl font-bold text-[#081a4b]"
            : "text-lg font-semibold text-[#081a4b]";

      blocks.push(
        <h3 key={`h-${blocks.length}`} className={className}>
          {renderInlineMarkdown(content)}
        </h3>
      );
      return;
    }

    if (/^[-•]\s+/.test(line) || /^\d+\.\s+/.test(line)) {
      flushParagraph();
      listItems.push(line.replace(/^[-•]\s+/, "").replace(/^\d+\.\s+/, ""));
      return;
    }

    paragraphLines.push(line);
  });

  flushParagraph();
  flushList();

  return <div className="space-y-4">{blocks}</div>;
}

export function TenderGeneralChat({
  threadId,
  currentThreadId,
  threadTitle,
  initialMessages,
  userLabel,
  threadOptions,
}: TenderGeneralChatProps) {
  const [messages, setMessages] = useState(initialMessages);
  const [draft, setDraft] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [activePreviewIndex, setActivePreviewIndex] = useState(0);
  const [previewCache, setPreviewCache] = useState<Record<string, SelectedFilePreview>>({});
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [procurementOnlyMode, setProcurementOnlyMode] = useState(false);
  const [attachedFilesOnlyMode, setAttachedFilesOnlyMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const composerRef = useRef<HTMLFormElement | null>(null);
  const storageKey = `general-chat-mode:${threadId}`;
  const activePreviewFile = selectedFiles[activePreviewIndex] ?? null;
  const activePreviewKey = activePreviewFile
    ? `${activePreviewFile.name}:${activePreviewFile.size}:${activePreviewFile.lastModified}`
    : null;
  const activePreview = activePreviewKey ? previewCache[activePreviewKey] : null;
  const activeObjectUrl = useMemo(() => {
    if (!activePreviewFile) return null;
    const isPdf = /\.pdf$/i.test(activePreviewFile.name) || activePreviewFile.type === "application/pdf";
    const isImage = activePreviewFile.type.startsWith("image/");
    if (!isPdf && !isImage) return null;
    return URL.createObjectURL(activePreviewFile);
  }, [activePreviewFile]);

  const sortedMessages = useMemo(
    () =>
      [...messages].sort(
        (left, right) => new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime()
      ),
    [messages]
  );
  const sortedSelectedFiles = useMemo(
    () =>
      selectedFiles
        .map((file, index) => ({ file, index }))
        .sort((left, right) => {
          const priority = getFileTypePriority(left.file) - getFileTypePriority(right.file);
          if (priority !== 0) return priority;
          return left.file.name.localeCompare(right.file.name, "ru");
        }),
    [selectedFiles]
  );
  const recentUserTopics = useMemo(() => {
    const seen = new Set<string>();

    return [...sortedMessages]
      .filter((message) => message.role === "user")
      .reverse()
      .map((message) => message.body.split("\n")[0]?.trim() || "Сообщение без названия")
      .map((line) => line.replace(/^Файлы:\s*/i, "").trim())
      .filter((line) => line.length > 0)
      .filter((line) => {
        if (seen.has(line)) return false;
        seen.add(line);
        return true;
      })
      .slice(0, 8);
  }, [sortedMessages]);

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
  }, [sortedMessages, isSubmitting]);

  useEffect(() => {
    return () => {
      if (activeObjectUrl) {
        URL.revokeObjectURL(activeObjectUrl);
      }
    };
  }, [activeObjectUrl]);

  useEffect(() => {
    const filesNeedingPreview = selectedFiles
      .map((file) => ({
        file,
        key: `${file.name}:${file.size}:${file.lastModified}`,
      }))
      .filter(({ key }) => !previewCache[key]);

    if (filesNeedingPreview.length === 0) {
      return;
    }

    let cancelled = false;
    setIsPreviewLoading(Boolean(activePreviewFile));

    Promise.all(
      filesNeedingPreview.map(async ({ file, key }) => {
        const formData = new FormData();
        formData.set("file", file);

        const response = await fetch("/api/tender/general-chat/preview", {
          method: "POST",
          body: formData,
        });

        const payload = (await response.json().catch(() => null)) as
          | { ok?: boolean; error?: string; preview?: SelectedFilePreview }
          | null;
        if (!response.ok || !payload?.ok || !payload.preview) {
          throw new Error(payload?.error || `Не удалось прочитать файл ${file.name}.`);
        }

        return { key, preview: payload.preview as SelectedFilePreview };
      })
    )
      .then((results) => {
        if (!cancelled) {
          setPreviewCache((current) => {
            const next = { ...current };
            results.forEach(({ key, preview }) => {
              next[key] = preview;
            });
            return next;
          });
        }
      })
      .catch((previewError) => {
        if (!cancelled) {
          setError(
            previewError instanceof Error
              ? previewError.message
              : "Не удалось построить предпросмотр файла."
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsPreviewLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [activePreviewFile, previewCache, selectedFiles]);

  function addFiles(nextFiles: File[]) {
    if (nextFiles.length === 0) return;
    setSelectedFiles((current) => [...current, ...nextFiles]);
    setError(null);
    setActivePreviewIndex((current) => (selectedFiles.length === 0 ? 0 : current));
  }

  function askQuestion(question: string) {
    if (isSubmitting) return;
    setDraft(question);
  }

  function removeFileAtIndex(index: number) {
    setSelectedFiles((current) => {
      const next = current.filter((_, currentIndex) => currentIndex !== index);
      setActivePreviewIndex((prev) => Math.max(0, Math.min(prev, next.length - 1)));
      return next;
    });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const question = draft.trim();
    const hasFiles = selectedFiles.length > 0;
    const filesToUpload = [...selectedFiles];

    if ((!question && !hasFiles) || isSubmitting) return;

    setError(null);
    const optimisticUserMessage: GeneralChatMessage = {
      id: -Date.now(),
      role: "user",
      authorName: userLabel,
      body:
        question || (hasFiles ? "Проанализируй прикреплённые файлы и помоги по ним." : ""),
      createdAt: new Date().toISOString(),
    };
    const optimisticAssistantMessage: GeneralChatMessage = {
      id: optimisticUserMessage.id - 1,
      role: "assistant",
      authorName: "GPT",
      body: hasFiles
        ? "Получил файлы. Сейчас читаю их, разбираю структуру и готовлю ответ..."
        : "Думаю над ответом...",
      createdAt: new Date(Date.now() + 1).toISOString(),
    };

    setDraft("");
    setSelectedFiles([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setMessages((current) => [...current, optimisticUserMessage, optimisticAssistantMessage]);
    setIsSubmitting(true);

    requestAnimationFrame(() => {
      composerRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    });

    try {
      if (filesToUpload.some((file) => ARCHIVE_FILE_PATTERN.test(file.name))) {
        throw new Error(
          "Архивы ZIP/RAR/7Z прикреплять нельзя. Загружайте только сами документы: PDF, DOC, DOCX, XLS, XLSX, TXT."
        );
      }

      const response =
        filesToUpload.length > 0
          ? await fetch("/api/tender/general-chat", {
              method: "POST",
              body: (() => {
                const formData = new FormData();
                formData.set("threadId", String(threadId));
                formData.set("message", question);
                formData.set("useWebSearch", String(!procurementOnlyMode));
                formData.set("attachedFilesOnly", String(attachedFilesOnlyMode));
                filesToUpload.forEach((file) => formData.append("files", file));
                return formData;
              })(),
            })
          : await fetch("/api/tender/general-chat", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                threadId,
                message: question,
                useWebSearch: !procurementOnlyMode,
                attachedFilesOnly: attachedFilesOnlyMode,
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
        ...current.filter(
          (item) =>
            item.id !== optimisticUserMessage.id && item.id !== optimisticAssistantMessage.id
        ),
        payload.userMessage as GeneralChatMessage,
        payload.assistantMessage as GeneralChatMessage,
      ]);
    } catch (submitError) {
      setMessages((current) =>
        current.filter(
          (item) =>
            item.id !== optimisticUserMessage.id && item.id !== optimisticAssistantMessage.id
        )
      );
      setDraft(question);
      setSelectedFiles(filesToUpload);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Не удалось получить ответ GPT."
      );
    } finally {
      setIsSubmitting(false);
      requestAnimationFrame(() => {
        endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
      });
    }
  }

  return (
    <section className="grid gap-3 xl:h-[calc(100vh-7.5rem)] xl:grid-cols-[260px_minmax(0,1fr)_300px] xl:overflow-hidden">
      <aside className="hidden xl:flex xl:h-full xl:flex-col xl:overflow-hidden xl:rounded-[1.5rem] xl:bg-[#f3f4f6] xl:px-3 xl:py-3">
        <div className="px-3 py-3">
          <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            GOSZAKON
          </div>
          <div className="mt-1.5 text-lg font-semibold text-[#111827]">GPT-чат</div>
          <button
            type="button"
            onClick={() => window.location.assign(`/tender/chat?new=${Date.now()}`)}
            className="mt-4 w-full rounded-2xl bg-white px-4 py-3 text-left text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            Новый чат
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-2 py-2">
          <div className="px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
            Текущий чат
          </div>
          <div className="mt-2 rounded-2xl bg-white px-4 py-4 shadow-sm">
            <div className="line-clamp-2 text-sm font-semibold text-[#111827]">{threadTitle}</div>
            <div className="mt-2 text-xs leading-5 text-slate-500">
              {sortedMessages.length > 0
                ? `${sortedMessages.length} сообщений в этой ветке`
                : "Новая ветка без сообщений"}
            </div>
          </div>

          <div className="mt-5 px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
            Последние темы
          </div>
          <div className="mt-2 space-y-1">
            {threadOptions.length > 0 ? (
              threadOptions.map((thread) => (
                <button
                  key={thread.id}
                  type="button"
                  onClick={() => window.location.assign(`/tender/chat?thread=${thread.id}`)}
                  className={`w-full rounded-2xl px-3 py-3 text-left text-sm transition ${
                    thread.id === currentThreadId
                      ? "bg-white text-[#111827] shadow-sm"
                      : "text-slate-700 hover:bg-white/80"
                  }`}
                >
                  <div className="line-clamp-2 font-medium">{thread.title}</div>
                  <div className="mt-1 text-xs text-slate-500">
                    {thread.messageCount > 0
                      ? `${thread.messageCount} сообщений`
                      : "Пустой чат"}
                  </div>
                </button>
              ))
            ) : (
              <div className="rounded-2xl px-3 py-3 text-sm text-slate-500">
                Чаты появятся после первых сообщений.
              </div>
            )}
          </div>
        </div>

        <div className="px-3 py-3">
          <div className="px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
            Аккаунт
          </div>
          <div className="mt-2 rounded-2xl bg-white px-4 py-4 shadow-sm">
            <div className="text-sm font-semibold text-[#111827]">{userLabel}</div>
            <div className="mt-1 text-xs leading-5 text-slate-500">
              Личная история чата хранится на вашем сервере.
            </div>
          </div>
        </div>
      </aside>

      <div className="flex min-h-[84vh] flex-col rounded-[1.5rem] bg-white xl:min-h-0 xl:h-full xl:overflow-hidden">
        <div className="px-8 py-4">
          <div className="mx-auto flex w-full max-w-4xl items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="text-[15px] font-semibold text-[#111827]">{threadTitle}</div>
              <div className="mt-1 text-sm text-slate-500">
                Работаю как обычный чат: можно писать вопрос, прикладывать документы и продолжать диалог.
              </div>
            </div>
          </div>
        </div>

        <div ref={viewportRef} className="flex-1 overflow-y-auto px-8 py-8 xl:min-h-0">
          {sortedMessages.length > 0 ? (
            <div className="mx-auto flex w-full max-w-4xl flex-col gap-10">
              {sortedMessages.map((message) => {
                const parsed = parseStoredSources(message.body);
                const isAssistant = message.role === "assistant";
                return (
                  <article
                    key={message.id}
                    className={isAssistant ? "w-full" : "ml-auto w-full max-w-[78%]"}
                  >
                    {isAssistant ? (
                      <div className="rounded-[2rem] bg-white px-1 py-1 text-slate-800">
                        <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                          {message.authorName}
                        </div>
                        <div className="mt-4 text-[16px]">{renderAssistantMarkdown(parsed.text)}</div>
                        {parsed.sources.length > 0 ? (
                          <div className="mt-6 space-y-2 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
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
                      </div>
                    ) : (
                      <div className="rounded-[1.75rem] bg-[#111827] px-5 py-4 text-white shadow-sm">
                        <div className="text-xs font-semibold uppercase tracking-[0.14em] text-white/60">
                          {message.authorName}
                        </div>
                        <div className="mt-3 whitespace-pre-wrap text-[15px] leading-7">{parsed.text}</div>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="flex h-full items-center justify-center">
              <div className="max-w-2xl text-center">
                <div className="text-4xl font-medium tracking-tight text-[#111827]">
                  Готов, когда ты готов.
                </div>
                <div className="mt-4 text-base leading-8 text-slate-500">
                  Задай вопрос, прикрепи документы кнопкой снизу слева или просто перетащи их в поле ввода.
                </div>
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white px-6 pb-5 pt-2 xl:shrink-0"
          ref={composerRef}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="sr-only"
            onChange={(event) => {
              const files = Array.from(event.target.files ?? []);
              setSelectedFiles(files);
              setActivePreviewIndex(0);
              setError(null);
            }}
          />

          {selectedFiles.length > 0 ? (
            <div className="mx-auto mb-3 flex w-full max-w-4xl flex-wrap gap-2">
              {sortedSelectedFiles.map(({ file, index }) => {
                const key = `${file.name}:${file.size}:${file.lastModified}`;
                const preview = previewCache[key];
                const statusLabel =
                  preview?.statusLabel || (isPreviewLoading ? "Читаю файл..." : "Ожидает чтения");

                return (
                  <button
                    type="button"
                    key={`${file.name}-${index}`}
                    onClick={() => removeFileAtIndex(index)}
                    className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
                  >
                    {file.name} · {statusLabel} ×
                  </button>
                );
              })}
            </div>
          ) : null}

          {error ? (
            <div className="mx-auto mt-3 w-full max-w-4xl rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <div
            onDragOver={(event) => {
              event.preventDefault();
              event.dataTransfer.dropEffect = "copy";
            }}
            onDrop={(event) => {
              event.preventDefault();
              const files = Array.from(event.dataTransfer.files ?? []);
              addFiles(files);
            }}
            className="mx-auto w-full max-w-4xl rounded-[2rem] border border-slate-200 bg-white px-4 py-3 shadow-sm"
          >
            <div className="flex items-end gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isSubmitting}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-2xl text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                aria-label="Добавить файлы"
              >
                +
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isSubmitting}
                className="sr-only"
              >
                Добавить файлы
              </button>

              <textarea
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    const form = event.currentTarget.form;
                    if (form && (draft.trim() || selectedFiles.length > 0) && !isSubmitting) {
                      form.requestSubmit();
                    }
                  }
                }}
                rows={2}
                placeholder="Спроси ChatGPT"
                className="min-h-[2.75rem] flex-1 resize-none border-0 bg-transparent px-1 py-2 text-[15px] leading-7 text-slate-800 outline-none"
              />

              <button
                type="submit"
                disabled={isSubmitting || (!draft.trim() && selectedFiles.length === 0)}
                className="rounded-full bg-[#111827] px-5 py-3 text-sm font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? "Думаю..." : "Отправить"}
              </button>
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
              <div className="text-xs text-slate-400">
                PDF, DOC, DOCX, XLS, XLSX, TXT. Нажми `+` или перетащи файлы прямо сюда.
              </div>
              <div className="text-xs text-slate-400">
                Enter — отправить, Shift + Enter — новая строка
              </div>
            </div>
          </div>

          <div className="mx-auto mt-4 flex w-full max-w-4xl flex-wrap gap-2">
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
            {selectedFiles.length > 0 ? (
              <button
                type="button"
                onClick={() =>
                  askQuestion(
                    "Собери краткую выжимку только по прикреплённым файлам: что это за документы, что в них главное, какие риски и что проверить в первую очередь."
                  )
                }
                className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700 transition hover:border-emerald-300 hover:bg-emerald-100"
              >
                Собрать выжимку по файлам
              </button>
            ) : null}
          </div>
        </form>
      </div>

      <aside className="rounded-[1.5rem] bg-white p-4 shadow-sm xl:h-full xl:overflow-y-auto">
        <div className="text-sm font-medium uppercase tracking-[0.16em] text-slate-400">
          Режим работы
        </div>

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

        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-1">
          <button
            type="button"
            onClick={() => setAttachedFilesOnlyMode(false)}
            className={`w-full rounded-2xl px-3 py-2 text-sm font-medium transition ${
              !attachedFilesOnlyMode
                ? "bg-white text-[#0d5bd7] shadow-sm"
                : "text-slate-600 hover:bg-white"
            }`}
          >
            Обычный режим
          </button>
          <button
            type="button"
            onClick={() => setAttachedFilesOnlyMode(true)}
            className={`mt-1 w-full rounded-2xl px-3 py-2 text-sm font-medium transition ${
              attachedFilesOnlyMode
                ? "bg-[#0d5bd7] text-white shadow-sm"
                : "text-slate-600 hover:bg-white"
            }`}
          >
            Только прикреплённые файлы
          </button>
        </div>

        <div className="mt-5 rounded-[1.5rem] bg-[#fafbfc] px-4 py-4">
          <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
            Файлы к отправке
          </div>
          {selectedFiles.length > 0 ? (
            <div className="mt-3 space-y-2">
              {sortedSelectedFiles.map(({ file, index }) => {
                const key = `${file.name}:${file.size}:${file.lastModified}`;
                const preview = previewCache[key];
                const statusLabel =
                  preview?.statusLabel || (isPreviewLoading ? "Читаю файл..." : "Ожидает чтения");
                const statusTone = preview?.extracted
                  ? "text-emerald-700"
                  : preview
                    ? "text-amber-700"
                    : "text-slate-400";

                return (
                <div
                  key={`${file.name}-sidebar-${index}`}
                  className={`flex items-center justify-between gap-3 rounded-2xl px-3 py-2 transition ${
                    index === activePreviewIndex
                      ? "bg-white ring-1 ring-[#0d5bd7]"
                      : "bg-white/70"
                  }`}
                  >
                    <button
                      type="button"
                      onClick={() => setActivePreviewIndex(index)}
                      className="min-w-0 flex-1 text-left"
                    >
                      <div className="truncate text-sm font-medium text-slate-700">{file.name}</div>
                      <div className={`text-xs ${statusTone}`}>{statusLabel}</div>
                      <div className="text-xs text-slate-400">
                        {preview?.documentKind || "Документ"} · {(file.size / 1024 / 1024).toFixed(file.size > 1024 * 1024 ? 1 : 2)} МБ
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => removeFileAtIndex(index)}
                      className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500 transition hover:bg-rose-50 hover:text-rose-700"
                    >
                      Убрать
                    </button>
                </div>
                );
              })}
            </div>
          ) : (
            <div className="mt-3 text-sm leading-6 text-slate-500">Пока пусто.</div>
          )}
        </div>

        <div className="mt-4 rounded-[1.5rem] bg-[#fafbfc] px-4 py-4">
          <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
            Предпросмотр
          </div>
          {!activePreviewFile ? (
            <div className="mt-3 text-sm leading-6 text-slate-500">Файл не выбран.</div>
          ) : isPreviewLoading ? (
            <div className="mt-3 text-sm leading-6 text-slate-500">Готовлю предпросмотр файла...</div>
          ) : (
            <div className="mt-3 space-y-3">
              <div className="rounded-2xl bg-white px-3 py-3">
                <div className="text-sm font-semibold text-slate-800">{activePreviewFile.name}</div>
                <div className="mt-1 text-xs text-slate-500">
                  {activePreview?.documentKind ? `${activePreview.documentKind} · ` : ""}
                  {activePreview?.statusLabel || "Файл готов к отправке в чат."}
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  {activePreview?.note || "Файл готов к отправке в чат."}
                </div>
              </div>
              {activeObjectUrl && (activePreviewFile.type.startsWith("image/") || /\.pdf$/i.test(activePreviewFile.name)) ? (
                activePreviewFile.type.startsWith("image/") ? (
                  <img
                    src={activeObjectUrl}
                    alt={activePreviewFile.name}
                    className="max-h-[280px] w-full rounded-2xl border border-slate-200 object-contain bg-slate-50"
                  />
                ) : (
                  <iframe
                    src={activeObjectUrl}
                    title={activePreviewFile.name}
                    className="h-[320px] w-full rounded-2xl border border-slate-200 bg-white"
                  />
                )
              ) : activePreview?.text ? (
                <div className="max-h-[320px] overflow-y-auto rounded-2xl bg-white px-4 py-3 text-sm leading-7 text-slate-700 whitespace-pre-wrap">
                  {activePreview.text}
                </div>
              ) : (
                <div className="rounded-2xl bg-white px-4 py-4 text-sm leading-6 text-slate-500">
                  Для этого формата встроенный визуальный предпросмотр ограничен, но файл будет проанализирован после отправки.
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mt-4 space-y-2">
          {QUICK_PROMPTS.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => askQuestion(item)}
              className="w-full rounded-2xl bg-[#f7fbff] px-4 py-3 text-left text-sm font-medium text-[#0d5bd7] transition hover:bg-white"
            >
              {item}
            </button>
          ))}
        </div>
      </aside>
    </section>
  );
}
