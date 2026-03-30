import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import AdmZip from "adm-zip";
import { NextResponse } from "next/server";
import { getCurrentTenderUser } from "@/lib/admin-auth";
import { getPrisma } from "@/lib/prisma";
import { tenderHasCapability } from "@/lib/tender-permissions";
import { prepareTenderUploadDocuments } from "@/lib/tender-intake";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SUPPORTED_ARCHIVE_PATTERN = /\.(zip|rar)$/i;
const SUPPORTED_DOC_PATTERN = /\.(pdf|doc|docx|xls|xlsx|txt|csv|md)$/i;

function sanitizeAttachmentFileName(fileName: string) {
  return fileName
    .replace(/[^\p{L}\p{N}._/-]+/gu, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 180);
}

function getMimeTypeByName(fileName: string) {
  const lower = fileName.toLowerCase();
  if (lower.endsWith(".pdf")) return "application/pdf";
  if (lower.endsWith(".docx")) return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  if (lower.endsWith(".doc")) return "application/msword";
  if (lower.endsWith(".xlsx")) return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
  if (lower.endsWith(".xls")) return "application/vnd.ms-excel";
  if (lower.endsWith(".txt")) return "text/plain";
  if (lower.endsWith(".csv")) return "text/csv";
  if (lower.endsWith(".md")) return "text/markdown";
  return "application/octet-stream";
}

async function extractZipEntries(buffer: Buffer) {
  const zip = new AdmZip(buffer);
  return zip
    .getEntries()
    .filter((entry) => !entry.isDirectory)
    .map((entry) => ({
      fileName: entry.entryName.split("/").filter(Boolean).join("/"),
      buffer: entry.getData(),
    }));
}

async function extractRarEntries(buffer: Buffer) {
  const unrar = await import("node-unrar-js");
  const extractor = await unrar.createExtractorFromData({
    data: Uint8Array.from(buffer).buffer,
  });
  const extracted = extractor.extract();
  return [...extracted.files]
    .filter((item) => !item.fileHeader.flags.directory && item.extraction)
    .map((item) => ({
      fileName: item.fileHeader.name,
      buffer: Buffer.from(item.extraction as Uint8Array),
    }));
}

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentTenderUser();

    if (!currentUser || !tenderHasCapability(currentUser.role, "procurement_comments")) {
      return NextResponse.json(
        { ok: false, error: "Недостаточно прав для распаковки архива." },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("archive");
    const threadId = Number(formData.get("threadId") ?? 0);

    if (!(file instanceof File) || file.size <= 0) {
      return NextResponse.json(
        { ok: false, error: "Архив не найден." },
        { status: 400 }
      );
    }

    if (!SUPPORTED_ARCHIVE_PATTERN.test(file.name)) {
      return NextResponse.json(
        { ok: false, error: "Сейчас поддерживаются архивы ZIP и RAR." },
        { status: 400 }
      );
    }

    if (!Number.isInteger(threadId) || threadId <= 0) {
      return NextResponse.json(
        { ok: false, error: "Не удалось определить ветку чата для архива." },
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

    const archiveBuffer = Buffer.from(await file.arrayBuffer());
    const extractedEntries = file.name.toLowerCase().endsWith(".zip")
      ? await extractZipEntries(archiveBuffer)
      : await extractRarEntries(archiveBuffer);

    const documentEntries = extractedEntries
      .filter((item) => SUPPORTED_DOC_PATTERN.test(item.fileName))
      .slice(0, 40);

    if (documentEntries.length === 0) {
      return NextResponse.json(
        { ok: false, error: "В архиве не найдено поддерживаемых документов." },
        { status: 400 }
      );
    }

    const baseDir = path.join(
      process.cwd(),
      "public",
      "docs",
      "general-chat",
      `thread-${thread.id}`
    );
    await mkdir(baseDir, { recursive: true });

    const createdAttachments = [];

    for (const entry of documentEntries) {
      const preparedDocuments = await prepareTenderUploadDocuments({
        name: entry.fileName,
        type: getMimeTypeByName(entry.fileName),
        size: entry.buffer.byteLength,
        buffer: entry.buffer,
      });

      const mergedText = preparedDocuments
        .map((item) => item.extractedText?.trim())
        .filter((item): item is string => Boolean(item))
        .join("\n\n---\n\n")
        .trim();

      const timestamp = Date.now();
      const safeName = sanitizeAttachmentFileName(entry.fileName || preparedDocuments[0]?.title || "attachment");
      const storedFileName = `${timestamp}-${safeName || "attachment"}`;
      const relativeStoragePath = `/docs/general-chat/thread-${thread.id}/${storedFileName}`;
      const absoluteStoragePath = path.join(baseDir, storedFileName);
      await writeFile(absoluteStoragePath, entry.buffer);

      const storedAttachment = await prisma.tenderChatAttachment.create({
        data: {
          threadId: thread.id,
          messageId: null,
          title: preparedDocuments[0]?.title || entry.fileName,
          fileName: entry.fileName,
          mimeType: getMimeTypeByName(entry.fileName),
          fileSize: entry.buffer.byteLength,
          storagePath: relativeStoragePath,
          documentKind: preparedDocuments[0]?.documentKind || "Документ",
          extractionNote: preparedDocuments[0]?.extractionNote || "Файл подготовлен к анализу.",
          extractedText: mergedText || null,
        },
      });

      createdAttachments.push({
        attachmentId: storedAttachment.id,
        fileName: entry.fileName,
        documentKind: preparedDocuments[0]?.documentKind || "Документ",
        extracted: mergedText.length > 0,
        statusLabel: mergedText.length > 0 ? "Текст извлечён" : "Текст не извлечён",
        note: preparedDocuments[0]?.extractionNote || "Файл подготовлен к анализу.",
        text: mergedText.slice(0, 3000),
      });
    }

    return NextResponse.json({
      ok: true,
      archiveName: file.name,
      attachments: createdAttachments,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error ? error.message : "Не удалось распаковать архив.",
      },
      { status: 500 }
    );
  }
}
