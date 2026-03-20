import Link from "next/link";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getPrisma } from "@/lib/prisma";
import { slugifyCase } from "@/lib/case-admin";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{
    q?: string;
    status?: string;
    featured?: string;
    sort?: string;
    page?: string;
    created?: string;
    updated?: string;
    deleted?: string;
    published_changed?: string;
  }>;
};

const PAGE_SIZE = 20;

function formatDate(value?: Date | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("ru-RU").format(value);
}

function buildOrderBy(sort: string): Prisma.CaseOrderByWithRelationInput[] {
  if (sort === "customerName") {
    return [
      { customerName: "asc" },
      { decisionDate: "desc" },
      { updatedAt: "desc" },
    ];
  }

  if (sort === "procurementNumber") {
    return [
      { procurementNumber: "asc" },
      { decisionDate: "desc" },
      { updatedAt: "desc" },
    ];
  }

  if (sort === "updatedAt") {
    return [{ updatedAt: "desc" }];
  }

  return [
    { decisionDate: "desc" },
    { isFeatured: "desc" },
    { updatedAt: "desc" },
  ];
}

export default async function AdminCasesPage({ searchParams }: PageProps) {
  const prisma = getPrisma();
  const params = await searchParams;

  const q = (params.q || "").trim();
  const status = (params.status || "").trim();
  const featured = (params.featured || "").trim();
  const sort = (params.sort || "decisionDate").trim();
  const page = Math.max(Number(params.page || "1") || 1, 1);
  const created = params.created === "1";
  const updated = params.updated === "1";
  const deleted = params.deleted === "1";
  const publishedChanged = params.published_changed === "1";

  async function deleteCaseAction(formData: FormData) {
    "use server";

    const caseId = Number(formData.get("caseId"));

    if (!Number.isInteger(caseId) || caseId <= 0) {
      redirect("/admin/cases");
    }

    const prisma = getPrisma();
    const item = await prisma.case.findUnique({
      where: { id: caseId },
      select: { customerInn: true },
    });

    await prisma.case.delete({
      where: { id: caseId },
    });

    revalidatePath("/admin");
    revalidatePath("/admin/cases");
    revalidatePath("/cases");
    revalidatePath("/zakazchikam");
    if (item?.customerInn) {
      revalidatePath(`/zakazchik/${item.customerInn}`);
    }
    redirect("/admin/cases?deleted=1");
  }

  async function togglePublishedAction(formData: FormData) {
    "use server";

    const caseId = Number(formData.get("caseId"));

    if (!Number.isInteger(caseId) || caseId <= 0) {
      redirect("/admin/cases");
    }

    const prisma = getPrisma();
    const item = await prisma.case.findUnique({
      where: { id: caseId },
      select: { published: true, customerInn: true },
    });

    if (!item) {
      redirect("/admin/cases");
    }

    await prisma.case.update({
      where: { id: caseId },
      data: {
        published: !item.published,
      },
    });

    revalidatePath("/admin");
    revalidatePath("/admin/cases");
    revalidatePath("/cases");
    revalidatePath("/zakazchikam");
    if (item.customerInn) {
      revalidatePath(`/zakazchik/${item.customerInn}`);
    }
    redirect("/admin/cases?published_changed=1");
  }

  async function duplicateCaseAction(formData: FormData) {
    "use server";

    const caseId = Number(formData.get("caseId"));

    if (!Number.isInteger(caseId) || caseId <= 0) {
      redirect("/admin/cases");
    }

    const prisma = getPrisma();
    const source = await prisma.case.findUnique({
      where: { id: caseId },
    });

    if (!source) {
      redirect("/admin/cases");
    }

    const baseSlug = source.slug || slugifyCase(source.title) || `case-${source.id}`;
    const duplicateSuffix = Date.now().toString().slice(-6);

    const duplicated = await prisma.case.create({
      data: {
        ...source,
        id: undefined,
        slug: `${baseSlug}-copy-${duplicateSuffix}`,
        title: `${source.title} (копия)`,
        published: false,
        isFeatured: false,
        createdAt: undefined,
        updatedAt: undefined,
      },
      select: { id: true },
    });

    revalidatePath("/admin");
    revalidatePath("/admin/cases");

    redirect(`/admin/cases/${duplicated.id}/edit?duplicated=1`);
  }

  const where: Prisma.CaseWhereInput = {};

  if (q) {
    where.OR = [
      { title: { contains: q, mode: Prisma.QueryMode.insensitive } },
      { slug: { contains: q, mode: Prisma.QueryMode.insensitive } },
      { procurementNumber: { contains: q, mode: Prisma.QueryMode.insensitive } },
      { customerName: { contains: q, mode: Prisma.QueryMode.insensitive } },
      { customerInn: { contains: q, mode: Prisma.QueryMode.insensitive } },
      { region: { contains: q, mode: Prisma.QueryMode.insensitive } },
      { violation: { contains: q, mode: Prisma.QueryMode.insensitive } },
      { subject: { contains: q, mode: Prisma.QueryMode.insensitive } },
      { summary: { contains: q, mode: Prisma.QueryMode.insensitive } },
    ];
  }

  if (status === "published") where.published = true;
  if (status === "draft") where.published = false;
  if (featured === "yes") where.isFeatured = true;
  if (featured === "no") where.isFeatured = false;

  const [cases, totalCount, publishedCount, draftCount, featuredCount] =
    await Promise.all([
      prisma.case.findMany({
        where,
        orderBy: buildOrderBy(sort),
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
        select: {
          id: true,
          title: true,
          slug: true,
          procurementNumber: true,
          customerName: true,
          customerInn: true,
          decisionDate: true,
          updatedAt: true,
          published: true,
          isFeatured: true,
        },
      }),
      prisma.case.count({ where }),
      prisma.case.count({ where: { published: true } }),
      prisma.case.count({ where: { published: false } }),
      prisma.case.count({ where: { isFeatured: true } }),
    ]);

  const totalPages = Math.max(Math.ceil(totalCount / PAGE_SIZE), 1);

  function buildPageLink(nextPage: number) {
    const query = new URLSearchParams();
    if (q) query.set("q", q);
    if (status) query.set("status", status);
    if (featured) query.set("featured", featured);
    if (sort && sort !== "decisionDate") query.set("sort", sort);
    query.set("page", String(nextPage));
    return `/admin/cases?${query.toString()}`;
  }

  return (
    <main>
      {created ? (
        <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-700">
          Новый кейс сохранен.
        </div>
      ) : null}

      {updated ? (
        <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-700">
          Изменения в кейсе сохранены.
        </div>
      ) : null}

      {deleted ? (
        <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-700">
          Кейс удален.
        </div>
      ) : null}

      {publishedChanged ? (
        <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-700">
          Статус публикации обновлен.
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-sm font-medium uppercase tracking-[0.14em] text-slate-400">
            Админка
          </div>
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-[#081a4b]">
            Кейсы ФАС
          </h1>
          <p className="mt-2 text-base text-slate-600">
            Управление базой кейсов: поиск, сортировка и редактирование.
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
            href="/admin/cases/new"
            className="rounded-2xl bg-[#081a4b] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0d2568]"
          >
            Новый кейс
          </Link>
        </div>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="text-sm uppercase tracking-[0.12em] text-slate-400">Всего</div>
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
          <div className="text-sm uppercase tracking-[0.12em] text-slate-400">Черновики</div>
          <div className="mt-3 text-4xl font-bold tracking-tight text-amber-700">
            {draftCount}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="text-sm uppercase tracking-[0.12em] text-slate-400">Важные</div>
          <div className="mt-3 text-4xl font-bold tracking-tight text-[#081a4b]">
            {featuredCount}
          </div>
        </div>
      </div>

      <form
        method="GET"
        className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="grid gap-4 lg:grid-cols-[2fr_1fr_1fr_1fr_auto]">
          <div>
            <label className="block text-sm font-medium text-slate-700">Поиск</label>
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="Заголовок, номер закупки, ИНН, заказчик..."
              className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Статус</label>
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
            <label className="block text-sm font-medium text-slate-700">Важность</label>
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

          <div>
            <label className="block text-sm font-medium text-slate-700">Сортировка</label>
            <select
              name="sort"
              defaultValue={sort}
              className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
            >
              <option value="decisionDate">По дате решения</option>
              <option value="customerName">По заказчику</option>
              <option value="procurementNumber">По номеру закупки</option>
              <option value="updatedAt">По дате обновления</option>
            </select>
          </div>

          <div className="flex items-end gap-3">
            <button
              type="submit"
              className="rounded-2xl bg-[#081a4b] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0d2568]"
            >
              Применить
            </button>

            <Link
              href="/admin/cases"
              className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Сбросить
            </Link>
          </div>
        </div>
      </form>

      <div className="mt-8 overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full border-collapse text-left">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-5 py-4 text-sm font-semibold text-slate-600">ID</th>
              <th className="px-5 py-4 text-sm font-semibold text-slate-600">Заголовок</th>
              <th className="px-5 py-4 text-sm font-semibold text-slate-600">
                Номер закупки
              </th>
              <th className="px-5 py-4 text-sm font-semibold text-slate-600">
                Заказчик
              </th>
              <th className="px-5 py-4 text-sm font-semibold text-slate-600">
                Дата решения
              </th>
              <th className="px-5 py-4 text-sm font-semibold text-slate-600">Статус</th>
              <th className="sticky right-0 bg-slate-50 px-5 py-4 text-sm font-semibold text-slate-600">
                Действия
              </th>
            </tr>
          </thead>

          <tbody>
            {cases.map((item) => (
              <tr key={item.id} className="border-t border-slate-100">
                <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
                  {item.id}
                </td>

                <td className="px-5 py-4">
                  <div className="min-w-[320px] max-w-[520px]">
                    <div className="font-semibold text-[#081a4b]">{item.title}</div>
                    <div className="mt-1 text-sm text-slate-500">{item.slug}</div>
                  </div>
                </td>

                <td className="min-w-[180px] px-5 py-4 text-sm text-slate-700">
                  {item.procurementNumber || "—"}
                </td>

                <td className="min-w-[260px] px-5 py-4 text-sm text-slate-700">
                  <div className="font-medium text-slate-900">
                    {item.customerName || "Не указан"}
                  </div>
                  <div className="mt-1 text-slate-500">
                    {item.customerInn || "ИНН не указан"}
                  </div>
                </td>

                <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-700">
                  {formatDate(item.decisionDate)}
                </td>

                <td className="px-5 py-4">
                  <div className="flex flex-col gap-2">
                    <span
                      className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold ${
                        item.published
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {item.published ? "Опубликован" : "Черновик"}
                    </span>

                    {item.isFeatured ? (
                      <span className="inline-flex w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                        Важный
                      </span>
                    ) : null}
                  </div>
                </td>

                <td className="sticky right-0 bg-white px-5 py-4 shadow-[-10px_0_16px_-16px_rgba(15,23,42,0.45)]">
                  <div className="flex flex-col gap-2">
                    <Link
                      href={`/admin/cases/${item.id}/edit`}
                      className="rounded-xl border border-slate-300 px-3 py-2 text-center text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                    >
                      Редактировать
                    </Link>

                    <Link
                      href={`/cases/${item.id}${item.slug ? `-${item.slug}` : ""}`}
                      className="rounded-xl border border-slate-300 px-3 py-2 text-center text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                    >
                      Открыть
                    </Link>

                    {item.customerInn ? (
                      <Link
                        href={`/zakazchik/${item.customerInn}`}
                        className="rounded-xl border border-slate-300 px-3 py-2 text-center text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                      >
                        Заказчик
                      </Link>
                    ) : null}

                    <form action={duplicateCaseAction}>
                      <input type="hidden" name="caseId" value={item.id} />
                      <button
                        type="submit"
                        className="w-full rounded-xl border border-slate-300 px-3 py-2 text-center text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                      >
                        Дублировать
                      </button>
                    </form>

                    <form action={togglePublishedAction}>
                      <input type="hidden" name="caseId" value={item.id} />
                      <button
                        type="submit"
                        className="w-full rounded-xl border border-slate-300 px-3 py-2 text-center text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                      >
                        {item.published ? "Снять с публикации" : "Опубликовать"}
                      </button>
                    </form>

                    <form action={deleteCaseAction}>
                      <input type="hidden" name="caseId" value={item.id} />
                      <button
                        type="submit"
                        className="w-full rounded-xl border border-red-200 px-3 py-2 text-center text-sm font-medium text-red-700 transition hover:bg-red-50"
                      >
                        Удалить
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}

            {cases.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-10 text-center text-slate-500">
                  Кейсы не найдены.
                </td>
              </tr>
            ) : null}
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
