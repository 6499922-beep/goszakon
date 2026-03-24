import type { Metadata } from "next";
import Link from "next/link";
import { SITE_CONTACTS } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Штраф за ошибку в УПД или накладной | GOSZAKON",
  description:
    "Разбираем случаи, когда заказчик начисляет штраф за ошибку в УПД или накладной: где проходит граница между формальной неточностью и реальным нарушением контракта.",
};

const situations = [
  "Заказчик начислил штраф из-за неполного адреса, формулировки или другой технической ошибки в накладной.",
  "УПД возвращают по формальному замечанию, а потом используют это как основание для санкции и сдвига оплаты.",
  "Ошибку в документе заказчик подает как некомплектную поставку или ненадлежащее исполнение.",
  "Штраф за УПД или накладную уже удержали из оплаты и предлагают поставщику потом отдельно спорить с деньгами.",
];

const excuses = [
  "Раз документ оформлен неидеально, значит заказчик вправе оштрафовать поставщика.",
  "Ошибка в УПД якобы автоматически означает, что обязанность по оплате еще не наступила.",
  "Накладная оформлена не так, как хотел заказчик, значит поставка считается спорной.",
  "Поставщик согласился с договором, поэтому спорить с таким штрафом уже поздно.",
];

const weakPoints = [
  "Техническая ошибка в документе сама по себе не доказывает ненадлежащее исполнение по контракту.",
  "Заказчик часто смешивает вопрос документооборота и вопрос качества либо комплектности поставки.",
  "Штраф за бумажную неточность нередко несоразмерен и используется как инструмент давления, а не защиты интереса заказчика.",
  "Такие санкции часто связаны с удержанием денег, затягиванием приемки и другими собственными нарушениями заказчика.",
];

const firstChecks = [
  "Была ли реально нарушена поставка или спор касается только оформления УПД либо накладной.",
  "Есть ли в договоре прямое основание именно для такого штрафа.",
  "Принял ли заказчик товар фактически и не начал ли спор о документах уже после приемки.",
  "Используется ли ошибка в УПД или накладной как способ не платить либо удержать деньги.",
];

const outcomes = [
  "Выбивание штрафа, если заказчик натянул формальную ошибку на более тяжелое нарушение.",
  "Снижение спорной суммы, если санкция явно несоразмерна бумажному дефекту.",
  "Возврат удержанной части оплаты, если штраф уже вычли из платежа.",
  "Ослабление позиции заказчика по спору об оплате, приемке и дальнейшей неустойке.",
];

export default function UpdInvoicePenaltyPage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 lg:grid-cols-[1.08fr_0.92fr] lg:py-24">
          <div>
            <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600">
              Практика GOSZAKON
            </div>

            <h1 className="mt-6 max-w-5xl text-5xl font-bold leading-[1.02] tracking-tight text-[#081a4b] md:text-7xl">
              Штраф за ошибку в УПД или накладной
            </h1>

            <p className="mt-6 max-w-3xl text-xl leading-9 text-slate-700">
              Один из самых частых коммерческих споров, когда заказчик берет
              техническую ошибку в УПД или накладной и пытается превратить ее в
              полноценное нарушение контракта с денежной санкцией. На практике
              это часто не вопрос исполнения, а вопрос давления на поставщика.
            </p>

            <p className="mt-4 max-w-3xl text-lg leading-9 text-slate-700">
              Мы разбираем такие ситуации через договор, фактическую приемку и
              поведение заказчика. Если поставка реально состоялась, а спор
              строится вокруг бумажной неточности, штраф нужно ломать на уровне
              самого основания.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href={SITE_CONTACTS.phoneHref}
                className="rounded-2xl bg-[#081a4b] px-7 py-4 text-center text-base font-semibold text-white transition hover:bg-[#0d2568]"
              >
                Разобрать штраф по документам
              </a>

              <a
                href={SITE_CONTACTS.emailHref}
                className="rounded-2xl border border-slate-300 bg-white px-7 py-4 text-center text-base font-semibold text-[#081a4b] transition hover:bg-slate-50"
              >
                Направить УПД и накладную
              </a>
            </div>
          </div>

          <div className="grid gap-5">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-7 shadow-sm">
              <div className="text-sm uppercase tracking-[0.14em] text-slate-400">
                Как это выглядит на практике
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
                Главный вопрос
              </div>
              <p className="mt-4 text-lg leading-9 text-white/90">
                Ошибка в документе еще не означает, что контракт исполнен
                ненадлежащим образом и что заказчик может сразу штрафовать.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-20 lg:grid-cols-[1fr_0.95fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600">
              Что обычно говорит заказчик
            </div>

            <h2 className="mt-6 text-3xl font-bold tracking-tight text-[#081a4b]">
              Бумажную неточность часто подают как полноценное нарушение договора
            </h2>

            <div className="mt-6 space-y-4">
              {excuses.map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
                >
                  <p className="text-base leading-8 text-slate-700">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl bg-[#081a4b] p-8 text-white shadow-sm">
            <div className="inline-flex rounded-full border border-white/20 px-4 py-2 text-sm text-white/80">
              Где обычно слабость заказчика
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
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-20 lg:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 shadow-sm">
            <div className="inline-flex rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600">
              Что смотреть первым
            </div>

            <div className="mt-6 space-y-4">
              {firstChecks.map((item) => (
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
            <div className="inline-flex rounded-full border border-white/20 px-4 py-2 text-sm text-white/80">
              Что можно получить
            </div>

            <div className="mt-6 space-y-4">
              {outcomes.map((item) => (
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
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="max-w-3xl">
            <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600">
              Связанные материалы
            </div>

            <h2 className="mt-5 text-4xl font-bold tracking-tight text-[#081a4b] md:text-5xl">
              Куда перейти дальше по теме ошибок в документах и штрафов
            </h2>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <Link
              href="/shtraf-za-formalnye-nedostatki-dokumentov"
              className="rounded-3xl border border-slate-200 bg-slate-50 p-7 shadow-sm transition hover:bg-white hover:shadow-md"
            >
              <h3 className="text-2xl font-semibold text-[#081a4b]">
                Общая страница о формальных недостатках документов
              </h3>
              <p className="mt-4 text-slate-700">
                Более широкий разбор, когда спорят не только с УПД и
                накладными, но и с актами и иными документами по контракту.
              </p>
            </Link>

            <Link
              href="/zakazchik-ne-podpisyvaet-upd"
              className="rounded-3xl border border-slate-200 bg-slate-50 p-7 shadow-sm transition hover:bg-white hover:shadow-md"
            >
              <h3 className="text-2xl font-semibold text-[#081a4b]">
                Заказчик не подписывает УПД
              </h3>
              <p className="mt-4 text-slate-700">
                Когда спор по документу используют не для исправления ошибки, а
                для сдвига оплаты и давления на поставщика.
              </p>
            </Link>

            <Link
              href="/uderzhanie-deneg-iz-oplaty"
              className="rounded-3xl border border-slate-200 bg-slate-50 p-7 shadow-sm transition hover:bg-white hover:shadow-md"
            >
              <h3 className="text-2xl font-semibold text-[#081a4b]">
                Заказчик удержал деньги из оплаты
              </h3>
              <p className="mt-4 text-slate-700">
                Если штраф за УПД или накладную уже вычли из платежа, спор
                нужно вести сразу и по документу, и по деньгам.
              </p>
            </Link>

            <Link
              href="/cases/neustoyka"
              className="rounded-3xl border border-slate-200 bg-slate-50 p-7 shadow-sm transition hover:bg-white hover:shadow-md"
            >
              <h3 className="text-2xl font-semibold text-[#081a4b]">
                Практика по неустойке и удержаниям
              </h3>
              <p className="mt-4 text-slate-700">
                Кейсы и материалы, где спор идет о штрафах, удержаниях и
                завышенной договорной ответственности.
              </p>
            </Link>

            <Link
              href="/sudebnaya-zashita-v-zakupkah/snizhenie-neustojki-postavshiku"
              className="rounded-3xl border border-slate-200 bg-slate-50 p-7 shadow-sm transition hover:bg-white hover:shadow-md"
            >
              <h3 className="text-2xl font-semibold text-[#081a4b]">
                Снижение неустойки поставщику
              </h3>
              <p className="mt-4 text-slate-700">
                Если заказчик превратил формальную ошибку в крупную санкцию,
                важно быстро проверить и основание, и расчет.
              </p>
            </Link>

            <Link
              href="/uslugi/spory-po-neoplate"
              className="rounded-3xl border border-slate-200 bg-slate-50 p-7 shadow-sm transition hover:bg-white hover:shadow-md"
            >
              <h3 className="text-2xl font-semibold text-[#081a4b]">
                Разобрать ситуацию с юристом
              </h3>
              <p className="mt-4 text-slate-700">
                Если у вас уже есть УПД, накладная, претензия и расчет штрафа,
                можно сразу перейти к правовой оценке.
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
              Если заказчик начислил штраф за ошибку в УПД или накладной, важно быстро отделить бумажную неточность от реального нарушения договора
            </h2>

            <p className="mt-5 max-w-2xl text-lg leading-9 text-slate-200">
              Направьте нам УПД, накладную, договор, претензию и переписку. Мы
              посмотрим, есть ли у заказчика реальное основание для санкции или
              это очередная формальная конструкция под удержание денег.
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
              href="/shtraf-za-formalnye-nedostatki-dokumentov"
              className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-6 py-4 text-base font-semibold text-[#081a4b] transition hover:bg-slate-50"
            >
              Общий материал по теме
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
