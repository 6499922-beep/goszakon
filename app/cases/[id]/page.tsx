import Link from "next/link";
import { cases } from "../../data/cases";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const caseItem = cases.find((item) => item.id === Number(id));

  if (!caseItem) {
    return (
      <main className="min-h-screen bg-white px-6 py-20 text-slate-900">
        <div className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-slate-50 p-10 text-center shadow-sm">
          <h1 className="text-4xl font-bold tracking-tight text-[#081a4b]">
            Кейс не найден
          </h1>
          <p className="mt-4 text-lg leading-8 text-slate-600">
            Проверьте адрес страницы или вернитесь в каталог кейсов.
          </p>
          <Link
            href="/cases"
            className="mt-8 inline-flex rounded-2xl bg-[#081a4b] px-6 py-4 text-base font-medium text-white transition hover:bg-[#0d2568]"
          >
            Вернуться в каталог
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-16 md:py-20">
          <div className="mb-5 flex flex-wrap items-center gap-3">
            <Link
              href="/cases"
              className="inline-flex rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              ← Назад к каталогу
            </Link>

            <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
              {caseItem.tag}
            </span>

            <span className="text-sm text-slate-400">Кейс #{caseItem.id}</span>
          </div>

          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div>
              <h1 className="max-w-5xl text-4xl font-bold leading-tight tracking-tight text-[#081a4b] md:text-6xl">
                {caseItem.title}
              </h1>

              <p className="mt-6 max-w-3xl text-lg leading-9 text-slate-700">
                Разбор кейса по жалобе в ФАС: суть нарушения, позиция заявителя,
                решение ФАС и практический результат для поставщика.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-7 shadow-sm">
              <div className="text-sm uppercase tracking-[0.14em] text-slate-400">
                Документы
              </div>

              <a
                href={caseItem.pdf}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex w-full items-center justify-center rounded-2xl bg-[#081a4b] px-5 py-4 text-base font-medium text-white transition hover:bg-[#0d2568]"
              >
                Открыть PDF решения
              </a>

              <p className="mt-4 text-base leading-8 text-slate-600">
                В карточке кейса размещён документ, связанный с данным решением.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <div className="grid gap-5 md:grid-cols-3">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="text-sm uppercase tracking-[0.14em] text-slate-400">
                Закупка
              </div>
              <div className="mt-3 text-2xl font-bold tracking-tight text-[#081a4b]">
                №{caseItem.number}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="text-sm uppercase tracking-[0.14em] text-slate-400">
                Регион
              </div>
              <div className="mt-3 text-2xl font-bold tracking-tight text-[#081a4b]">
                {caseItem.region}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="text-sm uppercase tracking-[0.14em] text-slate-400">
                Предмет закупки
              </div>
              <div className="mt-3 text-2xl font-bold tracking-tight text-[#081a4b]">
                {caseItem.subject}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div className="space-y-6">
              <article className="rounded-3xl border border-slate-200 bg-slate-50 p-8 shadow-sm">
                <h2 className="text-3xl font-bold tracking-tight text-[#081a4b]">
                  Суть нарушения
                </h2>
                <p className="mt-4 text-lg leading-9 text-slate-700">
                  {caseItem.violation}
                </p>
              </article>

              <article className="rounded-3xl border border-slate-200 bg-slate-50 p-8 shadow-sm">
                <h2 className="text-3xl font-bold tracking-tight text-[#081a4b]">
                  Позиция заявителя
                </h2>
                <p className="mt-4 text-lg leading-9 text-slate-700">
                  {caseItem.applicantPosition}
                </p>
              </article>

              <article className="rounded-3xl border border-slate-200 bg-slate-50 p-8 shadow-sm">
                <h2 className="text-3xl font-bold tracking-tight text-[#081a4b]">
                  Решение ФАС
                </h2>
                <p className="mt-4 text-lg leading-9 text-slate-700">
                  {caseItem.decision}
                </p>
              </article>

              <article className="rounded-3xl border border-slate-200 bg-slate-50 p-8 shadow-sm">
                <h2 className="text-3xl font-bold tracking-tight text-[#081a4b]">
                  Результат
                </h2>
                <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-6">
                  <p className="text-lg leading-9 text-slate-700">
                    {caseItem.result}
                  </p>
                </div>
              </article>
            </div>

            <aside className="space-y-6">
              <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
                <div className="text-sm uppercase tracking-[0.14em] text-slate-400">
                  Что это значит для поставщика
                </div>
                <p className="mt-4 text-base leading-8 text-slate-700">
                  Этот кейс показывает, как именно нарушение оценивается на
                  практике и какие доводы могут иметь значение при рассмотрении
                  жалобы в ФАС по 223-ФЗ.
                </p>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
                <div className="text-sm uppercase tracking-[0.14em] text-slate-400">
                  Подготовка кейса
                </div>
                <p className="mt-4 text-base leading-8 text-slate-700">
                  Жалоба подготовлена специалистами <b>GOSZAKON</b>. Кейс
                  размещён в базе практики по жалобам в ФАС по 223-ФЗ.
                </p>
              </div>

              <div className="rounded-3xl bg-[#081a4b] p-7 text-white shadow-sm">
                <div className="text-sm uppercase tracking-[0.14em] text-white/60">
                  Нужна оценка вашей закупки?
                </div>
                <p className="mt-4 text-base leading-8 text-white/90">
                  Если вы видите похожее нарушение, направьте закупку на
                  проверку. Мы оценим перспективу жалобы и предложим стратегию
                  защиты.
                </p>

                <div className="mt-6 flex flex-col gap-3">
                  <Link
                    href="/#request"
                    className="inline-flex items-center justify-center rounded-2xl bg-white px-5 py-3 text-base font-medium text-[#081a4b] transition hover:bg-slate-100"
                  >
                    Проверить закупку
                  </Link>

                  <Link
                    href="/cases"
                    className="inline-flex items-center justify-center rounded-2xl border border-white/20 px-5 py-3 text-base font-medium text-white transition hover:bg-white/10"
                  >
                    Все кейсы
                  </Link>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}