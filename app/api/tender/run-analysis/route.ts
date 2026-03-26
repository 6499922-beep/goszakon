import { NextResponse } from "next/server";
import { kickTenderAnalysisRunner } from "@/lib/tender-analysis-runner";
import { getPrisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const providedToken = request.headers.get("x-tender-internal-token");
  const expectedToken = process.env.DATABASE_URL;

  if (!providedToken || !expectedToken || providedToken !== expectedToken) {
    return NextResponse.json(
      { ok: false, error: "Недостаточно прав для внутреннего запуска анализа" },
      { status: 403 }
    );
  }

  const body = (await request.json().catch(() => ({}))) as {
    procurementId?: number;
  };
  const procurementId = Number(body.procurementId);

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
    },
  });

  if (!procurement?.sourceText?.trim()) {
    return NextResponse.json(
      { ok: false, error: "Для закупки не найден исходный текст" },
      { status: 400 }
    );
  }

  await prisma.tenderProcurement.update({
    where: { id: procurementId },
    data: {
      aiAnalysisStatus: "queued",
      aiAnalysisError: null,
    },
  });

  kickTenderAnalysisRunner();

  return NextResponse.json({ ok: true, started: true });
}
