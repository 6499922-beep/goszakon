import Link from "next/link";
import { SITE_CONTACTS } from "@/lib/site-config";

export default function ComplaintToFasPage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <section className="border-b border-slate-200">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600">
            Услуга GOSZAKON
          </div>

          <h1 className="mt-6 text-5xl font-bold tracking-tight text-[#081a4b]">
            Жалоба в ФАС
          </h1>

          <p className="mt-6 max-w-3xl text-lg leading-9 text-slate-700">
            Подготовим и сопроводим жалобу в ФАС по спорной закупке: проанализируем
            документацию, найдём нарушения, сформируем сильную правовую позицию
            и подскажем, как действовать дальше.
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

            <Link
              href="/cases"
              className="rounded-2xl border border-slate-300 px-6 py-4 font-semibold text-[#081a4b]"
            >
              Практика ФАС
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-slate-50">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-[#081a4b]">
                Когда подаётся жалоба
              </h2>
              <p className="mt-3 text-slate-700">
                Если документация ограничивает конкуренцию, содержит товарный знак,
                заведомо спорные требования или иные нарушения.
              </p>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-[#081a4b]">
                Что мы делаем
              </h2>
              <p className="mt-3 text-slate-700">
                Изучаем закупку, формируем основания, готовим текст жалобы и сопровождаем
                позицию на стадии рассмотрения в ФАС.
              </p>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-[#081a4b]">
                Что важно заранее
              </h2>
              <p className="mt-3 text-slate-700">
                Жалоба — это не просто формальный документ. Важно сразу понимать
                перспективу, риски и экономический смысл спора.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}