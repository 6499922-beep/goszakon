import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title:
    "ФАС отказала во включении поставщика в РНП — кейс по 223-ФЗ | goszakon.ru",
  description:
    "Кейс: заказчик требовал включить поставщика в РНП после расторжения договора, но ФАС отказала, поскольку признаки недобросовестности не были доказаны.",
};

const facts = [
  "заказчик настаивал на включении поставщика в РНП после расторжения договора",
  "вопрос рассматривался в рамках практики по 223-ФЗ",
  "сама конфликтная ситуация не была признана достаточной для включения в реестр",
  "ключевым вопросом стало наличие или отсутствие недобросовестного поведения",
];

export default function RnpCasePage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-16 lg:py-24">
          <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-600">
            Кейс · РНП · 223-ФЗ
          </div>

          <h1 className="mt-6 max-w-5xl text-5xl font-bold leading-[1.04] tracking-tight text-[#081a4b] md:text-6xl">
            ФАС отказала во включении поставщика в РНП после расторжения договора
          </h1>

          <p className="mt-6 max-w-4xl text-xl leading-9 text-slate-700">
            Заказчик требовал включить поставщика в реестр недобросовестных
            поставщиков, однако комиссия не нашла достаточных оснований для
            такого решения.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
              <span className="font-medium text-slate-900">Результат:</span>{" "}
              отказ во включении в РНП
            </div>
            <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
              <span className="font-medium text-slate-900">Категория:</span>{" "}
              практика ФАС по 223-ФЗ
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-50">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 py-20 lg:grid-cols-[1fr_0.72fr]">
          <article className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-3xl font-bold tracking-tight text-[#081a4b]">
              Суть дела
            </h2>

            <p className="mt-5 text-lg leading-9 text-slate-700">
              После расторжения договора заказчик обратился с требованием о
              включении поставщика в РНП. Позиция заказчика строилась на том,
              что сам факт конфликта и прекращения договорных отношений якобы
              подтверждает недобросовестность поставщика.
            </p>

            <p className="mt-5 text-lg leading-9 text-slate-700">
              Однако комиссия ФАС оценила не только формальное основание
              обращения, но и реальные обстоятельства спора. Было установлено,
              что для включения в РНП недостаточно самого по себе расторжения
              договора: необходимо подтвердить именно недобросовестное поведение
              поставщика.
            </p>

            <h2 className="mt-10 text-3xl font-bold tracking-tight text-[#081a4b]">
              Что имело значение для комиссии
            </h2>

            <div className="mt-6 grid gap-3">
              {facts.map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-base text-slate-700"
                >
                  {item}
                </div>
              ))}
            </div>

            <h2 className="mt-10 text-3xl font-bold tracking-tight text-[#081a4b]">
              Итог по делу
            </h2>

            <p className="mt-5 text-lg leading-9 text-slate-700">
              Комиссия пришла к выводу, что представленные материалы не
              подтверждают наличие достаточных признаков недобросовестности.
              Включение в РНП не было признано обоснованным, и поставщика в
              реестр не внесли.
            </p>

            <h2 className="mt-10 text-3xl font-bold tracking-tight text-[#081a4b]">
              Практический вывод
            </h2>

            <p className="mt-5 text-lg leading-9 text-slate-700">
              Этот кейс показывает, что включение в РНП не является автоматическим
              последствием любого спора или расторжения договора. Для комиссии
              принципиально важно, доказано ли недобросовестное поведение
              поставщика, а не просто наличие конфликта с заказчиком.
            </p>
          </article>

          <aside className="space-y-6">
            <div className="rounded-3xl bg-white p-7 shadow-sm ring-1 ring-slate-200">
              <div className="text-sm font-medium uppercase tracking-wide text-slate-500">
                Результат
              </div>
              <div className="mt-3 text-2xl font-bold text-[#081a4b]">
                Отказ во включении в РНП
              </div>
              <p className="mt-4 text-base leading-8 text-slate-700">
                Комиссия не поддержала требование заказчика, поскольку
                недобросовестность должна подтверждаться доказательствами, а не
                предполагаться автоматически.
              </p>
            </div>

            <div className="rounded-3xl bg-white p-7 shadow-sm ring-1 ring-slate-200">
              <div className="text-sm font-medium uppercase tracking-wide text-slate-500">
                Значение кейса
              </div>
              <p className="mt-4 text-base leading-8 text-slate-700">
                Практика полезна для поставщиков, которым необходимо показать,
                что конфликтная ситуация, нарушение сроков или расторжение
                договора ещё не означают безусловного включения в реестр.
              </p>
            </div>

            <div className="rounded-3xl bg-[#081a4b] p-7 text-white shadow-sm">
              <div className="text-sm font-medium uppercase tracking-wide text-white/70">
                Нужна оценка ситуации
              </div>
              <h2 className="mt-3 text-2xl font-bold leading-8">
                Поможем подготовить позицию по спору о включении в РНП
              </h2>
              <p className="mt-4 text-base leading-8 text-white/85">
                Быстро оценим материалы, выделим риски и поможем выстроить
                аргументацию для комиссии ФАС.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/rnp"
                  className="rounded-2xl bg-white px-5 py-3 font-medium text-[#081a4b] transition hover:bg-slate-100"
                >
                  Перейти в раздел РНП
                </Link>
                <Link
                  href="/rnp/kak-izbezhat-vklyucheniya-v-rnp"
                  className="rounded-2xl border border-white/20 px-5 py-3 transition hover:bg-white/10"
                >
                  Стратегия защиты
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}