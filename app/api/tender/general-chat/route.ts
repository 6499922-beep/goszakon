import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { TenderChatMessageRole, TenderChatThreadKind } from "@prisma/client";
import { NextResponse } from "next/server";
import { getCurrentTenderUser } from "@/lib/admin-auth";
import { getPrisma } from "@/lib/prisma";
import { tenderHasCapability } from "@/lib/tender-permissions";
import { prepareTenderUploadDocuments } from "@/lib/tender-intake";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const ARCHIVE_FILE_PATTERN = /\.(zip|rar|7z)$/i;
const MAX_HISTORY_MESSAGES = 8;
const MAX_HISTORY_CHARS = 9000;
const MAX_CURRENT_ATTACHMENT_BLOCKS = 12;
const MAX_CURRENT_ATTACHMENT_BLOCK_CHARS = 4200;
const MAX_CURRENT_ATTACHMENT_CONTEXT_CHARS = 30000;
const MAX_RECENT_ATTACHMENT_BLOCKS = 4;
const MAX_RECENT_ATTACHMENT_BLOCK_CHARS = 2400;
const MAX_RECENT_ATTACHMENT_CONTEXT_CHARS = 10000;
const MAX_ATTACHMENT_SUMMARY_CHARS = 1800;
const ATTACHMENT_SUMMARY_CHUNK_CHARS = 12000;
const PENDING_ASSISTANT_BODY = "__GENERAL_CHAT_PENDING__";
const PENDING_ASSISTANT_PREFIX = `${PENDING_ASSISTANT_BODY}\n`;

type PendingAssistantMeta = {
  status: "pending" | "processing";
  userMessageId: number;
  useWebSearch: boolean;
  attachedFilesOnly: boolean;
};

function encodePendingAssistantMeta(meta: PendingAssistantMeta) {
  return `${PENDING_ASSISTANT_PREFIX}${JSON.stringify(meta)}`;
}

function decodePendingAssistantMeta(body: string | null | undefined): PendingAssistantMeta | null {
  const normalized = String(body ?? "").trim();
  if (!normalized.startsWith(PENDING_ASSISTANT_PREFIX)) return null;

  const raw = normalized.slice(PENDING_ASSISTANT_PREFIX.length).trim();
  if (!raw.startsWith("{")) return null;

  try {
    const parsed = JSON.parse(raw) as PendingAssistantMeta;
    if (!parsed || typeof parsed !== "object") return null;
    if (!Number.isInteger(parsed.userMessageId) || parsed.userMessageId <= 0) return null;
    if (parsed.status !== "pending" && parsed.status !== "processing") return null;
    return {
      status: parsed.status,
      userMessageId: parsed.userMessageId,
      useWebSearch: Boolean(parsed.useWebSearch),
      attachedFilesOnly: Boolean(parsed.attachedFilesOnly),
    };
  } catch {
    return null;
  }
}

function getOpenAiOutputText(payload: any) {
  const outputs = Array.isArray(payload?.output) ? payload.output : [];

  for (const item of outputs) {
    if (!Array.isArray(item?.content)) continue;
    for (const content of item.content) {
      if (content?.type === "output_text" && typeof content?.text === "string") {
        return content.text.trim();
      }
    }
  }

  return "";
}

function getOpenAiWebSources(payload: any) {
  const unique = new Map<string, { title: string; url: string }>();
  const outputs = Array.isArray(payload?.output) ? payload.output : [];

  for (const item of outputs) {
    const actionSources = Array.isArray(item?.action?.sources) ? item.action.sources : [];
    for (const source of actionSources) {
      const url = typeof source?.url === "string" ? source.url.trim() : "";
      if (!url) continue;
      const title =
        (typeof source?.title === "string" && source.title.trim()) ||
        (typeof source?.site_name === "string" && source.site_name.trim()) ||
        url;
      if (!unique.has(url)) unique.set(url, { title, url });
    }

    if (!Array.isArray(item?.content)) continue;
    for (const content of item.content) {
      const annotations = Array.isArray(content?.annotations) ? content.annotations : [];
      for (const annotation of annotations) {
        const url = typeof annotation?.url === "string" ? annotation.url.trim() : "";
        if (!url) continue;
        const title =
          (typeof annotation?.title === "string" && annotation.title.trim()) ||
          (typeof annotation?.text === "string" && annotation.text.trim()) ||
          url;
        if (!unique.has(url)) unique.set(url, { title, url });
      }
    }
  }

  return [...unique.values()].slice(0, 10);
}

async function requestOpenAiResponse({
  apiKey,
  model,
  prompt,
  inputFiles = [],
  useWebSearch,
  reasoningEffort = "medium",
  timeoutMs = 45000,
}: {
  apiKey: string;
  model: string;
  prompt: string;
  inputFiles?: Array<{ fileId: string }>;
  useWebSearch?: boolean;
  reasoningEffort?: "low" | "medium" | "high";
  timeoutMs?: number;
}) {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    let response: Response;
    try {
      response = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          reasoning: {
            effort: reasoningEffort,
          },
          ...(useWebSearch
            ? {
                tools: [{ type: "web_search" }],
              }
            : {}),
          input: [
            {
              role: "user",
              content: [
                { type: "input_text", text: prompt },
                ...inputFiles.map((item) => ({
                  type: "input_file",
                  file_id: item.fileId,
                })),
              ],
            },
          ],
        }),
        signal: controller.signal,
      });
    } catch (error) {
      clearTimeout(timeout);
      const isAbort = error instanceof Error && error.name === "AbortError";
      if (attempt === 2) {
        throw new Error(isAbort ? "OpenAI API timeout" : "OpenAI API request failed");
      }
      await new Promise((resolve) => setTimeout(resolve, 600 * (attempt + 1)));
      continue;
    }
    clearTimeout(timeout);

    if (response.ok) {
      return response.json();
    }

    const errorText = await response.text();
    if (response.status === 429 && /Request too large|tokens per min|TPM/i.test(errorText)) {
      throw new Error(
        "Запрос получился слишком большим для модели. Попробуйте повторить вопрос короче или прикрепить меньше файлов за один раз."
      );
    }

    const isRetryable =
      response.status === 429 ||
      response.status === 500 ||
      response.status === 502 ||
      response.status === 503 ||
      response.status === 504;

    if (!isRetryable || attempt === 2) {
      throw new Error(`OpenAI API error: ${response.status} ${errorText.slice(0, 500)}`);
    }

    await new Promise((resolve) => setTimeout(resolve, 600 * (attempt + 1)));
  }
  throw new Error("Не удалось получить ответ GPT после повторных попыток.");
}

async function buildAttachmentSummary({
  apiKey,
  model,
  title,
  documentKind,
  extractionNote,
  extractedText,
}: {
  apiKey: string;
  model: string;
  title: string;
  documentKind: string | null;
  extractionNote: string | null;
  extractedText: string | null;
}) {
  const text = extractedText?.trim();

  if (!text) {
    return extractionNote?.trim() || "Текст автоматически не извлечён.";
  }

  const textChunks = chunkTextForSummary(text, ATTACHMENT_SUMMARY_CHUNK_CHARS);

  const chunkSummaries: string[] = [];
  for (let index = 0; index < textChunks.length; index += 1) {
    const chunk = textChunks[index];
    const prompt = `
Ты готовишь серверную память по одному вложению рабочего чата GOSZAKON.
Перед тобой часть документа. Нужно извлечь из этого фрагмента только полезные факты, цифры, сроки, условия, риски и важные формулировки.

Правила:
- не пересказывай воду;
- не пиши вводных фраз;
- не придумывай отсутствующее;
- пиши по-русски;
- если фрагмент служебный, коротко так и отметь.

Название файла: ${title}
Тип документа: ${documentKind || "Документ"}
Статус чтения: ${extractionNote || "Текст извлечён"}
Часть: ${index + 1} из ${textChunks.length}

Фрагмент документа:
${chunk}
    `.trim();

    try {
      const payload = await requestOpenAiResponse({
        apiKey,
        model,
        prompt,
        useWebSearch: false,
        reasoningEffort: "low",
        timeoutMs: 25000,
      });
      const summary = getOpenAiOutputText(payload).trim();
      chunkSummaries.push(summary || chunk);
    } catch {
      chunkSummaries.push(chunk);
    }
  }

  const combinePrompt = `
Ты готовишь серверную память по одному вложению рабочего чата GOSZAKON.
Ниже даны выжимки по всем частям одного документа. Нужно собрать из них одну полную полезную сводку по всему файлу.

Требования:
- опирайся на все части документа, а не только на начало;
- сохрани ключевые цифры, сроки, условия, риски, обязанности, санкции и выводы;
- если это договор, обязательно сохрани: стороны, предмет, сроки, оплату, ответственность, неустойку, расторжение;
- если это претензия, сохрани: факты, даты, ссылки на пункты, требования, сроки, приложенные доказательства;
- если это ТЗ или документация, сохрани: предмет, требования, объёмы, сроки, ограничения;
- формат ответа:
  1. Что это за документ
  2. Главные факты
  3. Ключевые цифры и сроки
  4. Риски / что важно проверить
- по-русски
- без воды

Название файла: ${title}
Тип документа: ${documentKind || "Документ"}
Статус чтения: ${extractionNote || "Текст извлечён"}

Выжимки по всем частям файла:
${chunkSummaries.map((item, index) => `Часть ${index + 1}:\n${item}`).join("\n\n---\n\n")}
  `.trim();

  try {
    const payload = await requestOpenAiResponse({
      apiKey,
      model,
      prompt: combinePrompt,
      useWebSearch: false,
      reasoningEffort: "low",
      timeoutMs: 30000,
    });
    return getOpenAiOutputText(payload) || trimForPrompt(text, MAX_ATTACHMENT_SUMMARY_CHARS);
  } catch {
    return trimForPrompt(text, MAX_ATTACHMENT_SUMMARY_CHARS);
  }
}

async function ensureAttachmentSummaries({
  prisma,
  apiKey,
  model,
  attachments,
}: {
  prisma: ReturnType<typeof getPrisma>;
  apiKey: string;
  model: string;
  attachments: Array<{
    id: number;
    messageId?: number | null;
    title: string;
    fileName: string;
    mimeType: string | null;
    fileSize: number | null;
    storagePath: string | null;
    documentKind: string | null;
    extractionNote: string | null;
    extractedText: string | null;
    summaryText: string | null;
  }>;
}) {
  const attachmentsToSummarize = attachments.filter((attachment) => !attachment.summaryText?.trim());
  const updates = await Promise.all(
    attachmentsToSummarize.map(async (attachment) => {
      const summaryText = await buildAttachmentSummary({
        apiKey,
        model,
        title: attachment.title,
        documentKind: attachment.documentKind,
        extractionNote: attachment.extractionNote,
        extractedText: attachment.extractedText,
      });
      return { id: attachment.id, summaryText };
    })
  );

  if (updates.length > 0) {
    await Promise.all(
      updates.map((item) =>
        prisma.tenderChatAttachment.update({
          where: { id: item.id },
          data: { summaryText: item.summaryText },
        })
      )
    );
  }

  return attachments.map((attachment) => {
    const updated = updates.find((item) => item.id === attachment.id);
    return {
      ...attachment,
      summaryText: updated?.summaryText || attachment.summaryText,
    };
  });
}

async function ensureAttachmentExtraction({
  prisma,
  attachments,
}: {
  prisma: ReturnType<typeof getPrisma>;
  attachments: Array<{
    id: number;
    messageId?: number | null;
    title: string;
    fileName: string;
    mimeType: string | null;
    fileSize: number | null;
    storagePath: string | null;
    documentKind: string | null;
    extractionNote: string | null;
    extractedText: string | null;
    summaryText: string | null;
  }>;
}): Promise<
  Array<{
    id: number;
    messageId?: number | null;
    title: string;
    fileName: string;
    mimeType: string | null;
    fileSize: number | null;
    storagePath: string | null;
    documentKind: string | null;
    extractionNote: string | null;
    extractedText: string | null;
    summaryText: string | null;
  }>
> {
  const updates: Array<{
    id: number;
    title: string;
    documentKind: string | null;
    extractionNote: string | null;
    extractedText: string | null;
    summaryText?: string | null;
  }> = [];

  for (const attachment of attachments) {
    if (attachment.extractedText?.trim() || !attachment.storagePath) continue;

    try {
      const absoluteStoragePath = path.join(
        process.cwd(),
        "public",
        attachment.storagePath.replace(/^\/+/, "")
      );
      const buffer = await readFile(absoluteStoragePath);
      const preparedDocuments = await prepareTenderUploadDocuments({
        name: attachment.fileName || attachment.title,
        type: attachment.mimeType || "application/octet-stream",
        size: attachment.fileSize || buffer.byteLength,
        buffer,
      });

      const mergedText = preparedDocuments
        .map((item) => item.extractedText?.trim())
        .filter((item): item is string => Boolean(item))
        .join("\n\n---\n\n")
        .trim();

      const firstPrepared = preparedDocuments[0];
      updates.push({
        id: attachment.id,
        title: firstPrepared?.title || attachment.title,
        documentKind: firstPrepared?.documentKind || attachment.documentKind,
        extractionNote:
          firstPrepared?.extractionNote ||
          attachment.extractionNote ||
          "Файл прочитан в фоне.",
        extractedText: mergedText || null,
        summaryText: null,
      });
    } catch (error) {
      console.error("[general-chat] attachment extraction failed", attachment.id, error);
      updates.push({
        id: attachment.id,
        title: attachment.title,
        documentKind: attachment.documentKind,
        extractionNote: "Файл не удалось прочитать автоматически.",
        extractedText: null,
        summaryText: null,
      });
    }
  }

  if (updates.length > 0) {
    await Promise.all(
      updates.map((item) =>
        prisma.tenderChatAttachment.update({
          where: { id: item.id },
          data: {
            title: item.title,
            documentKind: item.documentKind,
            extractionNote: item.extractionNote,
            extractedText: item.extractedText,
            summaryText: item.summaryText ?? null,
          },
        })
      )
    );
  }

  return attachments.map((attachment) => {
    const updated = updates.find((item) => item.id === attachment.id);
    return updated
      ? {
          ...attachment,
          title: updated.title,
          documentKind: updated.documentKind,
          extractionNote: updated.extractionNote,
          extractedText: updated.extractedText,
          summaryText: updated.summaryText ?? null,
        }
      : attachment;
  });
}

function trimForPrompt(value: string | null | undefined, limit: number) {
  return String(value ?? "").replace(/\s+/g, " ").trim().slice(0, limit);
}

function chunkTextForSummary(value: string, chunkSize: number) {
  const normalized = String(value || "").trim();
  if (!normalized) return [];

  const chunks: string[] = [];
  let start = 0;

  while (start < normalized.length) {
    const end = Math.min(start + chunkSize, normalized.length);
    chunks.push(normalized.slice(start, end).trim());
    start = end;
  }

  return chunks.filter(Boolean);
}

function squeezeItemsToBudget(items: string[], maxChars: number) {
  const accepted: string[] = [];
  let total = 0;

  for (const item of items) {
    if (!item) continue;
    const next = item.length;
    if (accepted.length > 0 && total + next > maxChars) break;
    if (accepted.length === 0 && next > maxChars) {
      accepted.push(item.slice(0, maxChars));
      break;
    }
    accepted.push(item);
    total += next;
  }

  return accepted;
}

function sanitizeAttachmentFileName(fileName: string) {
  return fileName
    .replace(/[^\p{L}\p{N}._-]+/gu, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 120);
}

async function getOrCreateThread(userId: number) {
  const prisma = getPrisma();
  const existing = await prisma.tenderChatThread.findFirst({
    where: {
      ownerId: userId,
      kind: TenderChatThreadKind.GENERAL,
    },
    orderBy: { updatedAt: "asc" },
  });

  if (existing) return existing;

  return prisma.tenderChatThread.create({
    data: {
      ownerId: userId,
      title: "Личный чат",
      kind: TenderChatThreadKind.GENERAL,
    },
  });
}

async function getOrCreateFallbackThread(userId: number, excludeThreadId?: number) {
  const prisma = getPrisma();
  const existing = await prisma.tenderChatThread.findFirst({
    where: {
      ownerId: userId,
      kind: TenderChatThreadKind.GENERAL,
      ...(excludeThreadId
        ? {
            id: {
              not: excludeThreadId,
            },
          }
        : {}),
    },
    orderBy: { updatedAt: "desc" },
  });

  if (existing) return existing;

  return prisma.tenderChatThread.create({
    data: {
      ownerId: userId,
      title: "Новый чат",
      kind: TenderChatThreadKind.GENERAL,
    },
  });
}

async function updateThreadTitleIfNeeded({
  prisma,
  threadId,
  currentTitle,
  nextTitle,
}: {
  prisma: ReturnType<typeof getPrisma>;
  threadId: number;
  currentTitle: string;
  nextTitle: string;
}) {
  if (currentTitle !== "Личный чат" && currentTitle !== "Новый чат") {
    return;
  }

  const title = trimForPrompt(nextTitle, 80) || "Новый чат";
  await prisma.tenderChatThread.update({
    where: { id: threadId },
    data: { title },
  });
}

async function loadThreadState(threadId: number, userId: number) {
  const prisma = getPrisma();
  const thread = await prisma.tenderChatThread.findFirst({
    where: {
      id: threadId,
      ownerId: userId,
      kind: TenderChatThreadKind.GENERAL,
    },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
        take: 100,
      },
    },
  });

  if (!thread) return null;

  const attachments = await prisma.tenderChatAttachment.findMany({
    where: {
      threadId: thread.id,
      messageId: {
        not: null,
      },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
    select: {
      id: true,
      title: true,
      fileName: true,
      documentKind: true,
      extractionNote: true,
      storagePath: true,
      createdAt: true,
    },
  });

  return {
    thread: {
      id: thread.id,
      title: thread.title,
    },
    messages: thread.messages.map((message) => ({
      id: message.id,
      role: message.role === TenderChatMessageRole.ASSISTANT ? "assistant" : "user",
      authorName: message.authorName || (message.role === TenderChatMessageRole.ASSISTANT ? "GPT" : "Сотрудник"),
      body: message.body,
      createdAt: message.createdAt.toISOString(),
    })),
    attachments: attachments.map((item) => ({
      id: item.id,
      title: item.title,
      fileName: item.fileName,
      documentKind: item.documentKind || "Документ",
      extractionNote: item.extractionNote || "Файл сохранён на сервере",
      storagePath: item.storagePath,
      createdAt: item.createdAt.toISOString(),
    })),
  };
}

async function resolvePendingAssistant({
  prisma,
  threadId,
  assistantMessageId,
  meta,
  apiKey,
  model,
}: {
  prisma: ReturnType<typeof getPrisma>;
  threadId: number;
  assistantMessageId: number;
  meta: PendingAssistantMeta;
  apiKey: string;
  model: string;
}) {
  if (meta.status === "processing") {
    return;
  }

  const lockBody = encodePendingAssistantMeta({ ...meta, status: "processing" });
  const lockResult = await prisma.tenderChatMessage.updateMany({
    where: {
      id: assistantMessageId,
      threadId,
      body: encodePendingAssistantMeta(meta),
    },
    data: {
      body: lockBody,
    },
  });

  if (lockResult.count === 0) {
    return;
  }

  const recentMessages = await prisma.tenderChatMessage.findMany({
    where: { threadId },
    orderBy: { createdAt: "asc" },
    take: 20,
  });
  const userMessage = recentMessages.find((item) => item.id === meta.userMessageId);
  const recentAttachments = await prisma.tenderChatAttachment.findMany({
    where: {
      threadId,
      messageId: {
        not: null,
      },
    },
    orderBy: { createdAt: "desc" },
    take: 12,
    select: {
      id: true,
      title: true,
      fileName: true,
      mimeType: true,
      fileSize: true,
      storagePath: true,
      documentKind: true,
      extractionNote: true,
      extractedText: true,
      summaryText: true,
      messageId: true,
    },
  });

  let preparedAttachments = await ensureAttachmentExtraction({
    prisma,
    attachments: recentAttachments.map((item) => ({
      id: item.id,
      messageId: item.messageId,
      title: item.title,
      fileName: item.fileName,
      mimeType: item.mimeType,
      fileSize: item.fileSize,
      storagePath: item.storagePath,
      documentKind: item.documentKind,
      extractionNote: item.extractionNote,
      extractedText: item.extractedText,
      summaryText: item.summaryText,
    })),
  });

  preparedAttachments = await ensureAttachmentSummaries({
    prisma,
    apiKey,
    model,
    attachments: preparedAttachments,
  });

  const currentAttachments = preparedAttachments.filter((item) => item.messageId === meta.userMessageId);
  const previousAttachments = preparedAttachments
    .filter((item) => item.messageId !== meta.userMessageId)
    .filter((item) => Boolean(item.summaryText || item.extractedText))
    .slice(0, 3);

  const historyItems = recentMessages
    .filter((item) => item.id !== assistantMessageId)
    .slice(-6)
    .map(
      (item) =>
        `${item.authorName || (item.role === TenderChatMessageRole.ASSISTANT ? "GPT" : "Пользователь")}: ${trimForPrompt(item.body, 500)}`
    );

  const currentAttachmentBlocks = squeezeItemsToBudget(
    currentAttachments
      .map((item) =>
        [
          `Файл: ${item.title}`,
          `Тип: ${item.documentKind || "Документ"}`,
          `Статус чтения: ${item.extractionNote || "Файл сохранён на сервере"}`,
          `Полная сводка по файлу: ${
            item.summaryText?.trim() ||
            item.extractedText ||
            "Текст автоматически не извлечён. Используй это как ограничение и не придумывай содержимое документа."
          }`,
        ].join("\n")
      )
      .slice(0, 8)
      .map((block) => trimForPrompt(block, MAX_CURRENT_ATTACHMENT_BLOCK_CHARS)),
    MAX_CURRENT_ATTACHMENT_CONTEXT_CHARS
  );

  const previousAttachmentBlocks = meta.attachedFilesOnly
    ? []
    : squeezeItemsToBudget(
        previousAttachments.map((item) =>
          trimForPrompt(
            [
              `Файл: ${item.title}`,
              `Сводка: ${item.summaryText || item.extractedText || item.extractionNote || ""}`,
            ].join("\n"),
            MAX_RECENT_ATTACHMENT_BLOCK_CHARS
          )
        ),
        MAX_RECENT_ATTACHMENT_CONTEXT_CHARS
      );

  const prompt = `
Ты — рабочий GPT-ассистент GOSZAKON внутри внутреннего чата.
Отвечай по-русски, уверенно, конкретно и по существу.
Главный источник истины сейчас — извлечённый текст по прикреплённым файлам этой реплики.

Правила:
- не придумывай факты;
- если данных не хватает, скажи это прямо, но не превращай ответ в длинное оправдание;
- если файл прочитан не полностью, прямо отмечай это;
- не описывай внутреннюю кухню системы словами "реплика", "память", "выжимки", "prompt", "подготовка файлов";
- не говори "у меня сейчас есть только часть файлов" или "файлы не подготовлены целиком";
- если текста документа не хватает, говори по-человечески: "этот файл не удалось прочитать автоматически полностью" или "по этому документу не видно нужного фрагмента";
- если в видимых фрагментах уже есть достаточно фактов для содержательного вывода, сначала дай этот вывод по существу;
- ограничения и оговорки выноси в конец коротким блоком "Что не видно из документов", а не ставь их в центр ответа;
- не пиши фразы вроде "сейчас содержательно проанализировать нельзя", если по видимым фрагментам уже можно сделать рабочий вывод;
- делай практический вывод и следующий шаг, если это уместно;
${meta.attachedFilesOnly ? "- отвечай только по прикреплённым файлам этой реплики;" : ""}

История:
${squeezeItemsToBudget(historyItems, 2200).join("\n") || "История пока пустая."}

Текущие файлы:
${currentAttachmentBlocks.join("\n\n---\n\n") || "Файлы этой реплики не подготовлены."}

${!meta.attachedFilesOnly && previousAttachmentBlocks.length > 0 ? `Память по прошлым файлам ветки:\n${previousAttachmentBlocks.join("\n\n---\n\n")}` : ""}

Последний вопрос:
${userMessage?.body || "Проанализируй прикреплённые файлы и помоги сотруднику."}
  `.trim();

  try {
    const payload = await requestOpenAiResponse({
      apiKey,
      model,
      prompt,
      useWebSearch: meta.useWebSearch && currentAttachments.length === 0,
      reasoningEffort: "high",
      timeoutMs: 90000,
    });
    const answer = getOpenAiOutputText(payload) || "GPT завершил проход, но не вернул текста ответа.";
    const webSources = meta.useWebSearch ? getOpenAiWebSources(payload) : [];
    const finalAnswer =
      webSources.length > 0
        ? `${answer}\n\nИсточники:\n${webSources
            .map((item, index) => `${index + 1}. ${item.title} — ${item.url}`)
            .join("\n")}`
        : answer;

    await prisma.tenderChatMessage.update({
      where: { id: assistantMessageId },
      data: { body: finalAnswer },
    });
  } catch (error) {
    console.error("[general-chat] pending resolve failed", assistantMessageId, error);
    await prisma.tenderChatMessage.update({
      where: { id: assistantMessageId },
      data: {
        body: "Не удалось завершить полный проход по файлам. Попробуй повторить запрос в новой ветке или сузить комплект файлов.",
      },
    });
  }
}

function startPendingAssistantResolution(input: {
  threadId: number;
  assistantMessageId: number;
  meta: PendingAssistantMeta;
  apiKey: string;
  model: string;
}) {
  setTimeout(() => {
    const prisma = getPrisma();
    resolvePendingAssistant({
      prisma,
      threadId: input.threadId,
      assistantMessageId: input.assistantMessageId,
      meta: input.meta,
      apiKey: input.apiKey,
      model: input.model,
    }).catch((error) => {
      console.error("[general-chat] background resolve failed", input.assistantMessageId, error);
    });
  }, 0);
}

async function parseIncomingRequest(request: Request) {
  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    const rawFiles = formData.getAll("files");
    const files = rawFiles.filter((item): item is File => item instanceof File && item.size > 0);

    return {
      threadId: Number(formData.get("threadId") ?? 0),
      message: String(formData.get("message") ?? "").trim(),
      useWebSearch: String(formData.get("useWebSearch") ?? "true") === "true",
      attachedFilesOnly: String(formData.get("attachedFilesOnly") ?? "false") === "true",
      files,
      attachmentIds: [] as number[],
    };
  }

  const body = (await request.json().catch(() => ({}))) as {
    threadId?: number;
    message?: string;
    useWebSearch?: boolean;
    attachmentIds?: number[];
  };

  return {
    threadId: Number(body.threadId ?? 0),
    message: String(body.message ?? "").trim(),
    useWebSearch: Boolean(body.useWebSearch),
    attachedFilesOnly: Boolean((body as any).attachedFilesOnly),
    files: [] as File[],
    attachmentIds: Array.isArray(body.attachmentIds)
      ? body.attachmentIds.map((item) => Number(item)).filter((item) => Number.isInteger(item) && item > 0)
      : [],
  };
}

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentTenderUser();

    if (!currentUser || !tenderHasCapability(currentUser.role, "procurement_comments")) {
      return NextResponse.json(
        { ok: false, error: "Недостаточно прав для GPT-чата." },
        { status: 403 }
      );
    }

    const { threadId, message, useWebSearch, attachedFilesOnly, files, attachmentIds } =
      await parseIncomingRequest(request);

    if (!message && files.length === 0 && attachmentIds.length === 0) {
      return NextResponse.json(
        { ok: false, error: "Нужно ввести сообщение или прикрепить файлы." },
        { status: 400 }
      );
    }

    if (files.some((file) => ARCHIVE_FILE_PATTERN.test(file.name))) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Архивы ZIP/RAR/7Z загружать нельзя. Прикрепляйте только сами документы: PDF, DOC, DOCX, XLS, XLSX, TXT.",
        },
        { status: 400 }
      );
    }

    const prisma = getPrisma();
    const thread =
      Number.isInteger(threadId) && threadId > 0
        ? await prisma.tenderChatThread.findFirst({
            where: {
              id: threadId,
              ownerId: currentUser.id,
              kind: TenderChatThreadKind.GENERAL,
            },
          })
        : await getOrCreateThread(currentUser.id);

    if (!thread) {
      return NextResponse.json(
        { ok: false, error: "Чат не найден." },
        { status: 404 }
      );
    }

    const userName = currentUser.name?.trim() || currentUser.email?.trim() || "Сотрудник";
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY is not configured");
    }

    const fileSummary: string[] = [];
    const fileReadStates: string[] = [];

    const userMessage = await prisma.tenderChatMessage.create({
      data: {
        threadId: thread.id,
        role: TenderChatMessageRole.USER,
        body: message || "Проанализируй прикреплённые файлы.",
        authorId: currentUser.id,
        authorName: userName,
      },
    });

    const attachmentRows: Array<{
      title: string;
      fileName: string;
      mimeType: string | null;
      fileSize: number | null;
      storagePath: string | null;
      documentKind: string | null;
      extractionNote: string | null;
      extractedText: string | null;
    }> = [];

    for (const file of files) {
      try {
        const buffer = Buffer.from(await file.arrayBuffer());
        const timestamp = Date.now();
        const baseDir = path.join(
          process.cwd(),
          "public",
          "docs",
          "general-chat",
          `thread-${thread.id}`
        );
        await mkdir(baseDir, { recursive: true });
        const safeName = sanitizeAttachmentFileName(file.name || "attachment");
        const storedFileName = `${timestamp}-${safeName || "attachment"}`;
        const relativeStoragePath = `/docs/general-chat/thread-${thread.id}/${storedFileName}`;
        const absoluteStoragePath = path.join(baseDir, storedFileName);
        await writeFile(absoluteStoragePath, buffer);

        attachmentRows.push({
          title: file.name,
          fileName: file.name,
          mimeType: file.type || "application/octet-stream",
          fileSize: file.size,
          storagePath: relativeStoragePath,
          documentKind: "Документ",
          extractionNote: "Файл загружен. Идёт чтение и разбор.",
          extractedText: null,
        });

        fileSummary.push(`${file.name} — документ прикреплён`);
        fileReadStates.push(`${file.name} — Документ — файл загружен и будет прочитан в фоне`);
      } catch (fileError) {
        console.error("[general-chat] file-prepare failed", file.name, fileError);
        fileSummary.push(`${file.name} — файл не удалось подготовить`);
        fileReadStates.push(`${file.name} — неизвестный тип — файл не удалось прочитать автоматически`);
        attachmentRows.push({
          title: file.name,
          fileName: file.name,
          mimeType: file.type || "application/octet-stream",
          fileSize: file.size,
          storagePath: null,
          documentKind: "Не определён",
          extractionNote: "Файл не удалось прочитать автоматически.",
          extractedText: null,
        });
      }
    }

    const pendingAttachments =
      attachmentIds.length > 0
        ? await prisma.tenderChatAttachment.findMany({
            where: {
              id: {
                in: attachmentIds,
              },
              threadId: thread.id,
              messageId: null,
            },
            orderBy: { createdAt: "desc" },
            select: {
              id: true,
              title: true,
              fileName: true,
              documentKind: true,
              extractionNote: true,
              storagePath: true,
              extractedText: true,
              summaryText: true,
              createdAt: true,
            },
          })
        : [];

    for (const attachment of pendingAttachments) {
      fileSummary.push(`${attachment.title} — ${attachment.documentKind || "Документ"}`);
      fileReadStates.push(
        `${attachment.title} — ${attachment.documentKind || "Документ"} — ${
          attachment.extractionNote || "Файл сохранён на сервере"
        }`
      );
    }

    if (attachmentRows.length > 0) {
      await prisma.tenderChatAttachment.createMany({
        data: attachmentRows.map((item) => ({
          threadId: thread.id,
          messageId: userMessage.id,
          title: item.title,
          fileName: item.fileName,
          mimeType: item.mimeType,
          fileSize: item.fileSize,
          storagePath: item.storagePath,
          documentKind: item.documentKind,
          extractionNote: item.extractionNote,
          extractedText: item.extractedText,
        })),
      });
    }

    if (pendingAttachments.length > 0) {
      await prisma.tenderChatAttachment.updateMany({
        where: {
          id: {
            in: pendingAttachments.map((item) => item.id),
          },
          threadId: thread.id,
          messageId: null,
        },
        data: {
          messageId: userMessage.id,
        },
      });
    }

    const createdAttachments = attachmentRows.length
      || pendingAttachments.length
      ? await prisma.tenderChatAttachment.findMany({
          where: { messageId: userMessage.id },
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            title: true,
            fileName: true,
            documentKind: true,
            extractionNote: true,
            storagePath: true,
            extractedText: true,
            summaryText: true,
            createdAt: true,
          },
        })
      : [];

    const userMessageBody =
      fileSummary.length > 0
        ? `${message || "Проанализируй прикреплённые файлы."}\n\nФайлы:\n${fileSummary
            .map((title) => `- ${title}`)
            .join("\n")}`
        : message || "Проанализируй прикреплённые файлы.";

    if (userMessage.body !== userMessageBody) {
      await prisma.tenderChatMessage.update({
        where: { id: userMessage.id },
        data: { body: userMessageBody },
      });
      userMessage.body = userMessageBody;
    }

    const assistantMessage = await prisma.tenderChatMessage.create({
      data: {
        threadId: thread.id,
        role: TenderChatMessageRole.ASSISTANT,
        body: encodePendingAssistantMeta({
          status: "pending",
          userMessageId: userMessage.id,
          useWebSearch,
          attachedFilesOnly,
        }),
        authorName: "GPT",
      },
    });

    await updateThreadTitleIfNeeded({
      prisma,
      threadId: thread.id,
      currentTitle: thread.title,
      nextTitle: message || fileSummary[0] || "Новый чат",
    });

    startPendingAssistantResolution({
      threadId: thread.id,
      assistantMessageId: assistantMessage.id,
      meta: {
        status: "pending",
        userMessageId: userMessage.id,
        useWebSearch,
        attachedFilesOnly,
      },
      apiKey,
      model: process.env.OPENAI_CHAT_MODEL || process.env.OPENAI_MODEL || "gpt-5",
    });

    return NextResponse.json({
      ok: true,
      thread: {
        id: thread.id,
        title: thread.title,
      },
      userMessage: {
        id: userMessage.id,
        role: "user",
        authorName: userMessage.authorName || userName,
        body: userMessage.body,
        createdAt: userMessage.createdAt.toISOString(),
      },
      assistantMessage: {
        id: assistantMessage.id,
        role: "assistant",
        authorName: "GPT",
        body: "Получил запрос. Читаю файлы и готовлю ответ...",
        createdAt: assistantMessage.createdAt.toISOString(),
      },
      attachments: createdAttachments.map((item) => ({
        id: item.id,
        title: item.title,
        fileName: item.fileName,
        documentKind: item.documentKind || "Документ",
        extractionNote: item.extractionNote || "Файл сохранён на сервере",
        storagePath: item.storagePath,
        createdAt: item.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("[general-chat] failed", error);
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error ? error.message : "Не удалось получить ответ GPT.",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const currentUser = await getCurrentTenderUser();

    if (!currentUser || !tenderHasCapability(currentUser.role, "procurement_comments")) {
      return NextResponse.json({ ok: false, error: "Недостаточно прав." }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const threadId = Number(searchParams.get("threadId") ?? 0);

    if (!Number.isInteger(threadId) || threadId <= 0) {
      return NextResponse.json({ ok: false, error: "Некорректный чат." }, { status: 400 });
    }

    const prisma = getPrisma();
    const state = await loadThreadState(threadId, currentUser.id);
    if (!state) {
      return NextResponse.json({ ok: false, error: "Чат не найден." }, { status: 404 });
    }

    return NextResponse.json({ ok: true, ...state });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Не удалось загрузить состояние чата.",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const currentUser = await getCurrentTenderUser();

    if (!currentUser || !tenderHasCapability(currentUser.role, "procurement_comments")) {
      return NextResponse.json({ ok: false, error: "Недостаточно прав." }, { status: 403 });
    }

    const body = (await request.json().catch(() => ({}))) as {
      threadId?: number;
      title?: string;
    };

    const threadId = Number(body.threadId ?? 0);
    const title = String(body.title ?? "").trim().slice(0, 120);

    if (!Number.isInteger(threadId) || threadId <= 0) {
      return NextResponse.json({ ok: false, error: "Некорректный чат." }, { status: 400 });
    }

    if (!title) {
      return NextResponse.json({ ok: false, error: "Нужно указать название чата." }, { status: 400 });
    }

    const prisma = getPrisma();
    const thread = await prisma.tenderChatThread.findFirst({
      where: {
        id: threadId,
        ownerId: currentUser.id,
        kind: TenderChatThreadKind.GENERAL,
      },
    });

    if (!thread) {
      return NextResponse.json({ ok: false, error: "Чат не найден." }, { status: 404 });
    }

    const updated = await prisma.tenderChatThread.update({
      where: { id: thread.id },
      data: { title },
      select: {
        id: true,
        title: true,
      },
    });

    return NextResponse.json({ ok: true, thread: updated });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error ? error.message : "Не удалось переименовать чат.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const currentUser = await getCurrentTenderUser();

    if (!currentUser || !tenderHasCapability(currentUser.role, "procurement_comments")) {
      return NextResponse.json({ ok: false, error: "Недостаточно прав." }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const threadId = Number(searchParams.get("threadId") ?? 0);

    if (!Number.isInteger(threadId) || threadId <= 0) {
      return NextResponse.json({ ok: false, error: "Некорректный чат." }, { status: 400 });
    }

    const prisma = getPrisma();
    const thread = await prisma.tenderChatThread.findFirst({
      where: {
        id: threadId,
        ownerId: currentUser.id,
        kind: TenderChatThreadKind.GENERAL,
      },
      select: {
        id: true,
      },
    });

    if (!thread) {
      return NextResponse.json({ ok: false, error: "Чат не найден." }, { status: 404 });
    }

    await prisma.tenderChatThread.delete({
      where: { id: thread.id },
    });

    const fallbackThread = await getOrCreateFallbackThread(currentUser.id, thread.id);

    return NextResponse.json({
      ok: true,
      deletedThreadId: thread.id,
      fallbackThreadId: fallbackThread.id,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Не удалось удалить чат.",
      },
      { status: 500 }
    );
  }
}
