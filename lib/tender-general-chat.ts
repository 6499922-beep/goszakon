import { getPrisma } from "@/lib/prisma";

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

async function requestSummaryResponse({
  apiKey,
  model,
  prompt,
  timeoutMs = 30000,
}: {
  apiKey: string;
  model: string;
  prompt: string;
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
          reasoning: { effort: "low" },
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

    const errorText = await response.text().catch(() => "");
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

  throw new Error("Не удалось получить summary от GPT.");
}

function chunkText(value: string, chunkSize: number) {
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

export async function buildTenderChatAttachmentSummary(input: {
  apiKey: string;
  model: string;
  title: string;
  documentKind: string | null;
  extractionNote: string | null;
  extractedText: string | null;
}) {
  const text = input.extractedText?.trim();
  if (!text) {
    return input.extractionNote?.trim() || "Текст автоматически не извлечён.";
  }

  const chunks = chunkText(text, 12000);
  const chunkSummaries: string[] = [];

  for (let index = 0; index < chunks.length; index += 1) {
    const prompt = `
Ты готовишь серверную память по одному вложению рабочего чата GOSZAKON.
Перед тобой часть документа. Извлеки только полезные факты, цифры, сроки, условия, риски и обязательства.

Название файла: ${input.title}
Тип документа: ${input.documentKind || "Документ"}
Статус чтения: ${input.extractionNote || "Текст извлечён"}
Часть: ${index + 1} из ${chunks.length}

Фрагмент документа:
${chunks[index]}
    `.trim();

    try {
      const payload = await requestSummaryResponse({
        apiKey: input.apiKey,
        model: input.model,
        prompt,
        timeoutMs: 25000,
      });
      chunkSummaries.push(getOpenAiOutputText(payload) || chunks[index]);
    } catch {
      chunkSummaries.push(chunks[index]);
    }
  }

  const combinePrompt = `
Ты готовишь полную серверную сводку по одному документу для рабочего чата GOSZAKON.
Ниже даны выжимки по всем частям файла. Собери одну полную полезную сводку по всему документу.

Требования:
- опирайся на все части документа;
- сохрани ключевые цифры, сроки, условия, риски, обязанности, санкции и выводы;
- если это договор, обязательно сохрани стороны, предмет, сроки, оплату, ответственность, неустойку, расторжение;
- если это претензия, сохрани факты, даты, ссылки на пункты, требования, сроки;
- формат ответа:
  1. Что это за документ
  2. Главные факты
  3. Ключевые цифры и сроки
  4. Риски / что важно проверить

Название файла: ${input.title}
Тип документа: ${input.documentKind || "Документ"}

Выжимки:
${chunkSummaries.map((item, index) => `Часть ${index + 1}:\n${item}`).join("\n\n---\n\n")}
  `.trim();

  try {
    const payload = await requestSummaryResponse({
      apiKey: input.apiKey,
      model: input.model,
      prompt: combinePrompt,
      timeoutMs: 30000,
    });
    return getOpenAiOutputText(payload) || text.slice(0, 1800);
  } catch {
    return text.slice(0, 1800);
  }
}

export function startTenderChatAttachmentSummaryJob(input: {
  attachmentId: number;
  apiKey: string;
  model: string;
}) {
  setTimeout(async () => {
    const prisma = getPrisma();
    try {
      const attachment = await prisma.tenderChatAttachment.findUnique({
        where: { id: input.attachmentId },
        select: {
          id: true,
          title: true,
          documentKind: true,
          extractionNote: true,
          extractedText: true,
          summaryText: true,
        },
      });

      if (!attachment || attachment.summaryText?.trim()) {
        return;
      }

      const summaryText = await buildTenderChatAttachmentSummary({
        apiKey: input.apiKey,
        model: input.model,
        title: attachment.title,
        documentKind: attachment.documentKind,
        extractionNote: attachment.extractionNote,
        extractedText: attachment.extractedText,
      });

      await prisma.tenderChatAttachment.update({
        where: { id: input.attachmentId },
        data: { summaryText },
      });
    } catch (error) {
      console.error("[general-chat] background attachment summary failed", input.attachmentId, error);
    }
  }, 0);
}
