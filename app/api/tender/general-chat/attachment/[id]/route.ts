import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { getCurrentTenderUser } from "@/lib/admin-auth";
import { getPrisma } from "@/lib/prisma";
import { tenderHasCapability } from "@/lib/tender-permissions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function guessContentType(fileName: string) {
  const normalized = fileName.toLowerCase();

  if (normalized.endsWith(".pdf")) return "application/pdf";
  if (normalized.endsWith(".docx")) {
    return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  }
  if (normalized.endsWith(".doc")) return "application/msword";
  if (normalized.endsWith(".xlsx")) {
    return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
  }
  if (normalized.endsWith(".xls")) return "application/vnd.ms-excel";
  if (normalized.endsWith(".txt")) return "text/plain; charset=utf-8";

  return "application/octet-stream";
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const currentUser = await getCurrentTenderUser();

  if (!currentUser || !tenderHasCapability(currentUser.role, "procurement_comments")) {
    return NextResponse.json({ ok: false, error: "Недостаточно прав." }, { status: 403 });
  }

  const { id } = await params;
  const attachmentId = Number(id);

  if (!Number.isInteger(attachmentId) || attachmentId <= 0) {
    return NextResponse.json({ ok: false, error: "Некорректный файл." }, { status: 400 });
  }

  const prisma = getPrisma();
  const attachment = await prisma.tenderChatAttachment.findFirst({
    where: {
      id: attachmentId,
      thread: {
        ownerId: currentUser.id,
      },
    },
    select: {
      id: true,
      fileName: true,
      title: true,
      mimeType: true,
      storagePath: true,
      extractedText: true,
    },
  });

  if (!attachment) {
    return NextResponse.json({ ok: false, error: "Файл не найден." }, { status: 404 });
  }

  if (!attachment.storagePath) {
    if (attachment.extractedText?.trim()) {
      return new NextResponse(attachment.extractedText.trim(), {
        status: 200,
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Content-Disposition": `inline; filename*=UTF-8''${encodeURIComponent(
            `${attachment.title || attachment.fileName}-preview.txt`
          )}`,
        },
      });
    }

    return NextResponse.json(
      { ok: false, error: "У файла нет сохранённого оригинала." },
      { status: 404 }
    );
  }

  const relativePath = attachment.storagePath.replace(/^\/+/, "");
  const absolutePath = path.join(process.cwd(), "public", relativePath);

  try {
    const fileBuffer = await readFile(absolutePath);
    const fileName = attachment.fileName?.trim() || attachment.title?.trim() || `attachment-${attachment.id}`;

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": attachment.mimeType || guessContentType(fileName),
        "Content-Disposition": `inline; filename*=UTF-8''${encodeURIComponent(fileName)}`,
        "Cache-Control": "private, max-age=60",
      },
    });
  } catch {
    if (attachment.extractedText?.trim()) {
      return new NextResponse(attachment.extractedText.trim(), {
        status: 200,
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Content-Disposition": `inline; filename*=UTF-8''${encodeURIComponent(
            `${attachment.title || attachment.fileName}-preview.txt`
          )}`,
          "Cache-Control": "private, max-age=60",
        },
      });
    }

    return NextResponse.json({ ok: false, error: "Файл не найден на диске." }, { status: 404 });
  }
}
