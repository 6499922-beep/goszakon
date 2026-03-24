import type { Metadata } from "next";
import Link from "next/link";
import { SITE_CONTACTS } from "@/lib/site-config";

export const metadata: Metadata = {
  title:
    "Штраф за формальные недостатки документов по госконтракту | GOSZAKON",
  description:
    "Разбираем ситуации, когда заказчик начисляет штраф из-за формальных недостатков УПД, накладных и актов: где его позиция слаба и как выбивать такие санкции.",
};

const situations = [
  "Штраф начисляют из-за неполного адреса, формулировки в накладной или другого технического дефекта документа.",
  "Заказчик превращает спор о документообороте в вывод о некомплектной поставке или ненадлежащем исполнении.",
  "Формальную ошибку в УПД, акте или накладной используют как основание удержать деньги из оплаты.",
  "По каждой накладной или документу насчитывают отдельный крупный штраф, хотя реального ущерба и срыва исполнения нет.",
];

const excuses = [
  "Документ оформлен не идеально, значит заказчик вправе применить штраф в полном объеме.",
  "Поставщик подписал договор, следовательно заранее согласился с любыми последствиями формального дефекта.",
  "Ошибка в документах якобы автоматически означает ненадлежащее исполнение поставки.",
  "Пока поставщик не признает штраф и не исправит документы так, как хочет заказчик, платить необязательно.",
];

const weakPoints = [
  "Формальный дефект документа сам по себе не равен неисполнению обязательства по контракту.",
  "Заказчик часто натягивает смысл нарушения и искусственно расширяет договорную санкцию.",
  "Штрафы нередко начисляют несоразмерно: по каждой накладной, на всю сумму или без связи с реальными последствиями.",
  "Сам заказчик часто нарушает порядок приемки, претензионную процедуру или удерживает деньги без достаточного договорного основания.",
];

const workPrinciples = [
  {
    title: "Отделяем реальное нарушение от бумажной формальности",
    text: "Смотрим, было ли фактически нарушено исполнение по контракту или заказчик пытается превратить технический дефект документа в денежную санкцию.",
  },
  {
    title: "Проверяем, как именно применен штраф",
    text: "Разбираем базу начисления, количество эпизодов, договорное основание и то, насколько вообще такая санкция следует из текста контракта.",
  },
  {
    title: "Связываем спор с поведением заказчика",
    text: "Если заказчик сам принял поставку, затянул замечания, удержал деньги без права или придумал новый стандарт документов уже после исполнения, это работает против него.",
  },
  {
    title: "Переводим спор из оправданий в атаку",
    text: "Наша цель не объяснять, почему поставщик ошибся в бумаге, а показать, почему заказчик юридически слабо применил штраф и почему санкцию нужно ломать.",
  },
];

const firstChecks = [
  "Что именно нарушено: исполнение по контракту или только оформление отдельного документа.",
  "Есть ли в договоре прямое и корректное основание для такого штрафа.",
  "Соразмерен ли штраф самому нарушению и не превращен ли один дефект в серию санкций.",
  "Принял ли заказчик поставку фактически и не начал ли спорить с документами уже после этого.",
  "Не удержаны ли деньги из оплаты раньше, чем вопрос о штрафе вообще был нормально разрешен.",
];

const outcomes = [
  "Полное выбивание штрафа, если заказчик натянул формальное нарушение на более тяжелую санкцию.",
  "Снижение суммы, если заказчик применил штраф несоразмерно и процессуально с ошибками.",
  "Возврат удержанных из оплаты денег, если штраф уже был обращен в удержание.",
  "Ослабление общей позиции заказчика по спору о приемке, оплате и дальнейшей неустойке.",
];

export default function FormalDefectsPenaltyPage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 lg:grid-cols-[1.08fr_0.92fr] lg:py-24">
          <div>
            <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600">
              Практика GOSZAKON
            </div>

            <h1 className="mt-6 max-w-5xl text-5xl font-bold leading-[1.02] tracking-tight text-[#081a4b] md:text-7xl">
              Штраф за формальные недостатки документов
            </h1>

            <p className="mt-6 max-w-3xl text-xl leading-9 text-slate-700">
              Одна из самых спорных практик в закупках, когда заказчик
              превращает техническую ошибку в УПД, накладной или акте в
              основание для крупного штрафа. На деле это часто не спор о
              качестве исполнения, а попытка через документооборот создать
              поставщику денежную проблему.
            </p>

            <p className="mt-4 max-w-3xl text-lg leading-9 text-slate-700">
              Мы разбираем такие ситуации через договор, фактическое исполнение
              и поведение заказчика. Если он натянул формальный дефект документа
              на вывод о неисполнении или некомплектной поставке, такую санкцию
              нужно ломать, а не оправдывать.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href={SITE_CONTACTS.phoneHref}
                className="rounded-2xl bg-[#081a4b] px-7 py-4 text-center text-base font-semibold text-white transition hover:bg-[#0d2568]"
              >
                Разобрать штраф
              </a>

              <a
                href={SITE_CONTACTS.emailHref}
                className="rounded-2xl border border-slate-300 bg-white px-7 py-4 text-center text-base font-semibold text-[#081a4b] transition hover:bg-slate-50"
              >
                Направить договор и документы
              </a>
            </div>
          </div>

          <div className="grid gap-5">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-7 shadow-sm">
              <div className="text-sm uppercase tracking-[0.14em] text-slate-400">
                Как это выглядит на практике
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
                Главный перекос
              </div>
              <p className="mt-4 text-lg leading-9 text-white/90">
                Заказчик часто пытается сделать вид, что ошибка в бумаге равна
                реальному нарушению контракта, хотя это совсем не одно и то же.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-20 lg:grid-cols-[1fr_0.95fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600">
              Что обычно говорит заказчик
            </div>

            <h2 className="mt-6 text-3xl font-bold tracking-tight text-[#081a4b]">
              Формальный дефект документа подают как полное нарушение поставки
            </h2>

            <div className="mt-6 space-y-4">
              {excuses.map((item) => (
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
            <div className="inline-flex rounded-full border border-white/20 px-4 py-2 text-sm text-white/80">
              Где обычно слабость заказчика
            </div>

            <div className="mt-6 space-y-4">
              {weakPoints.map((item) => (
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

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="max-w-3xl">
            <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600">
              Наша логика
            </div>

            <h2 className="mt-5 text-4xl font-bold tracking-tight text-[#081a4b] md:text-5xl">
              Мы не спорим о бумаге в отрыве от контракта, мы разбираем, почему заказчик решил, что она стоит денег
            </h2>

            <p className="mt-5 text-lg leading-9 text-slate-700">
              Слабая защита в таких делах начинается с объяснений, почему
              документ оформлен неидеально. Сильная защита смотрит шире: был ли
              реально нарушен контракт, как заказчик квалифицировал ситуацию,
              почему применил именно такой штраф и что сделал сам после приемки
              поставки.
            </p>

            <p className="mt-4 text-lg leading-9 text-slate-700">
              Очень часто спор по формальным недостаткам документов на самом
              деле связан с неоплатой, удержанием денег, попыткой навязать
              внутренний стандарт оформления или желанием просто усилить
              давление на поставщика.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {workPrinciples.map((item) => (
              <div
                key={item.title}
                className="rounded-3xl border border-slate-200 bg-slate-50 p-7 shadow-sm"
              >
                <h3 className="text-xl font-semibold text-[#081a4b]">
                  {item.title}
                </h3>
                <p className="mt-4 text-base leading-8 text-slate-700">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-20 lg:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600">
              Что смотреть первым
            </div>

            <div className="mt-6 space-y-4">
              {firstChecks.map((item) => (
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
            <div className="inline-flex rounded-full border border-white/20 px-4 py-2 text-sm text-white/80">
              Что можно получить
            </div>

            <div className="mt-6 space-y-4">
              {outcomes.map((item) => (
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

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="max-w-3xl">
            <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600">
              Связанные материалы
            </div>

            <h2 className="mt-5 text-4xl font-bold tracking-tight text-[#081a4b] md:text-5xl">
              Куда перейти дальше по спорам о документах, штрафах и удержаниях
            </h2>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <Link
              href="/shtraf-za-nekomplektnuyu-postavku-iz-za-dokumentov"
              className="rounded-3xl border border-slate-200 bg-slate-50 p-7 shadow-sm transition hover:bg-white hover:shadow-md"
            >
              <h3 className="text-2xl font-semibold text-[#081a4b]">
                Штраф за некомплектную поставку из-за документов
              </h3>
              <p className="mt-4 text-slate-700">
                Узкий материал о ситуации, когда спорный документ пытаются
                превратить в доказательство некомплектной поставки.
              </p>
            </Link>

            <Link
              href="/shtraf-za-oshibku-v-upd-ili-nakladnoy"
              className="rounded-3xl border border-slate-200 bg-slate-50 p-7 shadow-sm transition hover:bg-white hover:shadow-md"
            >
              <h3 className="text-2xl font-semibold text-[#081a4b]">
                Штраф за ошибку в УПД или накладной
              </h3>
              <p className="mt-4 text-slate-700">
                Более узкий разбор под частый коммерческий спор, когда санкцию
                строят именно на УПД или товарной накладной.
              </p>
            </Link>

            <Link
              href="/zakazchik-ne-podpisyvaet-upd"
              className="rounded-3xl border border-slate-200 bg-slate-50 p-7 shadow-sm transition hover:bg-white hover:shadow-md"
            >
              <h3 className="text-2xl font-semibold text-[#081a4b]">
                Заказчик не подписывает УПД
              </h3>
              <p className="mt-4 text-slate-700">
                Когда формальные замечания к УПД используют как способ не
                платить и затянуть срок расчета.
              </p>
            </Link>

            <Link
              href="/uderzhanie-deneg-iz-oplaty"
              className="rounded-3xl border border-slate-200 bg-slate-50 p-7 shadow-sm transition hover:bg-white hover:shadow-md"
            >
              <h3 className="text-2xl font-semibold text-[#081a4b]">
                Заказчик удержал деньги из оплаты
              </h3>
              <p className="mt-4 text-slate-700">
                Когда спорный штраф уже превратили в удержание и уменьшили
                платеж без нормального разрешения спора.
              </p>
            </Link>

            <Link
              href="/sudebnaya-zashita-v-zakupkah/snizhenie-neustojki-postavshiku"
              className="rounded-3xl border border-slate-200 bg-slate-50 p-7 shadow-sm transition hover:bg-white hover:shadow-md"
            >
              <h3 className="text-2xl font-semibold text-[#081a4b]">
                Снижение неустойки поставщику
              </h3>
              <p className="mt-4 text-slate-700">
                Если заказчик превратил формальный дефект в большую денежную
                санкцию, спор часто нужно вести и по штрафу, и по расчету.
              </p>
            </Link>

            <Link
              href="/cases/neustoyka"
              className="rounded-3xl border border-slate-200 bg-slate-50 p-7 shadow-sm transition hover:bg-white hover:shadow-md"
            >
              <h3 className="text-2xl font-semibold text-[#081a4b]">
                Практика по неустойке и удержаниям
              </h3>
              <p className="mt-4 text-slate-700">
                Кейсы, где спор шел о штрафах, удержаниях, базе расчета и
                перекосе ответственности сторон.
              </p>
            </Link>

            <Link
              href="/spornye-praktiki/vnutrennie-sistemy-oplaty"
              className="rounded-3xl border border-slate-200 bg-slate-50 p-7 shadow-sm transition hover:bg-white hover:shadow-md"
            >
              <h3 className="text-2xl font-semibold text-[#081a4b]">
                Привязка оплаты к внутренним документам
              </h3>
              <p className="mt-4 text-slate-700">
                Когда формальный документооборот используют не для учета, а для
                сдвига оплаты и давления на поставщика.
              </p>
            </Link>

            <Link
              href="/uslugi/spory-po-neoplate"
              className="rounded-3xl border border-slate-200 bg-slate-50 p-7 shadow-sm transition hover:bg-white hover:shadow-md"
            >
              <h3 className="text-2xl font-semibold text-[#081a4b]">
                Разобрать ситуацию с юристом
              </h3>
              <p className="mt-4 text-slate-700">
                Если штраф уже начислен или удержан из оплаты, можно сразу
                перейти к правовой оценке и стратегии защиты.
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
              Если заказчик превратил бумажную формальность в крупный штраф, спор нужно быстро разбирать по договору и фактам
            </h2>

            <p className="mt-5 max-w-2xl text-lg leading-9 text-slate-200">
              Направьте нам договор, УПД, накладные, акты, претензию и расчет
              штрафа. Мы посмотрим, где заказчик натянул формальный дефект на
              более тяжелое нарушение и как переломить спор.
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
              href="/cases/neustoyka"
              className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-6 py-4 text-base font-semibold text-[#081a4b] transition hover:bg-slate-50"
            >
              Практика по неустойке и удержаниям
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
