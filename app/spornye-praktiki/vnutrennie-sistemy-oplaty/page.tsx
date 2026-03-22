import type { Metadata } from "next";
import Link from "next/link";
import { SITE_CONTACTS } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Привязка оплаты к внутренним документам заказчика | GOSZAKON",
  description:
    "Разбираем спорную практику, когда заказчики ставят оплату по госконтракту в зависимость от внутренних актов, систем, платежных дней и иных условий, не влияющих на момент расчета.",
};

const schemes = [
  "Оплата ставится в зависимость от подписания внутреннего акта заказчика, где он сам указывает сумму неустойки.",
  "После уже подписанного УПД поставщика заставляют заново заводить документы во внутреннюю программу заказчика.",
  "Заказчик пишет, что оплатит только после того, как поставщик сначала заплатит неустойку.",
  "Оплата откладывается до \"платежного дня\", который у заказчика бывает раз в месяц или по внутреннему графику.",
  "При наличии ЭДО заказчик требует только бумажные оригиналы и использует это как причину не платить.",
  "Заказчик увязывает оплату с полной поставкой всей партии, хотя контракт такого условия не содержит.",
];

const excuses = [
  "Вы подписали договор, значит согласились с таким порядком.",
  "Это наше право, а не обязанность оплачивать до выполнения внутренних процедур.",
  "У нас такая бухгалтерия и такой порядок оплаты.",
  "Пока документы не пройдут нашу систему, срок оплаты не наступил.",
  "Пока поставщик не оплатит начисленную неустойку, заказчик платить не будет.",
];

const whyControversial = [
  "Верховный Суд исходит из того, что момент оплаты должен определяться по факту надлежащего оформления и подписания документов исполнения, а не по внутренним уловкам заказчика.",
  "Внутренние акты, маршруты согласования и программы заказчика не должны подменять собой законный срок оплаты.",
  "Заказчик не может создавать дополнительные условия для расчета, которые зависят только от него самого.",
  "Привязка оплаты к предварительной уплате неустойки фактически лишает поставщика нормальной защиты и ставит его в зависимое положение.",
  "Косметические и технические процедуры не должны превращаться в инструмент задержки денег.",
];

const approach = [
  {
    title: "Отделяем законный срок оплаты от внутренних уловок",
    text: "Показываем, когда обязательство по оплате реально наступило и почему внутренние документы заказчика не могут сдвигать этот момент.",
  },
  {
    title: "Фиксируем искусственные препятствия",
    text: "Документируем, как заказчик требует лишние бумаги, повторную загрузку в систему, новые подписи или иные действия, которых нет в контракте.",
  },
  {
    title: "Начисляем встречную ответственность",
    text: "Считаем неустойку и проценты уже на стороне заказчика, чтобы ослабить его позицию и снизить или перекрыть предъявленные поставщику санкции.",
  },
  {
    title: "Выводим спор в сильную правовую плоскость",
    text: "Работаем не на уровне жалоб и эмоций, а на уровне точного понимания закупочного договора, сроков, практики и доказательств.",
  },
];

export default function InternalPaymentSystemsPage() {
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
                Привязка оплаты к внутренним документам заказчика
              </h1>

              <p className="mt-6 text-lg leading-9 text-slate-700">
                Одна из самых удобных для заказчика схем задержки оплаты выглядит
                так: деньги по контракту должны прийти не после подписания УПД и
                наступления законного срока, а после внутренних действий самого
                заказчика. Он придумывает дополнительный акт, внутреннюю систему,
                собственный платежный день или новое условие, без которого якобы
                нельзя платить.
              </p>

              <p className="mt-4 text-lg leading-9 text-slate-700">
                Мы считаем такую практику спорной и во многих случаях незаконной.
                Если оплата по сути зависит не от исполнения поставщика, а от
                того, что еще придумает заказчик у себя внутри, это уже не
                нормальный порядок расчета, а инструмент искусственной задержки денег.
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
                Как это обычно выглядит
              </div>

              <h2 className="mt-4 text-3xl font-bold text-[#081a4b]">
                Типовые схемы задержки оплаты
              </h2>

              <div className="mt-6 space-y-3 text-base leading-8 text-slate-700">
                {schemes.map((item) => (
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
              Что обычно говорит заказчик
            </div>

            <h2 className="mt-6 text-3xl font-bold tracking-tight text-[#081a4b]">
              Почти всегда это подается как якобы нормальный порядок
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
              Почему мы считаем это спорным
            </div>

            <div className="mt-6 space-y-4">
              {whyControversial.map((item) => (
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
              Практический смысл
            </div>

            <h2 className="mt-5 text-4xl font-bold text-[#081a4b]">
              Это не техническая оговорка, а способ управлять деньгами поставщика
            </h2>

            <p className="mt-5 text-lg leading-9 text-slate-700">
              Когда заказчик привязывает оплату к собственному акту, внутренней
              системе, платежному дню или предварительной уплате неустойки, он
              получает полный контроль над моментом расчета. Это означает, что
              поставщик может исполнить обязательство, оформить документы и все
              равно не получить деньги вовремя только потому, что заказчик
              придумал еще один внутренний шаг.
            </p>

            <p className="mt-4 text-lg leading-9 text-slate-700">
              Дальше эта схема работает еще агрессивнее: заказчик затягивает
              оплату, а затем использует накопившийся разрыв для давления на
              поставщика, в том числе через неустойку и иные удержания. Именно
              поэтому такие условия нужно оценивать не как бытовую формальность,
              а как спорную закупочную практику.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {approach.map((item) => (
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
              Наша позиция
            </div>

            <h2 className="mt-6 text-3xl font-bold tracking-tight text-[#081a4b]">
              Мы не принимаем внутренние правила заказчика как закон
            </h2>

            <p className="mt-5 text-lg leading-9 text-slate-700">
              Если срок оплаты уже наступил по закону и по сути исполнения,
              заказчик не может бесконечно переносить его на основании своих
              внутренних процедур. Особенно если эти процедуры целиком зависят от
              самого заказчика и не дают поставщику никакой реальной возможности
              влиять на момент расчета.
            </p>

            <p className="mt-4 text-lg leading-9 text-slate-700">
              В таких спорах важна точность. Нужно очень хорошо понимать, о чем
              именно идет речь: какой документ подписан, что написано в договоре,
              когда наступил срок оплаты, как связаны УПД, акты, ЭДО, претензии,
              неустойка и внутренние маршруты заказчика. Обычный юрист, далекий
              от госзакупок, здесь легко может все испортить.
            </p>
          </div>

          <div className="rounded-3xl bg-[#081a4b] p-8 text-white shadow-sm">
            <div className="inline-flex rounded-full border border-white/20 px-4 py-2 text-sm text-white/80">
              Что делаем на практике
            </div>

            <p className="mt-6 text-lg leading-9 text-white/90">
              Мы считаем встречную неустойку и проценты на стороне заказчика,
              фиксируем, что срок оплаты уже наступил, и используем это для
              ослабления его позиции. Во многих ситуациях это позволяет не
              только добиваться оплаты, но и снижать или перекрывать
              неустойку, предъявленную поставщику.
            </p>

            <p className="mt-4 text-lg leading-9 text-white/90">
              Это нужно делать ювелирно: здесь решают детали договора, логика
              исполнения и опыт в закупочных спорах, а не общие рассуждения о
              справедливости.
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
              Что смотреть рядом с этой проблемой
            </h2>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <Link
              href="/neoplata-po-goskontraktu"
              className="rounded-3xl border border-slate-200 bg-slate-50 p-7 shadow-sm transition hover:bg-white hover:shadow-md"
            >
              <h3 className="text-2xl font-semibold text-[#081a4b]">
                Неоплата по госконтракту
              </h3>
              <p className="mt-4 text-slate-700">
                Большой материал о взыскании оплаты, приемке, формальных
                замечаниях и искусственных препятствиях со стороны заказчика.
              </p>
            </Link>

            <Link
              href="/cases?q=%D0%9D%D0%B5%D0%BE%D0%BF%D0%BB%D0%B0%D1%82%D0%B0"
              className="rounded-3xl border border-slate-200 bg-slate-50 p-7 shadow-sm transition hover:bg-white hover:shadow-md"
            >
              <h3 className="text-2xl font-semibold text-[#081a4b]">
                Кейсы по неоплате
              </h3>
              <p className="mt-4 text-slate-700">
                Практика и решения, где заказчик затягивал срок оплаты или
                незаконно переносил момент расчета.
              </p>
            </Link>

            <Link
              href="/uslugi/spory-po-neoplate"
              className="rounded-3xl border border-slate-200 bg-slate-50 p-7 shadow-sm transition hover:bg-white hover:shadow-md"
            >
              <h3 className="text-2xl font-semibold text-[#081a4b]">
                Получить консультацию
              </h3>
              <p className="mt-4 text-slate-700">
                Если заказчик уже привязал оплату к своему акту или внутренней
                системе, можно сразу разобрать договор и документы.
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
                Заказчик привязал оплату к своим внутренним документам или системе?
              </h2>

              <p className="mt-5 max-w-3xl text-lg leading-9 text-white/90">
                Направьте нам договор, УПД, акты, переписку и требования
                заказчика. Мы посмотрим, где срок оплаты уже наступил по закону,
                а где заказчик просто прикрывает задержку внутренними уловками.
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
                Также можно посмотреть{" "}
                <Link
                  href="/neoplata-po-goskontraktu"
                  className="underline underline-offset-4"
                >
                  материал о неоплате по госконтракту
                </Link>{" "}
                и страницу{" "}
                <Link
                  href="/sudebnaya-zashita-v-zakupkah/snizhenie-neustojki-postavshiku"
                  className="underline underline-offset-4"
                >
                  о снижении неустойки поставщику
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
