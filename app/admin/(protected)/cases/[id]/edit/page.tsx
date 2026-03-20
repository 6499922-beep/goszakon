import Link from "next/link";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getPrisma } from "@/lib/prisma";
import { ADMIN_COOKIE_NAME, verifyAdminSession } from "@/lib/admin-auth";
import {
  caseRegionOptions,
  caseViolationOptions,
} from "@/lib/case-options";
import {
  isValidCustomerInn,
  isValidCustomerKpp,
  normalizeCustomerName,
  normalizeDigits,
  normalizeOptionalString,
  parseCaseDecisionDate,
  parseOptionalCategoryId,
  slugifyCase,
} from "@/lib/case-admin";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; duplicated?: string }>;
};

function formatDateInput(date?: Date | null) {
  if (!date) return "";
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${day}.${month}.${year}`;
}

function errorText(error?: string) {
  if (error === "title") return "Укажите заголовок кейса.";
  if (error === "slug") return "Не удалось сформировать slug.";
  if (error === "slug_exists") return "Кейс с таким slug уже существует.";
  if (error === "customer_inn") return "ИНН заказчика должен содержать 10 или 12 цифр.";
  if (error === "customer_kpp") return "КПП заказчика должен содержать 9 цифр.";
  if (error === "decision_date") {
    return "Некорректная дата. Используйте формат 31.03.2026 или 2026-03-31.";
  }
  if (error === "server") return "Не удалось сохранить изменения.";
  return "";
}

export default async function AdminEditCasePage({
  params,
  searchParams,
}: PageProps) {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  const caseId = Number(id);

  if (!Number.isInteger(caseId) || caseId <= 0) {
    notFound();
  }

  const prisma = getPrisma();

  const [item, categories] = await Promise.all([
    prisma.case.findUnique({
      where: { id: caseId },
      include: { category: true },
    }),
    prisma.category.findMany({
      orderBy: { name: "asc" },
    }),
  ]);

  if (!item) {
    notFound();
  }

  const originalCustomerInn = item.customerInn || null;
  const error = errorText(resolvedSearchParams.error);
  const duplicated = resolvedSearchParams.duplicated === "1";

  async function updateCaseAction(formData: FormData) {
    "use server";

    const cookieStore = await cookies();
    const session = await verifyAdminSession(
      cookieStore.get(ADMIN_COOKIE_NAME)?.value
    );

    if (!session) {
      redirect("/admin/signin");
    }

    const prisma = getPrisma();

    const title = String(formData.get("title") || "").trim();
    const slugInput = String(formData.get("slug") || "").trim();
    const slug = slugInput || slugifyCase(title);

    const decisionDateRaw = String(formData.get("decisionDate") || "").trim();
    const isFeatured = formData.get("isFeatured") === "on";
    const published = formData.get("published") === "on";
    const customerName = normalizeCustomerName(formData.get("customerName"));
    const customerInn = normalizeDigits(formData.get("customerInn"));
    const customerKpp = normalizeDigits(formData.get("customerKpp"));

    if (!title) {
      redirect(`/admin/cases/${caseId}/edit?error=title`);
    }

    if (!slug) {
      redirect(`/admin/cases/${caseId}/edit?error=slug`);
    }

    const existingSlug = await prisma.case.findFirst({
      where: {
        slug,
        NOT: { id: caseId },
      },
      select: { id: true },
    });

    if (existingSlug) {
      redirect(`/admin/cases/${caseId}/edit?error=slug_exists`);
    }

    const categoryId = parseOptionalCategoryId(formData.get("categoryId"));
    const decisionDate = decisionDateRaw
      ? parseCaseDecisionDate(decisionDateRaw)
      : null;

    if (decisionDateRaw && !decisionDate) {
      redirect(`/admin/cases/${caseId}/edit?error=decision_date`);
    }

    if (!isValidCustomerInn(customerInn)) {
      redirect(`/admin/cases/${caseId}/edit?error=customer_inn`);
    }

    if (!isValidCustomerKpp(customerKpp)) {
      redirect(`/admin/cases/${caseId}/edit?error=customer_kpp`);
    }

    const updated = await prisma.case.update({
      where: { id: caseId },
      data: {
        title,
        slug,
        summary: normalizeOptionalString(formData.get("summary")),
        procurementNumber: normalizeOptionalString(formData.get("procurementNumber")),
        region: normalizeOptionalString(formData.get("region")),
        subject: normalizeOptionalString(formData.get("subject")),
        violation: normalizeOptionalString(formData.get("violation")),
        applicantPosition: normalizeOptionalString(formData.get("applicantPosition")),
        decision: normalizeOptionalString(formData.get("decision")),
        result: normalizeOptionalString(formData.get("result")),
        pdfUrl: normalizeOptionalString(formData.get("pdfUrl")),
        customerName,
        customerInn,
        customerKpp,
        decisionDate,
        isFeatured,
        published,
        categoryId,
      },
      select: {
        id: true,
        slug: true,
      },
    });

    revalidatePath("/admin");
    revalidatePath("/admin/cases");
    revalidatePath("/cases");
    revalidatePath(`/cases/${updated.id}-${updated.slug}`);
    revalidatePath("/zakazchikam");
    if (originalCustomerInn) {
      revalidatePath(`/zakazchik/${originalCustomerInn}`);
    }
    if (customerInn) {
      revalidatePath(`/zakazchik/${customerInn}`);
    }

    redirect("/admin/cases?updated=1");
  }

  return (
    <main>
      {duplicated ? (
        <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-700">
          Создана копия кейса. Проверьте заголовок, slug и статус публикации перед сохранением.
        </div>
      ) : null}

      {error ? (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-sm font-medium uppercase tracking-[0.14em] text-slate-400">
            Админка
          </div>
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-[#081a4b]">
            Редактирование кейса
          </h1>
          <p className="mt-2 text-base text-slate-600">
            Изменение карточки решения ФАС.
          </p>
        </div>

        <Link
          href="/admin/cases"
          className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
        >
          Назад к кейсам
        </Link>
      </div>

      <form
        action={updateCaseAction}
        className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm"
      >
        <div className="grid gap-6 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Заголовок *
            </label>
            <input
              type="text"
              name="title"
              required
              defaultValue={item.title}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Slug
            </label>
            <input
              type="text"
              name="slug"
              defaultValue={item.slug}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
            />
            <p className="mt-2 text-sm text-slate-500">
              Если очистить поле, slug сформируется из заголовка автоматически.
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Дата решения
            </label>
            <input
              type="text"
              name="decisionDate"
              inputMode="numeric"
              defaultValue={formatDateInput(item.decisionDate)}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
              placeholder="31.03.2026 или 2026-03-31"
            />
            <p className="mt-2 text-sm text-slate-500">
              Можно вставлять дату из буфера.
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Номер закупки / дела
            </label>
            <input
              type="text"
              name="procurementNumber"
              defaultValue={item.procurementNumber || ""}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Краткая суть дела
            </label>
            <textarea
              name="summary"
              rows={4}
              defaultValue={item.summary || ""}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Заказчик
            </label>
            <input
              type="text"
              name="customerName"
              defaultValue={item.customerName || ""}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
            />
            <p className="mt-2 text-sm text-slate-500">
              Старайтесь держать единое написание заказчика, чтобы база не распадалась на дубли.
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              ИНН заказчика
            </label>
            <input
              type="text"
              name="customerInn"
              defaultValue={item.customerInn || ""}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
            />
            <p className="mt-2 text-sm text-slate-500">Только 10 или 12 цифр.</p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              КПП заказчика
            </label>
            <input
              type="text"
              name="customerKpp"
              defaultValue={item.customerKpp || ""}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
            />
            <p className="mt-2 text-sm text-slate-500">Если указываете КПП, он должен содержать 9 цифр.</p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Регион
            </label>
            <input
              type="text"
              name="region"
              list="case-region-options"
              defaultValue={item.region || ""}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
            />
            <datalist id="case-region-options">
              {caseRegionOptions.map((itemValue) => (
                <option key={itemValue} value={itemValue} />
              ))}
            </datalist>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Предмет спора
            </label>
            <input
              type="text"
              name="subject"
              defaultValue={item.subject || ""}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Нарушение
            </label>
            <input
              type="text"
              name="violation"
              list="case-violation-options"
              defaultValue={item.violation || ""}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
            />
            <datalist id="case-violation-options">
              {caseViolationOptions.map((itemValue) => (
                <option key={itemValue} value={itemValue} />
              ))}
            </datalist>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Категория
            </label>
            <select
              name="categoryId"
              defaultValue={item.categoryId?.toString() || ""}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
            >
              <option value="">Без категории</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Позиция заявителя
            </label>
            <textarea
              name="applicantPosition"
              rows={5}
              defaultValue={item.applicantPosition || ""}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Что исследовала комиссия
            </label>
            <textarea
              name="decision"
              rows={6}
              defaultValue={item.decision || ""}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Практический вывод
            </label>
            <textarea
              name="result"
              rows={5}
              defaultValue={item.result || ""}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              PDF / ссылка на решение
            </label>
            <input
              type="text"
              name="pdfUrl"
              defaultValue={item.pdfUrl || ""}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              id="isFeatured"
              type="checkbox"
              name="isFeatured"
              defaultChecked={item.isFeatured}
              className="h-5 w-5 rounded border-slate-300"
            />
            <label htmlFor="isFeatured" className="text-sm font-medium text-slate-700">
              Пометить как важный кейс
            </label>
          </div>

          <div className="flex items-center gap-3">
            <input
              id="published"
              type="checkbox"
              name="published"
              defaultChecked={item.published}
              className="h-5 w-5 rounded border-slate-300"
            />
            <label htmlFor="published" className="text-sm font-medium text-slate-700">
              Опубликован
            </label>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="submit"
            className="rounded-2xl bg-[#081a4b] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#0d2568]"
          >
            Сохранить изменения
          </button>

          <Link
            href="/admin/cases"
            className="rounded-2xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Отмена
          </Link>
        </div>
      </form>
    </main>
  );
}
