import type { Metadata } from "next";
import Link from "next/link";
import { SITE_CONTACTS } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Неустойка на всю сумму контракта | GOSZAKON",
  description:
    "Разбираем ситуацию, когда заказчик считает неустойку на всю сумму контракта, а не на фактически проблемную часть обязательства: где его позиция слаба и как ломать такой расчет.",
};

const situations = [
  "Часть товара уже поставлена и принята, но заказчик все равно считает санкцию от всей цены контракта.",
  "Просрочка касается только остатка поставки, а базой для расчета берут полный объем договора.",
  "Неустойка на всю сумму контракта потом превращается в удержание из оплаты или основание для иска.",
  "Заказчик подает такой расчет как что-то стандартное, хотя он завышает санкцию в разы.",
];

const excuses = [
  "Раз договор один, значит и считать можно от всей его цены.",
  "Частичное исполнение якобы не влияет на базу начисления, пока обязательство не закрыто полностью.",
  "Поставщик согласился с договором, значит спорить с таким расчетом поздно.",
  "Заказчик считает, что вправе сначала начислить максимум, а потом уже разбираться с деталями.",
];

const weakPoints = [
  "База расчета неустойки должна быть связана с реально проблемной частью обязательства, а не автоматически со всей ценой договора.",
  "Если часть поставки принята, заказчик не может игнорировать исполненный объем только потому, что ему так удобнее считать.",
  "Завышенный расчет почти всегда усиливает и другие слабости заказчика: удержание из оплаты, спорный претензионный порядок и несоразмерность санкции.",
  "Когда заказчик считает на всю сумму контракта, это часто не правоприменение, а способ создать поставщику максимально тяжелую цифру.",
];

const workPrinciples = [
  {
    title: "Разбираем, какая часть обязательства реально спорная",
    text: "Смотрим, что поставлено, что принято, по какому объему вообще есть просрочка и какую часть контракта заказчик пытается искусственно втянуть в расчет.",
  },
  {
    title: "Проверяем базу начисления",
    text: "Ключевой вопрос в таких делах не только размер процента, а то, от какой суммы его считают и почему заказчик решил взять именно весь контракт.",
  },
  {
    title: "Связываем расчет с фактическим исполнением",
    text: "Если товар, работы или услуги уже приняты в части, это должно работать против завышенного расчета и ломать саму конструкцию неустойки.",
  },
  {
    title: "Используем практику и логику договора",
    text: "Мы не просим снизить сумму абстрактно, а показываем, что сам подход заказчика к расчету юридически неверен и завышает санкцию.",
  },
];

const firstChecks = [
  "Какая часть обязательства реально просрочена, а какая уже исполнена и принята.",
  "Что заказчик взял за базу начисления: остаток, этап, отдельную партию или всю цену контракта.",
  "Есть ли в деле документы о частичной приемке, поставке и закрытии части обязательств.",
  "Не превратился ли завышенный расчет уже в удержание из оплаты или встречное требование к поставщику.",
  "Как этот расчет соотносится с судебной практикой и фактической логикой исполнения договора.",
];

const outcomes = [
  "Исключение из базы расчета уже исполненной и принятой части обязательства.",
  "Существенное снижение неустойки за счет корректной базы начисления.",
  "Ослабление позиции заказчика по удержанию, претензии или встречному иску.",
  "Подготовка сильной позиции для суда и дальнейшего возврата удержанных денег.",
];

export default function FullContractPenaltyPage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 lg:grid-cols-[1.08fr_0.92fr] lg:py-24">
          <div>
            <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600">
              Практика GOSZAKON
            </div>

            <h1 className="mt-6 max-w-5xl text-5xl font-bold leading-[1.02] tracking-tight text-[#081a4b] md:text-7xl">
              Неустойка на всю сумму контракта
            </h1>

            <p className="mt-6 max-w-3xl text-xl leading-9 text-slate-700">
              Один из самых частых и самых дорогих перекосов в закупочных
              спорах, когда заказчик считает неустойку не от реально проблемной
              части обязательства, а от всей цены контракта. Так сумма санкции
              искусственно раздувается и сразу создает поставщику тяжелую
              переговорную позицию.
            </p>

            <p className="mt-4 max-w-3xl text-lg leading-9 text-slate-700">
              Мы разбираем такие случаи через фактическое исполнение и базу
              расчета. Если часть поставки уже исполнена и принята, заказчик не
              должен превращать весь контракт в основание для максимальной
              санкции только потому, что так удобнее.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href={SITE_CONTACTS.phoneHref}
                className="rounded-2xl bg-[#081a4b] px-7 py-4 text-center text-base font-semibold text-white transition hover:bg-[#0d2568]"
              >
                Разобрать расчет неустойки
              </a>

              <a
                href={SITE_CONTACTS.emailHref}
                className="rounded-2xl border border-slate-300 bg-white px-7 py-4 text-center text-base font-semibold text-[#081a4b] transition hover:bg-slate-50"
              >
                Направить договор и претензию
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
                Главная ошибка
              </div>
              <p className="mt-4 text-lg leading-9 text-white/90">
                Заказчик берет самую тяжелую базу расчета и делает вид, что
                частичного исполнения как будто не было.
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
              Завышенный расчет часто подают как обычную арифметику
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
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="max-w-3xl">
            <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600">
              Наша логика
            </div>

            <h2 className="mt-5 text-4xl font-bold tracking-tight text-[#081a4b] md:text-5xl">
              Вопрос не в том, что процент высокий, а в том, что заказчик считает от неправильной суммы
            </h2>

            <p className="mt-5 text-lg leading-9 text-slate-700">
              По таким делам слабая защита обычно сводится к просьбе снизить
              итоговую цифру. Сильная защита начинается раньше: с проверки
              самой базы начисления, факта частичного исполнения и того, почему
              заказчик вообще решил игнорировать уже принятую часть контракта.
            </p>

            <p className="mt-4 text-lg leading-9 text-slate-700">
              Такой спор часто связан не только с неустойкой. Завышенный расчет
              может перейти в удержание из оплаты, усилить претензию заказчика
              и в целом создать ложное ощущение, что поставщик уже проиграл по
              цифрам. Именно поэтому базу расчета нужно ломать сразу.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {workPrinciples.map((item) => (
              <div
                key={item.title}
                className="rounded-3xl border border-slate-200 bg-slate-50 p-7 shadow-sm"
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

      <section className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-20 lg:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600">
              Что смотреть первым
            </div>

            <div className="mt-6 space-y-4">
              {firstChecks.map((item) => (
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
              Куда перейти дальше по теме завышенной неустойки
            </h2>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <Link
              href="/analitika/neustoyka-ne-na-vsyu-summu-dogovora-a51-11790-2025"
              className="rounded-3xl border border-slate-200 bg-slate-50 p-7 shadow-sm transition hover:bg-white hover:shadow-md"
            >
              <h3 className="text-2xl font-semibold text-[#081a4b]">
                Судебный материал по делу А51-11790/2025
              </h3>
              <p className="mt-4 text-slate-700">
                Показательный судебный акт, где прямо разобрана ошибочность
                расчета неустойки на всю цену договора.
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
                Общая стратегия по спорам о санкциях, удержаниях и завышенном
                расчете заказчика.
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
                Когда завышенный расчет уже превратили в удержание и просто
                уменьшили платеж поставщику.
              </p>
            </Link>

            <Link
              href="/shtraf-za-formalnye-nedostatki-dokumentov"
              className="rounded-3xl border border-slate-200 bg-slate-50 p-7 shadow-sm transition hover:bg-white hover:shadow-md"
            >
              <h3 className="text-2xl font-semibold text-[#081a4b]">
                Штраф за формальные недостатки документов
              </h3>
              <p className="mt-4 text-slate-700">
                Еще один частый сценарий, когда санкцию завышают не по сути
                исполнения, а через спорную квалификацию документов.
              </p>
            </Link>

            <Link
              href="/spornye-praktiki/neravnoznachnaya-neustoyka"
              className="rounded-3xl border border-slate-200 bg-slate-50 p-7 shadow-sm transition hover:bg-white hover:shadow-md"
            >
              <h3 className="text-2xl font-semibold text-[#081a4b]">
                Неравная неустойка
              </h3>
              <p className="mt-4 text-slate-700">
                Разбор системного перекоса в договорах, который потом усиливает
                и завышенные расчеты заказчиков.
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
                Подборка кейсов и материалов, где спор идет о расчете санкции,
                удержаниях и договорной ответственности сторон.
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
              Если заказчик считает неустойку на всю сумму контракта, это нужно ломать сразу на уровне базы расчета
            </h2>

            <p className="mt-5 max-w-2xl text-lg leading-9 text-slate-200">
              Направьте нам договор, спецификацию, документы о частичной
              приемке, претензию и расчет. Мы оценим, насколько завышена база
              начисления и как лучше переломить спор.
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
              href="/cases/neustoyka"
              className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-6 py-4 text-base font-semibold text-[#081a4b] transition hover:bg-slate-50"
            >
              Практика по неустойке и удержаниям
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
