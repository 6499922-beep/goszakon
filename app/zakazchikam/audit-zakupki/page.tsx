import type { Metadata } from "next";
import Link from "next/link";
import { SITE_CONTACTS } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Аудит закупки и документации для заказчика | GOSZAKON",
  description:
    "Проводим аудит закупки до публикации: документация, проект договора, критерии оценки, национальный режим и иные риски жалоб и штрафов для заказчика.",
};

const risks = [
  "Закупка распадается уже после публикации из-за спорной документации или слабого проекта договора.",
  "ФАС видит нарушение там, где заказчик пытался решить практическую задачу, но оформил ее юридически слабо.",
  "Национальный режим, сроки поставки, критерии оценки и описание объекта закупки собраны без нужной логики и доказательной базы.",
  "В результате процедуру приходится переделывать, а ответственных лиц штрафуют за дефекты документации.",
];

const services = [
  "Проверяем документацию, извещение, критерии оценки и проект договора до публикации.",
  "Показываем, какие формулировки чаще всего становятся основанием для жалоб и штрафов.",
  "Помогаем выстроить закупку под реальную потребность заказчика без лишних правовых перекосов.",
  "Особенно глубоко смотрим на национальный режим, описание объекта закупки и закупочные ограничения.",
];

export default function CustomerAuditPage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:py-24">
          <div className="max-w-5xl">
            <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600">
              Для заказчиков
            </div>
            <h1 className="mt-6 text-5xl font-bold tracking-tight text-[#081a4b] md:text-7xl">
              Аудит закупки и документации до публикации
            </h1>
            <p className="mt-6 max-w-4xl text-xl leading-9 text-slate-700">
              Нормальная профилактика для заказчика почти всегда дешевле, чем
              сорванная закупка, жалоба в ФАС или штраф за слабую документацию.
              Мы проверяем закупку заранее и снимаем точки, на которых процедура
              чаще всего начинает распадаться.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a href={SITE_CONTACTS.phoneHref} className="rounded-2xl bg-[#081a4b] px-7 py-4 text-center font-semibold text-white">
                Проверить закупку до публикации
              </a>
              <Link href="/zakazchikam/nacionalnyj-rezhim" className="rounded-2xl border border-slate-300 px-7 py-4 text-center font-semibold text-[#081a4b]">
                Национальный режим
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto grid max-w-7xl gap-6 px-6 py-16 md:grid-cols-2">
          {risks.map((item) => (
            <div key={item} className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
              <p className="text-base leading-8 text-slate-700">{item}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <h2 className="text-4xl font-bold tracking-tight text-[#081a4b]">
            Что проверяем для заказчика
          </h2>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {services.map((item) => (
              <div key={item} className="rounded-3xl border border-slate-200 bg-slate-50 p-7 shadow-sm">
                <p className="text-base leading-8 text-slate-700">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
