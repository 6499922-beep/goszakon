import type { Metadata } from "next";
import { SITE_CONTACTS } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Национальный режим для заказчика | GOSZAKON",
  description:
    "Помогаем заказчикам выстраивать закупку с учетом национального режима без лишних рисков жалоб, отмены закупки и штрафов.",
};

const painPoints = [
  "Неправильно выбран или описан механизм допуска, запрета или ограничения.",
  "Документация не дает прозрачного понимания, какие подтверждающие документы ждут от участника.",
  "Национальный режим формально включен, но логика закупки и предмет договора не состыкованы.",
  "Из-за ошибки в режиме страдает вся закупка: жалоба, отмена процедуры, риск штрафа для заказчика.",
];

export default function CustomerNationalModePage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:py-24">
          <div className="max-w-5xl">
            <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600">
              Для заказчиков
            </div>
            <h1 className="mt-6 text-5xl font-bold tracking-tight text-[#081a4b] md:text-7xl">
              Национальный режим для заказчика
            </h1>
            <p className="mt-6 max-w-4xl text-xl leading-9 text-slate-700">
              Национальный режим сейчас стал одной из самых конфликтных зон для
              заказчика. Ошибка здесь часто означает не просто жалобу, а полный
              развал закупки и штраф за документацию. Мы помогаем встроить режим
              в закупку так, чтобы он работал в логике предмета и закона, а не
              как случайный формальный блок.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a href={SITE_CONTACTS.phoneHref} className="rounded-2xl bg-[#081a4b] px-7 py-4 text-center font-semibold text-white">
                Разобрать нацрежим
              </a>
              <a href={SITE_CONTACTS.emailHref} className="rounded-2xl border border-slate-300 px-7 py-4 text-center font-semibold text-[#081a4b]">
                Направить закупку
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto grid max-w-7xl gap-6 px-6 py-16 md:grid-cols-2">
          {painPoints.map((item) => (
            <div key={item} className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
              <p className="text-base leading-8 text-slate-700">{item}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
