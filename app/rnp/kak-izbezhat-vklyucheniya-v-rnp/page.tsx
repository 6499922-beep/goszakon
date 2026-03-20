import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Как избежать включения в РНП — стратегия защиты | goszakon.ru",
  description:
    "Разбираем, как поставщику снизить риск включения в РНП: что подготовить для ФАС, какие доказательства собрать и как выстроить правовую позицию.",
};

const steps = [
  {
    title: "Собрать переписку",
    text: "Важно сохранить всю деловую переписку с заказчиком, уведомления, проекты документов и ответы на претензии.",
  },
  {
    title: "Зафиксировать объективные причины",
    text: "Если исполнению помешали обстоятельства, их нужно подтвердить документами, а не ссылаться на них общими словами.",
  },
  {
    title: "Подготовить объяснения",
    text: "Позиция для комиссии должна быть логичной, документально подтверждённой и сфокусированной на отсутствии недобросовестности.",
  },
  {
    title: "Не затягивать с реакцией",
    text: "Чем раньше поставщик начинает готовить защиту, тем выше шансы убедительно представить обстоятельства спора.",
  },
];

export default function AvoidRnpPage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-5xl px-6 py-16 lg:py-24">
          <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-600">
            РНП · стратегия защиты
          </div>

          <h1 className="mt-6 text-5xl font-bold leading-[1.04] tracking-tight text-[#081a4b] md:text-6xl">
            Как избежать включения в РНП: что делать поставщику
          </h1>

          <p className="mt-6 max-w-4xl text-xl leading-9 text-slate-700">
            Главная задача поставщика — показать, что конфликт с заказчиком сам
            по себе не означает недобросовестного поведения. Для этого нужна
            своевременная подготовка документов и понятная правовая позиция.
          </p>
        </div>
      </section>

      <section className="bg-slate-50">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="grid gap-6 md:grid-cols-2">
            {steps.map((item) => (
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
            <h2>Сосредоточьтесь на доказательствах, а не на эмоциях</h2>
            <p>
              Комиссия оценивает не общие заявления, а документы и фактические
              действия поставщика. Поэтому основа защиты — переписка, уведомления,
              проекты договорных документов, подтверждение готовности исполнить
              обязательства и иные материалы, показывающие добросовестность.
            </p>

            <h2>Не допускайте пассивного поведения</h2>
            <p>
              Если компания молчит, не отвечает на запросы, не направляет
              объяснения и не фиксирует свою позицию, это работает против неё.
              Даже при наличии объективных причин их нужно своевременно довести
              до заказчика и затем до комиссии ФАС.
            </p>

            <h2>Правильная задача защиты</h2>
            <p>
              Цель — не просто спорить с заказчиком, а показать, что в действиях
              поставщика отсутствует необходимый признак недобросовестности.
              Именно этот акцент часто становится ключевым для отказа во
              включении в РНП.
            </p>
          </div>

          <div className="mt-12 rounded-3xl border border-slate-200 bg-slate-50 p-8">
            <h2 className="text-3xl font-bold tracking-tight text-[#081a4b]">
              Что подготовить перед рассмотрением в ФАС
            </h2>

            <div className="mt-6 grid gap-3">
              <div className="rounded-2xl bg-white px-5 py-4 text-base text-slate-700 ring-1 ring-slate-200">
                переписку с заказчиком
              </div>
              <div className="rounded-2xl bg-white px-5 py-4 text-base text-slate-700 ring-1 ring-slate-200">
                уведомления и ответы на претензии
              </div>
              <div className="rounded-2xl bg-white px-5 py-4 text-base text-slate-700 ring-1 ring-slate-200">
                документы, подтверждающие попытки исполнить договор
              </div>
              <div className="rounded-2xl bg-white px-5 py-4 text-base text-slate-700 ring-1 ring-slate-200">
                письменную правовую позицию по обстоятельствам спора
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-50">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="rounded-[2rem] bg-[#081a4b] px-8 py-10 text-white md:px-12 md:py-14">
            <h2 className="text-4xl font-bold tracking-tight">
              Чем раньше вы начинаете защиту, тем выше шанс избежать включения
            </h2>
            <p className="mt-5 max-w-3xl text-lg leading-9 text-white/85">
              Подготовка позиции после обращения заказчика в ФАС — это не
              формальность, а один из ключевых факторов исхода дела.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/rnp"
                className="rounded-2xl bg-white px-6 py-3 font-medium text-[#081a4b] transition hover:bg-slate-100"
              >
                Вернуться в раздел РНП
              </Link>
              <Link
                href="/cases/rnp-otkaz-vklyuchenie"
                className="rounded-2xl border border-white/20 px-6 py-3 transition hover:bg-white/10"
              >
                Посмотреть практику
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}