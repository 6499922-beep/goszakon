import Link from "next/link";

const CONTACT_PHONE_DISPLAY = "+7 936 135-03-03";
const CONTACT_PHONE_HREF = "tel:+79361350303";
const CONTACT_EMAIL = "info@goszakon.ru";
const CONTACT_EMAIL_HREF = "mailto:info@goszakon.ru";

export default function ArbitrationClausePage() {
  const risks = [
    "условие о третейском разбирательстве включено в контракт без реальной альтернативы;",
    "поставщик не ожидал, что спор нельзя будет передать в государственный суд;",
    "третейская оговорка сформулирована неясно или односторонне выгодно;",
    "возникают вопросы о допустимости такого условия в закупочном контракте;",
    "спор о подсудности затягивает защиту прав и взыскание денежных требований.",
  ];

  const practicePoints = [
    {
      title: "Проверяем текст контракта",
      text: "Анализируем формулировку третейской оговорки, порядок согласования условия и его связь с общими правилами закупочного законодательства.",
    },
    {
      title: "Оцениваем применимость оговорки",
      text: "Смотрим, можно ли оспаривать передачу спора в третейский суд и есть ли основания для рассмотрения дела в государственном суде.",
    },
    {
      title: "Формируем правовую позицию",
      text: "Готовим аргументы по подсудности, допустимости спорного условия и защите интересов поставщика или заказчика.",
    },
    {
      title: "Сопровождаем спор",
      text: "Помогаем на стадии переговоров, претензионной работы и в дальнейшем судебном процессе.",
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
                Третейский суд в закупочном споре
              </h1>

              <p className="mt-6 text-lg leading-9 text-slate-700">
                Условие о передаче спора в третейский суд может серьёзно повлиять
                на стратегию защиты, сроки взыскания и сам порядок рассмотрения конфликта.
              </p>

              <p className="mt-4 text-lg leading-9 text-slate-700">
                В закупочной практике такие условия требуют отдельной правовой оценки:
                важно понять, действительно ли спор должен рассматриваться в третейском суде
                и насколько такое условие вообще устойчиво.
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

              </div>
            </div>

            <div className="rounded-[32px] border border-slate-200 bg-slate-50 p-8 shadow-sm">
              <div className="text-sm uppercase tracking-[0.14em] text-slate-400">
                Основные риски
              </div>

              <h2 className="mt-4 text-3xl font-bold text-[#081a4b]">
                Что важно проверить
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
              Как мы подходим к таким спорам
            </h2>

            <p className="mt-5 text-lg leading-9 text-slate-700">
              Вопрос о третейской оговорке нельзя решать формально. Нужно смотреть
              на текст контракта, процедуру закупки, переговорную позицию сторон и
              последствия для дальнейшей защиты прав.
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

          <div className="mt-12 rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
            <div className="text-sm font-medium uppercase tracking-[0.14em] text-slate-400">
              Показательный материал
            </div>
            <h2 className="mt-4 text-3xl font-bold text-[#081a4b]">
              Когда третейская оговорка уже сработала против поставщика
            </h2>
            <p className="mt-4 max-w-3xl text-lg leading-9 text-slate-700">
              Мы добавили в аналитику отдельный материал по решению МКАС, где с
              поставщика взыскали неустойку и арбитражные сборы. Это не кейс про
              победу, а хороший пример того, почему третейскую оговорку нельзя
              оставлять без отдельной проверки.
            </p>
            <div className="mt-6">
              <Link
                href="/analitika/mkas-neustoyka-po-treteyskoy-ogovorke-b-92-2025"
                className="inline-flex rounded-2xl bg-[#081a4b] px-6 py-4 font-semibold text-white transition hover:bg-[#0d2568]"
              >
                Посмотреть материал
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#081a4b] text-white">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <h2 className="text-4xl font-bold">
                Нужно оценить условие о третейском суде?
              </h2>

              <p className="mt-5 max-w-3xl text-lg leading-9 text-white/90">
                Если спор уже возник или вы хотите заранее проверить контракт,
                лучше сразу определить, насколько такое условие законно и как
                оно повлияет на стратегию защиты.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3 text-base text-white/85">
                <a href={CONTACT_PHONE_HREF} className="font-semibold text-white">
                  {CONTACT_PHONE_DISPLAY}
                </a>
                <a href={CONTACT_EMAIL_HREF} className="transition hover:text-white">
                  {CONTACT_EMAIL}
                </a>
              </div>

              <div className="mt-5 text-sm text-white/70">
                Также смотрите{" "}
                <Link href="/cases" className="underline underline-offset-4">
                  практику ФАС
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

            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
