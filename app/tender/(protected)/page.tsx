import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentTenderUser } from "@/lib/admin-auth";
import { getTenderDashboardData } from "@/lib/tender-dashboard";
import { tenderHasCapability } from "@/lib/tender-permissions";
import {
  formatTenderCurrency,
  tenderStatusLabels,
  tenderStatusTone,
} from "@/lib/tender-format";

export const dynamic = "force-dynamic";

export default async function TenderDashboardPage() {
  const currentUser = await getCurrentTenderUser();
  if (!currentUser) {
    redirect("/signin");
  }
  if (!tenderHasCapability(currentUser.role, "overview")) {
    redirect("/procurements");
  }

  const data = await getTenderDashboardData();

  const cards = [
    { label: "Всего закупок", value: data.procurementsTotal },
    { label: "Активные в работе", value: data.activeProcurements },
    { label: "Пакет готов / подано", value: data.readyProcurements },
    { label: "Активные стоп-факторы", value: data.rulesTotal },
    { label: "Карточки компаний", value: data.companiesTotal },
  ];

  return (
    <main>
      <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
        <div className="grid gap-8 bg-[linear-gradient(135deg,#081a4b_0%,#0d5bd7_100%)] px-8 py-8 text-white xl:grid-cols-[1.1fr_0.9fr]">
          <div>
            <div className="text-sm font-medium uppercase tracking-[0.16em] text-white/65">
              Tender Desk
            </div>
            <h1 className="mt-3 max-w-3xl text-4xl font-bold tracking-tight">
              Обзор тендерного кабинета
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-white/80">
              Кабинет уже разделен на основные этапы вашей воронки: первичный
              анализ, стоп-факторы, предпросчет, передача ответственному и сборка
              комплекта документов на подачу.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              {tenderHasCapability(currentUser.role, "procurement_create") ? (
                <Link
                  href="/procurements/new"
                  className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-[#081a4b] transition hover:bg-slate-100"
                >
                  Занести новую закупку
                </Link>
              ) : null}
              <Link
                href="/procurements"
                className="rounded-2xl border border-white/20 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Открыть реестр
              </Link>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              "Удобная ручная форма для первой фиксации закупки",
              "Чистая карточка анализа без перегруза интерфейса",
              "Подготовка к AI-выжимке по вашей структуре",
              "База для rule engine и проверки стоп-факторов",
            ].map((item) => (
              <div
                key={item}
                className="rounded-3xl border border-white/15 bg-white/10 p-5 text-sm leading-6 text-white/85"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="text-sm uppercase tracking-[0.12em] text-slate-400">
              {card.label}
            </div>
            <div className="mt-3 text-4xl font-bold tracking-tight text-[#081a4b]">
              {card.value}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-8 xl:grid-cols-[1.4fr_0.9fr]">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-[#081a4b]">
                Последние закупки
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                После создания карточки сотрудник сразу видит статус, заказчика и
                объём закупки.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              {tenderHasCapability(currentUser.role, "procurement_create") ? (
                <Link
                  href="/procurements/new"
                  className="rounded-2xl bg-[#081a4b] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#0d2568]"
                >
                  Новая закупка
                </Link>
              ) : null}
              <Link
                href="/procurements"
                className="rounded-2xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Открыть реестр
              </Link>
            </div>
          </div>

          {data.recentProcurements.length === 0 ? (
            <div className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-500">
              Пока нет загруженных закупок. Следующим шагом добавим форму создания
              карточки и первичный AI-анализ документации.
            </div>
          ) : (
            <div className="mt-6 space-y-3">
              {data.recentProcurements.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="min-w-0">
                    <Link
                      href={`/procurements/${item.id}`}
                      className="font-semibold text-[#081a4b] transition hover:text-[#0d5bd7]"
                    >
                      {item.title}
                    </Link>
                    <div className="mt-1 text-sm text-slate-500">
                      {item.customerName ?? "Заказчик не указан"} •{" "}
                      {item.itemsCount ?? "—"} позиций •{" "}
                      {formatTenderCurrency(item.nmckWithoutVat?.toString())}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${tenderStatusTone[item.status]}`}
                    >
                      {tenderStatusLabels[item.status]}
                    </span>
                    <span className="text-xs text-slate-400">
                      {item.deadline
                        ? new Intl.DateTimeFormat("ru-RU").format(item.deadline)
                        : "без срока"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-[#081a4b]">Первый рабочий сценарий</h2>
            <div className="mt-5 space-y-3 text-sm leading-7 text-slate-700">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                1. Оператор заносит закупку через красивую форму.
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                2. Система создаёт чистую карточку анализа по блокам.
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                3. Следующим этапом подключаем AI-выжимку и правила.
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-[#081a4b]">Следующие модули</h2>
            <div className="mt-5 space-y-3 text-sm leading-7 text-slate-700">
              <div className="rounded-2xl bg-slate-50 px-4 py-3">
                Загрузка закупки по ссылке и документов
              </div>
              <div className="rounded-2xl bg-slate-50 px-4 py-3">
                AI-выкладка по вашей структуре summary
              </div>
              <div className="rounded-2xl bg-slate-50 px-4 py-3">
                Rule engine со стоп-факторами и blacklist по ИНН/брендам
              </div>
              <div className="rounded-2xl bg-slate-50 px-4 py-3">
                Передача в предпросчет и чек-лист комплекта документов
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-[#081a4b] p-6 text-white shadow-sm">
            <div className="text-sm uppercase tracking-[0.12em] text-white/60">
              Что уже заложено
            </div>
            <div className="mt-3 text-2xl font-bold tracking-tight">
              База компаний, закупок и стоп-факторов уже есть в схеме данных.
            </div>
            <p className="mt-3 text-sm leading-7 text-white/80">
              Дальше я начну подключать формы создания записей и хранение ваших
              типовых правил, чтобы кабинет можно было использовать на реальных
              заявках.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
