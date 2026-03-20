"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { materialTypeOptions } from "@/lib/materials";

type MaterialFormData = {
  id?: number;
  title: string;
  slug: string;
  type: string;
  topic: string | null;
  authority: string | null;
  outcome: string | null;
  caseNumber: string | null;
  decisionDate: string | null;
  excerpt: string | null;
  body: string;
  seoTitle: string | null;
  seoDescription: string | null;
  pdfUrl: string | null;
  sourceName: string | null;
  isPublished: boolean;
  isFeatured: boolean;
  sortOrder: number;
};

type MaterialFormProps = {
  initialData?: MaterialFormData;
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/["'`]/g, "")
    .replace(/[^\p{L}\p{N}\s-]+/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function MaterialForm({ initialData }: MaterialFormProps) {
  const router = useRouter();
  const isEditing = Boolean(initialData?.id);

  const [title, setTitle] = useState(initialData?.title ?? "");
  const [slug, setSlug] = useState(initialData?.slug ?? "");
  const [type, setType] = useState(initialData?.type ?? materialTypeOptions[0]?.value ?? "ANALYTICS");
  const [topic, setTopic] = useState(initialData?.topic ?? "");
  const [authority, setAuthority] = useState(initialData?.authority ?? "");
  const [outcome, setOutcome] = useState(initialData?.outcome ?? "");
  const [caseNumber, setCaseNumber] = useState(initialData?.caseNumber ?? "");
  const [decisionDate, setDecisionDate] = useState(
    initialData?.decisionDate ? initialData.decisionDate.slice(0, 10) : ""
  );
  const [excerpt, setExcerpt] = useState(initialData?.excerpt ?? "");
  const [body, setBody] = useState(initialData?.body ?? "");
  const [seoTitle, setSeoTitle] = useState(initialData?.seoTitle ?? "");
  const [seoDescription, setSeoDescription] = useState(initialData?.seoDescription ?? "");
  const [pdfUrl, setPdfUrl] = useState(initialData?.pdfUrl ?? "");
  const [sourceName, setSourceName] = useState(initialData?.sourceName ?? "");
  const [isPublished, setIsPublished] = useState(initialData?.isPublished ?? false);
  const [isFeatured, setIsFeatured] = useState(initialData?.isFeatured ?? false);
  const [sortOrder, setSortOrder] = useState(String(initialData?.sortOrder ?? 0));

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const submitLabel = useMemo(() => {
    if (isSubmitting) {
      return isEditing ? "Сохраняем..." : "Создаём...";
    }
    return isEditing ? "Сохранить изменения" : "Создать публикацию";
  }, [isEditing, isSubmitting]);

  function fillSlugFromTitle() {
    if (!title.trim()) return;
    setSlug(slugify(title));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!title.trim()) {
      setError("Укажите заголовок.");
      return;
    }

    if (!slug.trim()) {
      setError("Укажите slug.");
      return;
    }

    if (!body.trim()) {
      setError("Текст публикации не может быть пустым.");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        title: title.trim(),
        slug: slug.trim(),
        type,
        topic: topic.trim(),
        authority: authority.trim(),
        outcome: outcome.trim(),
        caseNumber: caseNumber.trim(),
        decisionDate: decisionDate || null,
        excerpt: excerpt.trim(),
        body: body.trim(),
        seoTitle: seoTitle.trim(),
        seoDescription: seoDescription.trim(),
        pdfUrl: pdfUrl.trim(),
        sourceName: sourceName.trim(),
        isPublished,
        isFeatured,
        sortOrder: Number(sortOrder || 0),
      };

      const response = await fetch(
        isEditing ? `/api/admin/materials/${initialData?.id}` : "/api/admin/materials",
        {
          method: isEditing ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();

      if (!response.ok || !result?.ok) {
        setError(result?.error || "Не удалось сохранить публикацию.");
        return;
      }

      setSuccess(isEditing ? "Публикация сохранена." : "Публикация создана.");

      router.push("/admin/materials");
      router.refresh();
    } catch {
      setError("Произошла ошибка при сохранении публикации.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!initialData?.id) return;

    const confirmed = window.confirm("Удалить эту публикацию? Действие нельзя отменить.");
    if (!confirmed) return;

    setError("");
    setSuccess("");
    setIsDeleting(true);

    try {
      const response = await fetch(`/api/admin/materials/${initialData.id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok || !result?.ok) {
        setError(result?.error || "Не удалось удалить публикацию.");
        return;
      }

      router.push("/admin/materials");
      router.refresh();
    } catch {
      setError("Произошла ошибка при удалении публикации.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm"
    >
      <div className="grid gap-6 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Заголовок *
          </label>
          <input
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
            placeholder="Например: Как подать жалобу в ФАС по 223-ФЗ"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Slug *
          </label>
          <div className="flex gap-3">
            <input
              type="text"
              value={slug}
              onChange={(event) => setSlug(event.target.value)}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
              placeholder="kak-podat-zhalobu-v-fas"
            />
            <button
              type="button"
              onClick={fillSlugFromTitle}
              className="rounded-2xl border border-slate-300 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Из заголовка
            </button>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Тип публикации *
          </label>
          <select
            value={type}
            onChange={(event) => setType(event.target.value)}
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
          >
            {materialTypeOptions.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Тема
          </label>
          <input
            type="text"
            value={topic}
            onChange={(event) => setTopic(event.target.value)}
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
            placeholder="Жалоба в ФАС, РНП, товарный знак..."
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Орган
          </label>
          <input
            type="text"
            value={authority}
            onChange={(event) => setAuthority(event.target.value)}
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
            placeholder="Московское УФАС, ФАС России..."
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Результат
          </label>
          <input
            type="text"
            value={outcome}
            onChange={(event) => setOutcome(event.target.value)}
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
            placeholder="Жалоба признана обоснованной..."
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Номер дела / закупки
          </label>
          <input
            type="text"
            value={caseNumber}
            onChange={(event) => setCaseNumber(event.target.value)}
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Дата решения
          </label>
          <input
            type="date"
            value={decisionDate}
            onChange={(event) => setDecisionDate(event.target.value)}
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
          />
        </div>

        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Краткое описание
          </label>
          <textarea
            rows={4}
            value={excerpt}
            onChange={(event) => setExcerpt(event.target.value)}
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
            placeholder="Краткий анонс публикации для списка и SEO."
          />
        </div>

        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Основной текст *
          </label>
          <textarea
            rows={14}
            value={body}
            onChange={(event) => setBody(event.target.value)}
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
            placeholder="Полный текст публикации..."
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            SEO title
          </label>
          <input
            type="text"
            value={seoTitle}
            onChange={(event) => setSeoTitle(event.target.value)}
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            SEO description
          </label>
          <input
            type="text"
            value={seoDescription}
            onChange={(event) => setSeoDescription(event.target.value)}
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            PDF URL
          </label>
          <input
            type="text"
            value={pdfUrl}
            onChange={(event) => setPdfUrl(event.target.value)}
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
            placeholder="https://..."
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Источник
          </label>
          <input
            type="text"
            value={sourceName}
            onChange={(event) => setSourceName(event.target.value)}
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
            placeholder="ФАС России, Московское УФАС..."
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Порядок сортировки
          </label>
          <input
            type="number"
            value={sortOrder}
            onChange={(event) => setSortOrder(event.target.value)}
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
          />
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-6">
        <label className="flex items-center gap-3 text-sm font-medium text-slate-700">
          <input
            type="checkbox"
            checked={isPublished}
            onChange={(event) => setIsPublished(event.target.checked)}
          />
          Опубликовать
        </label>

        <label className="flex items-center gap-3 text-sm font-medium text-slate-700">
          <input
            type="checkbox"
            checked={isFeatured}
            onChange={(event) => setIsFeatured(event.target.checked)}
          />
          Отметить как важную
        </label>
      </div>

      {error ? (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {success ? (
        <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {success}
        </div>
      ) : null}

      <div className="mt-8 flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-2xl bg-[#081a4b] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#0d2568] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {submitLabel}
        </button>

        <button
          type="button"
          onClick={() => router.push("/admin/materials")}
          className="rounded-2xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
        >
          Отмена
        </button>

        {isEditing ? (
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="rounded-2xl border border-red-300 bg-white px-6 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isDeleting ? "Удаляем..." : "Удалить"}
          </button>
        ) : null}
      </div>
    </form>
  );
}