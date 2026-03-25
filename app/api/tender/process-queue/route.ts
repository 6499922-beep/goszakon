import { NextResponse } from "next/server";
import { getCurrentTenderUser } from "@/lib/admin-auth";
import { getPrisma } from "@/lib/prisma";
import { tenderHasCapability } from "@/lib/tender-permissions";
import { enqueueTenderPrimaryAnalysisJob } from "@/lib/tender-primary-analysis";

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

  if (
    procurement.aiAnalysisStatus === "running" ||
    procurement.aiAnalysisStatus === "completed"
  ) {
    return NextResponse.json({
      ok: true,
      skipped: true,
      reason: procurement.aiAnalysisStatus,
    });
  }

  enqueueTenderPrimaryAnalysisJob({
    procurementId,
    sourceText: procurement.sourceText,
  });

  return NextResponse.json({ ok: true, started: true });
}
