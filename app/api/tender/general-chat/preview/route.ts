import { NextResponse } from "next/server";
import { getCurrentTenderUser } from "@/lib/admin-auth";
import { tenderHasCapability } from "@/lib/tender-permissions";
import { prepareTenderUploadDocuments } from "@/lib/tender-intake";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ARCHIVE_FILE_PATTERN = /\.(zip|rar|7z)$/i;

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

    const preparedDocuments = await prepareTenderUploadDocuments({
      name: file.name,
      type: file.type || "application/octet-stream",
      size: file.size,
      buffer: Buffer.from(await file.arrayBuffer()),
    });

    const mergedText = preparedDocuments
      .map((item) => item.extractedText?.trim())
      .filter((item): item is string => Boolean(item))
      .join("\n\n---\n\n")
      .trim();

    return NextResponse.json({
      ok: true,
      preview: {
        fileName: file.name,
        fileType: file.type || "application/octet-stream",
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
