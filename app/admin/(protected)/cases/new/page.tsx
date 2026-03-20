import Link from "next/link";
import { getPrisma } from "@/lib/prisma";
import {
  caseRegionOptions,
  caseViolationOptions,
} from "@/lib/case-options";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type PageProps = {
  searchParams: Promise<{ error?: string }>;
};

function errorText(error?: string) {
  if (error === "title") return "Укажите заголовок кейса.";
  if (error === "slug") return "Не удалось сформировать slug.";
  if (error === "slug_exists") return "Кейс с таким slug уже существует.";
  if (error === "customer_inn") return "ИНН заказчика должен содержать 10 или 12 цифр.";
  if (error === "customer_kpp") return "КПП заказчика должен содержать 9 цифр.";
  if (error === "decision_date") {
    return "Некорректная дата. Используйте формат 31.03.2026 или 2026-03-31.";
  }
  if (error === "server") return "Не удалось сохранить кейс.";
  return "";
}

export default async function AdminNewCasePage({ searchParams }: PageProps) {
  const prisma = getPrisma();
  const params = await searchParams;

  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });

  const error = errorText(params.error);

  return (
    <main>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-sm font-medium uppercase tracking-[0.14em] text-slate-400">
            Админка
          </div>
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-[#081a4b]">
            Новый кейс ФАС
          </h1>
          <p className="mt-2 text-base text-slate-600">
            Создание карточки решения ФАС для базы практики.
          </p>
        </div>

        <Link
          href="/admin/cases"
          className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
        >
          Назад к кейсам
        </Link>
      </div>

      {error ? (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <form
        action="/api/admin/cases"
        method="POST"
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
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
              placeholder="Например: ФАС признала жалобу обоснованной из-за товарного знака"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Slug
            </label>
            <input
              type="text"
              name="slug"
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
              placeholder="Можно оставить пустым — сформируется автоматически"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Дата решения
            </label>
            <input
              type="text"
              name="decisionDate"
              inputMode="numeric"
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
              placeholder="31.03.2026 или 2026-03-31"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Номер закупки / дела
            </label>
            <input
              type="text"
              name="procurementNumber"
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
              placeholder="Например: 0123456789012345678"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Краткая суть дела
            </label>
            <textarea
              name="summary"
              rows={4}
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
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
            />
            <p className="mt-2 text-sm text-slate-500">
              Лучше указывать единое официальное название без лишних вариантов написания.
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              ИНН заказчика
            </label>
            <input
              type="text"
              name="customerInn"
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
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
            />
            <datalist id="case-region-options">
              {caseRegionOptions.map((item) => (
                <option key={item} value={item} />
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
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
            />
            <datalist id="case-violation-options">
              {caseViolationOptions.map((item) => (
                <option key={item} value={item} />
              ))}
            </datalist>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Категория
            </label>
            <select
              name="categoryId"
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
              defaultValue=""
            >
              <option value="">Без категории</option>
              {categories.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
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
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              id="isFeatured"
              type="checkbox"
              name="isFeatured"
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
              defaultChecked
              className="h-5 w-5 rounded border-slate-300"
            />
            <label htmlFor="published" className="text-sm font-medium text-slate-700">
              Опубликовать сразу
            </label>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="submit"
            className="rounded-2xl bg-[#081a4b] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#0d2568]"
          >
            Сохранить кейс
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
