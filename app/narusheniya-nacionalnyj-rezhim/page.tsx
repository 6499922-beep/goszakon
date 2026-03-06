import Link from "next/link";

export default function NationalRegimePage() {

  const violations = [
    "Заказчик неправильно применяет ограничения допуска иностранных товаров.",
    "Документация не соответствует требованиям постановлений Правительства РФ.",
    "Неверно определён перечень товаров, подпадающих под национальный режим.",
    "Поставщики необоснованно ограничены в возможности предложить продукцию.",
  ];

  const typicalCases = [
    "Закупка подпадает под постановление о запрете или ограничении иностранных товаров.",
    "Заказчик не проверяет происхождение продукции должным образом.",
    "Документация противоречит установленным правилам национального режима.",
    "Участникам создаются разные условия допуска к закупке.",
  ];

  return (
    <main className="min-h-screen bg-white text-slate-900">

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:py-20">

          <div className="max-w-4xl">

            <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600">
              Категория нарушения
            </div>

            <h1 className="mt-5 text-5xl font-bold tracking-tight text-[#081a4b] md:text-6xl">
              Национальный режим в закупках по 223-ФЗ
            </h1>

            <p className="mt-6 text-lg leading-9 text-slate-700">
              Национальный режим регулирует условия допуска иностранных товаров
              и продукции российского происхождения в закупках.
              Ошибки в применении этих правил нередко становятся основанием
              для обращения поставщиков в ФАС.
            </p>

            <p className="mt-4 text-lg leading-9 text-slate-700">
              Важно понимать, подпадает ли конкретная закупка под ограничения,
              какие постановления применяются и как заказчик обязан
              формулировать требования в документации.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/#request"
                className="inline-flex items-center justify-center rounded-2xl bg-[#081a4b] px-6 py-4 text-base font-semibold text-white transition hover:bg-[#0d2568]"
              >
                Проверить закупку
              </Link>

              <Link
                href="/cases"
                className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-6 py-4 text-base font-semibold text-[#081a4b] transition hover:bg-slate-50"
              >
                Смотреть практику ФАС
              </Link>
            </div>

          </div>

        </div>
      </section>

      <section className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-20">

          <h2 className="text-4xl font-bold text-[#081a4b]">
            Типичные нарушения национального режима
          </h2>

          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">

            {violations.map((item) => (
              <div
                key={item}
                className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm"
              >
                <p className="text-base leading-8 text-slate-700">
                  {item}
                </p>
              </div>
            ))}

          </div>

        </div>
      </section>

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:grid lg:grid-cols-2 lg:gap-8">

          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8">

            <h2 className="text-3xl font-bold text-[#081a4b]">
              Когда имеет смысл подавать жалобу
            </h2>

            <div className="mt-6 space-y-4">

              {typicalCases.map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-slate-200 bg-white p-5"
                >
                  <p className="text-base leading-8 text-slate-700">
                    {item}
                  </p>
                </div>
              ))}

            </div>

          </div>

          <div className="rounded-3xl bg-[#081a4b] p-8 text-white">

            <h2 className="text-3xl font-bold">
              Как мы оцениваем такие закупки
            </h2>

            <p className="mt-5 text-lg leading-9 text-white/90">
              Мы анализируем документацию, применимые постановления
              и фактические условия закупки, чтобы понять,
              нарушен ли национальный режим и есть ли перспектива
              обращения в ФАС.
            </p>

            <p className="mt-4 text-lg leading-9 text-white/90">
              Если у вас есть сомнения по применению национального режима,
              лучше проверить закупку до подачи жалобы.
            </p>

            <Link
              href="/#request"
              className="mt-6 inline-flex rounded-2xl bg-white px-6 py-4 text-base font-semibold text-[#081a4b]"
            >
              Отправить закупку на проверку
            </Link>

          </div>

        </div>
      </section>

    </main>
  );
}