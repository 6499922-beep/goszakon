import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Когда включают в РНП — основания и практика | goszakon.ru",
  description:
    "Разбираем, когда ФАС рассматривает вопрос о включении в РНП, какие основания заявляет заказчик и почему решение зависит от обстоятельств дела.",
};

const reasons = [
  {
    title: "Уклонение от заключения договора",
    text: "Один из самых частых поводов для обращения заказчика в ФАС — ситуация, когда поставщик не подписывает договор или фактически уклоняется от его заключения.",
  },
  {
    title: "Неисполнение обязательных условий",
    text: "Основанием может быть непредоставление обеспечения исполнения договора либо иное существенное нарушение обязанностей, предусмотренных закупочной документацией.",
  },
  {
    title: "Расторжение договора",
    text: "Если договор расторгнут, заказчик может инициировать вопрос о включении поставщика в РНП. Но само расторжение ещё не означает автоматическую санкцию.",
  },
  {
    title: "Признаки недобросовестности",
    text: "Ключевое значение для комиссии имеет не только формальное событие, но и наличие доказательств именно недобросовестного поведения поставщика.",
  },
];

export default function WhenRnpPage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-5xl px-6 py-16 lg:py-24">
          <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-600">
            РНП · основания включения
          </div>

          <h1 className="mt-6 text-5xl font-bold leading-[1.04] tracking-tight text-[#081a4b] md:text-6xl">
            Когда включают в РНП и что именно проверяет комиссия ФАС
          </h1>

          <p className="mt-6 max-w-4xl text-xl leading-9 text-slate-700">
            Вопрос о включении поставщика в РНП возникает не по любому спору, а
            при наличии конкретных оснований, на которые ссылается заказчик.
            Однако окончательное решение зависит от анализа обстоятельств дела.
          </p>
        </div>
      </section>

      <section className="bg-slate-50">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="grid gap-6 md:grid-cols-2">
            {reasons.map((item) => (
              <div
                key={item.title}
                className="rounded-3xl bg-white p-7 shadow-sm ring-1 ring-slate-200"
              >
                <h2 className="text-2xl font-bold tracking-tight text-[#081a4b]">
                  {item.title}
                </h2>
                <p className="mt-4 text-base leading-8 text-slate-700">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <div className="prose prose-slate max-w-none prose-p:text-lg prose-p:leading-9 prose-headings:text-[#081a4b] prose-headings:tracking-tight">
            <h2>Автоматического включения в РНП нет</h2>
            <p>
              Даже если заказчик направил материалы в ФАС, это не означает, что
              поставщик обязательно будет внесён в реестр. Комиссия должна
              рассмотреть поведение сторон, переписку, сроки, фактические
              действия по исполнению договора и причины возникшего конфликта.
            </p>

            <h2>Что особенно важно для комиссии</h2>
            <p>
              На практике большое значение имеют доказательства того, что
              поставщик не уклонялся умышленно, а предпринимал разумные меры для
              исполнения обязательств. Это могут быть письма, проекты документов,
              уведомления, ответы заказчику, попытки устранить нарушения и иные
              подтверждения добросовестного поведения.
            </p>

            <h2>Почему позицию нужно готовить заранее</h2>
            <p>
              Ошибка многих компаний в том, что они начинают реагировать слишком
              поздно — уже после направления материалов в ФАС. Более эффективный
              подход — заранее собрать документы, объяснить свою позицию и
              показать, что спор сам по себе ещё не свидетельствует о
              недобросовестности.
            </p>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-3">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <div className="text-lg font-semibold text-[#081a4b]">
                Переписка
              </div>
              <p className="mt-3 text-base leading-8 text-slate-700">
                Подтверждает попытки урегулировать ситуацию и исполнить
                обязательства.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <div className="text-lg font-semibold text-[#081a4b]">
                Документы
              </div>
              <p className="mt-3 text-base leading-8 text-slate-700">
                Показывают объективные причины спора и отсутствие намерения
                уклоняться.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <div className="text-lg font-semibold text-[#081a4b]">
                Позиция
              </div>
              <p className="mt-3 text-base leading-8 text-slate-700">
                Помогает сфокусировать комиссию на ключевом вопросе —
                недобросовестность не презюмируется.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-50">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="rounded-[2rem] bg-[#081a4b] px-8 py-10 text-white md:px-12 md:py-14">
            <h2 className="text-4xl font-bold tracking-tight">
              Наличие спора с заказчиком ещё не означает включение в РНП
            </h2>
            <p className="mt-5 max-w-3xl text-lg leading-9 text-white/85">
              Важно показать комиссии, что поставщик действовал разумно,
              открыто и добросовестно, а основания для жёсткой санкции не
              подтверждаются материалами дела.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/cases/rnp-otkaz-vklyuchenie"
                className="rounded-2xl bg-white px-6 py-3 font-medium text-[#081a4b] transition hover:bg-slate-100"
              >
                Изучить кейс
              </Link>
              <Link
                href="/rnp/kak-izbezhat-vklyucheniya-v-rnp"
                className="rounded-2xl border border-white/20 px-6 py-3 transition hover:bg-white/10"
              >
                Как избежать включения
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}