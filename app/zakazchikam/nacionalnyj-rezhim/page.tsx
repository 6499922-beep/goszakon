import type { Metadata } from "next";
import Link from "next/link";
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

const related = [
  {
    title: "Нацрежим под предмет закупки и документацию",
    text: "Если нужно собрать режим допуска в логике конкретной закупки, а не оставить его отдельным формальным блоком.",
    href: "/zakazchikam/nacionalnyj-rezhim-pod-predmet-zakupki",
  },
  {
    title: "Подготовка закупочной документации",
    text: "Если проблема шире, чем один только нацрежим, и нужно усиливать всю документацию до публикации.",
    href: "/zakazchikam/podgotovka-zakupochnoj-dokumentacii",
  },
  {
    title: "Защита интересов заказчика в ФАС",
    text: "Если спор по режиму уже перешел в жалобу и закупку нужно защищать на административной стадии.",
    href: "/zakazchikam/zashita-v-fas",
  },
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

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="max-w-3xl">
            <h2 className="text-4xl font-bold tracking-tight text-[#081a4b]">
              Что смотреть рядом
            </h2>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {related.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-3xl border border-slate-200 bg-slate-50 p-7 transition hover:bg-white hover:shadow-md"
              >
                <h3 className="text-2xl font-semibold text-[#081a4b]">
                  {item.title}
                </h3>
                <p className="mt-3 text-slate-700">{item.text}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
