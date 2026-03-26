import { TenderActionType, TenderProcurementStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { getCurrentTenderUser } from "@/lib/admin-auth";
import { getPrisma } from "@/lib/prisma";
import { tenderHasCapability } from "@/lib/tender-permissions";
import {
  buildTenderIntakeTitle,
  normalizeTenderString,
} from "@/lib/tender-intake";
import { logTenderEvent } from "@/lib/tender-workflow";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isArchiveFileName(fileName: string) {
  return /\.(zip|rar|7z)$/i.test(fileName.trim());
}

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentTenderUser();

    if (!currentUser || !tenderHasCapability(currentUser.role, "procurement_create")) {
      return NextResponse.json(
        { ok: false, error: "Недостаточно прав для создания закупки" },
        { status: 403 }
      );
    }

    const body = (await request.json().catch(() => ({}))) as {
      sourceUrl?: string | null;
      fileNames?: string[];
    };

    const sourceUrl = normalizeTenderString(body.sourceUrl);
    const uploadedNames = Array.isArray(body.fileNames)
      ? body.fileNames.filter((name): name is string => Boolean(name?.trim()))
      : [];

    if (uploadedNames.length === 0) {
      return NextResponse.json(
        { ok: false, error: "Нужно выбрать хотя бы один документ." },
        { status: 400 }
      );
    }

    if (uploadedNames.some(isArchiveFileName)) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Архивы ZIP/RAR/7Z загружать нельзя. Выбирайте только сами документы: PDF, DOC, DOCX, XLS, XLSX, TXT.",
        },
        { status: 400 }
      );
    }

    const prisma = getPrisma();
    const actorName =
      currentUser.name?.trim() || currentUser.email?.trim() || "Сотрудник";

    const record = await prisma.tenderProcurement.create({
      data: {
        title: buildTenderIntakeTitle({
          sourceUrl,
          uploadedNames,
        }),
        sourceUrl,
        status: TenderProcurementStatus.NEW,
        aiAnalysisStatus: "queued",
      },
    });

    await logTenderEvent({
      procurementId: record.id,
      actionType: TenderActionType.CREATED,
      title: "Закупка создана для загрузки документов",
      description: `Подготовлена новая карточка для пакета из ${uploadedNames.length} файлов.`,
      actorName,
    });

    return NextResponse.json({
      ok: true,
      procurementId: record.id,
    });
  } catch (error) {
    console.error("[tender-intake-start] failed", error);

    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Не удалось подготовить карточку закупки.",
      },
      { status: 500 }
    );
  }
}
