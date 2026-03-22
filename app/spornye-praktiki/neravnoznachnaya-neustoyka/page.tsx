import type { Metadata } from "next";
import Link from "next/link";
import { SITE_CONTACTS } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Неравная неустойка в госконтракте | GOSZAKON",
  description:
    "Разбираем спорную практику неравной неустойки в госконтрактах, когда ответственность поставщика заведомо жестче ответственности заказчика и затем используется против него.",
};

const imbalanceExamples = [
  "Заказчик почти не отвечает за просрочку оплаты, а поставщик отвечает за каждый день просрочки по жесткой ставке.",
  "В договоре для заказчика предусмотрены льготные периоды и мягкие последствия, а для поставщика - быстрый рост санкций.",
  "База расчета и логика начисления для поставщика значительно тяжелее, чем для самого заказчика.",
  "Даже при явном перекосе ответственности заказчик потом применяет свою неустойку выборочно и нередко еще и с ошибками.",
];

const whyProblem = [
  "Договор почти всегда пишет заказчик, поэтому изначально закладывает удобную для себя модель ответственности.",
  "Неравная неустойка становится для заказчика инструментом давления, а не только способом компенсировать нарушение.",
  "При конфликте такой перекос позволяет удерживать деньги, начислять завышенные суммы и выдавливать поставщика из отношений.",
  "Даже когда условие уже спорно само по себе, заказчик часто применяет его еще и процессуально неправильно.",
];

const whatWeCheck = [
  {
    title: "Как реально устроена ответственность сторон",
    text: "Смотрим не только на размер ставки, но и на весь перекос: льготные периоды, базу начисления, сроки, порядок уведомления и последствия нарушения для каждой стороны.",
  },
  {
    title: "Как заказчик оформил начисление",
    text: "Просто насчитать неустойку может почти любой. Но довести ее по договору, процедуре и срокам правильно - это уже редкость. Именно здесь заказчики очень часто ошибаются.",
  },
  {
    title: "Где сам заказчик нарушил свои условия",
    text: "Проверяем, как направлялась претензия, соблюден ли порядок уведомления, правильно ли рассчитана сумма и не нарушил ли заказчик собственные обязательства.",
  },
  {
    title: "Как использовать перекос в защите поставщика",
    text: "Показываем, что спор идет не просто о цифре, а о системно неравной конструкции договора и о слабом применении этой конструкции самим заказчиком.",
  },
];

const practicalMeaning = [
  "Неравная неустойка почти во всех договорах становится важным аргументом для снижения санкции.",
  "Когда заказчик применяет такой перекос выборочно, это усиливает сомнения в добросовестности его позиции.",
  "Чем жестче заказчик переписывает договор под себя, тем чаще потом сам не соблюдает собственные же правила начисления.",
  "Именно в этих несостыковках и появляется сильная защита поставщика.",
];

export default function UnequalPenaltyPage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="grid gap-12 lg:grid-cols-[1.08fr_0.92fr]">
            <div>
              <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600">
                Спорные практики
              </div>

              <h1 className="mt-6 text-5xl font-bold tracking-tight text-[#081a4b] md:text-6xl">
                Неравная неустойка в госконтракте
              </h1>

              <p className="mt-6 text-lg leading-9 text-slate-700">
                Неравная неустойка - один из самых устойчивых перекосов в
                закупочной практике. Поскольку договор почти всегда пишет сам
                заказчик, он почти никогда не делает ответственность одинаковой
                для себя и для поставщика. В результате за неоплату заказчик
                рискует минимально, а за просрочку поставщика запускается
                жесткий и дорогой механизм санкций.
              </p>

              <p className="mt-4 text-lg leading-9 text-slate-700">
                Мы считаем такую практику системной проблемой. Причем важен не
                только сам перекос в тексте договора, но и то, как заказчик
                потом им пользуется: применяет выборочно, считает неправильно,
                удерживает деньги и использует неустойку как инструмент давления
                на поставщика.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <a
                  href={SITE_CONTACTS.phoneHref}
                  className="rounded-2xl bg-[#081a4b] px-6 py-4 font-semibold text-white transition hover:bg-[#0d2568]"
                >
                  {SITE_CONTACTS.phoneDisplay}
                </a>

                <a
                  href={SITE_CONTACTS.emailHref}
                  className="rounded-2xl border border-slate-300 px-6 py-4 font-semibold transition hover:bg-slate-50"
                >
                  {SITE_CONTACTS.email}
                </a>
              </div>
            </div>

            <div className="rounded-[32px] border border-slate-200 bg-slate-50 p-8 shadow-sm">
              <div className="text-sm uppercase tracking-[0.14em] text-slate-400">
                Как выглядит перекос
              </div>

              <h2 className="mt-4 text-3xl font-bold text-[#081a4b]">
                Типовые признаки неравной неустойки
              </h2>

              <div className="mt-6 space-y-3 text-base leading-8 text-slate-700">
                {imbalanceExamples.map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-slate-200 bg-white p-4"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-20 lg:grid-cols-[1fr_0.95fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600">
              Почему это проблема
            </div>

            <h2 className="mt-6 text-3xl font-bold tracking-tight text-[#081a4b]">
              Неустойка превращается в инструмент давления, а не в баланс ответственности
            </h2>

            <div className="mt-6 space-y-4">
              {whyProblem.map((item) => (
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
              Что мы видим на практике
            </div>

            <p className="mt-6 text-lg leading-9 text-white/90">
              Заказчик часто применяет такую неустойку не автоматически, а
              выборочно. Если отношения удобны, санкцию могут вообще не
              трогать. Если нужно создать давление, удержать деньги или
              избавиться от поставщика, неустойка внезапно начинает работать -
              причем нередко еще и с ошибками в расчете и процедуре.
            </p>

            <p className="mt-4 text-lg leading-9 text-white/90">
              Это и делает вопрос неравной ответственности особенно важным:
              спор идет не только о размере санкции, но и о том, как заказчик
              использует перекошенный договор против более слабой стороны.
            </p>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="max-w-3xl">
            <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600">
              Как мы работаем
            </div>

            <h2 className="mt-5 text-4xl font-bold text-[#081a4b]">
              Просто начислить неустойку легко, а вот применить ее правильно заказчики умеют редко
            </h2>

            <p className="mt-5 text-lg leading-9 text-slate-700">
              Почти везде заказчики не доводят эту работу так, как положено по
              договору, срокам и процедурам. Именно поэтому для нас важно не
              только само условие о неустойке, но и то, как оно реализовано в
              конкретном споре.
            </p>

            <p className="mt-4 text-lg leading-9 text-slate-700">
              Мы анализируем ситуацию полностью, чтобы понять, где заказчик
              ошибся, какие несостыковки допустил и как использовать их для
              снижения неустойки. Здесь решают детали, и именно опытный
              закупочный юрист способен их увидеть и превратить в сильную
              защиту поставщика.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {whatWeCheck.map((item) => (
              <div
                key={item.title}
                className="rounded-3xl border border-slate-200 bg-slate-50 p-7 shadow-sm"
              >
                <h3 className="text-xl font-semibold text-[#081a4b]">
                  {item.title}
                </h3>
                <p className="mt-4 text-slate-700">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-20 lg:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600">
              Практический смысл
            </div>

            <div className="mt-6 space-y-4">
              {practicalMeaning.map((item) => (
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
              Почему здесь важен опыт
            </div>

            <p className="mt-6 text-lg leading-9 text-white/90">
              Только опытный юрист по закупочным спорам обычно способен увидеть
              процессуальные и договорные ошибки заказчика в таких делах.
              Вопрос не в том, чтобы просто написать "снизьте неустойку", а в
              том, чтобы разобрать механизм ее появления, порядок применения и
              показать, где сама позиция заказчика юридически слаба.
            </p>

            <p className="mt-4 text-lg leading-9 text-white/90">
              Мы используем именно эти тонкости. Не спорим абстрактно о
              справедливости, а показываем конкретные несостыковки, которые
              позволяют снижать санкцию и защищать поставщика.
            </p>
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
              Куда перейти дальше по теме неустойки
            </h2>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <Link
              href="/sudebnaya-zashita-v-zakupkah/snizhenie-neustojki-postavshiku"
              className="rounded-3xl border border-slate-200 bg-slate-50 p-7 shadow-sm transition hover:bg-white hover:shadow-md"
            >
              <h3 className="text-2xl font-semibold text-[#081a4b]">
                Снижение неустойки поставщику
              </h3>
              <p className="mt-4 text-slate-700">
                Судебная стратегия, когда заказчик уже насчитал или удержал
                чрезмерную неустойку по контракту.
              </p>
            </Link>

            <Link
              href="/cases?q=%D0%BD%D0%B5%D1%83%D1%81%D1%82%D0%BE%D0%B9%D0%BA%D0%B0"
              className="rounded-3xl border border-slate-200 bg-slate-50 p-7 shadow-sm transition hover:bg-white hover:shadow-md"
            >
              <h3 className="text-2xl font-semibold text-[#081a4b]">
                Практика по неустойке
              </h3>
              <p className="mt-4 text-slate-700">
                Связанные кейсы и решения, где спор шел о расчете санкций,
                договорных условиях и удержаниях заказчика.
              </p>
            </Link>

            <Link
              href="/uslugi/proverka-zakupki"
              className="rounded-3xl border border-slate-200 bg-slate-50 p-7 shadow-sm transition hover:bg-white hover:shadow-md"
            >
              <h3 className="text-2xl font-semibold text-[#081a4b]">
                Получить консультацию
              </h3>
              <p className="mt-4 text-slate-700">
                Можно быстро проверить договор и понять, где именно заказчик
                заложил перекос ответственности и как это использовать в споре.
              </p>
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-[#081a4b] text-white">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <h2 className="text-4xl font-bold">
                В контракте заложена неравная неустойка и заказчик уже начал ей пользоваться?
              </h2>

              <p className="mt-5 max-w-3xl text-lg leading-9 text-white/90">
                Направьте нам договор, претензию, расчет и переписку. Мы
                посмотрим, где именно заказчик ошибся в условиях, процедуре или
                применении санкции и можно ли использовать этот перекос для
                снижения неустойки.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3 text-base text-white/85">
                <a href={SITE_CONTACTS.phoneHref} className="font-semibold text-white">
                  {SITE_CONTACTS.phoneDisplay}
                </a>
                <a href={SITE_CONTACTS.emailHref} className="transition hover:text-white">
                  {SITE_CONTACTS.email}
                </a>
              </div>

              <div className="mt-5 text-sm text-white/70">
                Смотрите также{" "}
                <Link
                  href="/sudebnaya-zashita-v-zakupkah/snizhenie-neustojki-postavshiku"
                  className="underline underline-offset-4"
                >
                  страницу о снижении неустойки поставщику
                </Link>{" "}
                и материал{" "}
                <Link
                  href="/neoplata-po-goskontraktu"
                  className="underline underline-offset-4"
                >
                  о неоплате по госконтракту
                </Link>
                .
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <a
                href={SITE_CONTACTS.phoneHref}
                className="rounded-2xl bg-white px-6 py-4 text-center font-semibold text-[#081a4b]"
              >
                Позвонить
              </a>

              <a
                href={SITE_CONTACTS.emailHref}
                className="rounded-2xl border border-white/20 px-6 py-4 text-center transition hover:bg-white/5"
              >
                Написать на почту
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
