import Link from "next/link";
import { SITE_CONTACTS } from "@/lib/site-config";

const situations = [
  "документация ограничивает конкуренцию или заточена под конкретный товар;",
  "заказчик прописал спорный нацрежим, сроки поставки или избыточные требования;",
  "заявку отклонили по надуманному или формальному основанию;",
  "нужно быстро понять, есть ли смысл жаловаться или лучше идти другим путем.",
];

const trustPoints = [
  "Жалоба в ФАС для нас не формальный шаблон, а способ быстро сломать слабую закупочную конструкцию.",
  "Работаем по всей России: можно подключиться дистанционно, а при необходимости выехать и собрать позицию с командой клиента.",
  "Сразу смотрим, что делать после ФАС: продолжать спор, идти в суд, менять стратегию или не тратить ресурсы на слабую жалобу.",
];

const firstDocuments = [
  "извещение, документация и проект договора;",
  "переписка по закупке, разъяснения и протоколы, если они уже есть;",
  "заявка или проект заявки, если спор связан с отклонением;",
  "краткое объяснение, что именно вы считаете нарушением и зачем вам нужен результат по спору.",
];

export default function ComplaintToFasPage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
          <div>
            <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600">
              Услуга GOSZAKON
            </div>

            <h1 className="mt-6 max-w-5xl text-5xl font-bold leading-[1.02] tracking-tight text-[#081a4b] md:text-7xl">
              Жалоба в ФАС по спорной закупке
            </h1>

            <p className="mt-6 max-w-3xl text-xl leading-9 text-slate-700">
              Подготовим и сопроводим жалобу в ФАС, если закупка ограничивает
              конкуренцию, документация собрана с нарушениями или заказчик
              отклонил заявку по слабому основанию.
            </p>

            <p className="mt-4 max-w-3xl text-lg leading-9 text-slate-700">
              Для нас жалоба в ФАС всегда начинается с одного вопроса: можно ли
              через нее реально изменить ситуацию, а не просто отправить еще
              один формальный документ.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href={SITE_CONTACTS.emailHref}
                className="rounded-2xl bg-[#081a4b] px-7 py-4 text-center text-base font-semibold text-white transition hover:bg-[#0d2568]"
              >
                Направить закупку на разбор
              </a>

              <a
                href={SITE_CONTACTS.phoneHref}
                className="rounded-2xl border border-slate-300 bg-white px-7 py-4 text-center text-base font-semibold text-[#081a4b] transition hover:bg-slate-50"
              >
                Быстро обсудить жалобу
              </a>
            </div>
          </div>

          <div className="grid gap-5">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-7 shadow-sm">
              <div className="text-sm uppercase tracking-[0.14em] text-slate-400">
                Когда обращаются чаще всего
              </div>

              <div className="mt-5 space-y-4">
                {situations.map((item) => (
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
                Важно
              </div>
              <p className="mt-4 text-lg leading-9 text-white/90">
                В закупочных спорах время почти всегда работает против заявителя.
                Чем раньше видна документация и фактический конфликт, тем проще
                построить сильную жалобу и не упустить рабочий момент.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-16 lg:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-3xl font-bold tracking-tight text-[#081a4b]">
              Почему к жалобе лучше подходить не формально
            </h2>

            <div className="mt-6 space-y-4">
              {trustPoints.map((item) => (
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
            <h2 className="text-3xl font-bold tracking-tight">
              Что прислать на разбор
            </h2>

            <div className="mt-6 space-y-4">
              {firstDocuments.map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-white/10 bg-white/5 p-5"
                >
                  <p className="text-base leading-8 text-white/90">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="grid gap-4 lg:grid-cols-3">
            <Link
              href="/narusheniya"
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="text-lg font-semibold text-[#081a4b]">
                Типовые нарушения
              </div>
              <p className="mt-2 text-sm leading-7 text-slate-600">
                Посмотрите, какие нарушения чаще всего становятся основанием для жалобы в ФАС.
              </p>
            </Link>

            <Link
              href="/cases"
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="text-lg font-semibold text-[#081a4b]">
                Практика ФАС
              </div>
              <p className="mt-2 text-sm leading-7 text-slate-600">
                Смотрите реальные кейсы по товарному знаку, конкуренции, документации и результатам жалоб.
              </p>
            </Link>

            <Link
              href="/uslugi/proverka-zakupki"
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="text-lg font-semibold text-[#081a4b]">
                Проверка закупки
              </div>
              <p className="mt-2 text-sm leading-7 text-slate-600">
                Если нужно понять, есть ли смысл жаловаться, лучше сначала оценить перспективу спора.
              </p>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
