import Link from "next/link";

export default function ViolationsPage() {
  const quickLinks = [
    { label: "Товарный знак", href: "/narusheniya-tovarnyj-znak" },
    { label: "Нацрежим", href: "/narusheniya-nacionalnyj-rezhim" },
    { label: "Ограничение конкуренции", href: "/narusheniya-ogranichenie-konkurencii" },
    { label: "Практика ФАС", href: "/cases" },
  ];

  const activeCategories = [
    {
      title: "Товарный знак",
      badge: "Частая жалоба",
      text: "Ситуации, когда заказчик указывает конкретный товарный знак без допуска эквивалента или фактически ограничивает круг участников через описание товара.",
      href: "/narusheniya-tovarnyj-znak",
    },
    {
      title: "Национальный режим",
      badge: "Высокий риск ошибки",
      text: "Ошибки в применении ограничений, запретов и условий допуска, которые влияют на состав участников и результаты закупки.",
      href: "/narusheniya-nacionalnyj-rezhim",
    },
    {
      title: "Ограничение конкуренции",
      badge: "Сильная аргументация",
      text: "Закупочные условия, которые искусственно сужают рынок, создают преимущества конкретному участнику или делают закупку недоступной для конкурентов.",
      href: "/narusheniya-ogranichenie-konkurencii",
    },
  ];

  const pendingCategories = [
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

  const strongestGrounds = [
    "Товарный знак без реального допуска эквивалента или с описанием под конкретного поставщика.",
    "Ошибки национального режима, которые меняют круг участников или результат закупки.",
    "Избыточные требования к заявке, производителю, документам или подтверждению опыта.",
    "Искусственно короткие сроки поставки и иные неисполнимые условия документации.",
  ];

  const complaintExamples = [
    "В жалобах по товарному знаку участники обычно указывают, что описание товара не допускает реальной поставки эквивалента и фактически ориентировано на одного производителя.",
    "По национальному режиму сильные жалобы строятся вокруг того, что заказчик неверно выбрал механизм ограничения, запрета или условия допуска и этим изменил результат закупки.",
    "По документации поставщики часто указывают, что совокупность короткого срока поставки, специальных требований к производителю и избыточных документов делает участие формально открытым, но фактически недоступным.",
  ];

  const weakerGrounds = [
    "Формальное несогласие с любым неудобным условием без связи с практикой ФАС.",
    "Жалоба на спорный пункт, который не повлиял на возможность участия или результат закупки.",
    "Попытка обжаловать вопрос исполнения договора как закупочное нарушение, если это уже чистый договорный спор.",
  ];

  const steps = [
    "Сначала определите тип нарушения: документация, товарный знак, нацрежим, конкуренция или исполнение договора.",
    "Далее сравните ситуацию с практикой по соответствующей категории и посмотрите, как ФАС квалифицирует похожие условия.",
    "После этого уже оценивайте, есть ли сильная основа для жалобы, спора по документации или дальнейшей судебной защиты.",
  ];

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:py-24">
          <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600">
            Практический раздел GOSZAKON
          </div>

          <h1 className="mt-6 max-w-4xl text-4xl font-bold leading-[1.04] tracking-tight text-[#081a4b] md:text-6xl">
            Нарушения в закупках и основания для жалобы в ФАС
          </h1>

          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-700 md:text-xl md:leading-9">
            Это не просто список спорных тем, а навигация по реальным основаниям жалоб.
            Здесь можно быстро понять, к какой категории относится нарушение,
            где у поставщика сильная позиция и на какую практику стоит опираться.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            {quickLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-[#081a4b] transition hover:border-slate-300 hover:bg-white"
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="#categories"
              className="rounded-2xl bg-[#081a4b] px-7 py-4 text-center text-base font-semibold text-white transition hover:bg-[#0d2568]"
            >
              Перейти к категориям нарушений
            </Link>

            <Link
              href="/cases"
              className="rounded-2xl border border-slate-300 bg-white px-7 py-4 text-center text-base font-semibold text-[#081a4b] transition hover:bg-slate-50"
            >
              Смотреть практику ФАС
            </Link>

            <Link
              href="/fas-ili-sud/kogda-idti-v-fas-a-kogda-v-sud"
              className="rounded-2xl border border-slate-300 bg-white px-7 py-4 text-center text-base font-semibold text-[#081a4b] transition hover:bg-slate-50"
            >
              Понять, идти в ФАС или в суд
            </Link>
          </div>

          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
              <div className="text-sm uppercase tracking-[0.14em] text-slate-400">
                Как пользоваться разделом
              </div>
              <p className="mt-4 text-base leading-8 text-slate-700">
                Сначала определите тип нарушения, потом откройте соответствующую
                категорию и сравните свою ситуацию с практикой ФАС.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
              <div className="text-sm uppercase tracking-[0.14em] text-slate-400">
                Что здесь главное
              </div>
              <p className="mt-4 text-base leading-8 text-slate-700">
                Не каждое неудобное условие закупки дает сильную жалобу. Важна
                не эмоция, а правильная квалификация нарушения.
              </p>
            </div>

            <div className="rounded-3xl bg-[#081a4b] p-6 text-white shadow-sm">
              <div className="text-sm uppercase tracking-[0.14em] text-white/60">
                Практический смысл
              </div>
              <p className="mt-4 text-base leading-8 text-white/90">
                Раздел помогает быстрее выйти на релевантную практику и понять,
                есть ли реальная перспектива жалобы, спора по документации или
                дальнейшей судебной защиты.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="categories" className="bg-slate-50">
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
            {activeCategories.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="group flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:border-slate-300 hover:shadow-md"
              >
                <div className="inline-flex w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                  {item.badge}
                </div>
                <h3 className="text-2xl font-semibold leading-9 text-[#081a4b]">
                  {item.title}
                </h3>
                <p className="mt-4 text-base leading-8 text-slate-700">
                  {item.text}
                </p>
                <span className="mt-6 text-sm font-semibold text-[#081a4b] transition group-hover:translate-x-1">
                  Открыть раздел →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-20 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 shadow-sm">
            <div className="text-sm uppercase tracking-[0.14em] text-slate-400">
              Где чаще бывает сильная жалоба
            </div>
            <div className="mt-5 space-y-4">
              {strongestGrounds.map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-slate-200 bg-white p-5"
                >
                  <p className="text-base leading-8 text-slate-700">{item}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6">
              <div className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-400">
                Как это звучит в жалобах
              </div>
              <div className="mt-4 space-y-4">
                {complaintExamples.map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <p className="text-sm leading-7 text-slate-700">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="text-sm uppercase tracking-[0.14em] text-slate-400">
                Что часто путают с сильным нарушением
              </div>
              <div className="mt-5 space-y-4">
                {weakerGrounds.map((item) => (
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
              <div className="text-sm uppercase tracking-[0.14em] text-white/60">
                Как идти по разделу
              </div>
              <div className="mt-5 space-y-4">
                {steps.map((item, index) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-white/10 bg-white/5 p-5"
                  >
                    <div className="text-sm font-semibold text-white/60">
                      Шаг {index + 1}
                    </div>
                    <p className="mt-2 text-base leading-8 text-white/90">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="max-w-3xl">
              <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600">
                Следующие направления
              </div>

              <h2 className="mt-5 text-3xl font-bold tracking-tight text-[#081a4b] md:text-4xl">
                Направления, которые мы еще расширяем на сайте
              </h2>

              <p className="mt-5 text-lg leading-9 text-slate-700">
                Эти категории уже важны для практики, но мы пока не стали
                делать из них основные карточки первого экрана, чтобы не
                размывать навигацию.
              </p>
            </div>

            <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {pendingCategories.map((item) => (
                <div
                  key={item.title}
                  className="flex h-full flex-col rounded-3xl border border-slate-200 bg-slate-50 p-7"
                >
                  <h3 className="text-2xl font-semibold leading-9 text-[#081a4b]">
                    {item.title}
                  </h3>
                  <p className="mt-4 text-base leading-8 text-slate-700">
                    {item.text}
                  </p>
                  <span className="mt-5 text-sm font-semibold text-slate-400">
                    Раздел дополняется
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
