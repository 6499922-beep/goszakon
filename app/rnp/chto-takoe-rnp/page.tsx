import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Что такое РНП — объяснение для поставщика | goszakon.ru",
  description:
    "Объясняем, что такое реестр недобросовестных поставщиков, чем опасно включение в РНП и почему решение не принимается автоматически.",
};

export default function WhatIsRnpPage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-5xl px-6 py-16 lg:py-24">
          <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-600">
            РНП · объяснение
          </div>

          <h1 className="mt-6 text-5xl font-bold leading-[1.04] tracking-tight text-[#081a4b] md:text-6xl">
            Что такое РНП и почему включение в реестр опасно для поставщика
          </h1>

          <p className="mt-6 max-w-4xl text-xl leading-9 text-slate-700">
            Реестр недобросовестных поставщиков — это механизм, который
            используется для ограничения участия в закупках компаний, признанных
            недобросовестными при заключении или исполнении договора.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/rnp"
              className="rounded-2xl border border-slate-300 px-6 py-3 transition hover:bg-slate-50"
            >
              Назад в раздел РНП
            </Link>
            <Link
              href="/rnp/kogda-vklyuchayut-v-rnp"
              className="rounded-2xl bg-[#081a4b] px-6 py-3 text-white transition hover:bg-[#0d2568]"
            >
              Когда включают в РНП
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-slate-50">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 py-20 lg:grid-cols-3">
          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <div className="text-3xl font-bold text-[#081a4b]">Реестр</div>
            <p className="mt-4 text-base leading-8 text-slate-700">
              В РНП включают сведения о поставщике, если комиссия приходит к
              выводу о его недобросовестном поведении.
            </p>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <div className="text-3xl font-bold text-[#081a4b]">Репутация</div>
            <p className="mt-4 text-base leading-8 text-slate-700">
              Попадание в реестр негативно влияет на деловую репутацию и может
              осложнить дальнейшее участие в закупках.
            </p>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <div className="text-3xl font-bold text-[#081a4b]">Защита</div>
            <p className="mt-4 text-base leading-8 text-slate-700">
              Во многих случаях включения можно избежать, если своевременно
              собрать доказательства и правильно выстроить правовую позицию.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <div className="prose prose-slate max-w-none prose-p:text-lg prose-p:leading-9 prose-headings:text-[#081a4b] prose-headings:tracking-tight">
            <h2>Что означает включение в РНП</h2>
            <p>
              Для поставщика включение в реестр означает не просто формальную
              запись. На практике это сигнал для рынка и заказчиков о наличии
              конфликта, связанного с исполнением или заключением договора.
              Именно поэтому вопрос о включении в РНП имеет серьёзное
              репутационное и коммерческое значение.
            </p>

            <h2>Всегда ли включают в РНП автоматически</h2>
            <p>
              Нет. Автоматического включения в реестр не существует. Комиссия
              оценивает фактические обстоятельства: был ли умысел, уклонялся ли
              поставщик от исполнения обязательств, предпринимал ли разумные
              действия для исполнения договора, вел ли деловую переписку,
              предупреждал ли заказчика о препятствиях.
            </p>

            <h2>Какие последствия возникают для компании</h2>
            <p>
              Основные риски связаны с ограничением участия в закупках,
              ухудшением переговорной позиции, потерей доверия со стороны
              заказчиков и дополнительными сложностями при заключении новых
              договоров. Поэтому реагировать на угрозу включения в РНП нужно как
              можно раньше, не дожидаясь заседания комиссии без подготовки.
            </p>

            <h2>Почему важна юридическая позиция</h2>
            <p>
              Даже если заказчик настаивает на включении в РНП, это ещё не
              означает, что комиссия поддержит его доводы. Во многих делах ключевым
              становится вопрос о том, были ли действия поставщика действительно
              недобросовестными, или конфликт возник по объективным причинам,
              которые можно подтвердить документально.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-slate-50">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="rounded-[2rem] bg-[#081a4b] px-8 py-10 text-white md:px-12 md:py-14">
            <h2 className="text-4xl font-bold tracking-tight">
              Если вопрос о включении в РНП уже поднят, время имеет значение
            </h2>
            <p className="mt-5 max-w-3xl text-lg leading-9 text-white/85">
              Чем раньше собрать переписку, документы, объяснения и доказательства
              добросовестного поведения, тем выше шансы убедить комиссию в
              отсутствии оснований для включения в реестр.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/cases/rnp-otkaz-vklyuchenie"
                className="rounded-2xl bg-white px-6 py-3 font-medium text-[#081a4b] transition hover:bg-slate-100"
              >
                Посмотреть кейс
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