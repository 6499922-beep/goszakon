import Link from "next/link";

export default function ViolationsPage() {
  const categories = [
    {
      title: "Товарный знак",
      text: "Ситуации, когда заказчик указывает конкретный товарный знак без допуска эквивалента или фактически ограничивает круг участников через описание товара.",
      href: "/narusheniya-tovarnyj-znak",
    },
    {
      title: "Национальный режим",
      text: "Ошибки в применении ограничений, запретов и условий допуска, которые влияют на состав участников и результаты закупки.",
      href: "/narusheniya-nacionalnyj-rezhim",
    },
    {
      title: "Ограничение конкуренции",
      text: "Закупочные условия, которые искусственно сужают рынок, создают преимущества конкретному участнику или делают закупку недоступной для конкурентов.",
      href: "/narusheniya-ogranichenie-konkurencii",
    },
    {
      title: "Документация закупки",
      text: "Нарушения в документации: противоречия, неопределённость условий, избыточные требования, неисполнимые сроки и иные дефекты закупочных условий.",
    },
    {
      title: "ОКПД2 и предмет закупки",
      text: "Ошибки в выборе кода, формировании предмета закупки и описании объекта, которые влияют на правила процедуры и круг участников.",
    },
    {
      title: "Неоплата и исполнение договора",
      text: "Споры, возникающие уже после закупки: просрочка оплаты, уклонение от обязательств, конфликт по исполнению договора и связанные с этим риски.",
    },
  ];

  const reasons = [
    "Нарушение в закупке нужно не просто увидеть, а правильно квалифицировать.",
    "Один и тот же спорный пункт документации может по-разному оцениваться в зависимости от предмета закупки и логики ФАС.",
    "Для практического результата важно понимать, какие нарушения действительно дают сильную позицию для жалобы.",
    "Разделение по категориям помогает быстрее находить релевантную практику и строить аргументацию.",
  ];

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
          <div>
            <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600">
              Практический раздел GOSZAKON
            </div>

            <h1 className="mt-6 max-w-5xl text-5xl font-bold leading-[1.02] tracking-tight text-[#081a4b] md:text-7xl">
              Нарушения в закупках и основания для жалобы в ФАС
            </h1>

            <p className="mt-6 max-w-3xl text-xl leading-9 text-slate-700">
              В этом разделе собраны основные категории нарушений, с которыми сталкиваются
              поставщики и заказчики в закупках. Структура помогает быстро понять,
              есть ли у ситуации перспектива жалобы, спора или дальнейшей защиты.
            </p>

            <p className="mt-4 max-w-3xl text-lg leading-9 text-slate-700">
              Мы исходим не из абстрактной теории, а из практики ФАС, закупочных документов
              и реальных оснований, которые могут повлиять на результат рассмотрения дела.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/cases"
                className="rounded-2xl bg-[#081a4b] px-7 py-4 text-center text-base font-semibold text-white transition hover:bg-[#0d2568]"
              >
                Смотреть практику ФАС
              </Link>

              <Link
                href="/uslugi"
                className="rounded-2xl border border-slate-300 bg-white px-7 py-4 text-center text-base font-semibold text-[#081a4b] transition hover:bg-slate-50"
              >
                Услуги для поставщиков
              </Link>
            </div>
          </div>

          <div className="grid gap-5">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-7 shadow-sm">
              <div className="text-sm uppercase tracking-[0.14em] text-slate-400">
                Почему это важно
              </div>

              <div className="mt-5 space-y-4">
                {reasons.map((item) => (
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
                Практический смысл раздела
              </div>
              <p className="mt-4 text-lg leading-9 text-white/90">
                Категории нарушений помогают быстрее ориентироваться в практике,
                понимать силу правовой позиции и оценивать, есть ли реальный смысл
                обращаться в ФАС или продолжать спор дальше.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="mb-10 max-w-3xl">
            <div className="inline-flex rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600">
              Основные категории
            </div>

            <h2 className="mt-5 text-4xl font-bold tracking-tight text-[#081a4b] md:text-5xl">
              Какие нарушения чаще всего становятся предметом спора
            </h2>

            <p className="mt-5 text-lg leading-9 text-slate-700">
              Ниже собраны ключевые направления, по которым формируется практика
              рассмотрения жалоб и закупочных споров.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {categories.map((item) =>
              item.href ? (
                <Link
                  key={item.title}
                  href={item.href}
                  className="flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  <h3 className="text-2xl font-semibold leading-9 text-[#081a4b]">
                    {item.title}
                  </h3>
                  <p className="mt-4 text-base leading-8 text-slate-700">
                    {item.text}
                  </p>
                  <span className="mt-5 text-sm font-semibold text-[#081a4b]">
                    Открыть раздел →
                  </span>
                </Link>
              ) : (
                <div
                  key={item.title}
                  className="flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-7 shadow-sm"
                >
                  <h3 className="text-2xl font-semibold leading-9 text-[#081a4b]">
                    {item.title}
                  </h3>
                  <p className="mt-4 text-base leading-8 text-slate-700">
                    {item.text}
                  </p>
                  <span className="mt-5 text-sm font-semibold text-slate-400">
                    Раздел будет добавлен
                  </span>
                </div>
              )
            )}
          </div>
        </div>
      </section>
    </main>
  );
}