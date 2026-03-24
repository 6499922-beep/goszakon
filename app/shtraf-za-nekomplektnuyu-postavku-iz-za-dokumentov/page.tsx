import type { Metadata } from "next";
import Link from "next/link";
import { SITE_CONTACTS } from "@/lib/site-config";

export const metadata: Metadata = {
  title:
    "Штраф за некомплектную поставку из-за документов | GOSZAKON",
  description:
    "Разбираем случаи, когда заказчик называет поставку некомплектной из-за спорных документов, УПД или накладных и начисляет штраф без реального основания.",
};

const situations = [
  "Заказчик ссылается на ошибку в накладной или ином документе и объявляет поставку некомплектной.",
  "Товар фактически поставлен, но из-за формального дефекта в бумагах применяют штраф как за реальную недопоставку.",
  "Под видом некомплектной поставки заказчик удерживает деньги из оплаты и усиливает спор по исполнению контракта.",
  "Документы принимают, а позже используют их оформление как повод переквалифицировать исполнение в нарушение.",
];

const excuses = [
  "Раз документы оформлены спорно, значит заказчик вправе считать поставку некомплектной.",
  "Наличие замечаний в накладной якобы доказывает, что обязательство исполнено ненадлежащим образом.",
  "Поставщик подписал договор и заранее согласился с такой квалификацией нарушения.",
  "Заказчик считает, что комплектность можно оценивать через форму документа, а не через фактический результат поставки.",
];

const weakPoints = [
  "Комплектность поставки определяется реальным составом переданного товара, а не только формулировкой в документе.",
  "Заказчик часто подменяет спор о бумагах спором о фактическом исполнении, хотя это разные вещи.",
  "Если товар принят, используется и не оспорен по существу, позиция о некомплектности из-за документов резко слабеет.",
  "Такие штрафы нередко связаны с удержанием денег, завышенной неустойкой и другими перекосами, которые заказчик строит вокруг одного формального дефекта.",
];

const firstChecks = [
  "Был ли реально неполный состав поставки или спор крутится только вокруг документов.",
  "Что именно заказчик считает подтверждением некомплектности: факт, осмотр товара или только оформление бумаг.",
  "Принял ли заказчик товар и не начал ли спор о комплектности уже после приемки.",
  "Есть ли в договоре прямое основание для такого штрафа и соответствует ли оно реальной ситуации.",
  "Не превратился ли этот штраф уже в удержание из оплаты или встречное требование.",
];

const outcomes = [
  "Выбивание штрафа, если заказчик подменил спор о документах спором о комплектности.",
  "Снижение суммы, если санкция явно несоразмерна реальному положению дел.",
  "Возврат удержанной части оплаты, если штраф уже обратили в удержание.",
  "Ослабление общей позиции заказчика по приемке, оплате и дальнейшей неустойке.",
];

export default function IncompleteSupplyDocsPenaltyPage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 lg:grid-cols-[1.08fr_0.92fr] lg:py-24">
          <div>
            <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600">
              Практика GOSZAKON
            </div>

            <h1 className="mt-6 max-w-5xl text-5xl font-bold leading-[1.02] tracking-tight text-[#081a4b] md:text-7xl">
              Штраф за некомплектную поставку из-за документов
            </h1>

            <p className="mt-6 max-w-3xl text-xl leading-9 text-slate-700">
              Один из самых спорных сценариев, когда заказчик берет формальную
              проблему в УПД, накладной или ином документе и пытается на этом
              основании объявить поставку некомплектной. В реальности это часто
              не спор о составе товара, а способ усилить санкцию против
              поставщика.
            </p>

            <p className="mt-4 max-w-3xl text-lg leading-9 text-slate-700">
              Мы разбираем такие случаи через фактическую комплектность,
              приемку, условия договора и поведение заказчика после поставки.
              Если товар реально передан, а спор строится на бумагах, такую
              квалификацию нужно ломать на уровне основания.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href={SITE_CONTACTS.phoneHref}
                className="rounded-2xl bg-[#081a4b] px-7 py-4 text-center text-base font-semibold text-white transition hover:bg-[#0d2568]"
              >
                Разобрать штраф
              </a>

              <a
                href={SITE_CONTACTS.emailHref}
                className="rounded-2xl border border-slate-300 bg-white px-7 py-4 text-center text-base font-semibold text-[#081a4b] transition hover:bg-slate-50"
              >
                Направить документы
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
                Был ли реально неполный состав поставки или заказчик просто
                пытается превратить бумажный дефект в более тяжелое нарушение.
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
              Формальный дефект документов подают как доказательство неполной поставки
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
              Куда перейти дальше по теме документов, комплектности и штрафов
            </h2>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <Link
              href="/shtraf-za-formalnye-nedostatki-dokumentov"
              className="rounded-3xl border border-slate-200 bg-slate-50 p-7 shadow-sm transition hover:bg-white hover:shadow-md"
            >
              <h3 className="text-2xl font-semibold text-[#081a4b]">
                Штраф за формальные недостатки документов
              </h3>
              <p className="mt-4 text-slate-700">
                Общая страница о случаях, когда спорный документооборот
                превращают в денежную санкцию.
              </p>
            </Link>

            <Link
              href="/shtraf-za-oshibku-v-upd-ili-nakladnoy"
              className="rounded-3xl border border-slate-200 bg-slate-50 p-7 shadow-sm transition hover:bg-white hover:shadow-md"
            >
              <h3 className="text-2xl font-semibold text-[#081a4b]">
                Штраф за ошибку в УПД или накладной
              </h3>
              <p className="mt-4 text-slate-700">
                Узкий материал о споре, где штраф строят именно на оформлении
                УПД и товарной накладной.
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
                Если штраф за якобы некомплектную поставку уже удержали из
                платежа, спор нужно вести и по основанию, и по деньгам.
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
                Кейсы и материалы, где спор идет о санкциях, удержаниях и
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
                Если заказчик раздувает санкцию через спорную квалификацию
                поставки, важно быстро проверить и основание, и расчет.
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
                Если у вас уже есть договор, накладные, претензия и расчет
                штрафа, можно сразу перейти к правовой оценке.
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
              Если заказчик называет поставку некомплектной только из-за документов, это нужно быстро разворачивать обратно в спор о фактах
            </h2>

            <p className="mt-5 max-w-2xl text-lg leading-9 text-slate-200">
              Направьте нам договор, накладные, УПД, акты приемки и претензию.
              Мы посмотрим, есть ли у заказчика реальные основания говорить о
              некомплектности или это формальная конструкция под штраф.
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
