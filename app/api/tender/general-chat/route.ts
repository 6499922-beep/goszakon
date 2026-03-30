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
const MAX_FILE_BLOCKS = 4;
const MAX_FILE_BLOCK_CHARS = 3200;
const MAX_FILE_CONTEXT_CHARS = 12000;

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
  useWebSearch,
  reasoningEffort = "medium",
  timeoutMs = 45000,
}: {
  apiKey: string;
  model: string;
  prompt: string;
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
              content: [{ type: "input_text", text: prompt }],
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
    };
  }

  const body = (await request.json().catch(() => ({}))) as {
    threadId?: number;
    message?: string;
    useWebSearch?: boolean;
  };

  return {
    threadId: Number(body.threadId ?? 0),
    message: String(body.message ?? "").trim(),
    useWebSearch: Boolean(body.useWebSearch),
    attachedFilesOnly: Boolean((body as any).attachedFilesOnly),
    files: [] as File[],
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

    const { threadId, message, useWebSearch, attachedFilesOnly, files } = await parseIncomingRequest(request);

    if (!message && files.length === 0) {
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
    const extractedFileBlocks: string[] = [];
    const fileSummary: string[] = [];
    const fileReadStates: string[] = [];

    for (const file of files) {
      const preparedDocuments = await prepareTenderUploadDocuments({
        name: file.name,
        type: file.type || "application/octet-stream",
        size: file.size,
        buffer: Buffer.from(await file.arrayBuffer()),
      });

      for (const prepared of preparedDocuments) {
        fileSummary.push(`${prepared.title} — ${prepared.documentKind}`);
        fileReadStates.push(
          `${prepared.title} — ${prepared.documentKind} — ${prepared.extractionNote}`
        );
        if (prepared.extractedText?.trim()) {
          extractedFileBlocks.push(
            [
              `Файл: ${prepared.title}`,
              `Тип: ${prepared.documentKind}`,
              `Статус чтения: ${prepared.extractionNote}`,
              "Извлечённый текст:",
              prepared.extractedText.trim(),
            ].join("\n")
          );
        } else {
          extractedFileBlocks.push(
            [
              `Файл: ${prepared.title}`,
              `Тип: ${prepared.documentKind}`,
              `Статус чтения: ${prepared.extractionNote}`,
              "Текст автоматически не извлечён. Используй тип документа, название файла и доступный контекст, но не придумывай содержание.",
            ].join("\n")
          );
        }
      }
    }

    const userMessageBody =
      fileSummary.length > 0
        ? `${message || "Проанализируй прикреплённые файлы."}\n\nФайлы:\n${fileSummary
            .map((title) => `- ${title}`)
            .join("\n")}`
        : message;

    const userMessage = await prisma.tenderChatMessage.create({
      data: {
        threadId: thread.id,
        role: TenderChatMessageRole.USER,
        body: userMessageBody,
        authorId: currentUser.id,
        authorName: userName,
      },
    });

    const recentMessages = await prisma.tenderChatMessage.findMany({
      where: { threadId: thread.id },
      orderBy: { createdAt: "asc" },
      take: 20,
    });

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY is not configured");
    }

    const model = process.env.OPENAI_CHAT_MODEL || process.env.OPENAI_MODEL || "gpt-5";
    const historyItems = recentMessages
      .slice(-MAX_HISTORY_MESSAGES)
      .map(
        (item) =>
          `${item.authorName || (item.role === "ASSISTANT" ? "GPT" : "Пользователь")}: ${trimForPrompt(item.body, 1100)}`
      );
    const historyText = squeezeItemsToBudget(historyItems, MAX_HISTORY_CHARS).join("\n");

    const limitedFileBlocks = squeezeItemsToBudget(
      extractedFileBlocks
        .slice(0, MAX_FILE_BLOCKS)
        .map((block) => trimForPrompt(block, MAX_FILE_BLOCK_CHARS)),
      MAX_FILE_CONTEXT_CHARS
    );

    const prompt = `
Ты — полноценный рабочий GPT-ассистент внутри внутреннего чата GOSZAKON.
Отвечай по-русски, уверенно, по делу и как в обычном чате, а не как в жёстком анализе.
Можно давать развёрнутые ответы, если вопрос сложный.
Если включён интернет-поиск, используй его там, где это реально помогает.
Если вопрос про закупки, договоры, НМЦК, риски, ФАС, документы и стратегию — отвечай как сильный практический эксперт, а не как шаблонный бот.

Правила:
- не придумывай факты;
- если данных не хватает, скажи это прямо;
- если вопрос юридически чувствительный, отмечай риск и неопределённость;
- если уместно, предлагай следующий практический шаг.
- если какой-то файл не удалось прочитать, явно скажи это;
- не делай вид, что прочитал файл, если текст из него не извлёкся;
${attachedFilesOnly ? "- отвечай только по прикреплённым файлам и прямому вопросу, не опирайся на интернет и общие знания, кроме базовой интерпретации документа;" : ""}

История чата:
${historyText || "История пока пустая."}

${fileReadStates.length > 0 ? `Прикреплённые файлы:\n${fileReadStates.map((item, index) => `${index + 1}. ${item}`).join("\n")}` : ""}
${limitedFileBlocks.length > 0 ? `Извлечённый текст по файлам:\n${limitedFileBlocks.join("\n\n---\n\n")}` : ""}

Последний вопрос:
${message || "Проанализируй прикреплённые файлы и помоги сотруднику по ним."}
`.trim();

    let payload;
    try {
      payload = await requestOpenAiResponse({
        apiKey,
        model,
        prompt,
        useWebSearch: useWebSearch && files.length === 0,
        reasoningEffort: files.length > 0 ? "low" : "medium",
        timeoutMs: files.length > 0 ? 30000 : 40000,
      });
    } catch {
      const fallbackPrompt = `
Ты — рабочий GPT-ассистент GOSZAKON.
Дай короткий и полезный ответ по вопросу пользователя, опираясь только на историю, список файлов и короткий доступный контекст.
Если данных мало, честно скажи, чего не хватает.

История:
${historyText || "История пока пустая."}

Файлы:
${fileReadStates.length > 0 ? fileReadStates.map((item, index) => `${index + 1}. ${item}`).join("\n") : "Файлы не приложены."}

Короткий контекст:
${limitedFileBlocks.length > 0 ? limitedFileBlocks.map((item, index) => `${index + 1}. ${trimForPrompt(item, 900)}`).join("\n\n") : "Извлечённого текста нет."}

Вопрос:
${message || "Проанализируй прикреплённые файлы и помоги сотруднику по ним."}
`.trim();

      try {
        payload = await requestOpenAiResponse({
          apiKey,
          model,
          prompt: fallbackPrompt,
          useWebSearch: false,
          reasoningEffort: "low",
          timeoutMs: 20000,
        });
      } catch {
        payload = null;
      }
    }
    const answer =
      (payload ? getOpenAiOutputText(payload) : "") ||
      [
        "Получил запрос, но GPT не успел сформировать полный ответ в этом проходе.",
        fileReadStates.length > 0 ? `Файлы приняты: ${fileReadStates.length}.` : "",
        fileReadStates.length > 0 ? "Что уже вижу:" : "",
        ...fileReadStates.slice(0, 5).map((item) => `- ${item}`),
        message ? `Попробуй сузить вопрос: ${trimForPrompt(message, 180)}` : "Попробуй задать более узкий вопрос по этим файлам.",
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

    const assistantMessage = await prisma.tenderChatMessage.create({
      data: {
        threadId: thread.id,
        role: TenderChatMessageRole.ASSISTANT,
        body: finalAnswer,
        authorName: "GPT",
      },
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
        body: assistantMessage.body,
        createdAt: assistantMessage.createdAt.toISOString(),
      },
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
