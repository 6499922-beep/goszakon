import { notFound } from "next/navigation";
import Link from "next/link";
import { getPrisma } from "@/lib/prisma";
import { materialTypeLabels } from "@/lib/materials";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string }>;
};

function formatDate(value?: Date | null) {
  if (!value) return "Не указана";
  return new Intl.DateTimeFormat("ru-RU").format(value);
}

export default async function AnalyticsDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const prisma = getPrisma();

  const material = await prisma.material.findUnique({
    where: { slug },
  });

  if (!material || !material.isPublished) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <article className="mx-auto max-w-5xl px-6 py-16">
        <div className="mb-8 flex flex-wrap items-center gap-4">
          <Link
            href="/analitika"
            className="text-sm font-medium text-slate-500 transition hover:text-slate-700"
          >
            ← Назад к аналитике
          </Link>

          <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm font-medium text-slate-700">
            {materialTypeLabels[material.type] ?? material.type}
          </span>

          {material.isFeatured ? (
            <span className="inline-flex rounded-full bg-[#081a4b] px-3 py-1 text-sm font-semibold text-white">
              Важный материал
            </span>
          ) : null}
        </div>

        <h1 className="mt-4 text-5xl font-bold tracking-tight text-[#081a4b]">
          {material.title}
        </h1>

        {material.excerpt ? (
          <p className="mt-6 text-xl leading-9 text-slate-700">
            {material.excerpt}
          </p>
        ) : null}

        <div className="mt-8 grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5 shadow-sm">
            <div className="text-xs uppercase tracking-wide text-slate-400">
              Тема
            </div>
            <div className="mt-2 text-base font-semibold text-slate-900">
              {material.topic || "Не указана"}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5 shadow-sm">
            <div className="text-xs uppercase tracking-wide text-slate-400">
              Орган
            </div>
            <div className="mt-2 text-base font-semibold text-slate-900">
              {material.authority || "Не указан"}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5 shadow-sm">
            <div className="text-xs uppercase tracking-wide text-slate-400">
              Результат
            </div>
            <div className="mt-2 text-base font-semibold text-slate-900">
              {material.outcome || "Не указан"}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5 shadow-sm">
            <div className="text-xs uppercase tracking-wide text-slate-400">
              Дата
            </div>
            <div className="mt-2 text-base font-semibold text-slate-900">
              {formatDate(material.decisionDate ?? material.publishedAt ?? material.createdAt)}
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="whitespace-pre-wrap text-base leading-8 text-slate-800">
              {material.body}
            </div>
          </div>

          <aside className="space-y-6">
            {material.pdfUrl ? (
              <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-6 shadow-sm">
                <div className="text-sm font-medium uppercase tracking-[0.14em] text-slate-400">
                  Источник
                </div>
                <div className="mt-3 text-lg font-semibold text-[#081a4b]">
                  {material.sourceName || "Документ по материалу"}
                </div>
                <a
                  href={material.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-[#081a4b] transition hover:bg-slate-50"
                >
                  Открыть PDF
                </a>
              </div>
            ) : null}

            <div className="rounded-3xl bg-[#081a4b] p-6 text-white shadow-sm">
              <div className="text-sm font-medium uppercase tracking-[0.14em] text-white/70">
                Похожая ситуация
              </div>
              <h2 className="mt-3 text-2xl font-bold tracking-tight">
                Нужна правовая оценка по вашему вопросу?
              </h2>
              <p className="mt-4 text-base leading-8 text-white/90">
                Поможем понять, как использовать эту практику в вашей ситуации и
                какой следующий шаг даст реальный результат.
              </p>
              <div className="mt-5 flex flex-col gap-3">
                <Link
                  href="/uslugi/proverka-zakupki"
                  className="inline-flex items-center justify-center rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-[#081a4b] transition hover:bg-slate-100"
                >
                  Оценить мою ситуацию
                </Link>
                <Link
                  href="/analitika"
                  className="inline-flex items-center justify-center rounded-2xl border border-white/20 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Все материалы аналитики
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </article>
    </main>
  );
}
