import { notFound } from "next/navigation";
import Link from "next/link";
import { getPrisma } from "@/lib/prisma";
import MaterialForm from "../../_components/material-form";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminEditMaterialPage({ params }: PageProps) {
  const { id } = await params;
  const prisma = getPrisma();

  const material = await prisma.material.findUnique({
    where: { id: Number(id) },
  });

  if (!material) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10 text-slate-900">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-sm font-medium uppercase tracking-[0.14em] text-slate-400">
              Админка
            </div>
            <h1 className="mt-2 text-4xl font-bold tracking-tight text-[#081a4b]">
              Редактирование публикации
            </h1>
            <p className="mt-2 text-base text-slate-600">
              Обновление аналитического материала, инструкции или разбора.
            </p>
          </div>

          <Link
            href="/admin/materials"
            className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Назад к аналитике
          </Link>
        </div>

        <MaterialForm
          initialData={{
            id: material.id,
            title: material.title,
            slug: material.slug,
            type: material.type,
            topic: material.topic,
            authority: material.authority,
            outcome: material.outcome,
            caseNumber: material.caseNumber,
            decisionDate: material.decisionDate
              ? material.decisionDate.toISOString()
              : null,
            excerpt: material.excerpt,
            body: material.body,
            seoTitle: material.seoTitle,
            seoDescription: material.seoDescription,
            pdfUrl: material.pdfUrl,
            sourceName: material.sourceName,
            isPublished: material.isPublished,
            isFeatured: material.isFeatured,
            sortOrder: material.sortOrder,
          }}
        />
      </div>
    </main>
  );
}