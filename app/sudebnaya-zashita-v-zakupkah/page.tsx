import type { Metadata } from "next";
import Link from "next/link";
import { SITE_CONTACTS } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Оспаривание решения ФАС в арбитражном суде | GOSZAKON",
  description:
    "Оспариваем решения ФАС в арбитражном суде, если жалоба отклонена формально, материалы дела не исследованы или позиция комиссии противоречит сложившейся практике.",
};

const situations = [
  "ФАС отказал по сильной жалобе, хотя позиция подтверждается документами.",
  "Комиссия не исследовала материалы дела и ограничилась формальной отпиской.",
  "Решение антимонопольного органа идет против сложившейся практики.",
  "Заказчика не привлекли к ответственности за неоплату в срок по надуманным основаниям.",
];

const disputeTypes = [
  {
    title: "Отказ ФАС по обоснованной жалобе",
    text: "Если жалоба сильная, но комиссия не приняла нашу сторону, проигнорировала документы или ушла от нормальной правовой оценки, мы продолжаем спор в арбитражном суде.",
  },
  {
    title: "Споры по НДС и НМЦК",
    text: "Даже по вопросам, где подход уже должен быть очевидным, ФАС иногда продолжает выносить спорные решения. Если комиссия сохраняет ошибочную позицию вопреки сложившейся практике, такое решение нужно ломать в суде.",
  },
  {
    title: "Неоплата и неустойка",
    text: "Мы оспариваем отказы ФАС в привлечении заказчика к ответственности за неоплату и ведем судебные споры о снижении неустойки поставщику, когда заказчик удерживает из оплаты чрезмерные санкции.",
  },
];

const proofPoints = [
  "ФАС не исследовал материалы дела полно и объективно.",
  "Комиссия проигнорировала ключевые доказательства.",
  "Выводы решения не соответствуют фактическим обстоятельствам.",
  "Мотивировка носит формальный характер и не отвечает на доводы жалобы.",
  "Антимонопольный орган пошел против сложившейся практики.",
  "Вместо рассмотрения спора по существу была подготовлена отказная отписка.",
];

const advantages = [
  "Мы не подаем безнадежные жалобы и заранее оцениваем перспективу спора.",
  "Понимаем, когда отказ ФАС означает слабую жалобу, а когда слабое решение самой комиссии.",
  "Сочетаем опыт административной защиты и арбитражного процесса.",
  "Ориентируемся не на формальную победу, а на практический результат для доверителя.",
];

const stages = [
  {
    title: "Разбираем решение ФАС",
    text: "Смотрим, как именно комиссия пришла к отказу, что исследовала, что проигнорировала и где решение не выдерживает правовой проверки.",
  },
  {
    title: "Оцениваем, можно ли ломать решение в суде",
    text: "Сопоставляем материалы дела, закон и уже сложившуюся практику. На этом этапе видно, есть ли у спора реальная судебная перспектива.",
  },
  {
    title: "Готовим позицию для арбитражного суда",
    text: "Определяем ключевые точки атаки: формальный подход, неполное исследование обстоятельств, игнорирование доказательств и противоречие практике.",
  },
  {
    title: "Сопровождаем спор до результата",
    text: "Готовим процессуальные документы, представляем интересы доверителя в суде и добиваемся отмены незаконного решения ФАС.",
  },
];

const formatOfWork = [
  "Быстро оцениваем перспективу по решению ФАС, материалам дела и документам закупки.",
  "Работаем по всей России: подключаемся онлайн, выезжаем к клиенту и собираем позицию вместе с командой.",
  "Если спор связан с оплатой, неустойкой или исполнением контракта, сразу стыкуем судебный блок с соседними требованиями.",
];

export default function CourtProtectionPage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 lg:grid-cols-[1.08fr_0.92fr] lg:py-24">
          <div>
            <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600">
              Судебная защита GOSZAKON
            </div>

            <h1 className="mt-6 max-w-5xl text-5xl font-bold leading-[1.02] tracking-tight text-[#081a4b] md:text-7xl">
              Оспаривание решения ФАС в арбитражном суде
            </h1>

            <p className="mt-6 max-w-3xl text-xl leading-9 text-slate-700">
              Если ФАС не исследовал материалы дела, формально отказал в жалобе
              или занял позицию против сложившейся практики, спор не
              заканчивается на административной стадии. Мы оспариваем такие
              решения в арбитражном суде и добиваемся их отмены.
            </p>

            <p className="mt-4 max-w-3xl text-lg leading-9 text-slate-700">
              Мы не ведем безнадежные дела. До обращения в суд заранее
              оцениваем перспективу, понимаем силу позиции и честно смотрим на
              шансы. Если решение ФАС юридически слабое, его можно и нужно
              ломать.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href={SITE_CONTACTS.emailHref}
                className="rounded-2xl bg-[#081a4b] px-7 py-4 text-center text-base font-semibold text-white transition hover:bg-[#0d2568]"
              >
                Направить решение ФАС
              </a>

              <a
                href={SITE_CONTACTS.phoneHref}
                className="rounded-2xl border border-slate-300 bg-white px-7 py-4 text-center text-base font-semibold text-[#081a4b] transition hover:bg-slate-50"
              >
                Быстро обсудить перспективу
              </a>
            </div>
          </div>

          <div className="grid gap-5">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-7 shadow-sm">
              <div className="text-sm uppercase tracking-[0.14em] text-slate-400">
                Когда мы идем в суд
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
                Практический результат
              </div>
              <div className="mt-4 text-4xl font-bold">80%+</div>
              <p className="mt-4 text-lg leading-9 text-white/90">
                Наш выигрыш по делам об оспаривании решений ФАС. Мы не идем в
                поток формальных споров, а берем в работу только те дела, где
                видим реальный шанс изменить итог.
              </p>

              <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-7 text-white/90">
                Подключаемся по всей России: можно быстро прислать решение,
                материалы жалобы и документы закупки, а дальше уже решить,
                нужен ли выезд и отдельная работа с командой.
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-bold tracking-tight text-[#081a4b] md:text-4xl">
              Как мы подключаемся к таким спорам
            </h2>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {formatOfWork.map((item) => (
              <div
                key={item}
                className="rounded-3xl border border-slate-200 bg-slate-50 p-7 shadow-sm"
              >
                <p className="text-base leading-8 text-slate-700">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="max-w-3xl">
            <div className="inline-flex rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600">
              Типовые споры
            </div>

            <h2 className="mt-5 text-4xl font-bold tracking-tight text-[#081a4b] md:text-5xl">
              Какие решения ФАС мы чаще всего оспариваем
            </h2>

            <p className="mt-5 text-lg leading-9 text-slate-700">
              Мы идем в суд не потому, что нам не понравился результат. Мы
              идем в суд тогда, когда отказ ФАС не выдерживает нормальной
              правовой проверки.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {disputeTypes.map((item) => (
              <div
                key={item.title}
                className="flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-7 shadow-sm"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
                  <div className="h-3 w-3 rounded-full bg-[#081a4b]" />
                </div>

                <h3 className="text-2xl font-semibold leading-8 text-[#081a4b]">
                  {item.title}
                </h3>

                <p className="mt-4 text-base leading-8 text-slate-700">
                  {item.text}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-8">
            <Link
              href="/sudebnaya-zashita-v-zakupkah/snizhenie-neustojki-postavshiku"
              className="inline-flex rounded-2xl border border-slate-300 bg-white px-6 py-4 text-base font-semibold text-[#081a4b] transition hover:bg-slate-100"
            >
              Отдельно: снижение неустойки поставщику
            </Link>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-20 lg:grid-cols-[1fr_0.95fr]">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 shadow-sm">
            <div className="inline-flex rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600">
              Почему ФАС приходится оспаривать
            </div>

            <h2 className="mt-6 text-3xl font-bold tracking-tight text-[#081a4b]">
              Отказ ФАС не всегда означает слабую жалобу
            </h2>

            <p className="mt-5 text-lg leading-9 text-slate-700">
              Институт жалоб в закупках до сих пор не работает так ровно, как
              должен был бы работать. Поставщики часто боятся спорить с
              заказчиком открыто, зависят от него и не всегда готовы доводить
              конфликт до конца. Из-за этого многие спорные вопросы слишком
              долго живут без нормального судебного продолжения, а по похожим
              ситуациям появляются разные и даже полярные решения.
            </p>

            <p className="mt-4 text-lg leading-9 text-slate-700">
              Один из показательных примеров связан со спорами по НДС и НМЦК.
              Даже после того, как подход по этому вопросу уже должен был стать
              очевидным, в практике продолжали появляться разные решения. Если
              ФАС сохраняет спорную позицию по вопросу, который уже должен
              решаться иначе, мы оспариваем такое решение в арбитражном суде.
            </p>
          </div>

          <div className="rounded-3xl bg-[#081a4b] p-8 text-white shadow-sm">
            <div className="inline-flex rounded-full border border-white/20 px-4 py-2 text-sm text-white/80">
              Что мы доказываем в суде
            </div>

            <div className="mt-6 space-y-4">
              {proofPoints.map((item) => (
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

      <section className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-20 lg:grid-cols-[0.95fr_1fr]">
          <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
            <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600">
              Наша позиция
            </div>

            <h2 className="mt-6 text-3xl font-bold tracking-tight text-[#081a4b]">
              Мы не идем в суд ради самой подачи
            </h2>

            <p className="mt-5 text-lg leading-9 text-slate-700">
              До обращения в арбитражный суд мы оцениваем, насколько грубые
              ошибки допущены в решении ФАС, подтверждается ли позиция
              документами, есть ли практика по аналогичным вопросам и даст ли
              отмена решения реальный результат для доверителя.
            </p>

            <p className="mt-4 text-lg leading-9 text-slate-700">
              Если дело слабое, мы говорим это сразу. Если видим, что ФАС сделал
              формальную отписку, не исследовал материалы дела или прикрыл
              заказчика от ответственности, мы идем в суд и добиваемся отмены
              такого решения.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600">
              Почему обращаются к нам
            </div>

            <div className="mt-6 space-y-4">
              {advantages.map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
                >
                  <p className="text-base leading-8 text-slate-700">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-20 lg:grid-cols-2">
          <div className="rounded-3xl bg-[#081a4b] p-8 text-white shadow-sm">
            <div className="inline-flex rounded-full border border-white/20 px-4 py-2 text-sm text-white/80">
              Как строится работа
            </div>

            <div className="mt-6 space-y-5">
              {stages.map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-white/10 bg-white/5 p-5"
                >
                  <h3 className="text-xl font-semibold">{item.title}</h3>
                  <p className="mt-3 text-base leading-8 text-white/90">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 shadow-sm">
            <div className="inline-flex rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600">
              Практический итог
            </div>

            <h2 className="mt-6 text-3xl font-bold tracking-tight text-[#081a4b]">
              Для нас важна не отмена бумаги, а результат для доверителя
            </h2>

            <p className="mt-5 text-lg leading-9 text-slate-700">
              Если суд отменяет необоснованное решение ФАС, мы рассматриваем
              спор дальше не как формальную победу, а как реальный шаг к
              восстановлению позиции доверителя. В зависимости от ситуации это
              может означать отмену незаконного отказа, привлечение заказчика к
              ответственности, продолжение защиты по закупке или дальнейшее
              взыскание денежных средств.
            </p>

            <p className="mt-4 text-lg leading-9 text-slate-700">
              Если действия заказчика уже привели к потерям и для этого есть
              основания, после выигрыша мы ставим вопрос и о деньгах. Для
              доверителя важен не сам судебный акт, а практический итог спора.
            </p>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="max-w-3xl">
            <div className="inline-flex rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600">
              Связанные материалы
            </div>

            <h2 className="mt-5 text-4xl font-bold tracking-tight text-[#081a4b] md:text-5xl">
              Куда перейти дальше по этой теме
            </h2>

            <p className="mt-5 text-lg leading-9 text-slate-700">
              Если спор связан не только с отказом ФАС, но и с деньгами,
              неустойкой или исполнением контракта, полезно сразу смотреть
              соседние материалы и практику.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <Link
              href="/sudebnaya-zashita-v-zakupkah/snizhenie-neustojki-postavshiku"
              className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <h3 className="text-2xl font-semibold text-[#081a4b]">
                Снижение неустойки поставщику
              </h3>
              <p className="mt-4 text-slate-700">
                Если заказчик удержал санкции из оплаты или насчитал чрезмерную
                сумму, спор часто продолжается уже в судебной плоскости.
              </p>
            </Link>

            <Link
              href="/cases"
              className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <h3 className="text-2xl font-semibold text-[#081a4b]">
                Практика ФАС
              </h3>
              <p className="mt-4 text-slate-700">
                Посмотрите реальные кейсы по жалобам, отказам комиссии и
                ситуациям, где административная стадия стала только началом спора.
              </p>
            </Link>

            <Link
              href="/uslugi/proverka-zakupki"
              className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <h3 className="text-2xl font-semibold text-[#081a4b]">
                Получить правовую оценку
              </h3>
              <p className="mt-4 text-slate-700">
                Если у вас уже есть решение ФАС на руках, можно быстро оценить,
                есть ли смысл идти дальше в арбитражный суд.
              </p>
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-[#081a4b] text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-20 md:grid-cols-2">
          <div>
            <div className="inline-flex rounded-full border border-white/20 px-4 py-2 text-sm text-white/80">
              Следующий шаг
            </div>

            <h2 className="mt-5 text-4xl font-bold tracking-tight">
              Если ФАС отказал по сильной жалобе, это еще не конец спора
            </h2>

            <p className="mt-5 max-w-2xl text-lg leading-9 text-slate-200">
              Направьте нам решение ФАС и материалы дела. Мы оценим, есть ли
              основания для судебного оспаривания, и честно скажем, можно ли
              изменить итог спора через арбитражный суд.
            </p>
          </div>

          <div className="flex flex-col justify-center gap-4 rounded-3xl bg-white p-8 text-slate-900 shadow-2xl">
            <a
              href={SITE_CONTACTS.phoneHref}
              className="inline-flex items-center justify-center rounded-2xl bg-[#081a4b] px-6 py-4 text-base font-semibold text-white transition hover:bg-[#0d2568]"
            >
              Позвонить: {SITE_CONTACTS.phoneDisplay}
            </a>

            <a
              href={SITE_CONTACTS.emailHref}
              className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-6 py-4 text-base font-semibold text-[#081a4b] transition hover:bg-slate-50"
            >
              Направить материалы на почту
            </a>

            <Link
              href="/cases"
              className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-6 py-4 text-base font-semibold text-[#081a4b] transition hover:bg-slate-50"
            >
              Смотреть практику ФАС
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
