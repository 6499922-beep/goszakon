import { SITE_CONTACTS } from "@/lib/site-config";

export default function NonPaymentPage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600">
            GOSZAKON • Практика закупок
          </div>

          <h1 className="mt-6 text-5xl font-bold tracking-tight text-[#081a4b]">
            Заказчик не оплачивает по госконтракту?
          </h1>

          <p className="mt-6 max-w-3xl text-lg leading-9 text-slate-700">
            Поможем разобраться в ситуации, выстроить позицию и вернуть деньги по контракту.
            Работаем с реальными закупочными спорами и знаем, как действовать в таких случаях.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <a
              href={SITE_CONTACTS.phoneHref}
              className="rounded-2xl bg-[#081a4b] px-6 py-4 font-semibold text-white"
            >
              {SITE_CONTACTS.phoneDisplay}
            </a>

            <a
              href={SITE_CONTACTS.emailHref}
              className="rounded-2xl border border-slate-300 px-6 py-4 font-semibold text-[#081a4b]"
            >
              {SITE_CONTACTS.email}
            </a>

            <a
              href={SITE_CONTACTS.telegramUrl}
              target="_blank"
              className="rounded-2xl border border-slate-300 px-6 py-4 font-semibold text-[#081a4b]"
            >
              Telegram
            </a>
          </div>
        </div>
      </section>

      {/* Боль */}
      <section className="bg-slate-50">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="text-3xl font-bold text-[#081a4b]">
            С чем сталкиваются поставщики
          </h2>

          <div className="mt-6 space-y-3 text-lg text-slate-700">
            <p>— заказчик затягивает оплату</p>
            <p>— не подписывает документы</p>
            <p>— ссылается на формальные причины</p>
            <p>— игнорирует обращения</p>
            <p>— пытается снизить цену или не платить вовсе</p>
          </div>
        </div>
      </section>

      {/* Практика */}
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="text-3xl font-bold text-[#081a4b]">
            Мы сами регулярно сталкиваемся с такими ситуациями
          </h2>

          <p className="mt-6 text-lg leading-9 text-slate-700">
            Мы работаем в сфере закупок не только как юристы, но и как практики.
            За годы работы мы неоднократно сталкивались с неоплатой по контрактам,
            отказами заказчиков и попытками уйти от обязательств.
          </p>

          <p className="mt-4 text-lg leading-9 text-slate-700">
            Поэтому мы понимаем не только правовую сторону, но и реальную логику поведения заказчиков.
            Мы знаем, где они злоупотребляют и какие инструменты действительно работают.
          </p>

          <p className="mt-4 text-lg leading-9 text-slate-700">
            Мы не даём абстрактных советов — мы предлагаем решения, которые применяются на практике.
          </p>
        </div>
      </section>

      {/* Важный блок */}
      <section className="bg-slate-50">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="text-3xl font-bold text-[#081a4b]">
            Не стоит бояться защищать свои права
          </h2>

          <p className="mt-6 text-lg leading-9 text-slate-700">
            Многие поставщики не идут в конфликт с заказчиком, опасаясь последствий.
            Этим часто пользуются заказчики, затягивая оплату или создавая формальные основания для отказа.
          </p>

          <p className="mt-4 text-lg leading-9 text-slate-700">
            На практике именно активная позиция поставщика меняет ситуацию.
          </p>

          <p className="mt-4 text-lg leading-9 text-slate-700">
            В ряде случаев подключение правовой позиции и инструментов ФАС становится
            эффективным способом давления на заказчика и ускоряет оплату.
          </p>
        </div>
      </section>

      {/* Что делаем */}
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="text-3xl font-bold text-[#081a4b]">
            Что мы делаем
          </h2>

          <div className="mt-6 space-y-3 text-lg text-slate-700">
            <p>— анализируем контракт и документы</p>
            <p>— оцениваем законность отказа в оплате</p>
            <p>— формируем правовую позицию</p>
            <p>— готовим претензию и стратегию</p>
            <p>— при необходимости подключаем ФАС</p>
            <p>— сопровождаем до возврата денег</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#081a4b] text-white">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="text-3xl font-bold">
            Разберём вашу ситуацию и скажем, как вернуть деньги
          </h2>

          <p className="mt-4 text-lg text-white/90">
            Вы можете направить документы или просто описать ситуацию — мы посмотрим
            и предложим рабочую стратегию.
          </p>

          <div className="mt-6 flex flex-wrap gap-4">
            <a
              href={SITE_CONTACTS.phoneHref}
              className="rounded-2xl bg-white px-6 py-4 font-semibold text-[#081a4b]"
            >
              Позвонить
            </a>

            <a
              href={SITE_CONTACTS.emailHref}
              className="rounded-2xl border border-white/20 px-6 py-4 font-semibold text-white"
            >
              Написать
            </a>

            <a
              href={SITE_CONTACTS.telegramUrl}
              className="rounded-2xl border border-white/20 px-6 py-4 font-semibold text-white"
            >
              Telegram
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}