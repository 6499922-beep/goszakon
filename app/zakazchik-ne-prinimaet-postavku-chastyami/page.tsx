import type { Metadata } from "next";
import Link from "next/link";
import { SITE_CONTACTS } from "@/lib/site-config";

export const metadata: Metadata = {
  title:
    "Заказчик не принимает поставку частями по госконтракту | GOSZAKON",
  description:
    "Разбираем ситуацию, когда заказчик отказывается принимать поставку частями, хотя договор этого не требует, и использует это для сдвига оплаты, удержаний и неустойки.",
};

const situations = [
  "Поставщик передал часть товара или этап исполнения, но заказчик отказывается принимать это до полного закрытия всего объема.",
  "Договор не запрещает частичную поставку, но заказчик требует сдавать все одной партией.",
  "Оплату сдвигают до завершения всего контракта, хотя фактически часть обязательства уже исполнена.",
  "Непринятую частичную поставку потом используют как фон для претензий, удержаний и начисления неустойки.",
];

const excuses = [
  "Мы принимаем только после полной поставки, иначе срок оплаты не наступает.",
  "Заказчику неудобно закрывать этапы или части, поэтому он вправе дождаться полного исполнения.",
  "Пока весь объем не поставлен, документы по части поставки не подписываем.",
  "Частичная поставка якобы не соответствует внутреннему порядку приемки заказчика.",
];

const weakPoints = [
  "Если договор не требует поставить все одной партией, заказчик не может произвольно навязать такое условие уже в процессе исполнения.",
  "Внутреннее удобство заказчика не заменяет условия контракта и не отменяет обязанность принять реально переданный объем.",
  "Отказ принимать часть поставки часто нужен не для контроля качества, а для сдвига оплаты и накопления давления на поставщика.",
  "Чем дольше заказчик не принимает переданный объем, тем чаще он сам создает основу для будущего спора об оплате и санкциях.",
];

const strategy = [
  {
    title: "Смотрим, что именно написано в договоре",
    text: "Проверяем, есть ли прямой запрет на частичную поставку, этапность, специальные правила приемки и как соотносятся поставка, УПД и срок оплаты.",
  },
  {
    title: "Фиксируем факт передачи части исполнения",
    text: "Собираем документы, переписку и подтверждения того, что часть обязательства реально была исполнена и могла быть принята заказчиком.",
  },
  {
    title: "Отделяем приемку от произвольного отказа",
    text: "Показываем, где заказчик действительно проверяет исполнение, а где уже просто навязывает новое условие, которого нет в контракте.",
  },
  {
    title: "Используем задержку против заказчика",
    text: "Если отказ принимать частичную поставку сдвигает оплату или ведет к спорной неустойке, это должно работать против заказчика, а не против поставщика.",
  },
];

const firstChecks = [
  "Есть ли в контракте прямой запрет на частичную поставку или, наоборот, он допускает этапность и поставку по частям.",
  "Какие документы подтверждают передачу части товара, работ или услуг.",
  "Связан ли отказ заказчика с качеством и комплектностью либо это просто новый порядок, которого нет в договоре.",
  "Пытается ли заказчик через отказ в частичной приемке сдвинуть оплату, удержать деньги или начислить санкцию.",
];

const outcomes = [
  "Подтверждение права на приемку и оплату переданного объема без ожидания искусственно навязанного полного закрытия контракта.",
  "Ослабление позиции заказчика по спору об оплате и сроках исполнения.",
  "Подготовка базы для взыскания долга, процентов и оспаривания удержаний.",
  "Разрушение логики заказчика, если он пытается превратить свой отказ в инструмент давления и неустойки.",
];

export default function PartialDeliveryRefusalPage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 lg:grid-cols-[1.08fr_0.92fr] lg:py-24">
          <div>
            <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600">
              Практика GOSZAKON
            </div>

            <h1 className="mt-6 max-w-5xl text-5xl font-bold leading-[1.02] tracking-tight text-[#081a4b] md:text-7xl">
              Заказчик не принимает поставку частями
            </h1>

            <p className="mt-6 max-w-3xl text-xl leading-9 text-slate-700">
              Один из удобных способов сдвинуть оплату выглядит так: заказчик
              отказывается принимать уже переданный объем и требует закрыть весь
              контракт одной партией, хотя договор этого не требует. По сути
              поставщик уже исполнил часть обязательства, но денег не получает,
              потому что заказчик навязывает новый порядок задним числом.
            </p>

            <p className="mt-4 max-w-3xl text-lg leading-9 text-slate-700">
              Мы рассматриваем такие споры как сочетание приемки, неоплаты и
              искусственного усложнения исполнения. Если частичная поставка
              допустима по договору или не запрещена прямо, заказчик не может
              превращать свой отказ в инструмент давления.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href={SITE_CONTACTS.phoneHref}
                className="rounded-2xl bg-[#081a4b] px-7 py-4 text-center text-base font-semibold text-white transition hover:bg-[#0d2568]"
              >
                Разобрать спор по приемке
              </a>

              <a
                href={SITE_CONTACTS.emailHref}
                className="rounded-2xl border border-slate-300 bg-white px-7 py-4 text-center text-base font-semibold text-[#081a4b] transition hover:bg-slate-50"
              >
                Направить договор и документы
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
                Заказчик пытается подменить условия контракта своим удобством и
                задержать оплату за уже переданный объем только потому, что ему
                удобнее принять все разом.
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
              Отказ в частичной приемке подают как будто это естественный порядок
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
              Частичная поставка не становится нарушением только потому, что заказчику так удобнее
            </h2>

            <p className="mt-5 text-lg leading-9 text-slate-700">
              В таких спорах слабая позиция начинается там, где поставщик
              соглашается, что заказчик вправе придумать новый порядок приемки
              уже после исполнения. Мы работаем иначе: сначала смотрим договор,
              фактическую передачу и документы, а потом отделяем реальные
              требования контракта от бытового удобства заказчика.
            </p>

            <p className="mt-4 text-lg leading-9 text-slate-700">
              Это особенно важно, если отказ принимать часть поставки потом
              используют для сдвига оплаты, удержания или неустойки. Тогда спор
              уже касается не только приемки, а всей финансовой модели контракта.
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
              Куда перейти дальше по приемке и оплате
            </h2>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <Link
              href="/zatyagivanie-priemki-po-goskontraktu"
              className="rounded-3xl border border-slate-200 bg-slate-50 p-7 shadow-sm transition hover:bg-white hover:shadow-md"
            >
              <h3 className="text-2xl font-semibold text-[#081a4b]">
                Заказчик затягивает приемку
              </h3>
              <p className="mt-4 text-slate-700">
                Когда документы держат неделями, а потом используют это для
                сдвига оплаты и дальнейших санкций.
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
                Общая логика взыскания, если заказчик через приемку и документы
                блокирует уже заработанные деньги.
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
                Если спор о приемке уже превратился в реальное удержание из
                платежа.
              </p>
            </Link>

            <Link
              href="/zakazchik-ne-podpisyvaet-upd"
              className="rounded-3xl border border-slate-200 bg-slate-50 p-7 shadow-sm transition hover:bg-white hover:shadow-md"
            >
              <h3 className="text-2xl font-semibold text-[#081a4b]">
                Заказчик не подписывает УПД
              </h3>
              <p className="mt-4 text-slate-700">
                Когда частичную поставку блокируют еще и через формальные
                замечания к документам.
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
                Когда отказ в частичной приемке дополнительно прикрывают
                внутренними процедурами и актами.
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
                Кейсы и решения, где заказчик сдвигал расчет через приемку,
                документы и спорные условия исполнения.
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
              Если заказчик не принимает поставку частями, спор нужно начинать с договора, а не с его удобства
            </h2>

            <p className="mt-5 max-w-2xl text-lg leading-9 text-slate-200">
              Направьте нам контракт, переписку, УПД, накладные и замечания
              заказчика. Мы посмотрим, был ли у него вообще повод не принимать
              частичное исполнение и как использовать эту ситуацию в споре по
              оплате.
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
