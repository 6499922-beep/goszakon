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
const PENDING_ASSISTANT_BODY = "__GENERAL_CHAT_PENDING__";

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

async function uploadOpenAiUserFile({
  apiKey,
  fileName,
  mimeType,
  buffer,
}: {
  apiKey: string;
  fileName: string;
  mimeType: string;
  buffer: Buffer;
}) {
  const formData = new FormData();
  formData.append("purpose", "user_data");
  formData.append(
    "file",
    new Blob([new Uint8Array(buffer)], { type: mimeType || "application/octet-stream" }),
    fileName
  );

  const response = await fetch("https://api.openai.com/v1/files", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI file upload error: ${response.status} ${errorText.slice(0, 500)}`);
  }

  const payload = (await response.json()) as { id?: string };
  if (!payload?.id) {
    throw new Error("OpenAI не вернул file_id для вложения.");
  }

  return payload.id;
}

async function readStoredAttachmentBuffer(storagePath: string) {
  const normalizedStoragePath = storagePath.replace(/^\/+/, "");
  const absolutePath = path.join(process.cwd(), "public", normalizedStoragePath);
  return readFile(absolutePath);
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

  const prompt = `
Ты готовишь серверную память по одному вложению рабочего чата GOSZAKON.
Нужно сделать очень короткую, но полезную выжимку по файлу, чтобы потом по ней можно было строить ответы без повторного чтения всего документа.

Формат:
- 1 строка: что это за документ
- 2-5 строк: главные факты, цифры, условия или риски
- без воды
- без вводных фраз
- по-русски

Название файла: ${title}
Тип документа: ${documentKind || "Документ"}
Статус чтения: ${extractionNote || "Текст извлечён"}

Текст файла:
${trimForPrompt(text, 12000)}
  `.trim();

  try {
    const payload = await requestOpenAiResponse({
      apiKey,
      model,
      prompt,
      useWebSearch: false,
      reasoningEffort: "low",
      timeoutMs: 18000,
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
  const updates: Array<{ id: number; summaryText: string }> = [];

  for (const attachment of attachments) {
    if (attachment.summaryText?.trim()) continue;

    const summaryText = await buildAttachmentSummary({
      apiKey,
      model,
      title: attachment.title,
      documentKind: attachment.documentKind,
      extractionNote: attachment.extractionNote,
      extractedText: attachment.extractedText,
    });

    updates.push({ id: attachment.id, summaryText });
  }

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

    const model = process.env.OPENAI_CHAT_MODEL || process.env.OPENAI_MODEL || "gpt-5";
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
        body: PENDING_ASSISTANT_BODY,
        authorName: "GPT",
      },
    });

    void (async () => {
      const recentMessages = await prisma.tenderChatMessage.findMany({
        where: { threadId: thread.id },
        orderBy: { createdAt: "asc" },
        take: 20,
      });
      const recentAttachments = await prisma.tenderChatAttachment.findMany({
        where: {
          threadId: thread.id,
          messageId: {
            not: null,
          },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
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
        },
      });
      const preparedRecentAttachments = recentAttachments;
      const messageAttachments = preparedRecentAttachments.filter((item) =>
        createdAttachments.some((created) => created.id === item.id)
      );
      const uploadedCurrentFiles: Array<{ fileId: string; fileName: string }> = [];
      const directUploadFailures: string[] = [];
      const uploadResults = await Promise.all(
        messageAttachments.map(async (attachment) => {
          if (!attachment.storagePath) {
            return {
              ok: false as const,
              error: `${attachment.title}: файл ещё не сохранён на сервере`,
            };
          }

          try {
            const buffer = await readStoredAttachmentBuffer(attachment.storagePath);
            const fileId = await uploadOpenAiUserFile({
              apiKey,
              fileName: attachment.fileName || attachment.title,
              mimeType: attachment.mimeType || "application/octet-stream",
              buffer,
            });
            return {
              ok: true as const,
              fileId,
              fileName: attachment.fileName || attachment.title,
            };
          } catch (uploadError) {
            return {
              ok: false as const,
              error: `${attachment.title}: ${
                uploadError instanceof Error ? uploadError.message : "не удалось передать файл напрямую"
              }`,
            };
          }
        })
      );

      uploadResults.forEach((result) => {
        if (result.ok) {
          uploadedCurrentFiles.push({
            fileId: result.fileId,
            fileName: result.fileName,
          });
        } else {
          directUploadFailures.push(result.error);
        }
      });

      const effectiveFileReadStates =
        messageAttachments.length > 0
          ? messageAttachments.map(
              (item) =>
                `${item.title} — ${item.documentKind || "Документ"} — ${
                  item.extractionNote || "Файл сохранён на сервере"
                }`
            )
          : fileReadStates;
      const historyItems = recentMessages
        .slice(-MAX_HISTORY_MESSAGES)
        .map(
          (item) =>
            `${item.authorName || (item.role === "ASSISTANT" ? "GPT" : "Пользователь")}: ${trimForPrompt(item.body, 1100)}`
        );
      const historyText = squeezeItemsToBudget(historyItems, MAX_HISTORY_CHARS).join("\n");

      const currentAttachmentMemoryBlocks = squeezeItemsToBudget(
        messageAttachments
          .map((item) =>
            [
              `Файл: ${item.title}`,
              `Короткая память: ${trimForPrompt(
                item.extractedText || item.summaryText || item.extractionNote || "",
                MAX_ATTACHMENT_SUMMARY_CHARS
              )}`,
            ].join("\n")
          )
          .slice(0, MAX_CURRENT_ATTACHMENT_BLOCKS)
          .map((block) => trimForPrompt(block, MAX_CURRENT_ATTACHMENT_BLOCK_CHARS)),
        MAX_CURRENT_ATTACHMENT_CONTEXT_CHARS
      );

      const recentAttachmentMemoryBlocks = squeezeItemsToBudget(
        preparedRecentAttachments
          .filter((item) => !messageAttachments.some((current) => current.id === item.id))
          .filter((item) => Boolean(item.summaryText || item.extractedText))
          .map((item) =>
            [
              `Файл: ${item.title}`,
              `Короткая память: ${trimForPrompt(item.summaryText || item.extractedText || item.extractionNote || "", 1200)}`,
            ].join("\n")
          )
          .slice(0, MAX_RECENT_ATTACHMENT_BLOCKS)
          .map((block) => trimForPrompt(block, MAX_RECENT_ATTACHMENT_BLOCK_CHARS)),
        MAX_RECENT_ATTACHMENT_CONTEXT_CHARS
      );

      const useDirectFileMode = uploadedCurrentFiles.length > 0;
      const compactHistoryText = useDirectFileMode
        ? squeezeItemsToBudget(historyItems.slice(-6), 3200).join("\n")
        : historyText;

      const prompt = `
Ты — полноценный рабочий GPT-ассистент внутри внутреннего чата GOSZAKON.
Отвечай по-русски, уверенно, по делу и как в обычном чате, а не как в жёстком анализе.
Можно давать развёрнутые ответы, если вопрос сложный.
Если включён интернет-поиск, используй его там, где это реально помогает.
Если вопрос про закупки, договоры, НМЦК, риски, ФАС, документы и стратегию — отвечай как сильный практический эксперт.

Правила:
- не придумывай факты;
- если данных не хватает, скажи это прямо;
- если вопрос юридически чувствительный, отмечай риск и неопределённость;
- если уместно, предлагай следующий практический шаг;
- если какой-то файл не удалось прочитать, явно скажи это;
- не делай вид, что прочитал файл, если текст из него не извлёкся;
- если приложены прямые файлы, в первую очередь опирайся именно на них;
- если старая память ветки конфликтует с текущими файлами, доверяй текущим файлам;
${attachedFilesOnly ? "- отвечай только по прикреплённым файлам и прямому вопросу, не опирайся на интернет и общие знания, кроме базовой интерпретации документа;" : ""}

История чата:
${compactHistoryText || "История пока пустая."}

${uploadedCurrentFiles.length > 0 ? `Текущие файлы переданы тебе напрямую через OpenAI Files API:\n${uploadedCurrentFiles.map((item, index) => `${index + 1}. ${item.fileName}`).join("\n")}` : ""}
${directUploadFailures.length > 0 ? `Не удалось передать напрямую часть файлов:\n${directUploadFailures.map((item, index) => `${index + 1}. ${item}`).join("\n")}` : ""}
${messageAttachments.length > 0 && !useDirectFileMode ? `Текущие прикреплённые файлы этой реплики:\n${messageAttachments
  .map(
    (item, index) =>
      `${index + 1}. ${item.title} — ${item.documentKind || "Документ"} — ${item.extractionNote || "без статуса"}${
        item.summaryText
          ? `\n${trimForPrompt(item.summaryText, 2400)}`
          : item.extractedText
            ? `\n${trimForPrompt(item.extractedText, 1800)}`
            : ""
      }`
  )
  .join("\n\n")}` : ""}
${effectiveFileReadStates.length > 0 ? `Статусы прикреплённых файлов:\n${effectiveFileReadStates.map((item, index) => `${index + 1}. ${item}`).join("\n")}` : ""}
${currentAttachmentMemoryBlocks.length > 0 && !useDirectFileMode ? `Рабочая память по текущим файлам:\n${currentAttachmentMemoryBlocks.join("\n\n---\n\n")}` : ""}
${!attachedFilesOnly && recentAttachmentMemoryBlocks.length > 0 && !useDirectFileMode ? `Дополнительная память по предыдущим файлам этой ветки:\n${recentAttachmentMemoryBlocks.join("\n\n---\n\n")}` : ""}

Последний вопрос:
${message || "Проанализируй прикреплённые файлы и помоги сотруднику по ним."}
`.trim();

      let payload;
      try {
        payload = await requestOpenAiResponse({
          apiKey,
          model,
          prompt,
          inputFiles: uploadedCurrentFiles,
          useWebSearch: useWebSearch && files.length === 0,
          reasoningEffort: files.length > 0 ? "medium" : "medium",
          timeoutMs: files.length > 0 ? 120000 : 40000,
        });
      } catch {
        try {
          payload = await requestOpenAiResponse({
            apiKey,
            model,
            prompt,
            inputFiles: uploadedCurrentFiles,
            useWebSearch: false,
            reasoningEffort: files.length > 0 ? "high" : "medium",
            timeoutMs: files.length > 0 ? 180000 : 60000,
          });
        } catch {
          payload = null;
        }
      }

      const answer =
        (payload ? getOpenAiOutputText(payload) : "") ||
        [
          "Не удалось завершить полный проход по файлам в разумное время.",
          effectiveFileReadStates.length > 0 ? `Файлы приняты: ${effectiveFileReadStates.length}.` : "",
          "Это технический сбой прохода, а не частичный ответ по существу.",
          "Повтори запрос ещё раз в новой ветке или с меньшим комплектом файлов, а я добью уже именно этот слой.",
        ]
          .filter(Boolean)
          .join("\n");
      const webSources = useWebSearch ? getOpenAiWebSources(payload) : [];
      const finalAnswer =
        webSources.length > 0
          ? `${answer}\n\nИсточники:\n${webSources
              .map((item, index) => `${index + 1}. ${item.title} — ${item.url}`)
              .join("\n")}`
          : answer;

      await prisma.tenderChatMessage.update({
        where: { id: assistantMessage.id },
        data: { body: finalAnswer },
      });

      await prisma.tenderChatThread.update({
        where: { id: thread.id },
        data: {
          title:
            thread.title === "Личный чат" || thread.title === "Новый чат"
              ? trimForPrompt(message || fileSummary[0] || "Новый чат", 80) || "Новый чат"
              : thread.title,
        },
      });
    })().catch(async (backgroundError) => {
      console.error("[general-chat] background failed", backgroundError);
      try {
        await prisma.tenderChatMessage.update({
          where: { id: assistantMessage.id },
          data: {
            body:
              "Не удалось подготовить полный ответ в фоне. Попробуй повторить вопрос чуть уже или отправить меньше файлов за раз.",
          },
        });
      } catch (updateError) {
        console.error("[general-chat] assistant fallback update failed", updateError);
      }
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
