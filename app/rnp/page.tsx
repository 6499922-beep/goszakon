import type { Metadata } from "next";
import Link from "next/link";
import { SITE_CONTACTS } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "РНП по 223-ФЗ — защита от включения в реестр | goszakon.ru",
  description:
    "Помогаем поставщикам защититься от включения в РНП по 223-ФЗ. Анализ ситуации, позиция для ФАС, практика и реальные кейсы.",
};

const highlights = [
  {
    value: "2 года",
    label: "Срок нахождения в РНП",
  },
  {
    value: "ФАС",
    label: "Решение принимает комиссия",
  },
  {
    value: "Практика",
    label: "Реальные кейсы защиты",
  },
  {
    value: "223-ФЗ",
    label: "Основная специализация",
  },
];

const reasons = [
  "уклонение от подписания договора",
  "непредоставление обеспечения исполнения",
  "существенное нарушение обязательств",
  "одностороннее расторжение договора заказчиком",
];

const cases = [
  {
    title: "ФАС отказала во включении поставщика в РНП",
    subtitle: "Практика по 223-ФЗ",
    result: "Отказ во включении в РНП",
    amount: "Спор по договору после расторжения",
    href: "/cases/rnp-otkaz-vklyuchenie",
    description:
      "Заказчик требовал включить поставщика в РНП после расторжения договора. Комиссия пришла к выводу, что автоматических оснований для включения нет, а признаки недобросовестности должны быть доказаны.",
  },
];

const trustPoints = [
  "Быстро оцениваем, есть ли у заказчика и ФАС реальная база для включения в РНП.",
  "Работаем по всей России: можно подключиться онлайн, а при необходимости собрать позицию с командой и документами на месте.",
  "Смотрим не только на сам эпизод, но и на переписку, попытки исполнения, поведение заказчика и экономическую логику конфликта.",
];

const firstDocuments = [
  "уведомление о заседании ФАС или письмо заказчика о направлении сведений в РНП;",
  "договор, проект договора, переписка о подписании и исполнении;",
  "документы по обеспечению, срокам, поставке или расторжению;",
  "объяснения, почему контракт не был подписан или исполнен в том виде, как этого требовал заказчик.",
];

export default function RnpPage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
          <div>
            <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600">
              Раздел практики по РНП
            </div>

            <h1 className="mt-6 text-5xl font-bold leading-[1.02] tracking-tight text-[#081a4b] md:text-7xl">
              РНП по 223-ФЗ: как защитить компанию от включения в реестр
            </h1>

            <p className="mt-6 max-w-3xl text-xl leading-9 text-slate-700">
              Анализируем риски, готовим позицию для комиссии ФАС и защищаем
              поставщиков в спорах о включении в реестр недобросовестных
              поставщиков.
            </p>

            <p className="mt-4 max-w-3xl text-lg leading-9 text-slate-700">
              Для таких ситуаций важна скорость. Чем раньше собрать документы и
              объяснить поведение поставщика, тем выше шанс не допустить
              включения в реестр.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={SITE_CONTACTS.emailHref}
                className="rounded-2xl bg-[#081a4b] px-7 py-4 text-white transition hover:bg-[#0d2568]"
              >
                Направить документы по РНП
              </a>

              <a
                href={SITE_CONTACTS.phoneHref}
                className="rounded-2xl border border-slate-300 px-7 py-4 transition hover:bg-slate-50"
              >
                Срочно обсудить ситуацию
              </a>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {highlights.map((item) => (
              <div
                key={item.label}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="text-4xl font-bold text-[#081a4b]">
                  {item.value}
                </div>
                <div className="mt-4 text-base leading-7 text-slate-600">
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-16 lg:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-3xl font-bold tracking-tight text-[#081a4b]">
              Почему с РНП важно подключаться сразу
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
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-20 lg:grid-cols-2">
          <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-3xl font-bold tracking-tight text-[#081a4b]">
              Что такое РНП и чем он опасен для поставщика
            </h2>

            <p className="mt-5 text-lg leading-9 text-slate-700">
              Реестр недобросовестных поставщиков — это специальный реестр, куда
              включают сведения о компаниях, если ФАС приходит к выводу о
              недобросовестном поведении при заключении или исполнении договора.
              Попадание в РНП влияет на деловую репутацию, участие в закупках и
              будущие коммерческие перспективы поставщика.
            </p>

            <ul className="mt-6 space-y-3 text-base leading-8 text-slate-700">
              <li>• включение в РНП не происходит автоматически;</li>
              <li>
                • комиссия оценивает обстоятельства, переписку и поведение
                поставщика;
              </li>
              <li>
                • при грамотной защите включение в реестр во многих случаях
                удаётся предотвратить.
              </li>
            </ul>

            <div className="mt-8">
              <Link
                href="/rnp/chto-takoe-rnp"
                className="inline-flex rounded-2xl border border-slate-300 px-6 py-3 transition hover:bg-slate-50"
              >
                Подробнее о РНП
              </Link>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-3xl font-bold tracking-tight text-[#081a4b]">
              Когда включают в РНП
            </h2>

            <p className="mt-5 text-lg leading-9 text-slate-700">
              Комиссия ФАС рассматривает вопрос о включении в реестр, если
              заказчик сообщает об уклонении от заключения договора или о
              существенном нарушении обязательств поставщиком.
            </p>

            <div className="mt-6 grid gap-3">
              {reasons.map((reason) => (
                <div
                  key={reason}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-base text-slate-700"
                >
                  {reason}
                </div>
              ))}
            </div>

            <p className="mt-6 text-base leading-8 text-slate-600">
              Само по себе расторжение договора ещё не означает автоматического
              включения в РНП. Значение имеют вина поставщика, его действия по
              исполнению обязательств и наличие признаков недобросовестности.
            </p>

            <div className="mt-8">
              <Link
                href="/rnp/kogda-vklyuchayut-v-rnp"
                className="inline-flex rounded-2xl border border-slate-300 px-6 py-3 transition hover:bg-slate-50"
              >
                Когда ФАС включает в РНП
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section id="practice" className="bg-white">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="max-w-3xl">
            <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-600">
              Практика ФАС по РНП
            </div>
            <h2 className="mt-5 text-4xl font-bold tracking-tight text-[#081a4b]">
              Реальные кейсы защиты поставщиков
            </h2>
            <p className="mt-5 text-lg leading-9 text-slate-700">
              В этом разделе мы показываем реальные ситуации, в которых
              поставщикам удавалось избежать включения в РНП благодаря
              выстроенной правовой позиции и доказательствам добросовестного
              поведения.
            </p>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {cases.map((item) => (
              <article
                key={item.title}
                className="flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="text-sm font-medium text-slate-500">
                  {item.subtitle}
                </div>

                <h3 className="mt-4 text-2xl font-bold leading-8 text-[#081a4b]">
                  {item.title}
                </h3>

                <p className="mt-4 flex-1 text-base leading-8 text-slate-700">
                  {item.description}
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                    <span className="font-medium text-slate-900">Результат:</span>{" "}
                    {item.result}
                  </div>
                  <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                    <span className="font-medium text-slate-900">Суть:</span>{" "}
                    {item.amount}
                  </div>
                </div>

                <div className="mt-8">
                  <Link
                    href={item.href}
                    className="inline-flex rounded-2xl bg-[#081a4b] px-6 py-3 text-white transition hover:bg-[#0d2568]"
                  >
                    Смотреть кейс
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr]">
            <div>
              <div className="inline-flex rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600">
                Как мы работаем
              </div>

              <h2 className="mt-5 text-4xl font-bold tracking-tight text-[#081a4b]">
                Что делаем для защиты от включения в РНП
              </h2>

              <p className="mt-5 text-lg leading-9 text-slate-700">
                Изучаем документы, проверяем основания обращения заказчика в ФАС,
                собираем доказательства добросовестности и формируем позицию для
                заседания комиссии.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                <div className="text-lg font-semibold text-[#081a4b]">
                  Анализ материалов
                </div>
                <p className="mt-3 text-base leading-8 text-slate-700">
                  Изучаем закупочную документацию, договор, уведомления заказчика
                  и переписку сторон.
                </p>
              </div>

              <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                <div className="text-lg font-semibold text-[#081a4b]">
                  Правовая позиция
                </div>
                <p className="mt-3 text-base leading-8 text-slate-700">
                  Готовим объяснения, доводы, подборку практики и комплект
                  документов для ФАС.
                </p>
              </div>

              <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                <div className="text-lg font-semibold text-[#081a4b]">
                  Представительство
                </div>
                <p className="mt-3 text-base leading-8 text-slate-700">
                  Представляем интересы поставщика и фокусируем комиссию на
                  отсутствии недобросовестности.
                </p>
              </div>

              <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                <div className="text-lg font-semibold text-[#081a4b]">
                  Дальнейшая защита
                </div>
                <p className="mt-3 text-base leading-8 text-slate-700">
                  При необходимости сопровождаем обжалование решения и дальнейшую
                  защиту интересов компании.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="rounded-[2rem] bg-[#081a4b] px-8 py-10 text-white md:px-12 md:py-14">
            <div className="max-w-4xl">
              <div className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-white/80">
                Практический вывод
              </div>

              <h2 className="mt-5 text-4xl font-bold tracking-tight md:text-5xl">
                Включение в РНП требует доказательств недобросовестного поведения
              </h2>

              <p className="mt-6 text-lg leading-9 text-white/85">
                Для комиссии ФАС имеет значение не только формальное нарушение,
                но и фактическое поведение поставщика: предпринимал ли он
                разумные меры, вел ли переписку, пытался ли исполнить
                обязательства и предупреждал ли заказчика о препятствиях.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/rnp/kak-izbezhat-vklyucheniya-v-rnp"
                  className="rounded-2xl bg-white px-7 py-4 font-medium text-[#081a4b] transition hover:bg-slate-100"
                >
                  Как избежать включения
                </Link>

                <a
                  href="#request"
                  className="rounded-2xl border border-white/20 px-7 py-4 text-white transition hover:bg-white/10"
                >
                  Обсудить ситуацию
                </a>
              </div>
            </div>
          </div>

          <div className="mt-10 grid gap-4 lg:grid-cols-4">
            <Link
              href="/cases/rnp"
              className="rounded-3xl border border-slate-200 bg-slate-50 p-6 transition hover:bg-white hover:shadow-sm"
            >
              <div className="font-semibold text-[#081a4b]">Вся практика по РНП</div>
              <p className="mt-2 text-sm leading-7 text-slate-600">
                Открыть подборку решений по включению и отказу во включении в реестр.
              </p>
            </Link>
            <Link
              href="/uslugi/risk-rnp"
              className="rounded-3xl border border-slate-200 bg-slate-50 p-6 transition hover:bg-white hover:shadow-sm"
            >
              <div className="font-semibold text-[#081a4b]">Оценка риска РНП</div>
              <p className="mt-2 text-sm leading-7 text-slate-600">
                Если нужно быстро понять перспективу до заседания комиссии ФАС.
              </p>
            </Link>
            <Link
              href="/sudebnaya-zashita-v-zakupkah"
              className="rounded-3xl border border-slate-200 bg-slate-50 p-6 transition hover:bg-white hover:shadow-sm"
            >
              <div className="font-semibold text-[#081a4b]">Судебная защита</div>
              <p className="mt-2 text-sm leading-7 text-slate-600">
                Когда спор по РНП не заканчивается в ФАС и требует продолжения в суде.
              </p>
            </Link>
            <Link
              href="/uslugi/zhaloba-v-fas"
              className="rounded-3xl border border-slate-200 bg-slate-50 p-6 transition hover:bg-white hover:shadow-sm"
            >
              <div className="font-semibold text-[#081a4b]">Связанные споры в ФАС</div>
              <p className="mt-2 text-sm leading-7 text-slate-600">
                Жалобы, подготовка позиции и сопровождение поставщика по закупочным спорам.
              </p>
            </Link>
          </div>
        </div>
      </section>

      <section id="request" className="bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="grid gap-10 rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-slate-200 lg:grid-cols-[1fr_0.9fr] lg:p-12">
            <div>
              <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-600">
                Проверить ситуацию
              </div>

              <h2 className="mt-5 text-4xl font-bold tracking-tight text-[#081a4b]">
                Проведём первичную оценку риска включения в РНП
              </h2>

              <p className="mt-5 text-lg leading-9 text-slate-700">
                Если заказчик уже направил материалы в ФАС или только готовится
                это сделать, важно быстро оценить документы и занять позицию до
                рассмотрения вопроса комиссией.
              </p>

              <div className="mt-8 space-y-3 text-base leading-8 text-slate-700">
                <div>• оценим вероятность включения в РНП;</div>
                <div>• подскажем, какие доказательства нужно собрать;</div>
                <div>• предложим стратегию защиты под вашу ситуацию.</div>
              </div>
            </div>

            <div className="rounded-3xl bg-slate-50 p-6 ring-1 ring-slate-200">
              <div className="text-2xl font-bold text-[#081a4b]">
                Что можно прислать для анализа
              </div>

              <div className="mt-5 grid gap-3">
                <div className="rounded-2xl bg-white px-5 py-4 text-base text-slate-700 ring-1 ring-slate-200">
                  договор и закупочную документацию
                </div>
                <div className="rounded-2xl bg-white px-5 py-4 text-base text-slate-700 ring-1 ring-slate-200">
                  переписку с заказчиком
                </div>
                <div className="rounded-2xl bg-white px-5 py-4 text-base text-slate-700 ring-1 ring-slate-200">
                  уведомление о расторжении или обращении в ФАС
                </div>
                <div className="rounded-2xl bg-white px-5 py-4 text-base text-slate-700 ring-1 ring-slate-200">
                  документы, подтверждающие добросовестные действия
                </div>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="#request"
                  className="rounded-2xl bg-[#081a4b] px-6 py-3 text-white transition hover:bg-[#0d2568]"
                >
                  Отправить документы
                </Link>

                <a
                  href={SITE_CONTACTS.phoneHref}
                  className="rounded-2xl border border-slate-300 px-6 py-3 transition hover:bg-white"
                >
                  Позвонить
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="grid gap-8 rounded-[2rem] border border-slate-200 bg-slate-50 p-8 lg:grid-cols-[1fr_0.9fr] lg:p-12">
            <div>
              <h2 className="text-4xl font-bold tracking-tight text-[#081a4b]">
                Есть риск включения в РНП?
              </h2>
              <p className="mt-5 text-lg leading-9 text-slate-700">
                Если вопрос уже срочный, лучше сразу связываться напрямую. Так
                можно быстрее обсудить материалы, документы и реальные основания
                для включения в реестр.
              </p>
            </div>

            <div className="rounded-3xl bg-white p-6 ring-1 ring-slate-200">
              <div className="text-2xl font-bold text-[#081a4b]">
                Для первичного разговора пригодятся
              </div>
              <div className="mt-5 grid gap-3">
                <div className="rounded-2xl bg-slate-50 px-5 py-4 text-base text-slate-700">
                  уведомление заказчика или материалы в ФАС
                </div>
                <div className="rounded-2xl bg-slate-50 px-5 py-4 text-base text-slate-700">
                  договор, переписка и документы по исполнению
                </div>
                <div className="rounded-2xl bg-slate-50 px-5 py-4 text-base text-slate-700">
                  краткое описание, что именно произошло
                </div>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href={SITE_CONTACTS.phoneHref}
                  className="rounded-2xl bg-[#081a4b] px-6 py-3 text-white transition hover:bg-[#0d2568]"
                >
                  Позвонить
                </a>
                <a
                  href={SITE_CONTACTS.emailHref}
                  className="rounded-2xl border border-slate-300 px-6 py-3 transition hover:bg-slate-50"
                >
                  Написать на почту
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
