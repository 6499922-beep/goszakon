import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { getCurrentTenderUser } from "@/lib/admin-auth";
import { startTenderChatAttachmentPreparationJob } from "@/lib/tender-general-chat";
import { getPrisma } from "@/lib/prisma";
import { tenderHasCapability } from "@/lib/tender-permissions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ARCHIVE_FILE_PATTERN = /\.(zip|rar|7z)$/i;

function sanitizeAttachmentFileName(fileName: string) {
  return fileName
    .replace(/[^\p{L}\p{N}._-]+/gu, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 120);
}

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentTenderUser();

    if (!currentUser || !tenderHasCapability(currentUser.role, "procurement_comments")) {
      return NextResponse.json(
        { ok: false, error: "Недостаточно прав для предпросмотра файлов." },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const threadId = Number(formData.get("threadId") ?? 0);

    if (!(file instanceof File) || file.size <= 0) {
      return NextResponse.json(
        { ok: false, error: "Файл для предпросмотра не найден." },
        { status: 400 }
      );
    }

    if (ARCHIVE_FILE_PATTERN.test(file.name)) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Архивы ZIP/RAR/7Z прикреплять нельзя. Загружайте только сами документы: PDF, DOC, DOCX, XLS, XLSX, TXT.",
        },
        { status: 400 }
      );
    }

    if (!Number.isInteger(threadId) || threadId <= 0) {
      return NextResponse.json(
        { ok: false, error: "Не удалось определить ветку чата для файла." },
        { status: 400 }
      );
    }

    const prisma = getPrisma();
    const thread = await prisma.tenderChatThread.findFirst({
      where: {
        id: threadId,
        ownerId: currentUser.id,
      },
      select: { id: true },
    });

    if (!thread) {
      return NextResponse.json({ ok: false, error: "Чат не найден." }, { status: 404 });
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer());

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
    await writeFile(absoluteStoragePath, fileBuffer);

    const storedAttachment = await prisma.tenderChatAttachment.create({
      data: {
        threadId: thread.id,
        messageId: null,
        title: file.name,
        fileName: file.name,
        mimeType: file.type || "application/octet-stream",
        fileSize: file.size,
        storagePath: relativeStoragePath,
        documentKind: "Документ",
        extractionNote: "Файл загружен. Идёт чтение и разбор.",
        extractedText: null,
      },
    });

    const apiKey = process.env.OPENAI_API_KEY;
    if (apiKey) {
      startTenderChatAttachmentPreparationJob({
        attachmentId: storedAttachment.id,
        apiKey,
        model: process.env.OPENAI_CHAT_MODEL || process.env.OPENAI_MODEL || "gpt-5",
      });
    }

    return NextResponse.json({
      ok: true,
      preview: {
        attachmentId: storedAttachment.id,
        fileName: file.name,
        fileType: file.type || "application/octet-stream",
        documentKind: "Документ",
        extracted: false,
        statusLabel: "Читаю файл...",
        text: "",
        note: "Файл загружен. Идёт чтение и подготовка к анализу.",
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error ? error.message : "Не удалось подготовить предпросмотр файла.",
      },
      { status: 500 }
    );
  }
}
