import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { getCurrentTenderUser } from "@/lib/admin-auth";
import { getPrisma } from "@/lib/prisma";
import { tenderHasCapability } from "@/lib/tender-permissions";
import { prepareTenderUploadDocuments } from "@/lib/tender-intake";

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
    const preparedDocuments = await prepareTenderUploadDocuments({
      name: file.name,
      type: file.type || "application/octet-stream",
      size: file.size,
      buffer: fileBuffer,
    });

    const mergedText = preparedDocuments
      .map((item) => item.extractedText?.trim())
      .filter((item): item is string => Boolean(item))
      .join("\n\n---\n\n")
      .trim();

    const timestamp = Date.now();
    const baseDir = path.join(
      process.cwd(),
      "public",
      "docs",
      "general-chat",
      `thread-${thread.id}`
    );
    await mkdir(baseDir, { recursive: true });
    const safeName = sanitizeAttachmentFileName(file.name || preparedDocuments[0]?.title || "attachment");
    const storedFileName = `${timestamp}-${safeName || "attachment"}`;
    const relativeStoragePath = `/docs/general-chat/thread-${thread.id}/${storedFileName}`;
    const absoluteStoragePath = path.join(baseDir, storedFileName);
    await writeFile(absoluteStoragePath, fileBuffer);

    const storedAttachment = await prisma.tenderChatAttachment.create({
      data: {
        threadId: thread.id,
        messageId: null,
        title: preparedDocuments[0]?.title || file.name,
        fileName: file.name,
        mimeType: file.type || "application/octet-stream",
        fileSize: file.size,
        storagePath: relativeStoragePath,
        documentKind: preparedDocuments[0]?.documentKind || "Документ",
        extractionNote: preparedDocuments[0]?.extractionNote || "Файл подготовлен к анализу.",
        extractedText: mergedText || null,
      },
    });

    return NextResponse.json({
      ok: true,
      preview: {
        attachmentId: storedAttachment.id,
        fileName: file.name,
        fileType: file.type || "application/octet-stream",
        documentKind: preparedDocuments[0]?.documentKind || "Документ",
        extracted: mergedText.length > 0,
        statusLabel: mergedText.length > 0 ? "Текст извлечён" : "Текст не извлечён",
        text: mergedText.slice(0, 6000),
        note: preparedDocuments[0]?.extractionNote || "Файл подготовлен к анализу.",
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
