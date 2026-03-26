import { notFound } from "next/navigation";
import { getPrisma } from "@/lib/prisma";
import { materialTypeLabels } from "@/lib/materials";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string }>;
};

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
      <article className="mx-auto max-w-4xl px-6 py-16">
        <div className="text-sm font-medium uppercase tracking-[0.14em] text-slate-400">
          {materialTypeLabels[material.type] ?? material.type}
        </div>

        <h1 className="mt-4 text-5xl font-bold tracking-tight text-[#081a4b]">
          {material.title}
        </h1>

        {material.excerpt ? (
          <p className="mt-6 text-xl leading-9 text-slate-700">
            {material.excerpt}
          </p>
        ) : null}

        <div className="mt-8 flex flex-wrap gap-4 text-sm text-slate-500">
          {material.topic ? <span>Тема: {material.topic}</span> : null}
          {material.authority ? <span>Орган: {material.authority}</span> : null}
          {material.outcome ? <span>Результат: {material.outcome}</span> : null}
        </div>

        {material.pdfUrl ? (
          <div className="mt-8">
            <a
              href={material.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex rounded-2xl border border-slate-300 px-5 py-3 text-sm font-semibold text-[#081a4b] transition hover:bg-slate-50"
            >
              {material.sourceName ? `Открыть источник: ${material.sourceName}` : "Открыть источник"}
            </a>
          </div>
        ) : null}

        <div className="prose prose-slate mt-10 max-w-none">
          <div className="whitespace-pre-wrap text-base leading-8 text-slate-800">
            {material.body}
          </div>
        </div>
      </article>
    </main>
  );
}
