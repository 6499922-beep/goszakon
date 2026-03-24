import type { Metadata } from "next";
import Link from "next/link";
import { SITE_CONTACTS } from "@/lib/site-config";

export const metadata: Metadata = {
  title:
    "Национальный режим под предмет закупки и документацию | GOSZAKON",
  description:
    "Помогаем заказчикам встроить национальный режим в предмет закупки, документацию и проект договора так, чтобы процедура выдерживала жалобу, ФАС и контроль.",
};

const situations = [
  "Национальный режим в закупке есть формально, но не состыкован с предметом закупки и логикой процедуры.",
  "Заказчик понимает, что ошибка в режиме допуска или подтверждающих документах может сломать всю закупку.",
  "Документация собрана так, что участник не понимает, какие документы нужны и как будет применяться режим.",
  "Закупка чувствительна к описанию объекта, происхождению товара, ограничениям допуска и проекту договора.",
];

const support = [
  "Разбираем предмет закупки и смотрим, как национальный режим должен работать именно в этой процедуре, а не в абстрактной теории.",
  "Собираем режим допуска, подтверждающие документы, описание объекта закупки и требования к участникам в одну связанную конструкцию.",
  "Проверяем, чтобы национальный режим не конфликтовал с НМЦК, критериями оценки, сроками и проектом договора.",
  "Убираем формулировки, которые чаще всего приводят к жалобам, отмене закупки и штрафам за документацию.",
];

const principles = [
  {
    title: "Режим нельзя вставлять отдельным блоком",
    text: "Если национальный режим живет отдельно от предмета закупки и логики документации, закупка почти всегда получает лишние правовые риски.",
  },
  {
    title: "Сначала предмет, потом режим",
    text: "Мы смотрим, что именно закупает заказчик, какие товары или работы реально нужны, и только после этого выстраиваем режим допуска и подтверждения.",
  },
  {
    title: "Подтверждающие документы должны быть понятны",
    text: "Участник должен заранее понимать, что именно от него ждут. Неясные и плавающие требования почти всегда становятся слабым местом закупки.",
  },
  {
    title: "Смотрим сразу на ФАС и контроль",
    text: "Мы заранее оцениваем, как режим будет выглядеть при жалобе, проверке и защите закупки, если спор начнется уже после публикации.",
  },
];

const outcomes = [
  "Национальный режим встроен в закупку не формально, а в логике предмета и документации.",
  "Меньше риска, что закупку отменят или переделают из-за ошибок в режиме допуска.",
  "Позиция заказчика сильнее в ФАС, если спор пойдет именно по режиму или подтверждающим документам.",
  "Снижается риск штрафов за документацию и за неправильное применение национального режима.",
];

export default function CustomerNationalModeStructurePage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:py-24">
          <div className="max-w-5xl">
            <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600">
              Для заказчиков
            </div>

            <h1 className="mt-6 text-5xl font-bold tracking-tight text-[#081a4b] md:text-7xl">
              Национальный режим под предмет закупки и документацию
            </h1>

            <p className="mt-6 max-w-4xl text-xl leading-9 text-slate-700">
              Национальный режим чаще всего ломается не потому, что заказчик
              забыл про него совсем, а потому, что режим встроен отдельно от
              предмета закупки, документации и проекта договора. Мы помогаем
              собрать такую конструкцию так, чтобы она держалась на логике
              закупки, а не на случайных формулировках.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href={SITE_CONTACTS.phoneHref}
                className="rounded-2xl bg-[#081a4b] px-7 py-4 text-center font-semibold text-white"
              >
                Разобрать закупку с нацрежимом
              </a>
              <Link
                href="/zakazchikam/nacionalnyj-rezhim"
                className="rounded-2xl border border-slate-300 px-7 py-4 text-center font-semibold text-[#081a4b]"
              >
                Общий раздел по нацрежиму
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto grid max-w-7xl gap-6 px-6 py-16 md:grid-cols-2">
          {situations.map((item) => (
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
              Что мы делаем по такой закупке
            </h2>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {support.map((item) => (
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
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="max-w-3xl">
            <h2 className="text-4xl font-bold tracking-tight text-[#081a4b]">
              Как мы смотрим на национальный режим в документации
            </h2>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {principles.map((item) => (
              <div
                key={item.title}
                className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm"
              >
                <h3 className="text-xl font-semibold text-[#081a4b]">
                  {item.title}
                </h3>
                <p className="mt-4 text-base leading-8 text-slate-700">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-16 lg:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 shadow-sm">
            <h2 className="text-3xl font-bold tracking-tight text-[#081a4b]">
              Что это дает заказчику
            </h2>
            <div className="mt-6 space-y-4">
              {outcomes.map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-slate-200 bg-white p-5"
                >
                  <p className="text-base leading-8 text-slate-700">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl bg-[#081a4b] p-8 text-white shadow-sm">
            <h2 className="text-3xl font-bold tracking-tight">
              Что смотреть рядом
            </h2>

            <div className="mt-6 space-y-4">
              <Link
                href="/zakazchikam/podgotovka-zakupochnoj-dokumentacii"
                className="block rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:bg-white/10"
              >
                <div className="text-xl font-semibold">
                  Подготовка закупочной документации
                </div>
                <p className="mt-2 text-base leading-8 text-white/90">
                  Если нужно сначала собрать сильную документацию под предмет
                  закупки и режим допуска.
                </p>
              </Link>

              <Link
                href="/zakazchikam/soprovozhdenie-zakupki"
                className="block rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:bg-white/10"
              >
                <div className="text-xl font-semibold">
                  Сопровождение закупки под задачу заказчика
                </div>
                <p className="mt-2 text-base leading-8 text-white/90">
                  Если нужно выстроить всю закупочную конструкцию, а не только
                  отдельный блок нацрежима.
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
                  Если спор по нацрежиму уже вышел в жалобу и процедуру нужно
                  защищать.
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
              В национальном режиме опасны не только нормы, но и несостыковки внутри документации
            </h2>
            <p className="mt-5 max-w-2xl text-lg leading-9 text-slate-700">
              Направьте нам предмет закупки, документацию, проект договора и
              блоки, где есть вопросы по режиму допуска или подтверждению
              происхождения. Мы посмотрим, как собрать закупку устойчивее и где
              сейчас заложены основные риски жалобы и штрафа.
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
