import type { Metadata } from "next";
import { SITE_CONTACTS } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Положение о закупке без нарушений | GOSZAKON",
  description:
    "Помогаем подготовить или переработать положение о закупке с учетом действующего законодательства, практики ФАС и реальной закупочной модели заказчика.",
};

const blocks = [
  "Готовим положение о закупке не как формальность, а как рабочий инструмент заказчика.",
  "Проверяем, какие нормы уже устарели, где появились новые риски и что конфликтует с действующей практикой.",
  "Учитываем не только закон, но и то, как положение реально будет работать в документации и спорах.",
  "Снимаем формулировки, которые потом становятся основой для жалоб, оспаривания закупок и штрафов.",
];

export default function CustomerProcurementRulesPage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:py-24">
          <div className="max-w-5xl">
            <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600">
              Для заказчиков
            </div>
            <h1 className="mt-6 text-5xl font-bold tracking-tight text-[#081a4b] md:text-7xl">
              Положение о закупке без нарушений
            </h1>
            <p className="mt-6 max-w-4xl text-xl leading-9 text-slate-700">
              Слабое положение о закупке потом дорого обходится заказчику:
              ошибки тянутся в документацию, процедуры спорят в ФАС, а
              внутренние правила не выдерживают актуального законодательства.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a href={SITE_CONTACTS.phoneHref} className="rounded-2xl bg-[#081a4b] px-7 py-4 text-center font-semibold text-white">
                Проверить положение
              </a>
              <a href={SITE_CONTACTS.emailHref} className="rounded-2xl border border-slate-300 px-7 py-4 text-center font-semibold text-[#081a4b]">
                Направить документы
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto grid max-w-7xl gap-6 px-6 py-16 md:grid-cols-2">
          {blocks.map((item) => (
            <div key={item} className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
              <p className="text-base leading-8 text-slate-700">{item}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
