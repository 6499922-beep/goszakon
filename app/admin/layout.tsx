import Link from "next/link";
import { ReactNode } from "react";

export default function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const links = [
    { title: "Обзор", href: "/admin" },
    { title: "Кейсы ФАС", href: "/admin/cases" },
    { title: "Новый кейс", href: "/admin/cases/new" },
    { title: "Аналитика", href: "/admin/materials" },
    { title: "Новая публикация", href: "/admin/materials/new" },
    { title: "Заявки", href: "/admin/leads" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <div className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
              GOSZAKON
            </div>
            <div className="mt-1 text-2xl font-bold text-[#081a4b]">
              Админ-панель
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-50"
            >
              На сайт
            </Link>

            <form action="/admin/logout" method="POST">
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

      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-8 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <nav className="space-y-2">
            {links.map((item) => (
              <Link
                key={item.href + item.title}
                href={item.href}
                className="block rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                {item.title}
              </Link>
            ))}
          </nav>
        </aside>

        <section>{children}</section>
      </div>
    </div>
  );
}
