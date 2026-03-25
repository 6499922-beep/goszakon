import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { getCurrentTenderUser } from "@/lib/admin-auth";
import { getPrisma } from "@/lib/prisma";
import { tenderHasCapability } from "@/lib/tender-permissions";

function extractStoredDocumentPath(note: string | null | undefined) {
  const match = note?.match(/Файл сохранён:\s*(\/[^\s]+)/);
  return match?.[1] ?? null;
}

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
  if (normalized.endsWith(".zip")) return "application/zip";
  if (normalized.endsWith(".rar")) return "application/vnd.rar";

  return "application/octet-stream";
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const currentUser = await getCurrentTenderUser();

  if (!currentUser || !tenderHasCapability(currentUser.role, "procurement_create")) {
    return NextResponse.json({ ok: false, error: "Недостаточно прав." }, { status: 403 });
  }

  const { id } = await params;
  const documentId = Number(id);

  if (!Number.isInteger(documentId) || documentId <= 0) {
    return NextResponse.json({ ok: false, error: "Некорректный документ." }, { status: 400 });
  }

  const prisma = getPrisma();
  const document = await prisma.tenderSourceDocument.findUnique({
    where: { id: documentId },
    select: {
      id: true,
      fileName: true,
      title: true,
      note: true,
      contentSnippet: true,
    },
  });

  if (!document) {
    return NextResponse.json({ ok: false, error: "Документ не найден." }, { status: 404 });
  }

  const storedPath = extractStoredDocumentPath(document.note);
  if (!storedPath) {
    return NextResponse.json(
      { ok: false, error: "У документа не найден сохранённый путь." },
      { status: 404 }
    );
  }

  const relativePath = storedPath.replace(/^\/+/, "");
  const absolutePath = path.join(process.cwd(), "public", relativePath);

  try {
    const fileBuffer = await readFile(absolutePath);
    const fileName = document.fileName?.trim() || document.title?.trim() || `document-${document.id}`;

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": guessContentType(fileName),
        "Content-Disposition": `inline; filename*=UTF-8''${encodeURIComponent(fileName)}`,
        "Cache-Control": "private, max-age=60",
      },
    });
  } catch {
    if (document.contentSnippet?.trim()) {
      const fallbackName =
        (document.fileName?.replace(/\.[^.]+$/, "") || document.title || `document-${document.id}`) +
        "-preview.txt";

      return new NextResponse(document.contentSnippet.trim(), {
        status: 200,
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Content-Disposition": `inline; filename*=UTF-8''${encodeURIComponent(fallbackName)}`,
          "Cache-Control": "private, max-age=60",
        },
      });
    }

    return NextResponse.json(
      { ok: false, error: "Файл не найден на диске." },
      { status: 404 }
    );
  }
}
