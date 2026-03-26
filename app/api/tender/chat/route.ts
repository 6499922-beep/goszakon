import { TenderActionType } from "@prisma/client";
import { NextResponse } from "next/server";
import { getCurrentTenderUser } from "@/lib/admin-auth";
import { getPrisma } from "@/lib/prisma";
import { tenderHasCapability } from "@/lib/tender-permissions";
import { logTenderEvent } from "@/lib/tender-workflow";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

  return [...unique.values()].slice(0, 8);
}

function trimForPrompt(value: string | null | undefined, limit: number) {
  return String(value ?? "").replace(/\s+/g, " ").trim().slice(0, limit);
}

function getDocumentPriority(kind: string | null | undefined, title: string | null | undefined) {
  const haystack = `${kind ?? ""} ${title ?? ""}`.toLowerCase();
  if (haystack.includes("извещ")) return 1;
  if (haystack.includes("техничес") || haystack.includes("тз")) return 2;
  if (haystack.includes("договор")) return 3;
  if (haystack.includes("цен") || haystack.includes("нмц")) return 4;
  if (haystack.includes("коммерчес")) return 5;
  return 10;
}

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentTenderUser();

    if (!currentUser || !tenderHasCapability(currentUser.role, "procurement_create")) {
      return NextResponse.json(
        { ok: false, error: "Недостаточно прав для чата по закупке" },
        { status: 403 }
      );
    }

    const body = (await request.json().catch(() => ({}))) as {
      procurementId?: number;
      message?: string;
      useWebSearch?: boolean;
    };

    const procurementId = Number(body.procurementId);
    const message = String(body.message ?? "").trim();
    const useWebSearch = Boolean(body.useWebSearch);

    if (!Number.isInteger(procurementId) || procurementId <= 0 || !message) {
      return NextResponse.json(
        { ok: false, error: "Нужны идентификатор закупки и текст вопроса." },
        { status: 400 }
      );
    }

    const prisma = getPrisma();
    const procurement = await prisma.tenderProcurement.findUnique({
      where: { id: procurementId },
      include: {
        sourceDocuments: {
          orderBy: { id: "asc" },
          select: {
            title: true,
            documentKind: true,
            contentSnippet: true,
            note: true,
          },
        },
        stageComments: {
          where: { stageKey: "gpt_chat" },
          orderBy: { createdAt: "asc" },
          take: 20,
        },
      },
    });

    if (!procurement) {
      return NextResponse.json(
        { ok: false, error: "Закупка не найдена." },
        { status: 404 }
      );
    }

    const userName = currentUser.name?.trim() || currentUser.email?.trim() || "Сотрудник";

    const userMessage = await prisma.tenderStageComment.create({
      data: {
        procurementId,
        stageKey: "gpt_chat",
        stageTitle: "GPT",
        body: message,
        authorId: currentUser.id,
        authorName: userName,
        authorRole: currentUser.role,
      },
    });

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY is not configured");
    }

    const model = process.env.OPENAI_CHAT_MODEL || process.env.OPENAI_MODEL || "gpt-5";
    const aiAnalysisText = procurement.aiAnalysis
      ? JSON.stringify(procurement.aiAnalysis, null, 2).slice(0, 6000)
      : "Распознанные поля пока отсутствуют.";

    const documentsText = [...procurement.sourceDocuments]
      .sort(
        (left, right) =>
          getDocumentPriority(left.documentKind, left.title) -
          getDocumentPriority(right.documentKind, right.title)
      )
      .map((document, index) => {
        const snippet =
          trimForPrompt(document.contentSnippet, 700) ||
          trimForPrompt(document.note, 300) ||
          "Текст не показан.";
        return `${index + 1}. ${document.title} [${document.documentKind || "Документ"}]\n${snippet}`;
      })
      .slice(0, 8)
      .join("\n\n");

    const historyText = procurement.stageComments
      .slice(-8)
      .map((item) => `${item.authorName || "Участник"}: ${trimForPrompt(item.body, 1000)}`)
      .join("\n");

    const prompt = `
Ты работаешь как GPT-помощник внутри карточки конкретной закупки.
Отвечай кратко, по делу, на русском.
Опирайся только на данные этой закупки: распознанные поля, список документов и переписку ниже.
Если чего-то нет в данных, прямо скажи, что этого в загруженной документации или в распознавании сейчас нет.
Если можешь, ссылайся в ответе на название документа, а не на общие слова.
${useWebSearch ? "Если в данных закупки ответа нет или его нужно проверить по внешним источникам, используй интернет-поиск и в конце укажи источники." : "Интернет-поиск не используй, отвечай только по данным этой закупки."}

Карточка закупки:
- Закупка: ${procurement.title}
- Номер закупки: ${procurement.procurementNumber ?? "не определён"}
- Заказчик: ${procurement.customerName ?? "не определён"}
- ИНН: ${procurement.customerInn ?? "не определён"}
- Площадка: ${procurement.platform ?? "не определена"}
- НМЦК без НДС: ${procurement.nmckWithoutVat?.toString() ?? "не определена"}
- Вид закупки: ${procurement.purchaseType ?? "не определён"}

Распознанные поля:
${aiAnalysisText}

Документы закупки:
${documentsText || "Документы не найдены."}

История чата:
${historyText || "История пока пустая."}

Последний вопрос:
${message}
`.trim();

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        reasoning: {
          effort: "low",
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
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API error: ${response.status} ${errorText.slice(0, 500)}`);
    }

    const payload = await response.json();
    const answer =
      getOpenAiOutputText(payload) ||
      "Не удалось получить содержательный ответ по этой закупке.";
    const webSources = useWebSearch ? getOpenAiWebSources(payload) : [];
    const finalAnswer =
      webSources.length > 0
        ? `${answer}\n\nИсточники:\n${webSources
            .map((item, index) => `${index + 1}. ${item.title} — ${item.url}`)
            .join("\n")}`
        : answer;

    const assistantMessage = await prisma.tenderStageComment.create({
      data: {
        procurementId,
        stageKey: "gpt_chat",
        stageTitle: "GPT",
        body: finalAnswer,
        authorName: "GPT",
      },
    });

    await logTenderEvent({
      procurementId,
      actionType: TenderActionType.NOTE_ADDED,
      title: "Вопрос в GPT по закупке",
      description: `Сотрудник задал вопрос по закупке: ${message.slice(0, 160)}`,
      actorName: userName,
      metadata: {
        stageKey: "gpt_chat",
      },
    });

    return NextResponse.json({
      ok: true,
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
    console.error("[tender-chat] failed", error);

    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error ? error.message : "Не удалось получить ответ GPT по закупке.",
      },
      { status: 500 }
    );
  }
}
