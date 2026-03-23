import type { Metadata } from "next";
import Link from "next/link";
import { SITE_CONTACTS } from "@/lib/site-config";
import { PRACTICE_HUBS } from "@/lib/practice-hubs";

export const metadata: Metadata = {
  title: "Практика ФАС по темам | GOSZAKON",
  description:
    "Обзор практики ФАС по основным закупочным спорам: неоплата, РНП, неустойка, товарный знак и ограничение конкуренции.",
};

const readingSignals = [
  "Сначала выбирайте тему спора, а не просто листайте решения по дате.",
  "Внутри каждой темы смотрите не только итог, но и логику: что именно ФАС счел нарушением и почему.",
  "После подбора похожей практики переходите к своему договору и документам, потому что результат всегда держится на деталях.",
];

const nextSteps = [
  {
    title: "Найти похожие кейсы",
    description:
      "Каждая тема ведет в отдельную подборку решений, где проще увидеть повторяющиеся аргументы и выводы.",
  },
  {
    title: "Понять рабочую позицию",
    description:
      "Сильная практика нужна не для чтения ради чтения, а чтобы увидеть, какие доводы реально работают в похожем споре.",
  },
  {
    title: "Проверить свои документы",
    description:
      "После подбора похожих дел следующий шаг — оценка договора, УПД, переписки, претензий или документации закупки.",
  },
];

export default function PracticeThemesPage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
          <div>
            <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600">
              Навигатор по базе практики
            </div>

            <h1 className="mt-6 max-w-5xl text-5xl font-bold leading-[1.02] tracking-tight text-[#081a4b] md:text-7xl">
              Практика ФАС по темам
            </h1>

            <p className="mt-6 max-w-3xl text-xl leading-9 text-slate-700">
              Это обзорный вход в базу практики. Здесь собраны не просто ссылки
              на кейсы, а рабочие тематические подборки по тем спорам, где
              поставщики и заказчики чаще всего теряют деньги, сроки и позицию.
            </p>

            <p className="mt-4 max-w-3xl text-lg leading-9 text-slate-700">
              Если вы не хотите листать общий архив решений, начинайте с темы:
              неоплата, РНП, неустойка или документация закупки. Так быстрее
              понять, какая практика действительно похожа на вашу ситуацию.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/cases"
                className="rounded-2xl bg-[#081a4b] px-7 py-4 text-center text-base font-semibold text-white transition hover:bg-[#0d2568]"
              >
                Перейти в базу кейсов
              </Link>

              <a
                href={SITE_CONTACTS.phoneHref}
                className="rounded-2xl border border-slate-300 bg-white px-7 py-4 text-center text-base font-semibold text-[#081a4b] transition hover:bg-slate-50"
              >
                Обсудить ситуацию
              </a>
            </div>
          </div>

          <div className="grid gap-5">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-7 shadow-sm">
              <div className="text-sm uppercase tracking-[0.14em] text-slate-400">
                Как пользоваться этим разделом
              </div>

              <div className="mt-5 space-y-4">
                {readingSignals.map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-slate-200 bg-white p-5"
                  >
                    <p className="text-base leading-8 text-slate-700">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl bg-[#081a4b] p-7 text-white shadow-sm">
              <div className="text-sm uppercase tracking-[0.14em] text-white/60">
                Что внутри
              </div>
              <div className="mt-4 text-5xl font-bold">{PRACTICE_HUBS.length}</div>
              <p className="mt-3 text-lg leading-9 text-white/90">
                тематические подборки, которые помогают быстрее перейти от общей
                базы практики к нужному типу спора.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="max-w-3xl">
            <div className="inline-flex rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600">
              Тематические входы
            </div>

            <h2 className="mt-5 text-4xl font-bold tracking-tight text-[#081a4b] md:text-5xl">
              Начинайте не с даты решения, а с типа проблемы
            </h2>

            <p className="mt-5 text-lg leading-9 text-slate-700">
              Поиск по теме экономит время и помогает быстрее увидеть
              повторяющиеся аргументы: что считается сильной позицией, где ФАС
              формально отказывает и какие действия заказчика или поставщика
              реально влияют на исход спора.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {PRACTICE_HUBS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="text-xl font-semibold leading-8 text-[#081a4b]">
                  {item.title}
                </div>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {item.description}
                </p>
                <span className="mt-5 inline-flex text-sm font-semibold text-[#081a4b]">
                  {item.cta} →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="max-w-3xl">
            <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600">
              Как читать практику
            </div>

            <h2 className="mt-5 text-4xl font-bold tracking-tight text-[#081a4b] md:text-5xl">
              Практика полезна, только если приводит к рабочему выводу
            </h2>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {nextSteps.map((item) => (
              <div
                key={item.title}
                className="rounded-3xl border border-slate-200 bg-slate-50 p-6"
              >
                <div className="text-xl font-semibold text-[#081a4b]">
                  {item.title}
                </div>
                <p className="mt-3 text-base leading-8 text-slate-700">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="rounded-3xl bg-[#081a4b] p-8 text-white shadow-sm">
              <div className="inline-flex rounded-full border border-white/20 px-4 py-2 text-sm text-white/80">
                Если нужна не теория, а результат
              </div>

              <h2 className="mt-6 text-3xl font-bold tracking-tight">
                После обзора практики важно быстро перейти к вашим документам
              </h2>

              <p className="mt-5 text-lg leading-9 text-white/90">
                Хорошая подборка решений помогает сориентироваться, но спор
                выигрывается на договоре, УПД, документации, претензиях и
                переписке. Мы можем быстро посмотреть вашу ситуацию и сказать,
                где у позиции реальная сила.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a
                  href={SITE_CONTACTS.phoneHref}
                  className="rounded-2xl bg-white px-6 py-4 text-center text-sm font-semibold text-[#081a4b] transition hover:bg-slate-100"
                >
                  Обсудить спор
                </a>
                <a
                  href={SITE_CONTACTS.emailHref}
                  className="rounded-2xl border border-white/20 px-6 py-4 text-center text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Направить документы
                </a>
              </div>
            </div>

            <div className="grid gap-5">
              <Link
                href="/cases"
                className="rounded-3xl border border-slate-200 bg-slate-50 p-7 shadow-sm transition hover:bg-white"
              >
                <div className="text-lg font-semibold text-[#081a4b]">
                  Вся база практики ФАС
                </div>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  Вернуться в общий архив решений с фильтрами по заказчику,
                  региону, нарушению, категории и результату спора.
                </p>
              </Link>

              <Link
                href="/sudebnaya-zashita-v-zakupkah"
                className="rounded-3xl border border-slate-200 bg-slate-50 p-7 shadow-sm transition hover:bg-white"
              >
                <div className="text-lg font-semibold text-[#081a4b]">
                  Судебная защита в закупках
                </div>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  Если административная стадия уже пройдена, переходите к блоку
                  по судебным спорам и оспариванию решений ФАС.
                </p>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
