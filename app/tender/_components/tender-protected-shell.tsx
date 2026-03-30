"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { TenderUserRole } from "@prisma/client";
import { TenderStageSwitcher } from "@/app/tender/_components/tender-stage-switcher";

type TenderProtectedShellProps = {
  children: React.ReactNode;
  links: Array<{ title: string; href: string }>;
  currentUserLabel: string;
  role: TenderUserRole | null;
};

export function TenderProtectedShell({
  children,
  links,
  currentUserLabel,
  role,
}: TenderProtectedShellProps) {
  const pathname = usePathname();
  const isGeneralChatPage = pathname === "/tender/chat" || pathname === "/chat";

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-6 px-6 py-4">
          <div>
            <div className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
              GOSZAKON Tender Desk
            </div>
            <div className="mt-1 text-xl font-bold tracking-tight text-[#081a4b]">
              {isGeneralChatPage ? "GPT-чат для сотрудников" : "Кабинет подготовки заявок"}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600 md:block">
              {currentUserLabel}
            </div>

            <form action="/logout" method="POST">
              <button
                type="submit"
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-50"
              >
                Выйти
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className={`mx-auto px-6 py-5 ${isGeneralChatPage ? "max-w-[1700px]" : "max-w-[1500px]"}`}>
        {!isGeneralChatPage ? (
          <>
            <section className="mb-5 rounded-[1.75rem] border border-slate-200 bg-white px-5 py-4 shadow-sm">
              <nav className="flex flex-wrap gap-2">
                {links.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="inline-flex rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-[#0d5bd7] hover:bg-white hover:text-[#0d5bd7]"
                  >
                    {item.title}
                  </Link>
                ))}
              </nav>
            </section>

            {role === TenderUserRole.ADMIN ? (
              <section className="mb-5 rounded-[1.75rem] border border-slate-200 bg-white px-5 py-4 shadow-sm">
                <div className="text-sm font-medium uppercase tracking-[0.14em] text-slate-400">
                  Этапы работы
                </div>
                <TenderStageSwitcher />
              </section>
            ) : null}
          </>
        ) : null}

        <section>{children}</section>
      </div>
    </div>
  );
}
