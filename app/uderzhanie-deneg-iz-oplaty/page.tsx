import type { Metadata } from "next";
import Link from "next/link";
import { SITE_CONTACTS } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Заказчик удержал деньги из оплаты по госконтракту | GOSZAKON",
  description:
    "Разбираем ситуации, когда заказчик удерживает деньги из оплаты по госконтракту: неустойку, штраф, спорную сумму или иное удержание без достаточного основания.",
};

const situations = [
  "Заказчик просто вычел из оплаты неустойку, которую сам же и насчитал.",
  "Из платежа удержали штраф за спорное или формальное нарушение документов.",
  "Заказчик удерживает деньги, хотя в договоре нет прямого права на такое удержание.",
  "Под видом удержания заказчик фактически перекладывает на поставщика весь спор без суда и нормальной проверки оснований.",
];

const excuses = [
  "Вы согласились с договором, значит заказчик вправе сам удержать спорную сумму.",
  "Сначала нужно оплатить неустойку, а уже потом можно говорить об остатке платежа.",
  "Удержание якобы допустимо автоматически, потому что у заказчика есть претензия к поставке.",
  "Пока спор по документам или приемке не закрыт, заказчик считает возможным не перечислять часть денег.",
];

const weakPoints = [
  "В договоре вообще может не быть прямого условия о праве заказчика удерживать деньги из оплаты.",
  "Сам расчет удержанной суммы часто завышен или построен на ошибочной базе начисления.",
  "Заказчик нарушает собственный претензионный порядок, но все равно удерживает деньги как будто вопрос уже решен.",
  "Удержание нередко строится на споре, который сам заказчик и создал: затянул приемку, не подписал УПД или навязал внутренние документы.",
];

const workPrinciples = [
  {
    title: "Проверяем, было ли право на удержание",
    text: "Смотрим сам договор, порядок оплаты и формулировки об ответственности. Очень часто заказчик удерживает деньги шире, чем ему вообще позволено.",
  },
  {
    title: "Ломаем расчет и основание удержания",
    text: "Проверяем, на какую сумму начислена санкция, за какой период, соблюден ли порядок претензии и не построен ли спор на собственной ошибке заказчика.",
  },
  {
    title: "Связываем удержание с поведением заказчика",
    text: "Если заказчик сам затянул приемку, не оплатил вовремя, требовал лишние документы или создал препятствия для исполнения, это должно работать против него.",
  },
  {
    title: "Переводим спор в активную позицию",
    text: "Наша цель не просто спорить с удержанием, а вернуть деньги, снизить санкцию или развернуть конфликт в требование уже к заказчику.",
  },
];

const firstChecks = [
  "Есть ли в договоре прямое и корректно сформулированное право заказчика на удержание.",
  "Что именно удержали: неустойку, штраф, спорную цену, якобы излишне выплаченную сумму или другой платеж.",
  "Соблюден ли претензионный порядок и был ли поставщик надлежащим образом уведомлен.",
  "Не строится ли удержание на споре о приемке, УПД, внутренних актах или других действиях самого заказчика.",
];

const outcomes = [
  "Возврат неправомерно удержанной суммы.",
  "Снижение спорной неустойки или штрафа до реально защищаемого уровня.",
  "Ослабление позиции заказчика в споре по оплате и санкциям.",
  "Подготовка базы для взыскания долга, процентов и встречных требований к заказчику.",
];

export default function WithheldPaymentPage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 lg:grid-cols-[1.08fr_0.92fr] lg:py-24">
          <div>
            <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600">
              Практика GOSZAKON
            </div>

            <h1 className="mt-6 max-w-5xl text-5xl font-bold leading-[1.02] tracking-tight text-[#081a4b] md:text-7xl">
              Заказчик удержал деньги из оплаты по госконтракту
            </h1>

            <p className="mt-6 max-w-3xl text-xl leading-9 text-slate-700">
              Удержание денег из оплаты стало для заказчиков одним из самых
              удобных инструментов давления. Вместо нормального разрешения
              спора заказчик просто уменьшает платеж, ссылается на свою
              претензию, неустойку или штраф и перекладывает на поставщика
              задачу потом отдельно отбивать эти деньги.
            </p>

            <p className="mt-4 max-w-3xl text-lg leading-9 text-slate-700">
              Мы разбираем такие ситуации не как “спор о цифре”, а как вопрос о
              том, имел ли заказчик вообще право удерживать деньги, правильно ли
              он посчитал сумму и не построен ли весь конфликт на его же
              собственных нарушениях.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href={SITE_CONTACTS.phoneHref}
                className="rounded-2xl bg-[#081a4b] px-7 py-4 text-center text-base font-semibold text-white transition hover:bg-[#0d2568]"
              >
                Разобрать удержание
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
                Главный перекос
              </div>
              <p className="mt-4 text-lg leading-9 text-white/90">
                Заказчик сначала сам формирует договор и санкции, а потом
                пытается обратить их в быстрый инструмент удержания денег, еще
                до того как спор реально проверен.
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
              Формальное удержание часто выдают за что-то само собой допустимое
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
              Мы не спорим с удержанием абстрактно, мы разбираем, почему заказчик вообще решил, что может так сделать
            </h2>

            <p className="mt-5 text-lg leading-9 text-slate-700">
              В таких делах слабая позиция начинается с просьбы “вернуть деньги,
              потому что так нечестно”. Сильная позиция строится иначе: что
              предусмотрено договором, как начислена сумма, соблюден ли
              претензионный порядок, и не нарушил ли сам заказчик условия
              оплаты, приемки или документооборота.
            </p>

            <p className="mt-4 text-lg leading-9 text-slate-700">
              Удержание денег часто невозможно рассматривать отдельно. Оно
              почти всегда связано с неустойкой, приемкой, УПД, внутренними
              актами и более широким спором об исполнении контракта.
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
              Куда перейти дальше по удержаниям и оплате
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
                Если удержание построено на неустойке или штрафе, спор почти
                всегда нужно вести сразу и по сумме, и по самому основанию.
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
                Общая стратегия, если заказчик не просто задерживает оплату, а
                сокращает платеж и создает препятствия для расчета.
              </p>
            </Link>

            <Link
              href="/spornye-praktiki/vnutrennie-sistemy-oplaty"
              className="rounded-3xl border border-slate-200 bg-slate-50 p-7 shadow-sm transition hover:bg-white hover:shadow-md"
            >
              <h3 className="text-2xl font-semibold text-[#081a4b]">
                Внутренние документы заказчика
              </h3>
              <p className="mt-4 text-slate-700">
                Когда удержание денег маскируют под акты, внутренние системы,
                предварительную оплату неустойки и другие спорные условия.
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
              Если заказчик уже удержал деньги, спор нужно переводить в проверку основания и возврат суммы
            </h2>

            <p className="mt-5 max-w-2xl text-lg leading-9 text-slate-200">
              Направьте нам договор, претензию, расчет удержания, УПД и
              переписку. Мы посмотрим, имел ли заказчик право уменьшать платеж
              и как лучше вернуть удержанные деньги.
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
              className="inline-flex items-center justify-center rounded-2xl border border-slate-300 px-6 py-4 text-base font-semibold text-[#081a4b] transition hover:bg-slate-50"
            >
              Написать: {SITE_CONTACTS.email}
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
