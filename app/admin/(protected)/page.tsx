import Link from "next/link";
import { getPrisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const prisma = getPrisma();

  const [casesCount, publishedCasesCount, analyticsCount, leadsCount] =
    await Promise.all([
      prisma.case.count(),
      prisma.case.count({ where: { published: true } }),
      prisma.material.count(),
      prisma.lead.count(),
    ]);

  const recentCases = await prisma.case.findMany({
    orderBy: { updatedAt: "desc" },
    take: 5,
  });

  const recentAnalytics = await prisma.material.findMany({
    orderBy: { updatedAt: "desc" },
    take: 5,
  });

  return (
    <main>
      <div className="mb-8">
        <div className="text-sm font-medium uppercase tracking-[0.14em] text-slate-400">
          Админка
        </div>
        <h1 className="mt-2 text-4xl font-bold tracking-tight text-[#081a4b]">
          Обзор проекта
        </h1>
        <p className="mt-2 text-base text-slate-600">
          Быстрый доступ к практике ФАС, аналитике и заявкам.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="text-sm uppercase tracking-[0.12em] text-slate-400">
            Кейсы ФАС
          </div>
          <div className="mt-3 text-4xl font-bold tracking-tight text-[#081a4b]">
            {casesCount}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="text-sm uppercase tracking-[0.12em] text-slate-400">
            Опубликованные кейсы
          </div>
          <div className="mt-3 text-4xl font-bold tracking-tight text-emerald-700">
            {publishedCasesCount}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="text-sm uppercase tracking-[0.12em] text-slate-400">
            Публикации аналитики
          </div>
          <div className="mt-3 text-4xl font-bold tracking-tight text-[#081a4b]">
            {analyticsCount}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="text-sm uppercase tracking-[0.12em] text-slate-400">
            Заявки
          </div>
          <div className="mt-3 text-4xl font-bold tracking-tight text-[#081a4b]">
            {leadsCount}
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_1fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-[#081a4b]">Последние кейсы</h2>
              <p className="mt-1 text-sm text-slate-500">
                Последние обновлённые карточки практики ФАС.
              </p>
            </div>

            <Link
              href="/admin/cases"
              className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Все кейсы
            </Link>
          </div>

          {recentCases.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-500">
              Кейсов пока нет.
            </div>
          ) : (
            <div className="space-y-3">
              {recentCases.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="min-w-0">
                    <div className="font-semibold text-[#081a4b]">{item.title}</div>
                    <div className="mt-1 text-sm text-slate-500">{item.slug}</div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                        item.published
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {item.published ? "Опубликован" : "Черновик"}
                    </span>

                    <Link
                      href={`/admin/cases/${item.id}/edit`}
                      className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-white"
                    >
                      Редактировать
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-[#081a4b]">Последняя аналитика</h2>
              <p className="mt-1 text-sm text-slate-500">
                Свежие публикации, инструкции и разборы.
              </p>
            </div>

            <Link
              href="/admin/materials"
              className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Вся аналитика
            </Link>
          </div>

          {recentAnalytics.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-500">
              Публикаций пока нет.
            </div>
          ) : (
            <div className="space-y-3">
              {recentAnalytics.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="min-w-0">
                    <div className="font-semibold text-[#081a4b]">{item.title}</div>
                    <div className="mt-1 text-sm text-slate-500">{item.slug}</div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                        item.isPublished
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {item.isPublished ? "Опубликована" : "Черновик"}
                    </span>

                    <Link
                      href={`/admin/materials/${item.id}/edit`}
                      className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-white"
                    >
                      Редактировать
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-[#081a4b]">Быстрые действия</h2>
        <p className="mt-2 text-sm text-slate-500">
          Самые частые сценарии работы в админке.
        </p>

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          <Link
            href="/admin/cases/new"
            className="block rounded-2xl bg-[#081a4b] px-5 py-4 text-sm font-semibold text-white transition hover:bg-[#0d2568]"
          >
            Создать новый кейс
          </Link>

          <Link
            href="/admin/materials/new"
            className="block rounded-2xl border border-slate-300 bg-white px-5 py-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Создать публикацию
          </Link>

          <Link
            href="/admin/leads"
            className="block rounded-2xl border border-slate-300 bg-white px-5 py-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Посмотреть заявки
          </Link>
        </div>
      </div>
    </main>
  );
}