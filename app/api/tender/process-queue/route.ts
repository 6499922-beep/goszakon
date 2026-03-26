import { NextResponse } from "next/server";
import { getCurrentTenderUser } from "@/lib/admin-auth";
import { kickTenderAnalysisRunner } from "@/lib/tender-analysis-runner";
import { getPrisma } from "@/lib/prisma";
import { tenderHasCapability } from "@/lib/tender-permissions";

const STALE_ANALYSIS_MINUTES = 10;

function isStaleRunningAnalysis(status: string | null, updatedAt: Date) {
  if (status !== "running") return false;

  const ageMinutes = Math.max(
    0,
    Math.round((Date.now() - updatedAt.getTime()) / 60000)
  );

  return ageMinutes >= STALE_ANALYSIS_MINUTES;
}

export async function POST(request: Request) {
  const currentUser = await getCurrentTenderUser();

  if (!currentUser || !tenderHasCapability(currentUser.role, "procurement_initial")) {
    return NextResponse.json(
      { ok: false, error: "Недостаточно прав для запуска анализа" },
      { status: 403 }
    );
  }

  const body = await request.json().catch(() => null);
  const procurementId = Number(body?.procurementId);

  if (!Number.isInteger(procurementId) || procurementId <= 0) {
    return NextResponse.json(
      { ok: false, error: "Некорректный идентификатор закупки" },
      { status: 400 }
    );
  }

  const prisma = getPrisma();
  const procurement = await prisma.tenderProcurement.findUnique({
    where: { id: procurementId },
    select: {
      id: true,
      sourceText: true,
      aiAnalysisStatus: true,
      updatedAt: true,
    },
  });

  if (!procurement) {
    return NextResponse.json(
      { ok: false, error: "Закупка не найдена" },
      { status: 404 }
    );
  }

  if (!procurement.sourceText?.trim()) {
    return NextResponse.json({
      ok: true,
      skipped: true,
      reason: "no_source_text",
    });
  }

  if (procurement.aiAnalysisStatus === "completed") {
    return NextResponse.json({
      ok: true,
      skipped: true,
      reason: "completed",
    });
  }

  if (
    procurement.aiAnalysisStatus === "running" &&
    !isStaleRunningAnalysis(procurement.aiAnalysisStatus, procurement.updatedAt)
  ) {
    return NextResponse.json({
      ok: true,
      skipped: true,
      reason: "running",
    });
  }

  if (isStaleRunningAnalysis(procurement.aiAnalysisStatus, procurement.updatedAt)) {
    await prisma.tenderProcurement.update({
      where: { id: procurementId },
      data: {
        aiAnalysisStatus: "retrying",
        aiAnalysisError:
          "Анализ занял слишком много времени. Система автоматически перевела закупку на повторный анализ.",
      },
    });
  }

  kickTenderAnalysisRunner();

  return NextResponse.json({ ok: true, started: true });
}
