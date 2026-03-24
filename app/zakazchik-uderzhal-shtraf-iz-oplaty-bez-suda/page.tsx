import type { Metadata } from "next";
import Link from "next/link";
import { SITE_CONTACTS } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Заказчик удержал штраф из оплаты без суда | GOSZAKON",
  description:
    "Разбираем случаи, когда заказчик удерживает штраф из оплаты без суда: где проходит граница между договорным правом и произвольным уменьшением платежа.",
};

const situations = [
  "Заказчик сам насчитал штраф и просто вычел его из платежа без отдельного разрешения спора.",
  "Из оплаты удержали санкцию за документы, приемку или якобы некомплектную поставку.",
  "Поставщику предлагают сначала смириться со штрафом, а уже потом отдельно спорить с остатком денег.",
  "Удержание подают как обычное исполнение договора, хотя реальной проверки основания еще не было.",
];

const excuses = [
  "Раз штраф предусмотрен договором, заказчик вправе сам сразу удержать его из оплаты.",
  "Поставщик подписал контракт, значит заранее согласился и с удержанием.",
  "Сначала нужно погасить штраф, а уже потом говорить о размере остатка платежа.",
  "Заказчик считает, что наличие претензии уже само по себе дает право уменьшить оплату.",
];

const weakPoints = [
  "В договоре может вообще не быть прямого и корректного права на такое удержание.",
  "Даже если санкция предусмотрена, это не означает, что заказчик вправе единолично и без разбора списать деньги.",
  "Удержание часто строится на спорном штрафе, завышенной неустойке или формальном дефекте документов.",
  "Заказчик нередко нарушает претензионный порядок, сроки уведомления или сам создает спорную ситуацию, на которой потом строит удержание.",
];

const firstChecks = [
  "Есть ли в договоре прямое основание именно для удержания штрафа из оплаты.",
  "На чем построен сам штраф: реальном нарушении, завышенном расчете или формальной придирке.",
  "Был ли соблюден претензионный порядок и как заказчик уведомлял поставщика.",
  "Не связан ли штраф с приемкой, УПД, накладными или другими действиями самого заказчика.",
  "Какую часть оплаты удержали и не завышена ли сама база расчета санкции.",
];

const outcomes = [
  "Возврат удержанной суммы, если заказчик не имел права так уменьшать платеж.",
  "Снижение спорной санкции, если штраф завышен или основан на слабой квалификации нарушения.",
  "Ослабление позиции заказчика по основному спору об оплате и исполнении контракта.",
  "Подготовка сильной базы для суда и встречных требований к заказчику.",
];

export default function WithheldPenaltyWithoutCourtPage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 lg:grid-cols-[1.08fr_0.92fr] lg:py-24">
          <div>
            <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600">
              Практика GOSZAKON
            </div>

            <h1 className="mt-6 max-w-5xl text-5xl font-bold leading-[1.02] tracking-tight text-[#081a4b] md:text-7xl">
              Заказчик удержал штраф из оплаты без суда
            </h1>

            <p className="mt-6 max-w-3xl text-xl leading-9 text-slate-700">
              Один из самых болезненных сценариев для поставщика, когда спор о
              штрафе даже не успели нормально разобрать, а заказчик уже сам
              уменьшил платеж. На практике это часто подают как техническое
              исполнение договора, хотя по сути это одностороннее решение о
              деньгах в свою пользу.
            </p>

            <p className="mt-4 max-w-3xl text-lg leading-9 text-slate-700">
              Мы разбираем такие случаи не как спор о цифре, а как вопрос о
              праве заказчика на удержание, основании самого штрафа и тех
              нарушениях, которые допустил он сам до того, как полез в оплату.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href={SITE_CONTACTS.phoneHref}
                className="rounded-2xl bg-[#081a4b] px-7 py-4 text-center text-base font-semibold text-white transition hover:bg-[#0d2568]"
              >
                Разобрать удержание штрафа
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
                Главный риск
              </div>
              <p className="mt-4 text-lg leading-9 text-white/90">
                Заказчик сначала сам квалифицирует нарушение, сам считает
                штраф и сам же сразу забирает деньги, не дожидаясь нормального
                разрешения спора.
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
              Удержание штрафа часто подают как автоматическое право заказчика
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
              Куда перейти дальше по штрафам, удержаниям и оплате
            </h2>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <Link
              href="/uderzhanie-deneg-iz-oplaty"
              className="rounded-3xl border border-slate-200 bg-slate-50 p-7 shadow-sm transition hover:bg-white hover:shadow-md"
            >
              <h3 className="text-2xl font-semibold text-[#081a4b]">
                Заказчик удержал деньги из оплаты
              </h3>
              <p className="mt-4 text-slate-700">
                Общий материал о случаях, когда заказчик уменьшает платеж на
                спорную сумму еще до разрешения конфликта.
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
                Если удержание построено на спорных бумагах, важно отдельно
                разобрать и основание самого штрафа.
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
                Кейсы, где спор идет о штрафах, удержании из оплаты и
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
                Если заказчик уже превратил спорную санкцию в удержание, вопрос
                обычно нужно решать и по сумме, и по самой базе штрафа.
              </p>
            </Link>

            <Link
              href="/neoplata-po-goskontraktu"
              className="rounded-3xl border border-slate-200 bg-slate-50 p-7 shadow-sm transition hover:bg-white hover:shadow-md"
            >
              <h3 className="text-2xl font-semibold text-[#081a4b]">
                Неоплата по госконтракту
              </h3>
              <p className="mt-4 text-slate-700">
                Когда удержание штрафа становится частью более широкой схемы
                неоплаты и давления через приемку и документы.
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
                Если у вас уже есть договор, претензия и расчет удержанного
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
              Если заказчик удержал штраф из оплаты без суда, спор нужно сразу переводить в проверку права на удержание и возврат суммы
            </h2>

            <p className="mt-5 max-w-2xl text-lg leading-9 text-slate-200">
              Направьте нам договор, претензию, расчет штрафа, платежные
              документы и переписку. Мы посмотрим, имел ли заказчик право
              списывать деньги в таком порядке и как лучше вернуть удержанную сумму.
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
              href="/uderzhanie-deneg-iz-oplaty"
              className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-6 py-4 text-base font-semibold text-[#081a4b] transition hover:bg-slate-50"
            >
              Общий материал по удержаниям
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
