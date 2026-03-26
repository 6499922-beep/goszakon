import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { getPrisma } from "@/lib/prisma";
import {
  ADMIN_COOKIE_NAME,
  createAdminSession,
  verifyAdminSession,
} from "@/lib/admin-auth";
import { isTenderHost } from "@/lib/tender-host";

type PageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function TenderSignInPage({ searchParams }: PageProps) {
  const headerStore = await headers();

  if (!isTenderHost(headerStore.get("host"))) {
    redirect("/");
  }

  const params = await searchParams;
  const cookieStore = await cookies();
  const existingSession = await verifyAdminSession(
    cookieStore.get(ADMIN_COOKIE_NAME)?.value
  );

  if (existingSession) {
    redirect("/");
  }

  async function signInAction(formData: FormData) {
    "use server";

    const headerStore = await headers();
    const email = String(formData.get("email") || "").trim().toLowerCase();
    const password = String(formData.get("password") || "");

    if (!email || !password) {
      redirect("/signin?error=1");
    }

    const prisma = getPrisma();
    const admin = await prisma.admin.findUnique({
      where: { email },
    });

    if (!admin) {
      redirect("/signin?error=1");
    }

    const passwordOk = await bcrypt.compare(password, admin.passwordHash);

    if (!passwordOk) {
      redirect("/signin?error=1");
    }

    const sessionValue = await createAdminSession(admin.id);
    const store = await cookies();
    const isSecureRequest = headerStore.get("x-forwarded-proto") === "https";

    store.set(ADMIN_COOKIE_NAME, sessionValue, {
      httpOnly: true,
      sameSite: "lax",
      secure: isSecureRequest,
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    redirect("/");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-6 py-16">
      <div className="grid w-full max-w-5xl gap-8 lg:grid-cols-[1.05fr_420px]">
        <section className="rounded-[2rem] bg-[#081a4b] p-10 text-white shadow-2xl">
          <div className="text-sm font-medium uppercase tracking-[0.18em] text-white/65">
            GOSZAKON Tender Desk
          </div>
          <h1 className="mt-6 max-w-2xl text-5xl font-bold leading-tight tracking-tight">
            Внутренний кабинет для анализа и подготовки заявок по 223-ФЗ.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/78">
            Здесь команда работает с закупками по этапам: загрузка документов,
            анализ, проверка правил и дальнейшая передача по процессу.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              "Загрузка и распознавание",
              "Правила и реестры",
              "Карточка закупки и чат",
            ].map((item) => (
              <div
                key={item}
                className="rounded-3xl border border-white/15 bg-white/10 p-5 text-sm font-medium leading-6"
              >
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
          <div className="text-sm font-medium uppercase tracking-[0.14em] text-slate-400">
            Авторизация
          </div>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#081a4b]">
            Вход в тендерный кабинет
          </h2>
          <p className="mt-3 text-base leading-7 text-slate-600">
            Используй существующую админскую учетную запись GOSZAKON. Позже мы
            добавим отдельные роли для операторов и проверяющих.
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
        </section>
      </div>
    </main>
  );
}
