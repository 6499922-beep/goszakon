import type { Metadata } from "next";
import Link from "next/link";
import { SITE_CONTACTS } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Судебная защита интересов заказчика | GOSZAKON",
  description:
    "Помогаем заказчикам защищать закупку и свои решения в суде, если спор вышел за пределы ФАС или требует отдельной судебной стратегии.",
};

const areas = [
  "Защита результатов закупки и документации, если спор продолжился после ФАС.",
  "Подготовка позиции заказчика по делу, где оспаривают решение комиссии, условия закупки или итоги процедуры.",
  "Работа со спором так, чтобы судебная стадия не разрушила всю закупочную модель заказчика.",
  "Сопровождение сложных дел, где спор связан сразу с документацией, национальным режимом и требованиями к участникам.",
];

export default function CustomerCourtDefensePage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:py-24">
          <div className="max-w-5xl">
            <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600">
              Для заказчиков
            </div>
            <h1 className="mt-6 text-5xl font-bold tracking-tight text-[#081a4b] md:text-7xl">
              Судебная защита интересов заказчика
            </h1>
            <p className="mt-6 max-w-4xl text-xl leading-9 text-slate-700">
              Если спор по закупке не закончился на административной стадии,
              заказчику нужна не просто реакция на иск, а полноценная судебная
              стратегия. Мы помогаем защитить закупку, документацию и правовую
              позицию заказчика в суде.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a href={SITE_CONTACTS.phoneHref} className="rounded-2xl bg-[#081a4b] px-7 py-4 text-center font-semibold text-white">
                Разобрать судебный спор
              </a>
              <Link href="/sudebnaya-zashita-v-zakupkah" className="rounded-2xl border border-slate-300 px-7 py-4 text-center font-semibold text-[#081a4b]">
                Общий раздел суда
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto grid max-w-7xl gap-6 px-6 py-16 md:grid-cols-2">
          {areas.map((item) => (
            <div key={item} className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
              <p className="text-base leading-8 text-slate-700">{item}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
