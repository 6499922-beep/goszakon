import Link from "next/link";

const CONTACT_PHONE_DISPLAY = "+7 936 135-03-03";
const CONTACT_PHONE_HREF = "tel:+79361350303";
const CONTACT_EMAIL = "info@goszakon.ru";
const CONTACT_EMAIL_HREF = "mailto:info@goszakon.ru";
const TELEGRAM_URL = "https://t.me/goszakon";

export default function InternalPaymentSystemsPage() {
  const risks = [
    "заказчик ссылается на внутренние регламенты вместо условий контракта;",
    "срок оплаты фактически ставится в зависимость от внутренних согласований;",
    "поставщику навязывают порядок, которого нет в контракте или законе;",
    "оплата затягивается под предлогом работы внутренних систем;",
    "возникает спор о том, что считается надлежащим основанием для оплаты.",
  ];

  const practicePoints = [
    {
      title: "Проверяем контракт и документы",
      text: "Смотрим, какие условия об оплате закреплены в контракте, и есть ли у заказчика право ссылаться на внутренние процедуры.",
    },
    {
      title: "Оцениваем правовую позицию",
      text: "Определяем, может ли внутренняя система заказчика влиять на срок оплаты и насколько такая позиция устойчива в споре.",
    },
    {
      title: "Фиксируем нарушение",
      text: "Помогаем собрать документы и переписку, чтобы показать, что задержка вызвана неисполнением обязательств заказчиком.",
    },
    {
      title: "Сопровождаем взыскание",
      text: "Готовим правовую стратегию для претензии, переговоров и, при необходимости, последующего судебного спора.",
    },
  ];

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600">
                Спорные практики
              </div>

              <h1 className="mt-6 text-5xl font-bold tracking-tight text-[#081a4b] md:text-6xl">
                Внутренние системы оплаты заказчика
              </h1>

              <p className="mt-6 text-lg leading-9 text-slate-700">
                В закупочных спорах заказчики нередко ссылаются на внутренние
                регламенты, маршруты согласования и особенности собственных систем
                оплаты, чтобы объяснить задержку перечисления денежных средств.
              </p>

              <p className="mt-4 text-lg leading-9 text-slate-700">
                Но внутренние процедуры сами по себе не должны ухудшать положение
                поставщика и подменять собой условия контракта или требования закона.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <a
                  href={CONTACT_PHONE_HREF}
                  className="rounded-2xl bg-[#081a4b] px-6 py-4 font-semibold text-white transition hover:bg-[#0d2568]"
                >
                  {CONTACT_PHONE_DISPLAY}
                </a>

                <a
                  href={CONTACT_EMAIL_HREF}
                  className="rounded-2xl border border-slate-300 px-6 py-4 font-semibold transition hover:bg-slate-50"
                >
                  {CONTACT_EMAIL}
                </a>

                <a
                  href={TELEGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-2xl border border-slate-300 px-6 py-4 font-semibold transition hover:bg-slate-50"
                >
                  Telegram
                </a>
              </div>
            </div>

            <div className="rounded-[32px] border border-slate-200 bg-slate-50 p-8 shadow-sm">
              <div className="text-sm uppercase tracking-[0.14em] text-slate-400">
                Основные риски
              </div>

              <h2 className="mt-4 text-3xl font-bold text-[#081a4b]">
                На что стоит обратить внимание
              </h2>

              <ul className="mt-6 space-y-3 text-base leading-8 text-slate-700">
                {risks.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="max-w-3xl">
            <h2 className="text-4xl font-bold text-[#081a4b]">
              Как мы подходим к таким ситуациям
            </h2>

            <p className="mt-5 text-lg leading-9 text-slate-700">
              Важно отделить реальные условия контракта от внутренних процессов
              заказчика и заранее понять, насколько обоснована ссылка на внутреннюю
              систему оплаты в конкретном споре.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {practicePoints.map((item) => (
              <div
                key={item.title}
                className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm"
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

      <section className="bg-[#081a4b] text-white">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <h2 className="text-4xl font-bold">
                Заказчик задерживает оплату из-за внутренних процедур?
              </h2>

              <p className="mt-5 max-w-3xl text-lg leading-9 text-white/90">
                Если заказчик прикрывается внутренней системой согласования или
                внутренними регламентами, лучше заранее проверить, насколько такая
                позиция вообще имеет правовое значение.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3 text-base text-white/85">
                <a href={CONTACT_PHONE_HREF} className="font-semibold text-white">
                  {CONTACT_PHONE_DISPLAY}
                </a>
                <a href={CONTACT_EMAIL_HREF} className="transition hover:text-white">
                  {CONTACT_EMAIL}
                </a>
                <a
                  href={TELEGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition hover:text-white"
                >
                  Telegram
                </a>
              </div>

              <div className="mt-5 text-sm text-white/70">
                Также можно посмотреть{" "}
                <Link href="/neoplata-po-goskontraktu" className="underline underline-offset-4">
                  материал о неоплате по госконтракту
                </Link>{" "}
                и раздел{" "}
                <Link href="/analitika" className="underline underline-offset-4">
                  аналитики
                </Link>.
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <a
                href={CONTACT_PHONE_HREF}
                className="rounded-2xl bg-white px-6 py-4 text-center font-semibold text-[#081a4b]"
              >
                Позвонить
              </a>

              <a
                href={CONTACT_EMAIL_HREF}
                className="rounded-2xl border border-white/20 px-6 py-4 text-center transition hover:bg-white/5"
              >
                Написать на почту
              </a>

              <a
                href={TELEGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-2xl border border-white/20 px-6 py-4 text-center transition hover:bg-white/5"
              >
                Написать в Telegram
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}