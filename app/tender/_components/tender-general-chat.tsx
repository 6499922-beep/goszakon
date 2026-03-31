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
  initialAttachments: Array<{
    id: number;
    title: string;
    fileName: string;
    documentKind: string;
    extractionNote: string;
    storagePath?: string | null;
    createdAt: string;
  }>;
  userLabel: string;
  threadOptions: Array<{
    id: number;
    title: string;
    messageCount: number;
    updatedAt: string;
    preview: string;
  }>;
};

type SelectedFilePreview = {
  attachmentId?: number;
  fileName: string;
  fileType: string;
  documentKind?: string;
  extracted?: boolean;
  statusLabel?: string;
  note: string;
  text: string;
};

type PreparedArchiveAttachment = {
  attachmentId: number;
  fileName: string;
  documentKind?: string;
  extracted?: boolean;
  statusLabel?: string;
  note: string;
  text: string;
};

const ARCHIVE_FILE_PATTERN = /\.(zip|rar|7z)$/i;
const PENDING_ASSISTANT_BODY = "__GENERAL_CHAT_PENDING__";

function formatThreadMeta(updatedAt: string, messageCount: number) {
  const date = new Date(updatedAt);
  const timeLabel = Number.isNaN(date.getTime())
    ? ""
    : date.toLocaleDateString("ru-RU", {
        day: "2-digit",
        month: "2-digit",
      });

  if (messageCount <= 0) {
    return timeLabel ? `${timeLabel} · пусто` : "Пустой чат";
  }

  return timeLabel ? `${messageCount} сообщ. · ${timeLabel}` : `${messageCount} сообщений`;
}

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

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function assistantMarkdownToWordHtml(text: string) {
  const lines = text.split("\n");
  const htmlParts: string[] = [];
  let paragraphLines: string[] = [];
  let listItems: string[] = [];

  const formatInline = (input: string) => {
    const escaped = escapeHtml(input);
    return escaped
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(
        /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
        '<a href="$2">$1</a>'
      );
  };

  const flushParagraph = () => {
    if (paragraphLines.length === 0) return;
    const paragraphText = paragraphLines.join(" ").trim();
    if (paragraphText) {
      htmlParts.push(`<p>${formatInline(paragraphText)}</p>`);
    }
    paragraphLines = [];
  };

  const flushList = () => {
    if (listItems.length === 0) return;
    htmlParts.push(
      `<ul>${listItems.map((item) => `<li>${formatInline(item)}</li>`).join("")}</ul>`
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
      const level = Math.min(4, line.match(/^#+/)?.[0].length ?? 1);
      const content = line.replace(/^#{1,4}\s+/, "");
      const tag = level === 1 ? "h1" : level === 2 ? "h2" : level === 3 ? "h3" : "h4";
      htmlParts.push(`<${tag}>${formatInline(content)}</${tag}>`);
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

  return htmlParts.join("");
}

function downloadAssistantMessageAsWord(title: string, body: string) {
  const safeTitle =
    title
      .replace(/[^\p{L}\p{N}\s._-]+/gu, "")
      .replace(/\s+/g, "-")
      .slice(0, 80) || "gpt-answer";
  const html = `<!DOCTYPE html>
<html lang="ru">
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(title)}</title>
    <style>
      body { font-family: Arial, sans-serif; font-size: 12pt; line-height: 1.55; color: #111827; }
      h1, h2, h3, h4 { color: #0f172a; margin: 18px 0 8px; }
      p { margin: 10px 0; }
      ul { margin: 10px 0 10px 22px; }
      li { margin: 6px 0; }
      .meta { color: #64748b; font-size: 10pt; margin-bottom: 18px; }
      a { color: #0d5bd7; text-decoration: underline; }
    </style>
  </head>
  <body>
    <h1>${escapeHtml(title)}</h1>
    <div class="meta">Сформировано в GPT-чате GOSZAKON · ${escapeHtml(
      new Date().toLocaleString("ru-RU")
    )}</div>
    ${assistantMarkdownToWordHtml(body)}
  </body>
</html>`;

  const blob = new Blob(["\ufeff", html], {
    type: "application/msword;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${safeTitle}.doc`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export function TenderGeneralChat({
  threadId,
  currentThreadId,
  threadTitle,
  initialMessages,
  initialAttachments,
  userLabel,
  threadOptions,
}: TenderGeneralChatProps) {
  const [messages, setMessages] = useState(initialMessages);
  const [storedAttachments, setStoredAttachments] = useState(initialAttachments);
  const [threadList, setThreadList] = useState(threadOptions);
  const [currentTitle, setCurrentTitle] = useState(threadTitle);
  const [draft, setDraft] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [preparedArchiveAttachments, setPreparedArchiveAttachments] = useState<
    PreparedArchiveAttachment[]
  >([]);
  const [selectedArchiveAttachmentIds, setSelectedArchiveAttachmentIds] = useState<number[]>([]);
  const [attachedArchiveAttachmentIds, setAttachedArchiveAttachmentIds] = useState<number[]>([]);
  const [activePreviewIndex, setActivePreviewIndex] = useState(0);
  const [previewCache, setPreviewCache] = useState<Record<string, SelectedFilePreview>>({});
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [isArchiveLoading, setIsArchiveLoading] = useState(false);
  const [archiveNotice, setArchiveNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [procurementOnlyMode, setProcurementOnlyMode] = useState(false);
  const [attachedFilesOnlyMode, setAttachedFilesOnlyMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openThreadMenuId, setOpenThreadMenuId] = useState<number | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const archiveInputRef = useRef<HTMLInputElement | null>(null);
  const composerRef = useRef<HTMLFormElement | null>(null);
  const sidebarRef = useRef<HTMLDivElement | null>(null);
  const filesToSendRef = useRef<HTMLDivElement | null>(null);
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
  const hasPendingAssistant = useMemo(
    () =>
      sortedMessages.some(
        (message) =>
          message.role === "assistant" &&
          (message.body === PENDING_ASSISTANT_BODY ||
            message.body === "Получил запрос. Читаю файлы и готовлю ответ...")
      ),
    [sortedMessages]
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
  const visibleThreads = useMemo(() => {
    const currentThread = threadList.find((item) => item.id === currentThreadId) || null;
    const rest = threadList.filter((item) => {
      if (item.id === currentThreadId) return false;
      if (item.messageCount > 0) return true;
      return item.title.trim() !== "Новый чат";
    });

    return currentThread ? [currentThread, ...rest] : rest;
  }, [threadList, currentThreadId]);
  const combinedAttachmentIds = useMemo(() => {
    const fileAttachmentIds = selectedFiles
      .map((file) => {
        const key = `${file.name}:${file.size}:${file.lastModified}`;
        return previewCache[key]?.attachmentId ?? null;
      })
      .filter((value): value is number => value !== null && Number.isInteger(value) && value > 0);

    return [...new Set([...fileAttachmentIds, ...attachedArchiveAttachmentIds])];
  }, [attachedArchiveAttachmentIds, previewCache, selectedFiles]);
  const attachedArchiveAttachments = useMemo(
    () =>
      preparedArchiveAttachments.filter((item) =>
        attachedArchiveAttachmentIds.includes(item.attachmentId)
      ),
    [attachedArchiveAttachmentIds, preparedArchiveAttachments]
  );
  useEffect(() => {
    setThreadList(threadOptions);
  }, [threadOptions]);

  useEffect(() => {
    setCurrentTitle(threadTitle);
  }, [threadTitle]);

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
    function handleClickOutside(event: MouseEvent) {
      if (!sidebarRef.current) return;
      if (sidebarRef.current.contains(event.target as Node)) return;
      setOpenThreadMenuId(null);
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [sortedMessages, isSubmitting]);

  useEffect(() => {
    if (!hasPendingAssistant) return;

    let cancelled = false;
    const timer = window.setInterval(async () => {
      try {
        const response = await fetch(`/api/tender/general-chat?threadId=${threadId}`, {
          method: "GET",
          cache: "no-store",
        });
        const payload = (await response.json().catch(() => null)) as
          | {
              ok?: boolean;
              thread?: { id: number; title: string };
              messages?: GeneralChatMessage[];
              attachments?: TenderGeneralChatProps["initialAttachments"];
            }
          | null;

        if (!response.ok || !payload?.ok || !payload.messages || cancelled) {
          return;
        }

        setMessages(payload.messages);
        if (payload.thread?.title) {
          setCurrentTitle(payload.thread.title);
          setThreadList((current) =>
            current.map((item) =>
              item.id === threadId ? { ...item, title: payload.thread!.title } : item
            )
          );
        }
        if (payload.attachments) {
          setStoredAttachments(payload.attachments);
        }
      } catch {
        // keep polling quietly
      }
    }, 2500);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [hasPendingAssistant, threadId]);

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
        formData.set("threadId", String(threadId));

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

  function removePreparedArchiveAttachment(attachmentId: number) {
    setPreparedArchiveAttachments((current) =>
      current.filter((item) => item.attachmentId !== attachmentId)
    );
    setSelectedArchiveAttachmentIds((current) =>
      current.filter((item) => item !== attachmentId)
    );
    setAttachedArchiveAttachmentIds((current) =>
      current.filter((item) => item !== attachmentId)
    );
  }

  function toggleArchiveCandidate(attachmentId: number) {
    setSelectedArchiveAttachmentIds((current) =>
      current.includes(attachmentId)
        ? current.filter((item) => item !== attachmentId)
        : [...current, attachmentId]
    );
  }

  function addSelectedArchiveAttachmentsToChat() {
    if (selectedArchiveAttachmentIds.length === 0) return;

    setAttachedArchiveAttachmentIds((current) => {
      const next = [...current, ...selectedArchiveAttachmentIds];
      return [...new Set(next)];
    });
    setArchiveNotice(
      `Добавлено в чат: ${selectedArchiveAttachmentIds.length} файл${selectedArchiveAttachmentIds.length === 1 ? "" : selectedArchiveAttachmentIds.length < 5 ? "а" : "ов"}.`
    );
    setSelectedArchiveAttachmentIds([]);
    requestAnimationFrame(() => {
      filesToSendRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  }

  function addAllArchiveAttachmentsToChat() {
    const ids = preparedArchiveAttachments.map((item) => item.attachmentId);
    if (ids.length === 0) return;

    setAttachedArchiveAttachmentIds(ids);
    setArchiveNotice(`Добавлены в чат все файлы из архива: ${ids.length}.`);
    setSelectedArchiveAttachmentIds([]);
    requestAnimationFrame(() => {
      filesToSendRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  }

  function removeArchiveAttachmentFromChat(attachmentId: number) {
    setAttachedArchiveAttachmentIds((current) =>
      current.filter((item) => item !== attachmentId)
    );
    setArchiveNotice("Файл убран из отправки в чат.");
  }

  async function handleArchiveUpload(files: FileList | null) {
    const archive = files?.[0];
    if (!archive) return;

    setError(null);
    setArchiveNotice(null);
    setIsArchiveLoading(true);

    try {
      const formData = new FormData();
      formData.set("archive", archive);
      formData.set("threadId", String(threadId));

      const response = await fetch("/api/tender/general-chat/archive-preview", {
        method: "POST",
        body: formData,
      });

      const payload = (await response.json().catch(() => null)) as
        | {
            ok?: boolean;
            error?: string;
            attachments?: PreparedArchiveAttachment[];
          }
        | null;

      if (!response.ok || !payload?.ok || !payload.attachments) {
        throw new Error(payload?.error || "Не удалось распаковать архив.");
      }

      setPreparedArchiveAttachments((current) => {
        const next = [...current, ...payload.attachments!];
        const seen = new Set<number>();
        return next.filter((item) => {
          if (seen.has(item.attachmentId)) return false;
          seen.add(item.attachmentId);
          return true;
        });
      });
      setSelectedArchiveAttachmentIds((current) => {
        const next = [...current, ...payload.attachments!.map((item) => item.attachmentId)];
        return [...new Set(next)];
      });
      setArchiveNotice(
        `Архив распакован. Найдено файлов: ${payload.attachments.length}. Отметь нужные и нажми «Добавить выбранное».`
      );
    } catch (archiveError) {
      setError(
        archiveError instanceof Error ? archiveError.message : "Не удалось распаковать архив."
      );
    } finally {
      setIsArchiveLoading(false);
      if (archiveInputRef.current) {
        archiveInputRef.current.value = "";
      }
    }
  }

  async function renameThread(targetThreadId: number, currentValue: string) {
    const nextTitle = window.prompt("Новое название чата", currentValue)?.trim();
    if (!nextTitle || nextTitle === currentValue) return;

    try {
      const response = await fetch("/api/tender/general-chat", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          threadId: targetThreadId,
          title: nextTitle,
        }),
      });

      const payload = (await response.json().catch(() => null)) as
        | { ok?: boolean; error?: string; thread?: { id: number; title: string } }
        | null;

      if (!response.ok || !payload?.ok || !payload.thread) {
        throw new Error(payload?.error || "Не удалось переименовать чат.");
      }

      setThreadList((current) =>
        current.map((item) =>
          item.id === payload.thread!.id ? { ...item, title: payload.thread!.title } : item
        )
      );
      setOpenThreadMenuId(null);

      if (targetThreadId === currentThreadId) {
        setCurrentTitle(payload.thread.title);
      }
    } catch (renameError) {
      setError(
        renameError instanceof Error ? renameError.message : "Не удалось переименовать чат."
      );
    }
  }

  async function deleteThread(targetThreadId: number) {
    const confirmed = window.confirm("Удалить этот чат целиком?");
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/tender/general-chat?threadId=${targetThreadId}`, {
        method: "DELETE",
      });
      const payload = (await response.json().catch(() => null)) as
        | { ok?: boolean; error?: string; fallbackThreadId?: number }
        | null;

      if (!response.ok || !payload?.ok || !payload.fallbackThreadId) {
        throw new Error(payload?.error || "Не удалось удалить чат.");
      }

      setOpenThreadMenuId(null);
      window.location.assign(`/tender/chat?thread=${payload.fallbackThreadId}`);
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Не удалось удалить чат.");
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const question = draft.trim();
    const hasFiles = selectedFiles.length > 0 || attachedArchiveAttachmentIds.length > 0;
    const filesToUpload = [...selectedFiles];
    const archiveAttachmentsToSend = [...attachedArchiveAttachmentIds];
    const attachmentIds = combinedAttachmentIds;

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
    setAttachedArchiveAttachmentIds([]);
    setSelectedArchiveAttachmentIds([]);
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

      if (filesToUpload.length > 0 && attachmentIds.length < filesToUpload.length) {
        throw new Error(
          "Не все файлы успели сохраниться на сервере. Подождите пару секунд и отправьте запрос ещё раз."
        );
      }

      const response = await fetch("/api/tender/general-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          threadId,
          message: question,
          useWebSearch: !procurementOnlyMode,
          attachedFilesOnly: attachedFilesOnlyMode,
          attachmentIds,
        }),
      });

      const payload = (await response.json().catch(() => null)) as
        | {
            ok?: boolean;
            error?: string;
            userMessage?: GeneralChatMessage;
            assistantMessage?: GeneralChatMessage;
            attachments?: Array<{
              id: number;
              title: string;
              fileName: string;
              documentKind: string;
              extractionNote: string;
              storagePath?: string | null;
              createdAt: string;
            }>;
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
      if (payload.attachments?.length) {
        setStoredAttachments((current) => {
          const next = [...payload.attachments!, ...current];
          const seen = new Set<number>();
          return next.filter((item) => {
            if (seen.has(item.id)) return false;
            seen.add(item.id);
            return true;
          });
        });
      }
    } catch (submitError) {
      setMessages((current) =>
        current.filter(
          (item) =>
            item.id !== optimisticUserMessage.id && item.id !== optimisticAssistantMessage.id
        )
      );
      setDraft(question);
      setSelectedFiles(filesToUpload);
      setAttachedArchiveAttachmentIds(archiveAttachmentsToSend);
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
    <section className="grid gap-3 xl:h-[calc(100vh-7.5rem)] xl:grid-cols-[250px_minmax(0,1fr)_280px] xl:overflow-hidden">
      <aside
        ref={sidebarRef}
        className="hidden xl:flex xl:h-full xl:flex-col xl:overflow-hidden xl:rounded-[1.5rem] xl:bg-[#f3f4f6] xl:px-2 xl:py-2"
      >
        <div className="px-3 py-3">
          <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
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

        <div className="min-h-0 flex-1 overflow-y-auto px-1 py-2">
          <div className="space-y-1">
            {visibleThreads.length > 0 ? (
              visibleThreads.map((thread) => (
                <div
                  key={thread.id}
                  className={`group relative rounded-xl transition ${
                    thread.id === currentThreadId ? "bg-white shadow-sm" : "hover:bg-white/70"
                  }`}
                >
                  <div className="flex items-start gap-2 px-3 py-3">
                    <button
                      type="button"
                      onClick={() => window.location.assign(`/tender/chat?thread=${thread.id}`)}
                      className="min-w-0 flex-1 text-left"
                    >
                      <div className="line-clamp-2 text-[13px] font-medium leading-5 text-[#111827]">
                        {thread.title}
                      </div>
                      <div className="mt-1 line-clamp-1 text-[11px] leading-4 text-slate-500">
                        {thread.preview
                          ? thread.preview
                              .replace(/\s+/g, " ")
                              .replace(/^Файлы:\s*/i, "")
                              .slice(0, 70)
                          : "Без сообщений"}
                      </div>
                      <div className="mt-1 text-[11px] text-slate-400">
                        {formatThreadMeta(thread.updatedAt, thread.messageCount)}
                      </div>
                    </button>
                    <div className="relative shrink-0">
                      <button
                        type="button"
                        onClick={() =>
                          setOpenThreadMenuId((current) =>
                            current === thread.id ? null : thread.id
                          )
                        }
                        className={`flex h-8 w-8 items-center justify-center rounded-full text-base transition ${
                          openThreadMenuId === thread.id || thread.id === currentThreadId
                            ? "bg-slate-100 text-slate-700"
                            : "text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                        }`}
                        aria-label="Действия с чатом"
                      >
                        …
                      </button>
                      {openThreadMenuId === thread.id ? (
                        <div className="absolute right-0 top-9 z-20 min-w-[170px] rounded-2xl border border-slate-200 bg-white p-2 shadow-lg">
                          <button
                            type="button"
                            onClick={() => renameThread(thread.id, thread.title)}
                            className="w-full rounded-xl px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-50"
                          >
                            Переименовать
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteThread(thread.id)}
                            className="mt-1 w-full rounded-xl px-3 py-2 text-left text-sm text-rose-700 transition hover:bg-rose-50"
                          >
                            Удалить
                          </button>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl px-3 py-3 text-sm text-slate-500">
                Чаты появятся после первых сообщений.
              </div>
            )}
          </div>
        </div>

        <div className="px-3 py-3">
          <div className="mt-2 rounded-2xl bg-white px-4 py-3 shadow-sm">
            <div className="text-sm font-semibold text-[#111827]">{userLabel}</div>
          </div>
        </div>
      </aside>

      <div className="flex min-h-[84vh] flex-col rounded-[1.5rem] bg-white xl:min-h-0 xl:h-full xl:overflow-hidden">
        <div className="px-8 py-4">
          <div className="mx-auto flex w-full max-w-4xl items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="text-[15px] font-semibold text-[#111827]">{currentTitle}</div>
            </div>
          </div>
        </div>

        <div ref={viewportRef} className="flex-1 overflow-y-auto px-8 py-8 xl:min-h-0">
          {sortedMessages.length > 0 ? (
            <div className="mx-auto flex w-full max-w-4xl flex-col gap-10">
              {sortedMessages.map((message) => {
                const parsed = parseStoredSources(message.body);
                const isAssistant = message.role === "assistant";
                const isPendingAssistantMessage =
                  isAssistant &&
                  (message.body === PENDING_ASSISTANT_BODY ||
                    message.body === "Получил запрос. Читаю файлы и готовлю ответ...");
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
                        {isPendingAssistantMessage ? (
                          <div className="mt-4 flex items-center gap-3 text-[16px] text-slate-600">
                            <span className="inline-block h-2.5 w-2.5 animate-pulse rounded-full bg-[#0d5bd7]" />
                            Готовлю ответ...
                          </div>
                        ) : (
                          <div className="mt-4 text-[16px] leading-8">{renderAssistantMarkdown(parsed.text)}</div>
                        )}
                        {!isPendingAssistantMessage && parsed.text.trim() ? (
                          <div className="mt-5 flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => downloadAssistantMessageAsWord(threadTitle, parsed.text)}
                              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-[#0d5bd7] hover:text-[#0d5bd7]"
                            >
                              Скачать в Word
                            </button>
                          </div>
                        ) : null}
                        {!isPendingAssistantMessage && parsed.sources.length > 0 ? (
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
          <input
            ref={archiveInputRef}
            type="file"
            accept=".zip,.rar"
            className="sr-only"
            onChange={(event) => {
              void handleArchiveUpload(event.target.files);
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

          {selectedFiles.length > 0 || attachedArchiveAttachments.length > 0 ? (
            <div className="mx-auto mt-4 flex w-full max-w-4xl flex-wrap gap-2">
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
            </div>
          ) : null}
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
            Архив
          </div>
          <button
            type="button"
            onClick={() => archiveInputRef.current?.click()}
            disabled={isArchiveLoading}
            className="mt-3 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-medium text-slate-700 transition hover:border-[#0d5bd7] hover:text-[#0d5bd7] disabled:opacity-50"
          >
            {isArchiveLoading ? "Распаковываю архив..." : "Загрузить ZIP / RAR"}
          </button>
          <div className="mt-2 text-xs leading-5 text-slate-500">
            Архив раскладывается на конечные документы. Ты сам отмечаешь, что добавить в чат.
          </div>
          {archiveNotice ? (
            <div className="mt-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-3 text-xs font-medium leading-5 text-emerald-800">
              {archiveNotice}
            </div>
          ) : null}
          {preparedArchiveAttachments.length > 0 ? (
            <div className="mt-3 space-y-2">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={addSelectedArchiveAttachmentsToChat}
                  disabled={selectedArchiveAttachmentIds.length === 0}
                  className="rounded-full bg-[#0d5bd7] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#0b4db7] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Добавить выбранное
                </button>
                <button
                  type="button"
                  onClick={addAllArchiveAttachmentsToChat}
                  disabled={preparedArchiveAttachments.length === 0}
                  className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-[#0d5bd7] hover:text-[#0d5bd7] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Добавить всё
                </button>
              </div>
              {attachedArchiveAttachments.length > 0 ? (
                <div className="rounded-2xl border border-[#cfe0ff] bg-[#eef4ff] px-3 py-3">
                  <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[#0d5bd7]">
                    Уже пойдут в чат
                  </div>
                  <div className="mt-2 text-xs leading-5 text-slate-600">
                    Эти файлы уже добавлены в отправку. После нажатия `Отправить` вопрос уйдёт вместе с ними.
                  </div>
                  <div className="mt-3 space-y-2">
                    {attachedArchiveAttachments.slice(0, 5).map((item) => (
                      <div
                        key={`archive-attached-${item.attachmentId}`}
                        className="flex items-center justify-between gap-2 rounded-xl bg-white px-3 py-2"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-medium text-slate-700">
                            {item.fileName}
                          </div>
                          <div className="text-xs text-[#0d5bd7]">
                            Добавлен в чат
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeArchiveAttachmentFromChat(item.attachmentId)}
                          className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500 transition hover:bg-rose-50 hover:text-rose-700"
                        >
                          Убрать
                        </button>
                      </div>
                    ))}
                    {attachedArchiveAttachments.length > 5 ? (
                      <div className="text-xs text-slate-500">
                        И ещё: {attachedArchiveAttachments.length - 5}
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : null}
              {preparedArchiveAttachments.slice(0, 6).map((item) => (
                <div key={item.attachmentId} className="rounded-2xl bg-white px-3 py-3">
                  <label className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={selectedArchiveAttachmentIds.includes(item.attachmentId)}
                      onChange={() => toggleArchiveCandidate(item.attachmentId)}
                      className="mt-1 h-4 w-4 rounded border-slate-300 text-[#0d5bd7] focus:ring-[#0d5bd7]"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium text-slate-700">
                        {item.fileName}
                      </div>
                      <div className="mt-1 text-xs text-slate-500">
                        {item.documentKind || "Документ"}
                      </div>
                      <div className="mt-1 text-xs text-emerald-700">
                        {item.statusLabel || "Готов к добавлению"}
                      </div>
                      {attachedArchiveAttachmentIds.includes(item.attachmentId) ? (
                        <div className="mt-1 text-xs font-semibold text-[#0d5bd7]">
                          Уже добавлен в чат
                        </div>
                      ) : null}
                    </div>
                  </label>
                  <button
                    type="button"
                    onClick={() => removePreparedArchiveAttachment(item.attachmentId)}
                    className="mt-2 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500 transition hover:bg-rose-50 hover:text-rose-700"
                  >
                    Удалить из списка
                  </button>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <div className="mt-4 rounded-[1.5rem] bg-[#fafbfc] px-4 py-4">
          <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
            Файлы ветки
          </div>
          {storedAttachments.length > 0 ? (
            <div className="mt-3 space-y-2">
              {storedAttachments.slice(0, 8).map((item) => (
                <a
                  key={item.id}
                  href={`/tender/chat/attachments/${item.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="block rounded-2xl bg-white px-3 py-3 transition hover:ring-1 hover:ring-[#0d5bd7]"
                >
                  <div className="truncate text-sm font-medium text-slate-700">{item.title}</div>
                  <div className="mt-1 text-xs text-slate-500">{item.documentKind}</div>
                  <div className="mt-1 text-xs text-[#0d5bd7]">Открыть файл</div>
                </a>
              ))}
            </div>
          ) : (
            <div className="mt-3 text-sm leading-6 text-slate-500">Пока нет сохранённых файлов.</div>
          )}
        </div>

        <div className="mt-4 rounded-[1.5rem] bg-[#fafbfc] px-4 py-4">
          <div ref={filesToSendRef} />
          <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
            Файлы к отправке
          </div>
          <div className="mt-1 text-xs text-slate-500">
            Сейчас в чат пойдут: {selectedFiles.length + attachedArchiveAttachments.length}
          </div>
          {selectedFiles.length > 0 || attachedArchiveAttachments.length > 0 ? (
            <div className="mt-3 space-y-2">
              {attachedArchiveAttachments.map((item) => (
                <div
                  key={`prepared-${item.attachmentId}`}
                  className="flex items-center justify-between gap-3 rounded-2xl bg-white px-3 py-2"
                >
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-slate-700">{item.fileName}</div>
                    <div className="text-xs text-emerald-700">{item.statusLabel || "Готов к отправке"}</div>
                    <div className="text-xs text-slate-400">{item.documentKind || "Документ"}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeArchiveAttachmentFromChat(item.attachmentId)}
                    className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500 transition hover:bg-rose-50 hover:text-rose-700"
                  >
                    Убрать
                  </button>
                </div>
              ))}
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
      </aside>
    </section>
  );
}
