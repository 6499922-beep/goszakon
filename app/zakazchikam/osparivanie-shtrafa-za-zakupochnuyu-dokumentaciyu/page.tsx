import type { Metadata } from "next";
import Link from "next/link";
import { SITE_CONTACTS } from "@/lib/site-config";

export const metadata: Metadata = {
  title:
    "Оспаривание штрафа за закупочную документацию | GOSZAKON",
  description:
    "Помогаем заказчикам оспаривать штрафы за закупочную документацию, ошибки в нацрежиме, критериях оценки, описании объекта закупки и иных дефектах процедуры.",
};

const situations = [
  "Ответственное лицо или сам заказчик получили штраф из-за закупочной документации.",
  "Основанием для привлечения стали формулировки в извещении, документации, проекте договора или критериях оценки.",
  "Штраф связан с национальным режимом, описанием объекта закупки, ограничением конкуренции или иными спорными блоками документации.",
  "Нужно не просто заплатить штраф, а разобраться, есть ли основания оспаривать его и как защитить позицию заказчика дальше.",
];

const support = [
  "Разбираем, что именно послужило основанием для штрафа и насколько сильно это подтверждено материалами проверки или дела.",
  "Показываем, где контролирующий орган дал формальную оценку, не исследовал закупку по существу или неправильно понял логику документации.",
  "Готовим позицию по спору о штрафе с учетом предмета закупки, нацрежима, проекта договора и реальной задачи заказчика.",
  "Если нужно, сопровождаем дальнейшее оспаривание в административном и судебном порядке.",
];

const principles = [
  {
    title: "Штраф нужно разбирать по логике закупки",
    text: "Слабая документация действительно может привести к ответственности, но не каждый штраф означает, что контролирующий орган правильно понял саму закупку и ее конструкцию.",
  },
  {
    title: "Важно отделять формальный дефект от реального нарушения",
    text: "Мы смотрим, было ли нарушение по существу, или контролирующий орган увидел проблему там, где речь шла о спорной или неполно исследованной правовой оценке.",
  },
  {
    title: "Нельзя спорить со штрафом отдельно от документации",
    text: "Чтобы оспаривать штраф, нужно понимать не только постановление или акт, но и весь контекст закупки: предмет, режим, сроки, проект договора и логику заказчика.",
  },
  {
    title: "Судебная защита должна усиливать закупочную модель",
    text: "Наша цель не просто оспорить штраф, а сделать так, чтобы позиция заказчика оставалась сильной и в текущем споре, и в следующих процедурах.",
  },
];

const outcomes = [
  "Понимание, есть ли реальные основания для оспаривания штрафа или постановления.",
  "Сильная позиция по спору о закупочной документации, нацрежиме и связанным блокам процедуры.",
  "Снижение риска, что формальный вывод контроля останется единственной версией событий.",
  "Более устойчивая закупочная модель заказчика на будущее, а не только разовая реакция на штраф.",
];

export default function CustomerPenaltyChallengePage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:py-24">
          <div className="max-w-5xl">
            <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600">
              Для заказчиков
            </div>

            <h1 className="mt-6 text-5xl font-bold tracking-tight text-[#081a4b] md:text-7xl">
              Оспаривание штрафа за закупочную документацию
            </h1>

            <p className="mt-6 max-w-4xl text-xl leading-9 text-slate-700">
              Штраф за закупочную документацию не всегда означает, что позиция
              контроля безупречна. Во многих случаях нужно разбирать не только
              постановление, но и саму закупку: предмет, режим, критерии,
              проект договора и то, как контроль оценил документацию по
              существу. Мы помогаем заказчику выстроить защиту по таким спорам
              и понять, есть ли основание идти дальше.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href={SITE_CONTACTS.phoneHref}
                className="rounded-2xl bg-[#081a4b] px-7 py-4 text-center font-semibold text-white"
              >
                Разобрать штраф и документы
              </a>
              <Link
                href="/zakazchikam/sudebnaya-zashita"
                className="rounded-2xl border border-slate-300 px-7 py-4 text-center font-semibold text-[#081a4b]"
              >
                Судебная защита заказчика
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
              Что мы делаем по такому спору
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
              Как мы смотрим на такие штрафы
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
                  Если нужно понять, где именно документация была собрана слабо
                  и как не повторять этот риск в новых процедурах.
                </p>
              </Link>

              <Link
                href="/zakazchikam/nacionalnyj-rezhim-pod-predmet-zakupki"
                className="block rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:bg-white/10"
              >
                <div className="text-xl font-semibold">
                  Нацрежим под предмет закупки и документацию
                </div>
                <p className="mt-2 text-base leading-8 text-white/90">
                  Если штраф связан с режимом допуска, подтверждающими
                  документами или логикой применения режима.
                </p>
              </Link>

              <Link
                href="/zakazchikam/sudebnaya-zashita"
                className="block rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:bg-white/10"
              >
                <div className="text-xl font-semibold">
                  Судебная защита заказчика
                </div>
                <p className="mt-2 text-base leading-8 text-white/90">
                  Если спор уже вышел в полноценное судебное оспаривание и
                  нужна отдельная стратегия защиты.
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
              Если штраф уже есть, важно разбирать не только постановление, но и всю закупку
            </h2>
            <p className="mt-5 max-w-2xl text-lg leading-9 text-slate-700">
              Направьте нам постановление, документы проверки, закупочную
              документацию и проект договора. Мы посмотрим, насколько сильна
              позиция контроля и есть ли основания для дальнейшего оспаривания.
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
