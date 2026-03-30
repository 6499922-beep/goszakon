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

type SelectedFilePreview = {
  fileName: string;
  fileType: string;
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

export function TenderGeneralChat({
  threadId,
  threadTitle,
  initialMessages,
  userLabel,
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
  const [isPending, startTransition] = useTransition();
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
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

  useEffect(() => {
    return () => {
      if (activeObjectUrl) {
        URL.revokeObjectURL(activeObjectUrl);
      }
    };
  }, [activeObjectUrl]);

  useEffect(() => {
    if (!activePreviewFile || !activePreviewKey || previewCache[activePreviewKey]) {
      return;
    }

    let cancelled = false;
    setIsPreviewLoading(true);

    const formData = new FormData();
    formData.set("file", activePreviewFile);

    fetch("/api/tender/general-chat/preview", {
      method: "POST",
      body: formData,
    })
      .then(async (response) => {
        const payload = (await response.json().catch(() => null)) as
          | { ok?: boolean; error?: string; preview?: SelectedFilePreview }
          | null;
        if (!response.ok || !payload?.ok || !payload.preview) {
          throw new Error(payload?.error || "Не удалось построить предпросмотр файла.");
        }
        if (!cancelled) {
          setPreviewCache((current) => ({
            ...current,
            [activePreviewKey]: payload.preview as SelectedFilePreview,
          }));
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
  }, [activePreviewFile, activePreviewKey, previewCache]);

  function addFiles(nextFiles: File[]) {
    if (nextFiles.length === 0) return;
    setSelectedFiles((current) => [...current, ...nextFiles]);
    setError(null);
    setActivePreviewIndex((current) => (selectedFiles.length === 0 ? 0 : current));
  }

  function askQuestion(question: string) {
    if (isPending) return;
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

    if ((!question && !hasFiles) || isPending) return;

    setError(null);
    const optimisticUserMessage: GeneralChatMessage = {
      id: -Date.now(),
      role: "user",
      authorName: userLabel,
      body:
        question || (hasFiles ? "Проанализируй прикреплённые файлы и помоги по ним." : ""),
      createdAt: new Date().toISOString(),
    };

    setDraft("");
    setSelectedFiles([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setMessages((current) => [...current, optimisticUserMessage]);

    startTransition(async () => {
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
          ...current.filter((item) => item.id !== optimisticUserMessage.id),
          payload.userMessage as GeneralChatMessage,
          payload.assistantMessage as GeneralChatMessage,
        ]);
      } catch (submitError) {
        setMessages((current) =>
          current.filter((item) => item.id !== optimisticUserMessage.id)
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
      }
    });
  }

  return (
    <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="flex min-h-[84vh] flex-col rounded-[2rem] border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-5">
          <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
            GPT-чат
          </div>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#081a4b]">
            {threadTitle}
          </h1>
          <p className="mt-2 text-sm leading-7 text-slate-500">
            Это отдельная рабочая страница общения со мной. Сюда можно свободно
            прикреплять документы и работать с ними как в полноценном чате.
          </p>
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

        <form onSubmit={handleSubmit} className="border-t border-slate-200 px-6 py-5">
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
            className="rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50/70 p-3 transition hover:border-[#0d5bd7]/40 hover:bg-white"
          >
            <textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  const form = event.currentTarget.form;
                  if (form && (draft.trim() || selectedFiles.length > 0) && !isPending) {
                    form.requestSubmit();
                  }
                }
              }}
              rows={4}
              placeholder="Напиши вопрос или просто прикрепи документы. Сюда же можно перетащить файлы мышкой."
              className="w-full rounded-3xl border border-slate-300 bg-white px-4 py-4 text-sm leading-7 text-slate-800 outline-none transition focus:border-[#0d5bd7]"
            />
          </div>

          {selectedFiles.length > 0 ? (
            <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
              <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                Прикреплённые файлы
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {sortedSelectedFiles.map(({ file, index }) => (
                  <button
                    type="button"
                    key={`${file.name}-${index}`}
                    onClick={() => removeFileAtIndex(index)}
                    className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
                  >
                    {file.name} ×
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {error ? (
            <div className="mt-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <div className="mt-3 flex flex-wrap gap-2">
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

          <div className="mt-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isPending}
                className="rounded-full border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Добавить файлы
              </button>
              {selectedFiles.length > 0 ? (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFiles([]);
                    setActivePreviewIndex(0);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = "";
                    }
                  }}
                  className="rounded-full border border-rose-200 bg-white px-4 py-2.5 text-sm font-semibold text-rose-700 transition hover:bg-rose-50"
                >
                  Очистить все
                </button>
              ) : null}
              <div className="text-xs text-slate-400">
                Enter — отправить, Shift + Enter — новая строка
              </div>
            </div>
            <button
              type="submit"
              disabled={isPending || (!draft.trim() && selectedFiles.length === 0)}
              className="rounded-2xl bg-[#081a4b] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0d2568] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPending ? "Думаю..." : selectedFiles.length > 0 ? "Отправить с файлами" : "Спросить"}
            </button>
          </div>
        </form>
      </div>

      <aside className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
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

        <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-7 text-slate-600">
          История чата сохраняется на вашем сервере. Это отдельная страница общения со
          мной без меню этапов и без рабочего тендерного шума.
        </div>

        <div className="mt-6 rounded-3xl border border-slate-200 bg-white px-4 py-4">
          <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
            Файлы к отправке
          </div>
          {selectedFiles.length > 0 ? (
            <div className="mt-3 space-y-2">
              {sortedSelectedFiles.map(({ file, index }) => (
                <div
                  key={`${file.name}-sidebar-${index}`}
                  className={`flex items-center justify-between gap-3 rounded-2xl border px-3 py-2 transition ${
                    index === activePreviewIndex
                      ? "border-[#0d5bd7] bg-[#f7fbff]"
                      : "border-slate-200 bg-slate-50"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setActivePreviewIndex(index)}
                    className="min-w-0 flex-1 text-left"
                  >
                    <div className="truncate text-sm font-medium text-slate-700">{file.name}</div>
                    <div className="text-xs text-slate-400">
                      {(file.size / 1024 / 1024).toFixed(file.size > 1024 * 1024 ? 1 : 2)} МБ
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => removeFileAtIndex(index)}
                    className="rounded-full border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-500 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
                  >
                    Убрать
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-3 text-sm leading-6 text-slate-500">
              Пока ничего не прикреплено. Можно добавить документы перед отправкой вопроса.
            </div>
          )}
        </div>

        <div className="mt-6 rounded-3xl border border-slate-200 bg-white px-4 py-4">
          <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
            Предпросмотр
          </div>
          {!activePreviewFile ? (
            <div className="mt-3 text-sm leading-6 text-slate-500">
              Выбери файл справа или перетащи новый в чат, чтобы посмотреть его перед отправкой.
            </div>
          ) : isPreviewLoading ? (
            <div className="mt-3 text-sm leading-6 text-slate-500">Готовлю предпросмотр файла...</div>
          ) : (
            <div className="mt-3 space-y-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
                <div className="text-sm font-semibold text-slate-800">{activePreviewFile.name}</div>
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
                <div className="max-h-[320px] overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-7 text-slate-700 whitespace-pre-wrap">
                  {activePreview.text}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-500">
                  Для этого формата встроенный визуальный предпросмотр ограничен, но файл будет проанализирован после отправки.
                </div>
              )}
            </div>
          )}
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
    </section>
  );
}
