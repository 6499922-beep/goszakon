import { NextResponse } from "next/server";
import { spawn } from "node:child_process";
import { getCurrentTenderUser } from "@/lib/admin-auth";
import { getPrisma } from "@/lib/prisma";
import { tenderHasCapability } from "@/lib/tender-permissions";

function spawnTenderAnalysisJob(procurementId: number) {
  const internalToken = process.env.DATABASE_URL;
  const port = process.env.PORT || "3000";
  const script = `
    fetch("http://127.0.0.1:${port}/api/tender/run-analysis", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-tender-internal-token": ${JSON.stringify(internalToken ?? "")}
      },
      body: JSON.stringify({ procurementId: ${procurementId} })
    }).catch((error) => {
      console.error("[tender-process-queue] detached runner failed", error);
      process.exitCode = 1;
    });
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

  spawnTenderAnalysisJob(procurementId);

  return NextResponse.json({ ok: true, started: true });
}
