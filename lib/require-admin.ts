import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, verifyAdminSession } from "@/lib/admin-auth";
import { isAdminPanelEnabled } from "@/lib/admin-access";

export type AdminGuardResult =
  | {
      ok: true;
      session: {
        adminId: number;
        expiresAt: number;
      };
    }
  | {
      ok: false;
      response: NextResponse;
    };

export async function requireAdmin(): Promise<AdminGuardResult> {
  if (!isAdminPanelEnabled()) {
    return {
      ok: false,
      response: NextResponse.json(
        { ok: false, error: "Not found" },
        { status: 404 }
      ),
    };
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  const session = await verifyAdminSession(token);

  if (!session) {
    return {
      ok: false,
      response: NextResponse.json(
        { ok: false, error: "Не авторизован" },
        { status: 401 }
      ),
    };
  }

  return {
    ok: true,
    session,
  };
}
