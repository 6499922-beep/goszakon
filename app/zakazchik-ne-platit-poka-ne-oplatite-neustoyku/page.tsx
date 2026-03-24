import type { Metadata } from "next";
import Link from "next/link";
import { SITE_CONTACTS } from "@/lib/site-config";

export const metadata: Metadata = {
  title:
    "Заказчик не платит, пока вы не оплатите его неустойку | GOSZAKON",
  description:
    "Разбираем спорную практику, когда заказчик ставит оплату по госконтракту в зависимость от предварительной уплаты неустойки или штрафа поставщиком.",
};

const situations = [
  "Заказчик прямо пишет: сначала оплатите нашу неустойку, потом получите основной платеж.",
  "В акте или внутреннем документе заказчик сам указывает сумму санкции и предлагает согласиться с ней как с условием оплаты.",
  "Поставщику не перечисляют деньги, пока он не подпишет спорный расчет штрафа или неустойки.",
  "Под видом удержания или сверки заказчик фактически блокирует всю оплату до признания своей санкции.",
];

const excuses = [
  "Вы согласились с договором, значит такой порядок допустим.",
  "Сначала надо урегулировать вопрос с неустойкой, а потом уже говорить об оплате.",
  "Пока поставщик не оплатил санкцию, у заказчика нет оснований переводить деньги.",
  "Это не задержка оплаты, а обычный порядок взаиморасчетов по контракту.",
];

const weakPoints = [
  "Срок оплаты не может бесконечно зависеть от того, согласится ли поставщик с расчетом заказчика.",
  "Спорная неустойка не превращается автоматически в бесспорный долг только потому, что ее насчитал заказчик.",
  "Оплата основного обязательства и спор о санкции нельзя смешивать так, чтобы поставщик сначала лишался денег, а только потом получал право спорить.",
  "Очень часто сам расчет неустойки завышен, построен на неверной базе или связан с нарушениями самого заказчика.",
];

const strategy = [
  {
    title: "Отделяем оплату от спорной санкции",
    text: "Показываем, что обязанность оплатить исполненный контракт не исчезает только потому, что заказчик предъявил претензию или сам посчитал неустойку.",
  },
  {
    title: "Проверяем, есть ли вообще долг по неустойке",
    text: "Разбираем базу начисления, период, порядок претензии и собственные нарушения заказчика, которые могли повлиять на исполнение.",
  },
  {
    title: "Считаем встречные требования к заказчику",
    text: "Если срок оплаты уже наступил, считаем проценты и встречную ответственность, чтобы ослабить позицию заказчика и перекрыть его санкции.",
  },
  {
    title: "Переводим спор в юридически сильную плоскость",
    text: "Работаем не через оправдания, а через договор, документы, сроки и доказательства того, что заказчик использует неустойку как инструмент давления.",
  },
];

const firstChecks = [
  "Что именно написано в договоре о сроке оплаты и есть ли там право заказчика блокировать платеж до уплаты санкции.",
  "Наступил ли срок оплаты по УПД, актам и реальному исполнению обязательства.",
  "Есть ли у заказчика вообще корректный и доказанный расчет неустойки или штрафа.",
  "Не связан ли спор о неустойке с затягиванием приемки, внутренними актами, неподписанием УПД или другими действиями самого заказчика.",
];

const outcomes = [
  "Взыскание основного долга, который заказчик пытался удерживать под видом спора о санкции.",
  "Снижение или полное выбивание спорной неустойки.",
  "Начисление процентов и встречных требований к заказчику за просрочку оплаты.",
  "Перевод конфликта из позиции оправдывающегося поставщика в активную правовую атаку.",
];

export default function HoldPaymentUntilPenaltyPage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 lg:grid-cols-[1.08fr_0.92fr] lg:py-24">
          <div>
            <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600">
              Спорные практики GOSZAKON
            </div>

            <h1 className="mt-6 max-w-5xl text-5xl font-bold leading-[1.02] tracking-tight text-[#081a4b] md:text-7xl">
              Заказчик не платит, пока вы не оплатите его неустойку
            </h1>

            <p className="mt-6 max-w-3xl text-xl leading-9 text-slate-700">
              Это одна из самых жестких схем давления на поставщика. Заказчик
              сначала сам начисляет неустойку или штраф, потом объявляет эту
              сумму обязательной к оплате и только после этого обещает
              перечислить основной долг по контракту.
            </p>

            <p className="mt-4 max-w-3xl text-lg leading-9 text-slate-700">
              По сути поставщику предлагают сначала признать спорную санкцию,
              лишиться части защиты и только потом рассчитывать на оплату.
              Мы считаем такую практику спорной и разбираем ее как сочетание
              неоплаты, удержания и навязанной ответственности.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href={SITE_CONTACTS.phoneHref}
                className="rounded-2xl bg-[#081a4b] px-7 py-4 text-center text-base font-semibold text-white transition hover:bg-[#0d2568]"
              >
                Разобрать спор по оплате
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
                Как это обычно выглядит
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
                Заказчик пытается превратить свою спорную санкцию в условие для
                получения поставщиком уже заработанных денег по контракту.
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
              Давление почти всегда маскируют под порядок расчетов
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
              Мы не принимаем спорную неустойку как пропуск к оплате
            </h2>

            <p className="mt-5 text-lg leading-9 text-slate-700">
              В таких конфликтах слабая позиция начинается там, где поставщик
              соглашается сначала заплатить спорную санкцию, а уже потом
              пытаться вернуть деньги или разбираться с расчетом. Мы работаем
              наоборот: сначала отделяем основной долг от спорной неустойки и
              проверяем, есть ли у заказчика вообще сильная база для своих
              требований.
            </p>

            <p className="mt-4 text-lg leading-9 text-slate-700">
              Очень часто за такой схемой стоят завышенный расчет, ошибочная
              база начисления, нарушения приемки, внутренние документы
              заказчика или собственная просрочка оплаты. Именно это и нужно
              превращать в сильную позицию поставщика.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {strategy.map((item) => (
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
              Куда перейти дальше по оплате и санкциям
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
                Когда санкцию уже превратили в реальное уменьшение платежа и
                спор нужно вести по деньгам здесь и сейчас.
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
                Когда оплату привязывают к актам, системам и внутренним шагам,
                которые сам же заказчик и контролирует.
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
                Если спор строится на завышенной неустойке, важно быстро ломать
                ее расчет и основание.
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
                Общий материал о взыскании оплаты, формальных замечаниях,
                приемке и искусственных препятствиях для расчета.
              </p>
            </Link>

            <Link
              href="/zakazchik-uderzhal-shtraf-iz-oplaty-bez-suda"
              className="rounded-3xl border border-slate-200 bg-slate-50 p-7 shadow-sm transition hover:bg-white hover:shadow-md"
            >
              <h3 className="text-2xl font-semibold text-[#081a4b]">
                Заказчик удержал штраф из оплаты без суда
              </h3>
              <p className="mt-4 text-slate-700">
                Узкий сценарий, когда заказчик сам решил спор о штрафе и сразу
                вычел его из платежа.
              </p>
            </Link>

            <Link
              href="/neustoyka-na-vsyu-summu-kontrakta"
              className="rounded-3xl border border-slate-200 bg-slate-50 p-7 shadow-sm transition hover:bg-white hover:shadow-md"
            >
              <h3 className="text-2xl font-semibold text-[#081a4b]">
                Неустойка на всю сумму контракта
              </h3>
              <p className="mt-4 text-slate-700">
                Когда завышенный расчет сам по себе становится инструментом
                давления и блокировки оплаты.
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
              Если заказчик требует сначала оплатить его санкцию, спор уже пора переводить в активную защиту
            </h2>

            <p className="mt-5 max-w-2xl text-lg leading-9 text-slate-200">
              Направьте нам договор, расчет неустойки, претензию, УПД, акты и
              переписку. Мы посмотрим, где заказчик смешал оплату с санкциями и
              как правильно отбить его позицию.
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
