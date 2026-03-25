import {
  TenderSourceDocumentAutofillStatus,
  TenderSourceDocumentStatus,
} from "@prisma/client";
import { NextResponse } from "next/server";
import { getCurrentTenderUser } from "@/lib/admin-auth";
import { getPrisma } from "@/lib/prisma";
import {
  extractTextFromTenderUpload,
  inferSourceDocumentKind,
  persistTenderUpload,
} from "@/lib/tender-intake";
import { tenderHasCapability } from "@/lib/tender-permissions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentTenderUser();

    if (!currentUser || !tenderHasCapability(currentUser.role, "procurement_create")) {
      return NextResponse.json(
        { ok: false, error: "Недостаточно прав для загрузки документов" },
        { status: 403 }
      );
    }

    const procurementId = Number(request.headers.get("x-procurement-id"));
    const rawFileName = request.headers.get("x-file-name")?.trim() || "document.bin";
    const fileName = decodeURIComponent(rawFileName);
    const fileType = request.headers.get("content-type")?.trim() || "";

    if (!Number.isInteger(procurementId) || procurementId <= 0) {
      return NextResponse.json(
        { ok: false, error: "Не удалось определить карточку закупки для файла." },
        { status: 400 }
      );
    }

    const arrayBuffer = await request.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (buffer.length === 0) {
      return NextResponse.json(
        { ok: false, error: `Файл "${fileName}" оказался пустым.` },
        { status: 400 }
      );
    }

    const prisma = getPrisma();
    const procurement = await prisma.tenderProcurement.findUnique({
      where: { id: procurementId },
      select: { id: true, sourceText: true },
    });

    if (!procurement) {
      return NextResponse.json(
        { ok: false, error: "Карточка закупки не найдена." },
        { status: 404 }
      );
    }

    const uploadedFile = {
      name: fileName,
      type: fileType,
      size: buffer.length,
      buffer,
    };

    const stored = await persistTenderUpload(uploadedFile);
    const { extractedText, extractionNote } = await extractTextFromTenderUpload(uploadedFile);

    await prisma.tenderSourceDocument.create({
      data: {
        procurementId,
        title: stored.originalFileName,
        fileName: stored.originalFileName,
        documentKind: inferSourceDocumentKind(stored.originalFileName),
        contentSnippet: extractedText?.slice(0, 4000) ?? null,
        status: extractedText
          ? TenderSourceDocumentStatus.READY_FOR_ANALYSIS
          : TenderSourceDocumentStatus.UPLOADED,
        autofillStatus: TenderSourceDocumentAutofillStatus.NOT_ANALYZED,
        note: extractionNote
          ? `${extractionNote}\nФайл сохранён: /${stored.storedRelativePath}`
          : `Файл сохранён: /${stored.storedRelativePath}`,
      },
    });

    if (extractedText?.trim()) {
      const nextSourceText = [procurement.sourceText?.trim(), `Файл: ${stored.originalFileName}\n${extractedText}`]
        .filter(Boolean)
        .join("\n\n")
        .trim();

      await prisma.tenderProcurement.update({
        where: { id: procurementId },
        data: {
          sourceText: nextSourceText,
        },
      });
    }

    return NextResponse.json({
      ok: true,
      procurementId,
      fileName: stored.originalFileName,
      extracted: Boolean(extractedText?.trim()),
      note: extractionNote,
    });
  } catch (error) {
    console.error("[tender-intake-file] failed", error);

    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Не удалось загрузить файл закупки.",
      },
      { status: 500 }
    );
  }
}
