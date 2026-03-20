import Link from "next/link";
import { SITE_CONTACTS } from "@/lib/site-config";

export default function CustomersPage() {
  const directions = [
    {
      title: "Аудит документации до публикации",
      text: "Проверяем проект извещения, документацию, критерии оценки и условия договора на предмет спорных формулировок и типовых рисков жалоб.",
    },
    {
      title: "Расчет НМЦК и обоснование закупки",
      text: "Помогаем собрать доказательственную базу по НМЦК, коммерческим предложениям, описанию объекта закупки и деловой логике закупки.",
      href: "/zakazchikam/raschet-nmck",
    },
    {
      title: "Подготовка позиции на жалобу",
      text: "Если жалоба уже подана, формируем позицию заказчика, подбираем аргументы и документы к заседанию ФАС.",
    },
    {
      title: "Сопровождение спора в ФАС",
      text: "Представляем интересы заказчика при рассмотрении жалобы, помогаем отвечать на вопросы комиссии и защищать закупку по существу.",
    },
    {
      title: "Оспаривание выводов контролирующего органа",
      text: "Когда административный спор не заканчивается в ФАС, готовим стратегию дальнейшей защиты и работаем с судебной перспективой.",
      href: "/sudebnaya-zashita-v-zakupkah",
    },
    {
      title: "Проверка закупки на уязвимости",
      text: "Находим условия, которые чаще всего становятся основанием для жалоб: товарный знак, ограничение конкуренции, национальный режим, неустойка и сроки.",
      href: "/narusheniya",
    },
  ];

  const situations = [
    "документация готовится к публикации и нужно заранее снять спорные риски;",
    "на закупку уже поступила жалоба и важно не потерять темп до заседания;",
    "есть спор по национальному режиму, товарному знаку или ограничению конкуренции;",
    "нужно обосновать НМЦК и защитить расчет от претензий;",
    "спор вышел за пределы ФАС и требует дальнейшей судебной защиты.",
  ];

  const process = [
    "Разбираем закупку, документацию, расчет и фактическую цель заказчика.",
    "Показываем слабые места, которые могут стать основанием для жалобы.",
    "Формируем письменную позицию и комплект документов для защиты.",
    "Сопровождаем заказчика в ФАС и далее при необходимости в суде.",
  ];

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:py-20">
          <div className="max-w-5xl">
            <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600">
              GOSZAKON для заказчиков
            </div>

            <h1 className="mt-6 text-4xl font-bold tracking-tight text-[#081a4b] md:text-6xl">
              Юридическая поддержка заказчиков в закупках и спорах с ФАС
            </h1>

            <p className="mt-6 max-w-4xl text-lg leading-9 text-slate-700">
              Помогаем заказчикам выстроить закупку так, чтобы снизить риск жалоб,
              а если спор уже возник, быстро собрать позицию, защитить документацию
              и сохранить управляемость процедуры.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href={SITE_CONTACTS.phoneHref}
                className="rounded-2xl bg-[#081a4b] px-7 py-4 text-center text-base font-semibold text-white transition hover:bg-[#0d2568]"
              >
                Позвонить: {SITE_CONTACTS.phoneDisplay}
              </a>

              <Link
                href="/zakazchikam/raschet-nmck"
                className="rounded-2xl border border-slate-300 bg-white px-7 py-4 text-center text-base font-semibold text-[#081a4b] transition hover:bg-slate-50"
              >
                Расчет НМЦК
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="mb-10 max-w-3xl">
            <h2 className="text-3xl font-bold tracking-tight text-[#081a4b] md:text-4xl">
              Чем помогаем заказчикам
            </h2>
            <p className="mt-4 text-lg leading-8 text-slate-700">
              Здесь акцент не на жалобе от поставщика, а на защите закупки, логики
              документации и позиции заказчика перед контролирующим органом.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {directions.map((item) =>
              item.href ? (
                <Link
                  key={item.title}
                  href={item.href}
                  className="flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  <h3 className="text-xl font-semibold leading-8 text-[#081a4b]">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-base leading-8 text-slate-700">
                    {item.text}
                  </p>
                  <span className="mt-5 text-sm font-semibold text-[#081a4b]">
                    Подробнее →
                  </span>
                </Link>
              ) : (
                <div
                  key={item.title}
                  className="flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-7 shadow-sm"
                >
                  <h3 className="text-xl font-semibold leading-8 text-[#081a4b]">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-base leading-8 text-slate-700">
                    {item.text}
                  </p>
                </div>
              )
            )}
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8">
              <h2 className="text-3xl font-bold tracking-tight text-[#081a4b]">
                Когда это особенно полезно
              </h2>

              <ul className="mt-6 space-y-3 text-base leading-8 text-slate-700">
                {situations.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </div>

            <div className="rounded-3xl bg-[#081a4b] p-8 text-white">
              <h2 className="text-3xl font-bold tracking-tight">
                Как строится работа
              </h2>

              <div className="mt-6 space-y-4 text-base leading-8 text-white/90">
                {process.map((item, index) => (
                  <p key={item}>
                    {index + 1}. {item}
                  </p>
                ))}
              </div>

              <a
                href={SITE_CONTACTS.emailHref}
                className="mt-8 inline-flex rounded-2xl bg-white px-6 py-4 text-base font-semibold text-[#081a4b] transition hover:bg-slate-100"
              >
                Написать: {SITE_CONTACTS.email}
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
