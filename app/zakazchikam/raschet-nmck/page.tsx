import { SITE_CONTACTS } from "@/lib/site-config";

export default function NmckPage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <section className="border-b border-slate-200">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h1 className="text-5xl font-bold tracking-tight text-[#081a4b]">
            Расчёт НМЦК
          </h1>

          <p className="mt-6 max-w-3xl text-lg leading-9 text-slate-700">
            Помогаем подготовить обоснование НМЦК и оценить правовые риски, связанные
            с ценообразованием и логикой закупочной модели.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <a
              href={SITE_CONTACTS.phoneHref}
              className="rounded-2xl bg-[#081a4b] px-6 py-4 font-semibold text-white"
            >
              {SITE_CONTACTS.phoneDisplay}
            </a>
            <a
              href={SITE_CONTACTS.emailHref}
              className="rounded-2xl border border-slate-300 px-6 py-4 font-semibold text-[#081a4b]"
            >
              {SITE_CONTACTS.email}
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}