import type { Metadata } from "next";
import Link from "next/link";
import { SITE_CONTACTS } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Неоплата по госконтракту: взыскание оплаты с заказчика | GOSZAKON",
  description:
    "Помогаем взыскать оплату по госконтракту, если заказчик затягивает приемку, ссылается на формальные недостатки документов или искусственно создает препятствия для расчета.",
};

const situations = [
  "Товар поставлен или работы выполнены, но заказчик не платит.",
  "Заказчик затягивает приемку на недели и месяцы, а потом подписывает документы новой датой.",
  "Оплату блокируют под предлогом формальных недостатков в УПД, актах и накладных.",
  "Документы якобы потерялись, не загружены в внутреннюю систему или не прошли бухгалтерию.",
];

const excuses = [
  "Подпись в УПД якобы не соответствует контракту, поэтому документы нужно переделывать снова и снова.",
  "Документы не заведены во внутреннюю программу заказчика, поэтому оплата откладывается.",
  "У заказчика другая внутренняя бухгалтерия, свои платежные дни или согласования.",
  "Есть замечания к документам, которые фактически не мешают приемке и оплате.",
];

const weakPoints = [
  "Заказчик сам затянул приемку, а потом пытается начислить неустойку за этот период.",
  "Документы были приняты или подписаны, но позднее заказчик начинает требовать их повторного оформления.",
  "Формальные претензии к УПД и актам используются не для исправления ошибки, а как предлог не платить.",
  "Внутренние процедуры заказчика не отменяют его обязанность принять и оплатить исполнение.",
  "Заказчик создает искусственные преграды для расчета, а затем использует задержку против поставщика.",
];

const directions = [
  {
    title: "Фиксируем реальные обстоятельства исполнения",
    text: "Собираем документы, переписку и даты, чтобы показать, когда обязательство было исполнено и кто именно создал задержку.",
  },
  {
    title: "Ломаем формальные причины неоплаты",
    text: "Показываем, что замечания к документам не мешали оплате, а внутренние процессы заказчика не освобождают его от обязательств.",
  },
  {
    title: "Выводим спор в активную позицию",
    text: "Не оправдываемся, а документируем ошибки заказчика и выстраиваем позицию для претензии, ФАС или суда.",
  },
];

const stages = [
  {
    title: "Разбираем договор и документы",
    text: "Смотрим порядок приемки, сроки оплаты, переписку, УПД, акты и то, как заказчик вел себя после исполнения контракта.",
  },
  {
    title: "Фиксируем слабости заказчика",
    text: "Выявляем, где заказчик затянул приемку, потерял документы, сослался на внутренние процедуры или выдумал формальные основания для неоплаты.",
  },
  {
    title: "Формируем сильную позицию",
    text: "Показываем не общие эмоции, а конкретные факты: что было исполнено, что сделал заказчик и почему отказ в оплате незаконен.",
  },
  {
    title: "Добиваемся оплаты и процентов",
    text: "В зависимости от ситуации идем через претензию, ФАС, судебное взыскание долга, процентов и связанных требований.",
  },
];

export default function NonPaymentPage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 lg:grid-cols-[1.08fr_0.92fr] lg:py-24">
          <div>
            <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600">
              Практика GOSZAKON
            </div>

            <h1 className="mt-6 max-w-5xl text-5xl font-bold leading-[1.02] tracking-tight text-[#081a4b] md:text-7xl">
              Неоплата по госконтракту: как взыскать деньги с заказчика
            </h1>

            <p className="mt-6 max-w-3xl text-xl leading-9 text-slate-700">
              Неоплата по госконтракту остается одной из самых больших проблем в
              закупочной практике. Заказчик часто не просто задерживает расчет,
              а создает систему, в которой ему выгодно не платить вовремя:
              затягивает приемку, цепляется к документам и использует
              внутренние процедуры как предлог для отказа в оплате.
            </p>

            <p className="mt-4 max-w-3xl text-lg leading-9 text-slate-700">
              Мы разбираем такие споры не на уровне общих жалоб, а по фактам:
              что было исполнено, какие препятствия создал заказчик и как
              вернуть деньги через сильную претензионную и судебную позицию.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href={SITE_CONTACTS.phoneHref}
                className="rounded-2xl bg-[#081a4b] px-7 py-4 text-center text-base font-semibold text-white transition hover:bg-[#0d2568]"
              >
                Разобрать неоплату
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
                Главная проблема
              </div>
              <p className="mt-4 text-lg leading-9 text-white/90">
                Заказчик может затягивать оплату так, что это становится для
                него экономически выгодно. Формально у него почти всегда
                больше контроля над приемкой, документами и моментом расчета,
                чем у поставщика.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-20 lg:grid-cols-[1fr_0.95fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600">
              Что говорят заказчики
            </div>

            <h2 className="mt-6 text-3xl font-bold tracking-tight text-[#081a4b]">
              Формальные причины неоплаты стали обычной практикой
            </h2>

            <p className="mt-5 text-lg leading-9 text-slate-700">
              Чаще всего заказчик не говорит прямо, что не хочет платить. Он
              выстраивает цепочку формальных объяснений, которые должны
              выглядеть как законные основания для задержки. На практике мы
              постоянно сталкиваемся с одними и теми же сценариями.
            </p>

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
              Что мы считаем слабой позицией
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
              Наша позиция
            </div>

            <h2 className="mt-5 text-4xl font-bold tracking-tight text-[#081a4b] md:text-5xl">
              Мы не просим и не извиняемся, мы показываем, что произошло на самом деле
            </h2>

            <p className="mt-5 text-lg leading-9 text-slate-700">
              В спорах по неоплате слабая позиция почти всегда выглядит
              одинаково: поставщик начинает оправдываться, объяснять, почему не
              смог вовремя донести документ, почему согласился на порядок
              заказчика и почему просит отнестись мягче. Мы так не работаем.
            </p>

            <p className="mt-4 text-lg leading-9 text-slate-700">
              Мы документируем факты, собираем переписку, фиксируем даты,
              разбираем порядок приемки и показываем, где именно заказчик сам
              создал искусственные препятствия для оплаты. Сильная позиция в
              таких делах строится не на эмоциях, а на доказательствах.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {directions.map((item) => (
              <div
                key={item.title}
                className="flex h-full flex-col rounded-3xl border border-slate-200 bg-slate-50 p-7 shadow-sm"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-white">
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

      <section className="border-b border-slate-200 bg-slate-50">
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

          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600">
              Что можно получить
            </div>

            <h2 className="mt-6 text-3xl font-bold tracking-tight text-[#081a4b]">
              В споре по неоплате важны не объяснения заказчика, а итог для поставщика
            </h2>

            <p className="mt-5 text-lg leading-9 text-slate-700">
              В зависимости от ситуации наша цель может включать взыскание
              основного долга, процентов за пользование чужими денежными
              средствами, оспаривание удержаний, фиксацию нарушений приемки и
              формирование позиции для дальнейшего суда или обращения в ФАС.
            </p>

            <p className="mt-4 text-lg leading-9 text-slate-700">
              Если заказчик сам затянул приемку, потерял документы или
              искусственно создавал препятствия для оплаты, мы используем это
              как доказательство его слабой позиции, а не как фон для
              бесконечных переговоров.
            </p>

            <div className="mt-8">
              <Link
                href="/sudebnaya-zashita-v-zakupkah/snizhenie-neustojki-postavshiku"
                className="inline-flex rounded-2xl border border-slate-300 px-6 py-4 text-base font-semibold text-[#081a4b] transition hover:bg-slate-50"
              >
                Если удержали неустойку из оплаты
              </Link>
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
              Куда перейти дальше по спорам об оплате
            </h2>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <Link
              href="/zakazchik-ne-podpisyvaet-upd"
              className="rounded-3xl border border-slate-200 bg-slate-50 p-7 shadow-sm transition hover:bg-white hover:shadow-md"
            >
              <h3 className="text-2xl font-semibold text-[#081a4b]">
                Заказчик не подписывает УПД
              </h3>
              <p className="mt-4 text-slate-700">
                Когда документ гоняют по кругу, возвращают по формальным
                основаниям и используют это как предлог не платить.
              </p>
            </Link>

            <Link
              href="/zatyagivanie-priemki-po-goskontraktu"
              className="rounded-3xl border border-slate-200 bg-slate-50 p-7 shadow-sm transition hover:bg-white hover:shadow-md"
            >
              <h3 className="text-2xl font-semibold text-[#081a4b]">
                Заказчик затягивает приемку
              </h3>
              <p className="mt-4 text-slate-700">
                Когда документы держат неделями, подписывают новой датой и
                используют приемку как способ не платить вовремя.
              </p>
            </Link>

            <Link
              href="/zakazchik-ne-prinimaet-postavku-chastyami"
              className="rounded-3xl border border-slate-200 bg-slate-50 p-7 shadow-sm transition hover:bg-white hover:shadow-md"
            >
              <h3 className="text-2xl font-semibold text-[#081a4b]">
                Заказчик не принимает поставку частями
              </h3>
              <p className="mt-4 text-slate-700">
                Когда уже переданный объем не принимают только потому, что
                заказчик хочет закрыть весь контракт одной партией.
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
                Когда заказчик не просто тянет расчет, а сам уменьшает платеж
                на спорную неустойку, штраф или другую сумму.
              </p>
            </Link>

            <Link
              href="/zakazchik-ne-platit-poka-ne-oplatite-neustoyku"
              className="rounded-3xl border border-slate-200 bg-slate-50 p-7 shadow-sm transition hover:bg-white hover:shadow-md"
            >
              <h3 className="text-2xl font-semibold text-[#081a4b]">
                Заказчик не платит, пока вы не оплатите его неустойку
              </h3>
              <p className="mt-4 text-slate-700">
                Когда санкцию заказчика превращают в предварительное условие
                для самой оплаты по контракту.
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
                Когда ошибку в УПД, накладной или акте превращают в крупную
                санкцию и используют как основание для неоплаты или удержания.
              </p>
            </Link>

            <Link
              href="/spornye-praktiki/vnutrennie-sistemy-oplaty"
              className="rounded-3xl border border-slate-200 bg-slate-50 p-7 shadow-sm transition hover:bg-white hover:shadow-md"
            >
              <h3 className="text-2xl font-semibold text-[#081a4b]">
                Спорная практика: внутренние документы
              </h3>
              <p className="mt-4 text-slate-700">
                Когда оплату незаконно ставят в зависимость от акта, внутренней
                программы, платежного дня или других процедур заказчика.
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
                Кейсы и решения, где заказчик затягивал оплату, ссылался на
                формальные причины и создавал препятствия для расчета.
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
                Если удержание построено на санкции заказчика, спор часто нужно
                сразу вести и по неустойке, и по возврату денег.
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
                Если заказчик уже не платит или удержал деньги, можно сразу
                перейти к правовой оценке и стратегии взыскания.
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
              Если заказчик не платит, спор нужно переводить из оправданий в доказательства
            </h2>

            <p className="mt-5 max-w-2xl text-lg leading-9 text-slate-200">
              Направьте нам договор, УПД, акты, переписку и все замечания
              заказчика. Мы посмотрим, где он создал искусственные препятствия
              для оплаты и как вернуть деньги по контракту.
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
              Судебная защита в закупках
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
