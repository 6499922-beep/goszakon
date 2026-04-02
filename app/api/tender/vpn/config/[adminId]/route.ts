import { NextResponse } from "next/server";
import { getCurrentTenderUser } from "@/lib/admin-auth";
import { getPrisma } from "@/lib/prisma";
import { tenderHasCapability } from "@/lib/tender-permissions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: { params: Promise<{ adminId: string }> }
) {
  const currentUser = await getCurrentTenderUser();

  if (!currentUser || !tenderHasCapability(currentUser.role, "vpn_manage")) {
    return NextResponse.json({ ok: false, error: "Недостаточно прав." }, { status: 403 });
  }

  const params = await context.params;
  const adminId = Number(params.adminId ?? 0);

  if (!Number.isInteger(adminId) || adminId <= 0) {
    return NextResponse.json({ ok: false, error: "Некорректный пользователь." }, { status: 400 });
  }

  const prisma = getPrisma();
  const profile = await prisma.tenderVpnProfile.findUnique({
    where: { adminId },
    select: {
      label: true,
      configText: true,
      isActive: true,
    },
  });

  if (!profile || !profile.isActive) {
    return NextResponse.json({ ok: false, error: "VPN-профиль не найден." }, { status: 404 });
  }

  const safeName = profile.label.replace(/[^\p{L}\p{N}._-]+/gu, "-");

  return new NextResponse(profile.configText, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": `attachment; filename="${safeName || "wireguard"}.conf"`,
      "Cache-Control": "no-store",
    },
  });
}
