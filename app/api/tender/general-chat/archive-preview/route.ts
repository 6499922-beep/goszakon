import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import AdmZip from "adm-zip";
import { NextResponse } from "next/server";
import { getCurrentTenderUser } from "@/lib/admin-auth";
import { startTenderChatAttachmentPreparationJob } from "@/lib/tender-general-chat";
import { getPrisma } from "@/lib/prisma";
import { tenderHasCapability } from "@/lib/tender-permissions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SUPPORTED_ARCHIVE_PATTERN = /\.(zip|rar)$/i;
const SUPPORTED_DOC_PATTERN = /\.(pdf|doc|docx|docm|rtf|xls|xlsx|xlsm|txt|csv|md)$/i;
const NESTED_ARCHIVE_PATTERN = /\.(zip|rar)$/i;

function sanitizeAttachmentFileName(fileName: string) {
  return fileName
    .replace(/[^\p{L}\p{N}._/-]+/gu, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 180);
}

function normalizeArchiveEntryName(fileName: string) {
  return fileName.replace(/\\/g, "/").trim().replace(/\s+/g, " ");
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
      fileName: normalizeArchiveEntryName(entry.entryName.split("/").filter(Boolean).join("/")),
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
      fileName: normalizeArchiveEntryName(item.fileHeader.name),
      buffer: Buffer.from(item.extraction as Uint8Array),
    }));
}

async function extractArchiveEntries(buffer: Buffer, fileName: string) {
  return fileName.toLowerCase().endsWith(".zip")
    ? extractZipEntries(buffer)
    : extractRarEntries(buffer);
}

async function collectSupportedDocuments(
  entries: Array<{ fileName: string; buffer: Buffer }>,
  depth = 0
): Promise<Array<{ fileName: string; buffer: Buffer }>> {
  const documents: Array<{ fileName: string; buffer: Buffer }> = [];

  for (const entry of entries) {
    const normalizedName = normalizeArchiveEntryName(entry.fileName);

    if (SUPPORTED_DOC_PATTERN.test(normalizedName)) {
      documents.push({
        fileName: normalizedName,
        buffer: entry.buffer,
      });
      continue;
    }

    if (depth < 2 && NESTED_ARCHIVE_PATTERN.test(normalizedName)) {
      try {
        const nestedEntries = await extractArchiveEntries(entry.buffer, normalizedName);
        const nestedDocuments = await collectSupportedDocuments(nestedEntries, depth + 1);
        documents.push(...nestedDocuments);
      } catch {
        // quietly skip broken nested archives and continue with the rest
      }
    }
  }

  return documents;
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
    const extractedEntries = await extractArchiveEntries(archiveBuffer, file.name);
    const documentEntries = (await collectSupportedDocuments(extractedEntries))
      .slice(0, 60);

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
    const apiKey = process.env.OPENAI_API_KEY;
    const model = process.env.OPENAI_CHAT_MODEL || process.env.OPENAI_MODEL || "gpt-5";

    for (const entry of documentEntries) {
      const timestamp = Date.now();
      const safeName = sanitizeAttachmentFileName(entry.fileName || "attachment");
      const storedFileName = `${timestamp}-${safeName || "attachment"}`;
      const relativeStoragePath = `/docs/general-chat/thread-${thread.id}/${storedFileName}`;
      const absoluteStoragePath = path.join(baseDir, storedFileName);
      await writeFile(absoluteStoragePath, entry.buffer);

      const storedAttachment = await prisma.tenderChatAttachment.create({
        data: {
          threadId: thread.id,
          messageId: null,
          title: entry.fileName,
          fileName: entry.fileName,
          mimeType: getMimeTypeByName(entry.fileName),
          fileSize: entry.buffer.byteLength,
          storagePath: relativeStoragePath,
          documentKind: "Документ",
          extractionNote: "Файл загружен. Идёт чтение и разбор.",
          extractedText: null,
        },
      });

      if (apiKey) {
        startTenderChatAttachmentPreparationJob({
          attachmentId: storedAttachment.id,
          apiKey,
          model,
        });
      }

      createdAttachments.push({
        attachmentId: storedAttachment.id,
        fileName: entry.fileName,
        documentKind: "Документ",
        extracted: false,
        statusLabel: "Читаю файл...",
        note: "Файл загружен. Идёт чтение и подготовка к анализу.",
        text: "",
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
