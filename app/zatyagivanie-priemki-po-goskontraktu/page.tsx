import type { Metadata } from "next";
import Link from "next/link";
import { SITE_CONTACTS } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Заказчик затягивает приемку по госконтракту | GOSZAKON",
  description:
    "Разбираем ситуации, когда заказчик затягивает приемку, подписывает документы новой датой, создает искусственные замечания и использует это как предлог не платить или начислить неустойку.",
};

const situations = [
  "Товар поставлен или работы выполнены, но заказчик не подписывает документы неделями и месяцами.",
  "Приемку специально растягивают, а потом оформляют новой датой, чтобы сдвинуть срок оплаты.",
  "Во время приемки появляются новые формальные замечания, которых раньше не было и которые не мешают использовать результат исполнения.",
  "Заказчик держит документы у себя, а затем использует затянутую приемку как основание для неустойки или удержания.",
];

const whyItHappens = [
  "Чтобы не платить вовремя и управлять деньгами поставщика за счет затянутой процедуры приемки.",
  "Чтобы позже начислить неустойку за период, который сам заказчик и создал.",
  "Чтобы давить на поставщика повторными замечаниями и переделкой документов.",
  "Чтобы перевести спор из вопроса оплаты в вопрос якобы неоконченной приемки.",
];

const weakPoints = [
  "Заказчик долго молчит после поставки, но при этом не оформляет мотивированный отказ в приемке.",
  "Замечания появляются поэтапно и каждый раз меняются, хотя по сути исполнение уже состоялось.",
  "Документы подписываются новой датой, чтобы искусственно сдвинуть срок оплаты и построить дальнейшие санкции.",
  "Период затянутой приемки потом используют против поставщика как будто задержка возникла по его вине.",
];

const workPrinciples = [
  {
    title: "Фиксируем реальную дату исполнения",
    text: "Собираем документы, переписку, накладные, УПД и иные подтверждения, чтобы показать, когда исполнение фактически состоялось и с какого момента заказчик должен был действовать.",
  },
  {
    title: "Отделяем приемку от искусственной задержки",
    text: "Показываем, где заказчик действительно проверял исполнение, а где уже просто тянул время, создавал новые формальные замечания и блокировал расчет.",
  },
  {
    title: "Ломаем логику будущей неустойки",
    text: "Если заказчик сам затягивал приемку, это нельзя превращать в период просрочки поставщика. Мы используем это, чтобы ослабить или полностью ломать его санкции.",
  },
  {
    title: "Переводим спор в активную позицию",
    text: "Не оправдываемся, а документируем ошибки заказчика и строим позицию для претензии, обращения в ФАС, взыскания оплаты и процентов.",
  },
];

const firstChecks = [
  "Когда товар или работа были реально переданы и какими документами это подтверждается.",
  "Был ли у заказчика надлежащий мотивированный отказ в приемке или он просто затягивал процедуру.",
  "Какие замечания действительно относятся к результату исполнения, а какие носят чисто формальный характер.",
  "Использует ли заказчик затянутую приемку для сдвига оплаты, удержания денег или начисления неустойки.",
];

const outcomes = [
  "Фиксация реальной даты приемки и момента наступления обязанности по оплате.",
  "Оспаривание неустойки, если заказчик включил в нее период своей собственной задержки.",
  "Взыскание долга, процентов и связанных требований, если деньги не выплачены после исполнения.",
  "Ослабление позиции заказчика по спору об оплате и последующих санкциях.",
];

export default function DelayedAcceptancePage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 lg:grid-cols-[1.08fr_0.92fr] lg:py-24">
          <div>
            <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600">
              Практика GOSZAKON
            </div>

            <h1 className="mt-6 max-w-5xl text-5xl font-bold leading-[1.02] tracking-tight text-[#081a4b] md:text-7xl">
              Заказчик затягивает приемку по госконтракту
            </h1>

            <p className="mt-6 max-w-3xl text-xl leading-9 text-slate-700">
              Затягивание приемки давно стало отдельной схемой давления на
              поставщика. Заказчик держит документы у себя, поэтапно придумывает
              замечания, подписывает новой датой и потом делает вид, что срок
              оплаты еще не наступил или что именно поставщик допустил просрочку.
            </p>

            <p className="mt-4 max-w-3xl text-lg leading-9 text-slate-700">
              Мы разбираем такие споры по фактам: когда исполнение реально
              состоялось, что делал заказчик после этого и как его поведение
              повлияло на оплату, приемку и дальнейшие санкции.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href={SITE_CONTACTS.phoneHref}
                className="rounded-2xl bg-[#081a4b] px-7 py-4 text-center text-base font-semibold text-white transition hover:bg-[#0d2568]"
              >
                Разобрать приемку
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
                Главный риск
              </div>
              <p className="mt-4 text-lg leading-9 text-white/90">
                Если не зафиксировать, что приемку затягивал сам заказчик, этот
                период потом превращают в аргумент против поставщика: для
                неоплаты, удержаний и даже для начисления неустойки.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-20 lg:grid-cols-[1fr_0.95fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600">
              Зачем это делают
            </div>

            <h2 className="mt-6 text-3xl font-bold tracking-tight text-[#081a4b]">
              Затянутая приемка часто нужна не для проверки, а для контроля над оплатой
            </h2>

            <div className="mt-6 space-y-4">
              {whyItHappens.map((item) => (
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
              Где обычно ломается позиция заказчика
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
              Приемка должна проверять исполнение, а не становиться инструментом давления
            </h2>

            <p className="mt-5 text-lg leading-9 text-slate-700">
              В таких спорах слабая позиция начинается там, где поставщик
              начинает оправдываться и принимать правила игры заказчика.
              Сильная позиция строится иначе: мы показываем, когда исполнение
              реально состоялось, как вел себя заказчик после этого и где его
              действия уже перестали быть нормальной приемкой.
            </p>

            <p className="mt-4 text-lg leading-9 text-slate-700">
              Это особенно важно, если затянутая приемка потом используется для
              неоплаты или для неустойки. Тогда вопрос уже не только в
              подписании документов, а в том, кто создал задержку и можно ли
              использовать этот период против поставщика.
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
              Куда перейти дальше по спорам о приемке и оплате
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
                Если затянутая приемка уже привела к задержке денег, переходите
                к общей стратегии взыскания оплаты.
              </p>
            </Link>

            <Link
              href="/cases/neoplata"
              className="rounded-3xl border border-slate-200 bg-slate-50 p-7 shadow-sm transition hover:bg-white hover:shadow-md"
            >
              <h3 className="text-2xl font-semibold text-[#081a4b]">
                Практика по неоплате
              </h3>
              <p className="mt-4 text-slate-700">
                Решения и кейсы, где спор строился вокруг приемки, УПД, срока
                оплаты и поведения заказчика после исполнения контракта.
              </p>
            </Link>

            <Link
              href="/sudebnaya-zashita-v-zakupkah/snizhenie-neustojki-postavshiku"
              className="rounded-3xl border border-slate-200 bg-slate-50 p-7 shadow-sm transition hover:bg-white hover:shadow-md"
            >
              <h3 className="text-2xl font-semibold text-[#081a4b]">
                Если приемку использовали для неустойки
              </h3>
              <p className="mt-4 text-slate-700">
                Отдельная страница о том, как ломать санкции, если заказчик сам
                создал период задержки и пытается считать его против поставщика.
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
              Если заказчик затягивает приемку, спор нужно переводить в доказательства
            </h2>

            <p className="mt-5 max-w-2xl text-lg leading-9 text-slate-200">
              Направьте нам договор, УПД, акты, переписку и замечания заказчика.
              Мы посмотрим, где приемка превратилась в искусственную задержку и
              как использовать это в споре об оплате и санкциях.
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
              href="/cases/neoplata"
              className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-6 py-4 text-base font-semibold text-[#081a4b] transition hover:bg-slate-50"
            >
              Практика ФАС по неоплате
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
