import type { Metadata } from "next";
import Link from "next/link";
import { SITE_CONTACTS } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Расчет НМЦК для заказчика | GOSZAKON",
  description:
    "Помогаем заказчикам подготовить расчет и обоснование НМЦК так, чтобы закупка выдерживала логику предмета, контроль и возможные жалобы.",
};

const risks = [
  "НМЦК собрана формально и не выдерживает проверку на деловую логику закупки.",
  "Коммерческие предложения, расчетные материалы и описание объекта закупки не состыкованы между собой.",
  "Цена выглядит уязвимой для жалобы, предписания или дальнейшего спора в ФАС.",
  "Из-за слабого обоснования страдает вся закупка: документация, предмет закупки и устойчивость процедуры.",
];

const services = [
  "Проверяем, как сформирована НМЦК и насколько расчет соотносится с предметом закупки.",
  "Смотрим коммерческие предложения, рыночные ориентиры, внутреннюю логику и доказательственную базу заказчика.",
  "Показываем, где расчет выглядит формальным, противоречивым или плохо защищаемым перед контролем.",
  "Помогаем выстроить обоснование так, чтобы цена не выпадала из общей конструкции закупки.",
];

const process = [
  "Разбираем предмет закупки, расчетные материалы и документы, на которые опирался заказчик.",
  "Проверяем, нет ли внутренних противоречий между НМЦК, документацией и фактической задачей закупки.",
  "Показываем слабые места, которые могут стать основанием для претензий, жалобы или штрафа.",
  "Формируем более устойчивую правовую и расчетную позицию по цене закупки.",
];

export default function NmckPage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:py-24">
          <div className="max-w-5xl">
            <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600">
              Для заказчиков
            </div>

            <h1 className="mt-6 text-5xl font-bold tracking-tight text-[#081a4b] md:text-7xl">
              Расчет НМЦК
            </h1>

            <p className="mt-6 max-w-4xl text-xl leading-9 text-slate-700">
              Слабая НМЦК редко остается просто слабой ценой. Обычно она тянет
              за собой весь риск закупки: жалобу, спорную документацию, вопрос к
              предмету закупки и дальнейшие претензии к логике процедуры. Мы
              помогаем заказчикам собирать расчет и обоснование так, чтобы они
              выдерживали не только внутреннюю задачу, но и внешний контроль.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href={SITE_CONTACTS.phoneHref}
                className="rounded-2xl bg-[#081a4b] px-7 py-4 text-center font-semibold text-white"
              >
                Разобрать расчет НМЦК
              </a>
              <Link
                href="/zakazchikam/audit-zakupki"
                className="rounded-2xl border border-slate-300 px-7 py-4 text-center font-semibold text-[#081a4b]"
              >
                Аудит закупки
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto grid max-w-7xl gap-6 px-6 py-16 md:grid-cols-2">
          {risks.map((item) => (
            <div
              key={item}
              className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm"
            >
              <p className="text-base leading-8 text-slate-700">{item}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="max-w-3xl">
            <h2 className="text-4xl font-bold tracking-tight text-[#081a4b]">
              Что делаем по НМЦК
            </h2>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {services.map((item) => (
              <div
                key={item}
                className="rounded-3xl border border-slate-200 bg-slate-50 p-7 shadow-sm"
              >
                <p className="text-base leading-8 text-slate-700">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-16 lg:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-3xl font-bold tracking-tight text-[#081a4b]">
              Как строится работа
            </h2>

            <div className="mt-6 space-y-4">
              {process.map((item, index) => (
                <p key={item} className="text-base leading-8 text-slate-700">
                  {index + 1}. {item}
                </p>
              ))}
            </div>
          </div>

          <div className="rounded-3xl bg-[#081a4b] p-8 text-white shadow-sm">
            <h2 className="text-3xl font-bold tracking-tight">
              Что смотреть рядом
            </h2>

            <div className="mt-6 space-y-4">
              <Link
                href="/zakazchikam/audit-zakupki"
                className="block rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:bg-white/10"
              >
                <div className="text-xl font-semibold">
                  Аудит закупки до публикации
                </div>
                <p className="mt-2 text-base leading-8 text-white/90">
                  Если НМЦК уязвима, почти всегда стоит сразу смотреть всю
                  документацию и модель закупки.
                </p>
              </Link>

              <Link
                href="/zakazchikam/nacionalnyj-rezhim"
                className="block rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:bg-white/10"
              >
                <div className="text-xl font-semibold">Национальный режим</div>
                <p className="mt-2 text-base leading-8 text-white/90">
                  Часто спор по цене и спор по режиму идут рядом и усиливают
                  общий риск по закупке.
                </p>
              </Link>

              <Link
                href="/zakazchikam/zashita-v-fas"
                className="block rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:bg-white/10"
              >
                <div className="text-xl font-semibold">
                  Защита интересов заказчика в ФАС
                </div>
                <p className="mt-2 text-base leading-8 text-white/90">
                  Если претензии к НМЦК уже стали частью жалобы, дальше нужен
                  не только расчет, но и защита позиции перед комиссией.
                </p>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-16 md:grid-cols-2">
          <div>
            <h2 className="text-4xl font-bold tracking-tight text-[#081a4b]">
              Если НМЦК уже выглядит спорно, лучше разбирать это до жалобы
            </h2>
            <p className="mt-5 max-w-2xl text-lg leading-9 text-slate-700">
              Направьте нам расчет, коммерческие предложения, описание объекта
              закупки и проект документации. Мы посмотрим, где цена выглядит
              уязвимо и как усилить позицию заказчика до спора.
            </p>
          </div>

          <div className="flex flex-col justify-center gap-4 rounded-3xl border border-slate-200 bg-slate-50 p-8 shadow-sm">
            <a
              href={SITE_CONTACTS.phoneHref}
              className="inline-flex items-center justify-center rounded-2xl bg-[#081a4b] px-6 py-4 text-base font-semibold text-white"
            >
              Позвонить: {SITE_CONTACTS.phoneDisplay}
            </a>
            <a
              href={SITE_CONTACTS.emailHref}
              className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-6 py-4 text-base font-semibold text-[#081a4b]"
            >
              Написать: {SITE_CONTACTS.email}
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
