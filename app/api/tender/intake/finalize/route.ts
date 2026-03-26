import {
  TenderActionType,
  TenderProcurementStatus,
} from "@prisma/client";
import { spawn } from "node:child_process";
import { NextResponse } from "next/server";
import { getCurrentTenderUser } from "@/lib/admin-auth";
import { getPrisma } from "@/lib/prisma";
import { tenderHasCapability } from "@/lib/tender-permissions";
import { logTenderEvent } from "@/lib/tender-workflow";

function spawnTenderAnalysisJob(procurementId: number) {
  const internalToken = process.env.DATABASE_URL;
  const port = process.env.PORT || "3000";
  const script = `
    (async () => {
      try {
        const response = await fetch("http://127.0.0.1:${port}/api/tender/run-analysis", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-tender-internal-token": ${JSON.stringify(internalToken ?? "")}
          },
          body: JSON.stringify({ procurementId: ${procurementId} })
        });
        if (!response.ok) {
          const text = await response.text();
          throw new Error("[tender-intake-finalize] run-analysis failed: " + response.status + " " + text.slice(0, 400));
        }
        await response.text().catch(() => "");
      } catch (error) {
        console.error("[tender-intake-finalize] detached runner failed", error);
        process.exitCode = 1;
      }
    })();
  `;

  const child = spawn(
    process.execPath,
    ["-e", script],
    {
      cwd: process.cwd(),
      detached: true,
      stdio: "ignore",
      env: process.env,
    }
  );

  child.unref();
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentTenderUser();

    if (!currentUser || !tenderHasCapability(currentUser.role, "procurement_create")) {
      return NextResponse.json(
        { ok: false, error: "Недостаточно прав для запуска анализа" },
        { status: 403 }
      );
    }

    const body = (await request.json().catch(() => ({}))) as {
      procurementId?: number;
    };
    const procurementId = Number(body.procurementId);

    if (!Number.isInteger(procurementId) || procurementId <= 0) {
      return NextResponse.json(
        { ok: false, error: "Не удалось определить закупку для анализа." },
        { status: 400 }
      );
    }

    const prisma = getPrisma();
    const procurement = await prisma.tenderProcurement.findUnique({
      where: { id: procurementId },
      include: {
        sourceDocuments: {
          orderBy: { id: "asc" },
        },
      },
    });

    if (!procurement) {
      return NextResponse.json(
        { ok: false, error: "Закупка не найдена." },
        { status: 404 }
      );
    }

    const combinedSourceText = [
      procurement.sourceText?.trim(),
      ...procurement.sourceDocuments
        .map((doc) =>
          doc.contentSnippet?.trim()
            ? `Файл: ${doc.fileName}\n${doc.contentSnippet.trim()}`
            : null
        )
        .filter(Boolean),
    ]
      .filter(Boolean)
      .join("\n\n")
      .trim();

    if (!combinedSourceText) {
      const extractionWarnings = procurement.sourceDocuments
        .map((doc) => doc.note?.trim())
        .filter(Boolean)
        .join("\n");

      const message = extractionWarnings
        ? `Не удалось автоматически извлечь текст из загруженных файлов.\n${extractionWarnings}`
        : "Для первичного анализа не хватило текста документации.";

      await prisma.tenderProcurement.update({
        where: { id: procurementId },
        data: {
          aiAnalysisStatus: "needs_text",
          aiAnalysisError: message,
          sourceText: null,
        },
      });

      return NextResponse.json({
        ok: true,
        procurementId,
        status: "needs_text",
      });
    }

    await prisma.tenderProcurement.update({
      where: { id: procurementId },
      data: {
        sourceText: combinedSourceText,
        aiAnalysisStatus: "queued",
        aiAnalysisError: null,
        status: TenderProcurementStatus.ANALYSIS,
      },
    });

    await logTenderEvent({
      procurementId,
      actionType: TenderActionType.NOTE_ADDED,
      title: "Первичный анализ запущен",
      description: "Документация поставлена в очередь на автоматический разбор.",
      actorName: "AI",
    });

    spawnTenderAnalysisJob(procurementId);

    return NextResponse.json({
      ok: true,
      procurementId,
      status: "queued",
    });
  } catch (error) {
    console.error("[tender-intake-finalize] failed", error);

    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Не удалось завершить загрузку и запустить анализ.",
      },
      { status: 500 }
    );
  }
}
