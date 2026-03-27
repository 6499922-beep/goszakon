import type { Metadata } from "next";
import Link from "next/link";
import { SITE_CONTACTS } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Заказчик не подписывает УПД по госконтракту | GOSZAKON",
  description:
    "Разбираем ситуации, когда заказчик не подписывает УПД, требует бесконечно переделывать документы, ссылается на подписи, ЭДО или внутренние процедуры и тем самым сдвигает срок оплаты.",
};

const situations = [
  "УПД направлен, но заказчик неделями его не подписывает и не дает понятного мотивированного ответа.",
  "Документ возвращают по формальным причинам: подпись не та, формат не тот, нужно переделать еще раз.",
  "При наличии ЭДО заказчик требует бумажные оригиналы или повторную загрузку в свою внутреннюю систему.",
  "Из-за неподписанного УПД заказчик делает вид, что срок оплаты вообще не наступил.",
];

const excuses = [
  "Подпись в УПД якобы не соответствует условиям контракта.",
  "Документ не прошел внутреннее согласование или бухгалтерскую проверку.",
  "Нужно завести УПД в программу заказчика и дождаться подтверждения внутри системы.",
  "Есть мелкие замечания к оформлению, поэтому оплата откладывается до исправления.",
];

const weakPoints = [
  "Заказчик не формулирует четкий мотивированный отказ, а просто тянет время.",
  "Замечания носят формальный характер и не мешают принять результат исполнения.",
  "После одного исправления появляются новые требования, которые раньше не озвучивались.",
  "Неподписанный УПД используют не как вопрос документооборота, а как способ удержать деньги.",
];

const workPrinciples = [
  {
    title: "Фиксируем, что исполнение уже состоялось",
    text: "Собираем УПД, переписку, акты, накладные и иные документы, чтобы показать: вопрос не в факте исполнения, а в поведении заказчика после него.",
  },
  {
    title: "Отделяем реальную ошибку от формальной придирки",
    text: "Показываем, какие замечания действительно могли иметь значение, а какие используются только для того, чтобы не подписывать документ и не платить.",
  },
  {
    title: "Привязываем спор к сроку оплаты",
    text: "Для нас вопрос неподписанного УПД всегда связан не только с документом, но и с деньгами: когда реально наступила обязанность оплатить и что заказчик сделал, чтобы ее сдвинуть.",
  },
  {
    title: "Строим активную позицию",
    text: "Не просим подписать из жалости, а документируем слабость заказчика и выводим спор в плоскость оплаты, процентов, ФАС или суда.",
  },
];

const firstChecks = [
  "Когда и в каком виде УПД был направлен заказчику.",
  "Есть ли у заказчика понятный мотивированный отказ или только серия формальных комментариев.",
  "Мешают ли замечания реально принять и оплатить исполнение.",
  "Используется ли неподписанный УПД как предлог для сдвига оплаты, удержания или будущей неустойки.",
];

const outcomes = [
  "Фиксация того, что заказчик злоупотребляет документооборотом и искусственно сдвигает оплату.",
  "Ослабление позиции заказчика по спору о сроке оплаты и формальных замечаниях к документам.",
  "Подготовка сильной базы для взыскания долга, процентов и оспаривания удержаний.",
  "Связка спора по УПД с приемкой, оплатой и последующими санкциями по контракту.",
];

const firstDocuments = [
  "сам УПД, история его отправки через ЭДО или иным способом;",
  "переписка с замечаниями заказчика и всеми возвратами документа;",
  "акты, накладные, документы по приемке и исполнению контракта;",
  "письма или расчеты, если из-за УПД уже сдвигают оплату или удерживают деньги.",
];

export default function CustomerRefusesUpdPage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 lg:grid-cols-[1.08fr_0.92fr] lg:py-24">
          <div>
            <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600">
              Практика GOSZAKON
            </div>

            <h1 className="mt-6 max-w-5xl text-5xl font-bold leading-[1.02] tracking-tight text-[#081a4b] md:text-7xl">
              Заказчик не подписывает УПД по госконтракту
            </h1>

            <p className="mt-6 max-w-3xl text-xl leading-9 text-slate-700">
              Неподписанный УПД редко бывает просто техническим вопросом. В
              закупочной практике это часто превращают в инструмент задержки
              оплаты: документ возвращают по формальным основаниям, гоняют по
              кругу через ЭДО и внутренние системы, а потом ссылаются на то,
              что срок расчета якобы еще не наступил.
            </p>

            <p className="mt-4 max-w-3xl text-lg leading-9 text-slate-700">
              Мы разбираем такие ситуации не как спор об одном документе, а как
              спор о деньгах, сроках и поведении заказчика после исполнения
              контракта.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href={SITE_CONTACTS.emailHref}
                className="rounded-2xl bg-[#081a4b] px-7 py-4 text-center text-base font-semibold text-white transition hover:bg-[#0d2568]"
              >
                Направить УПД и переписку
              </a>

              <a
                href={SITE_CONTACTS.phoneHref}
                className="rounded-2xl border border-slate-300 bg-white px-7 py-4 text-center text-base font-semibold text-[#081a4b] transition hover:bg-slate-50"
              >
                Быстро обсудить ситуацию
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
                Заказчик держит у себя документ, который сам же должен подписать,
                и этим получает контроль над сроком оплаты. Именно поэтому спор
                по УПД почти всегда выходит за рамки простого документооборота.
              </p>

              <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-7 text-white/90">
                Можно прислать спор дистанционно: УПД, переписку и документы по
                приемке. Этого уже достаточно, чтобы понять, где заканчивается
                нормальная проверка и начинается злоупотребление.
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-16 lg:grid-cols-[1fr_0.95fr]">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 shadow-sm">
            <div className="inline-flex rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600">
              Что прислать на разбор
            </div>

            <div className="mt-6 space-y-4">
              {firstDocuments.map((item) => (
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

      <section className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-20 lg:grid-cols-[1fr_0.95fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600">
              Что обычно говорит заказчик
            </div>

            <h2 className="mt-6 text-3xl font-bold tracking-tight text-[#081a4b]">
              Формальные замечания к УПД часто становятся заменой нормальной приемки
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
              Мы не спорим о форме ради формы, мы показываем, как через УПД сдвигают оплату
            </h2>

            <p className="mt-5 text-lg leading-9 text-slate-700">
              В таких спорах нельзя останавливаться на фразе “заказчик не
              подписывает УПД”. Важно показать, что исполнение уже произошло,
              документ был направлен, замечания формальны, а сам заказчик
              использует документооборот как инструмент задержки денег.
            </p>

            <p className="mt-4 text-lg leading-9 text-slate-700">
              Сильная позиция здесь строится на хронологии, документах и точном
              понимании, где заканчивается нормальная проверка и начинается
              искусственное препятствие для оплаты.
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
              Куда перейти дальше по спорам о документах и оплате
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
                Общая стратегия, если через неподписанный УПД заказчик сдвигает
                срок оплаты и держит деньги.
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
                Если неподписанный УПД связан с тем, что приемку держат неделями
                и подписывают новой датой.
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
                Когда УПД используют вместе с внутренними системами, актами и
                согласованиями, чтобы не платить вовремя.
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
              Если заказчик не подписывает УПД, спор нужно переводить в доказательства и срок оплаты
            </h2>

            <p className="mt-5 max-w-2xl text-lg leading-9 text-slate-200">
              Направьте нам УПД, переписку, договор и замечания заказчика. Мы
              посмотрим, где здесь реальный документооборот, а где уже
              искусственная задержка оплаты.
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
