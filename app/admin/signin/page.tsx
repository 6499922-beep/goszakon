import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { getPrisma } from "@/lib/prisma";
import { isAdminPanelEnabled } from "@/lib/admin-access";
import {
  ADMIN_COOKIE_NAME,
  createAdminSession,
  verifyAdminSession,
} from "@/lib/admin-auth";

type PageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function AdminSignInPage({ searchParams }: PageProps) {
  if (!isAdminPanelEnabled()) {
    notFound();
  }

  const params = await searchParams;
  const cookieStore = await cookies();
  const existingSession = await verifyAdminSession(
    cookieStore.get(ADMIN_COOKIE_NAME)?.value
  );

  if (existingSession) {
    redirect("/admin");
  }

  async function signInAction(formData: FormData) {
    "use server";

    const email = String(formData.get("email") || "").trim().toLowerCase();
    const password = String(formData.get("password") || "");

    if (!email || !password) {
      redirect("/admin/signin?error=1");
    }

    const prisma = getPrisma();
    const admin = await prisma.admin.findUnique({
      where: { email },
    });

    if (!admin) {
      redirect("/admin/signin?error=1");
    }

    const passwordOk = await bcrypt.compare(password, admin.passwordHash);

    if (!passwordOk) {
      redirect("/admin/signin?error=1");
    }

    const sessionValue = await createAdminSession(admin.id);
    const store = await cookies();

    store.set(ADMIN_COOKIE_NAME, sessionValue, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    redirect("/admin");
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-16 text-slate-900">
      <div className="mx-auto max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="text-sm font-medium uppercase tracking-[0.14em] text-slate-400">
          GOSZAKON
        </div>

        <h1 className="mt-3 text-4xl font-bold tracking-tight text-[#081a4b]">
          Вход в админку
        </h1>

        <p className="mt-3 text-base text-slate-600">
          Введите email и пароль администратора.
        </p>

        {params.error ? (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            Неверный email или пароль.
          </div>
        ) : null}

        <form action={signInAction} className="mt-8 space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              type="email"
              name="email"
              required
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
              placeholder="admin@goszakon.ru"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Пароль
            </label>
            <input
              type="password"
              name="password"
              required
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-2xl bg-[#081a4b] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#0d2568]"
          >
            Войти
          </button>
        </form>
      </div>
    </main>
  );
}
