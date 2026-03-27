import Link from "next/link";
import { SITE_CONTACTS } from "@/lib/site-config";

const situations = [
  "заказчик не оплачивает исполненный контракт;",
  "приемку затягивают, а документы возвращают по формальным основаниям;",
  "оплату ставят в зависимость от внутренних актов, программ и согласований;",
  "часть денег уже удержали под видом неустойки, штрафа или спорного расчета.",
];

const firstDocuments = [
  "контракт и приложения;",
  "УПД, акты, накладные и переписка по приемке;",
  "замечания заказчика, претензии, письма об удержании или отказе в оплате;",
  "краткий расчет, сколько именно не заплатили и за какой период.",
];

export default function NonPaymentDisputesPage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
          <div>
            <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600">
              Услуга GOSZAKON
            </div>

            <h1 className="mt-6 max-w-5xl text-5xl font-bold leading-[1.02] tracking-tight text-[#081a4b] md:text-7xl">
              Споры по неоплате по госконтракту
            </h1>

            <p className="mt-6 max-w-3xl text-xl leading-9 text-slate-700">
              Если заказчик не оплачивает исполненный контракт, затягивает
              приемку, возвращает документы по кругу или удерживает часть
              платежа, важно быстро собрать доказательства и выбрать рабочую
              стратегию возврата денег.
            </p>

            <p className="mt-4 max-w-3xl text-lg leading-9 text-slate-700">
              Мы подключаемся к таким спорам по всей России: дистанционно,
              с выездом и с привязкой не только к долгу, но и к удержаниям,
              процентам, ФАС и дальнейшему суду.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href={SITE_CONTACTS.emailHref}
                className="rounded-2xl bg-[#081a4b] px-6 py-4 text-center font-semibold text-white"
              >
                Прислать документы по неоплате
              </a>
              <a
                href={SITE_CONTACTS.phoneHref}
                className="rounded-2xl border border-slate-300 px-6 py-4 text-center font-semibold text-[#081a4b]"
              >
                Быстро обсудить спор
              </a>
            </div>
          </div>

          <div className="grid gap-5">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-7 shadow-sm">
              <div className="text-sm uppercase tracking-[0.14em] text-slate-400">
                Когда спор обычно уже созрел
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
                Что прислать на разбор
              </div>

              <div className="mt-5 space-y-4">
                {firstDocuments.map((item) => (
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
        </div>
      </section>

      <section className="bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="grid gap-4 lg:grid-cols-3">
            <Link
              href="/neoplata-po-goskontraktu"
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="text-lg font-semibold text-[#081a4b]">
                Главная страница по неоплате
              </div>
              <p className="mt-2 text-sm leading-7 text-slate-600">
                Большой хаб по оплате, приемке, УПД, удержаниям, жалобам и судебной стратегии.
              </p>
            </Link>

            <Link
              href="/uderzhanie-deneg-iz-oplaty"
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="text-lg font-semibold text-[#081a4b]">
                Удержание денег из оплаты
              </div>
              <p className="mt-2 text-sm leading-7 text-slate-600">
                Если заказчик не только не платит, но и сам уменьшил платеж на спорную сумму.
              </p>
            </Link>

            <Link
              href="/cases/neoplata"
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="text-lg font-semibold text-[#081a4b]">
                Практика по неоплате
              </div>
              <p className="mt-2 text-sm leading-7 text-slate-600">
                Кейсы и материалы по просрочке оплаты, удержаниям и поведению заказчиков.
              </p>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
