import type { Metadata } from "next";
import Link from "next/link";
import { SITE_CONTACTS } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Снижение неустойки поставщику по госконтракту | GOSZAKON",
  description:
    "Снижаем и оспариваем неустойку поставщику по госконтракту, если заказчик удержал ее из оплаты, неверно рассчитал сумму или сам нарушил договор.",
};

const situations = [
  "Заказчик начислил слишком большую неустойку и удержал ее из итоговой оплаты.",
  "Санкции посчитаны на всю сумму контракта, а не на фактически проблемную часть.",
  "Штраф начислен по формальному или надуманному основанию.",
  "Заказчик сам нарушал договор, но пытается выставить виноватым только поставщика.",
];

const weakPoints = [
  "В договоре может вообще не быть прямого права заказчика удерживать неустойку из оплаты.",
  "Претензионный порядок и сроки направления претензии часто нарушаются самим заказчиком.",
  "Неустойка нередко начисляется на всю цену контракта, а не на реально непоставленную часть.",
  "Формальный дефект документа заказчик пытается превратить в основание для крупного штрафа.",
  "Сам заказчик часто не исполняет те условия договора, которые требует от поставщика.",
];

const advantages = [
  "По нашей практике в 98% госконтрактов ответственность поставщика жестче, чем ответственность заказчика.",
  "Мы не строим защиту на оправданиях и не сводим дело к одной ссылке на статью 333 ГК РФ.",
  "Ищем ошибки заказчика в договоре, расчете, претензионной работе и фактическом исполнении.",
  "Смотрим, можно ли не только снизить сумму, но и полностью развернуть спор в пользу поставщика.",
];

const resultScenarios = [
  {
    title: "Снижение суммы до обоснованного размера",
    text: "Если само основание для санкции есть, но заказчик посчитал ее неверно или несоразмерно, добиваемся уменьшения до уровня, который можно защитить в суде.",
  },
  {
    title: "Полное выбивание спорной неустойки",
    text: "Если заказчик не имел права удерживать сумму, нарушил порядок предъявления требований или неправильно определил основание для штрафа, ломаем его позицию полностью.",
  },
  {
    title: "Переход в взыскание с заказчика",
    text: "Если заказчик сам нарушал договор, не оплатил вовремя или создал препятствия для исполнения, из защиты от взыскания можно перейти в активное требование уже к нему.",
  },
];

const stages = [
  {
    title: "Анализируем договор и закупочную документацию",
    text: "Проверяем, как устроена ответственность сторон, что заказчик предусмотрел в контракте и где нарушил собственные же условия.",
  },
  {
    title: "Разбираем расчет неустойки и штрафов",
    text: "Смотрим базу начисления, период просрочки, основания для санкций и логику удержания суммы из оплаты.",
  },
  {
    title: "Ищем слабые места заказчика",
    text: "Проверяем претензионный порядок, сроки, фактическое поведение заказчика и его собственные нарушения по договору.",
  },
  {
    title: "Строим сильную судебную позицию",
    text: "Опираемся не на оправдания, а на ошибки заказчика, его нарушения и несостоятельность самого расчета.",
  },
];

export default function SupplierPenaltyReductionPage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 lg:grid-cols-[1.08fr_0.92fr] lg:py-24">
          <div>
            <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600">
              Судебная защита GOSZAKON
            </div>

            <h1 className="mt-6 max-w-5xl text-5xl font-bold leading-[1.02] tracking-tight text-[#081a4b] md:text-7xl">
              Снижение неустойки поставщику по госконтракту
            </h1>

            <p className="mt-6 max-w-3xl text-xl leading-9 text-slate-700">
              Если заказчик начислил поставщику слишком большую неустойку,
              удержал ее из оплаты или пытается переложить на поставщика весь
              риск исполнения договора, это не значит, что сумму нужно просто
              принять. Мы разбираем слабости заказчика и используем их для
              снижения или выбивания спорной санкции.
            </p>

            <p className="mt-4 max-w-3xl text-lg leading-9 text-slate-700">
              Наша задача в таких делах не просить суд пожалеть поставщика, а
              показать, где именно заказчик ошибся, что нарушил сам и почему
              начисленная сумма не подлежит взысканию полностью.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href={SITE_CONTACTS.phoneHref}
                className="rounded-2xl bg-[#081a4b] px-7 py-4 text-center text-base font-semibold text-white transition hover:bg-[#0d2568]"
              >
                Оценить спор по неустойке
              </a>

              <a
                href={SITE_CONTACTS.emailHref}
                className="rounded-2xl border border-slate-300 bg-white px-7 py-4 text-center text-base font-semibold text-[#081a4b] transition hover:bg-slate-50"
              >
                Направить договор и расчет
              </a>
            </div>
          </div>

          <div className="grid gap-5">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-7 shadow-sm">
              <div className="text-sm uppercase tracking-[0.14em] text-slate-400">
                Когда спор особенно актуален
              </div>

              <div className="mt-5 space-y-4">
                {situations.map((item) => (
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
                Ключевой перекос системы
              </div>
              <div className="mt-4 text-4xl font-bold">98%</div>
              <p className="mt-4 text-lg leading-9 text-white/90">
                По нашей практике именно в таком объеме госконтрактов
                ответственность поставщика оказывается жестче, чем
                ответственность заказчика. Этот перекос нельзя просто принимать
                как норму.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-20 lg:grid-cols-[1fr_0.95fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600">
              Почему это происходит
            </div>

            <h2 className="mt-6 text-3xl font-bold tracking-tight text-[#081a4b]">
              Неустойка в госконтрактах почти всегда устроена в пользу заказчика
            </h2>

            <p className="mt-5 text-lg leading-9 text-slate-700">
              В закупочной практике заказчик почти всегда пишет договор под
              себя. Санкции поставщика выше, штрафы жестче, а собственная
              ответственность заказчика часто сведена к минимуму. В результате
              за просрочку поставщика быстро набегают крупные суммы, тогда как
              за просрочку оплаты заказчик фактически почти ничем не рискует.
            </p>

            <p className="mt-4 text-lg leading-9 text-slate-700">
              Дополнительно заказчики часто начисляют неустойку не на реально
              проблемную часть обязательства, а на всю сумму контракта. Еще одна
              типичная история, когда формальный дефект документа пытаются
              превратить в основание для крупного штрафа, который не
              соответствует реальному характеру нарушения.
            </p>
          </div>

          <div className="rounded-3xl bg-[#081a4b] p-8 text-white shadow-sm">
            <div className="inline-flex rounded-full border border-white/20 px-4 py-2 text-sm text-white/80">
              Какие слабости мы ищем
            </div>

            <div className="mt-6 space-y-4">
              {weakPoints.map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-white/10 bg-white/5 p-5"
                >
                  <p className="text-base leading-8 text-white/90">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-20 lg:grid-cols-[0.95fr_1fr]">
          <div className="rounded-3xl bg-slate-50 p-8 shadow-sm ring-1 ring-slate-200">
            <div className="inline-flex rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600">
              Почему обращаются к нам
            </div>

            <div className="mt-6 space-y-4">
              {advantages.map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-slate-200 bg-white p-5"
                >
                  <p className="text-base leading-8 text-slate-700">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600">
              Наша позиция
            </div>

            <h2 className="mt-6 text-3xl font-bold tracking-tight text-[#081a4b]">
              Мы не оправдываемся, а разбираем ошибки заказчика
            </h2>

            <p className="mt-5 text-lg leading-9 text-slate-700">
              Суды не любят слабую защиту, построенную на общих оправданиях.
              Поэтому мы не просим снизить сумму только потому, что поставщику
              тяжело, и не сводим дело к одной формальной ссылке на статью 333
              ГК РФ.
            </p>

            <p className="mt-4 text-lg leading-9 text-slate-700">
              Мы показываем, что поставщик сделал все, что мог, а сам заказчик
              нарушал договор, неправильно посчитал санкции, не соблюдал свой же
              претензионный порядок или вообще не имел права действовать так, как
              действовал. В этих спорах опыт важнее общих юридических фраз.
            </p>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="max-w-3xl">
            <div className="inline-flex rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600">
              Практические результаты
            </div>

            <h2 className="mt-5 text-4xl font-bold tracking-tight text-[#081a4b] md:text-5xl">
              Чего можно добиться в таком споре
            </h2>

            <p className="mt-5 text-lg leading-9 text-slate-700">
              Для нас цель не просто уменьшить цифру на бумаге. Мы работаем на
              тот результат, который реально меняет положение поставщика.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {resultScenarios.map((item) => (
              <div
                key={item.title}
                className="flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-7 shadow-sm"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
                  <div className="h-3 w-3 rounded-full bg-[#081a4b]" />
                </div>

                <h3 className="text-2xl font-semibold leading-8 text-[#081a4b]">
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
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-20 lg:grid-cols-2">
          <div className="rounded-3xl bg-[#081a4b] p-8 text-white shadow-sm">
            <div className="inline-flex rounded-full border border-white/20 px-4 py-2 text-sm text-white/80">
              Как строится работа
            </div>

            <div className="mt-6 space-y-5">
              {stages.map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-white/10 bg-white/5 p-5"
                >
                  <h3 className="text-xl font-semibold">{item.title}</h3>
                  <p className="mt-3 text-base leading-8 text-white/90">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 shadow-sm">
            <div className="inline-flex rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600">
              Показательный сценарий
            </div>

            <h2 className="mt-6 text-3xl font-bold tracking-tight text-[#081a4b]">
              Иногда из ответчика можно стать истцом
            </h2>

            <p className="mt-5 text-lg leading-9 text-slate-700">
              В одном из споров заказчик начислил поставщику неустойку, а сам
              при этом нарушил срок оплаты. Дополнительно ответственность сторон
              в договоре была неравнозначной, а сам заказчик нарушил порядок
              направления претензии. Изначально ситуация выглядела так, будто
              платить должен поставщик.
            </p>

            <p className="mt-4 text-lg leading-9 text-slate-700">
              После полного анализа договора и действий обеих сторон мы
              перевернули спор: позиция заказчика рассыпалась, и из защиты от
              взыскания дело перешло в активное требование уже к нему. Именно
              поэтому мы всегда смотрим шире, чем просто на размер начисленной
              суммы.
            </p>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="max-w-3xl">
            <div className="inline-flex rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600">
              Связанные материалы
            </div>

            <h2 className="mt-5 text-4xl font-bold tracking-tight text-[#081a4b] md:text-5xl">
              Что еще посмотреть по теме неустойки
            </h2>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <Link
              href="/spornye-praktiki/neravnoznachnaya-neustoyka"
              className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <h3 className="text-2xl font-semibold text-[#081a4b]">
                Неравная неустойка
              </h3>
              <p className="mt-4 text-slate-700">
                Разбор перекоса договорной ответственности, который заказчики потом
                используют против поставщика.
              </p>
            </Link>

            <Link
              href="/cases/neustoyka"
              className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <h3 className="text-2xl font-semibold text-[#081a4b]">
                Практика по неустойке
              </h3>
              <p className="mt-4 text-slate-700">
                Подборка кейсов и решений, где спор шел о расчете санкций,
                удержаниях и договорной ответственности сторон.
              </p>
            </Link>

            <Link
              href="/uslugi/proverka-zakupki"
              className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <h3 className="text-2xl font-semibold text-[#081a4b]">
                Получить консультацию
              </h3>
              <p className="mt-4 text-slate-700">
                Если заказчик уже удержал деньги или насчитал санкции, можно
                быстро оценить силу его позиции и перспективу суда.
              </p>
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-[#081a4b] text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-20 md:grid-cols-2">
          <div>
            <div className="inline-flex rounded-full border border-white/20 px-4 py-2 text-sm text-white/80">
              Следующий шаг
            </div>

            <h2 className="mt-5 text-4xl font-bold tracking-tight">
              Если вам уже начислили неустойку, это еще не значит, что ее
              придется платить
            </h2>

            <p className="mt-5 max-w-2xl text-lg leading-9 text-slate-200">
              Направьте нам договор, претензию и расчет. Мы оценим, насколько
              сильна позиция заказчика и можно ли переломить спор в суде.
            </p>
          </div>

          <div className="flex flex-col justify-center gap-4 rounded-3xl bg-white p-8 text-slate-900 shadow-2xl">
            <a
              href={SITE_CONTACTS.phoneHref}
              className="inline-flex items-center justify-center rounded-2xl bg-[#081a4b] px-6 py-4 text-base font-semibold text-white transition hover:bg-[#0d2568]"
            >
              Позвонить: {SITE_CONTACTS.phoneDisplay}
            </a>

            <a
              href={SITE_CONTACTS.emailHref}
              className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-6 py-4 text-base font-semibold text-[#081a4b] transition hover:bg-slate-50"
            >
              Направить материалы на почту
            </a>

            <Link
              href="/sudebnaya-zashita-v-zakupkah"
              className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-6 py-4 text-base font-semibold text-[#081a4b] transition hover:bg-slate-50"
            >
              Оспаривание решений ФАС
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
