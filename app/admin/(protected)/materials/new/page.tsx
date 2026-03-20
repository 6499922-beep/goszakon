import Link from "next/link";
import MaterialForm from "../_components/material-form";

export default function AdminNewMaterialPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10 text-slate-900">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-sm font-medium uppercase tracking-[0.14em] text-slate-400">
              Админка
            </div>
            <h1 className="mt-2 text-4xl font-bold tracking-tight text-[#081a4b]">
              Новая публикация
            </h1>
            <p className="mt-2 text-base text-slate-600">
              Добавление аналитической публикации, инструкции или разбора практики.
            </p>
          </div>

          <Link
            href="/admin/materials"
            className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Назад к аналитике
          </Link>
        </div>

        <MaterialForm />
      </div>
    </main>
  );
}