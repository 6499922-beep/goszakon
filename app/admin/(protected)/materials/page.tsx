import Link from "next/link";
import { MaterialType } from "@prisma/client";
import { getPrisma } from "@/lib/prisma";
import { materialTypeLabels } from "@/lib/materials";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{
    q?: string;
    type?: string;
    status?: string;
    featured?: string;
    page?: string;
  }>;
};

const PAGE_SIZE = 20;

function formatDate(value?: Date | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("ru-RU").format(value);
}

export default async function AdminMaterialsPage({ searchParams }: PageProps) {
  const prisma = getPrisma();
  const params = await searchParams;

  const q = (params.q || "").trim();
  const type = (params.type || "").trim();
  const status = (params.status || "").trim();
  const featured = (params.featured || "").trim();
  const page = Math.max(Number(params.page || "1") || 1, 1);

  const where: any = {};

  if (q) {
    where.OR = [
      { title: { contains: q } },
      { slug: { contains: q } },
      { excerpt: { contains: q } },
      { topic: { contains: q } },
      { authority: { contains: q } },
      { outcome: { contains: q } },
      { caseNumber: { contains: q } },
      { sourceName: { contains: q } },
      { body: { contains: q } },
    ];
  }

  if (type) where.type = type;
  if (status === "published") where.isPublished = true;
  if (status === "draft") where.isPublished = false;
  if (featured === "yes") where.isFeatured = true;
  if (featured === "no") where.isFeatured = false;

  const [materials, totalCount, publishedCount, draftCount, featuredCount] =
    await Promise.all([
      prisma.material.findMany({
        where,
        orderBy: [
          { decisionDate: "desc" },
          { isFeatured: "desc" },
          { updatedAt: "desc" },
        ],
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
      }),
      prisma.material.count({ where }),
      prisma.material.count({ where: { isPublished: true } }),
      prisma.material.count({ where: { isPublished: false } }),
      prisma.material.count({ where: { isFeatured: true } }),
    ]);

  const totalPages = Math.max(Math.ceil(totalCount / PAGE_SIZE), 1);

  function buildPageLink(nextPage: number) {
    const query = new URLSearchParams();
    if (q) query.set("q", q);
    if (type) query.set("type", type);
    if (status) query.set("status", status);
    if (featured) query.set("featured", featured);
    query.set("page", String(nextPage));
    return `/admin/materials?${query.toString()}`;
  }

  const typeOptions: MaterialType[] = [
    "ANALYTICS",
    "FAS_PRACTICE",
    "VIOLATIONS",
    "CONTROVERSIAL",
    "NONPAYMENT",
    "RNP",
    "CUSTOMERS",
    "COMPLAINT",
    "COURT",
  ];

  return (
    <main>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="max-w-3xl">
          <div className="text-sm font-medium uppercase tracking-[0.14em] text-slate-400">
            Админка
          </div>
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-[#081a4b]">
            Аналитика
          </h1>
          <p className="mt-2 text-base text-slate-600">
            Публикации, разборы, комментарии к практике и аналитические материалы.
          </p>
        </div>

        <div className="flex gap-3">
          <Link
            href="/admin"
            className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Назад
          </Link>
          <Link
            href="/admin/materials/new"
            className="rounded-2xl bg-[#081a4b] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0d2568]"
          >
            Новая публикация
          </Link>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="text-sm uppercase tracking-[0.12em] text-slate-400">
            Всего
          </div>
          <div className="mt-3 text-4xl font-bold tracking-tight text-[#081a4b]">
            {totalCount}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="text-sm uppercase tracking-[0.12em] text-slate-400">
            Опубликовано
          </div>
          <div className="mt-3 text-4xl font-bold tracking-tight text-emerald-700">
            {publishedCount}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="text-sm uppercase tracking-[0.12em] text-slate-400">
            Черновики
          </div>
          <div className="mt-3 text-4xl font-bold tracking-tight text-amber-700">
            {draftCount}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="text-sm uppercase tracking-[0.12em] text-slate-400">
            Важные
          </div>
          <div className="mt-3 text-4xl font-bold tracking-tight text-[#081a4b]">
            {featuredCount}
          </div>
        </div>
      </div>

      <form
        method="GET"
        className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="grid gap-4 xl:grid-cols-[2fr_1fr_1fr_1fr_auto]">
          <div className="xl:col-span-2">
            <label className="block text-sm font-medium text-slate-700">
              Поиск
            </label>
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="Заголовок, slug, тема, орган, номер дела..."
              className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Тип публикации
            </label>
            <select
              name="type"
              defaultValue={type}
              className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
            >
              <option value="">Все</option>
              {typeOptions.map((item) => (
                <option key={item} value={item}>
                  {materialTypeLabels[item]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Статус
            </label>
            <select
              name="status"
              defaultValue={status}
              className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
            >
              <option value="">Все</option>
              <option value="published">Опубликовано</option>
              <option value="draft">Черновики</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Важность
            </label>
            <select
              name="featured"
              defaultValue={featured}
              className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
            >
              <option value="">Все</option>
              <option value="yes">Только важные</option>
              <option value="no">Только обычные</option>
            </select>
          </div>

          <div className="flex items-end gap-3 xl:col-span-5">
            <button
              type="submit"
              className="rounded-2xl bg-[#081a4b] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0d2568]"
            >
              Применить
            </button>

            <Link
              href="/admin/materials"
              className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Сбросить
            </Link>
          </div>
        </div>
      </form>

      <div className="mt-8 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full border-collapse text-left">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-5 py-4 text-sm font-semibold text-slate-600">ID</th>
              <th className="px-5 py-4 text-sm font-semibold text-slate-600">
                Публикация
              </th>
              <th className="px-5 py-4 text-sm font-semibold text-slate-600">
                Классификация
              </th>
              <th className="px-5 py-4 text-sm font-semibold text-slate-600">
                Статус
              </th>
              <th className="px-5 py-4 text-sm font-semibold text-slate-600">
                Обновлён
              </th>
              <th className="px-5 py-4 text-sm font-semibold text-slate-600">
                Действия
              </th>
            </tr>
          </thead>
          <tbody>
            {materials.map((item) => (
              <tr key={item.id} className="border-t border-slate-100">
                <td className="px-5 py-4 text-sm text-slate-600">{item.id}</td>

                <td className="px-5 py-4">
                  <div className="font-semibold text-[#081a4b]">{item.title}</div>
                  <div className="mt-1 text-sm text-slate-500">{item.slug}</div>
                  {item.excerpt ? (
                    <div className="mt-2 line-clamp-2 text-sm text-slate-500">
                      {item.excerpt}
                    </div>
                  ) : null}
                </td>

                <td className="px-5 py-4 text-sm text-slate-700">
                  <div>Тип: {materialTypeLabels[item.type]}</div>
                  {item.topic ? (
                    <div className="mt-1 text-slate-500">Тема: {item.topic}</div>
                  ) : null}
                  {item.authority ? (
                    <div className="mt-1 text-slate-500">Орган: {item.authority}</div>
                  ) : null}
                  {item.caseNumber ? (
                    <div className="mt-1 text-slate-500">Дело: {item.caseNumber}</div>
                  ) : null}
                  {item.decisionDate ? (
                    <div className="mt-1 text-slate-500">
                      Дата решения: {formatDate(item.decisionDate)}
                    </div>
                  ) : null}
                </td>

                <td className="px-5 py-4">
                  <div className="flex flex-col gap-2">
                    <span
                      className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold ${
                        item.isPublished
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {item.isPublished ? "Опубликовано" : "Черновик"}
                    </span>

                    {item.isFeatured ? (
                      <span className="inline-flex w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                        Важная
                      </span>
                    ) : null}
                  </div>
                </td>

                <td className="px-5 py-4 text-sm text-slate-500">
                  {formatDate(item.updatedAt)}
                </td>

                <td className="px-5 py-4">
                  <div className="flex flex-col gap-2">
                    <Link
                      href={`/admin/materials/${item.id}/edit`}
                      className="rounded-xl border border-slate-300 px-3 py-2 text-center text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                    >
                      Редактировать
                    </Link>

                    {item.isPublished ? (
                      <Link
                        href={`/analitika/${item.slug}`}
                        className="rounded-xl border border-slate-300 px-3 py-2 text-center text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                      >
                        Открыть
                      </Link>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 ? (
        <div className="mt-8 flex items-center justify-center gap-3">
          {page > 1 ? (
            <Link
              href={buildPageLink(page - 1)}
              className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              ← Назад
            </Link>
          ) : null}

          <div className="text-sm text-slate-500">
            Страница {page} из {totalPages}
          </div>

          {page < totalPages ? (
            <Link
              href={buildPageLink(page + 1)}
              className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Вперёд →
            </Link>
          ) : null}
        </div>
      ) : null}
    </main>
  );
}