import Link from "next/link";
import { redirect } from "next/navigation";
import { createTenderProcurementAction } from "@/app/tender/actions";
import { Field } from "@/app/tender/_components/field";
import { getCurrentTenderUser } from "@/lib/admin-auth";
import { tenderHasCapability } from "@/lib/tender-permissions";

export const dynamic = "force-dynamic";

const inputClassName =
  "w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#0d5bd7] focus:ring-4 focus:ring-[#0d5bd7]/10";

const textareaClassName = `${inputClassName} min-h-36 resize-y`;

const systemSteps = [
  "Сохранит весь пакет исходной документации внутри закупки.",
  "Попробует извлечь текст из PDF, DOCX, XLSX и текстовых файлов.",
  "Автоматически заполнит карточку закупки по документации.",
  "Проверит стоп-факторы и создаст параллельную ФАС-ветку.",
  "Подсветит, что не получилось определить и что нужно проверить человеку.",
];

const employeeRole = [
  "скачать документы из агрегатора или ЭТП",
  "загрузить весь пакет без ручного заполнения карточки",
  "при необходимости вставить текст документации, если он уже есть под рукой",
];

const aiResult = [
  "заполненная карточка закупки",
  "основной вывод по закупке",
  "вывод по потенциальной жалобе в ФАС",
  "список найденных стоп-факторов",
  "список того, что не удалось определить автоматически",
];

export default async function NewTenderProcurementPage() {
  const currentUser = await getCurrentTenderUser();

  if (!currentUser || !tenderHasCapability(currentUser.role, "procurement_create")) {
    redirect("/procurements");
  }

  return (
    <main className="space-y-8">
      <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 bg-[linear-gradient(135deg,#081a4b_0%,#0d5bd7_100%)] px-8 py-8 text-white">
          <div className="text-sm font-medium uppercase tracking-[0.16em] text-white/70">
            Первый этап обработки
          </div>
          <h1 className="mt-3 max-w-4xl text-4xl font-bold tracking-tight">
            Сотрудник только загружает документацию. Дальше система сама разбирает
            закупку и заполняет карточку.
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-white/80">
            На этом экране не нужно вручную заносить заказчика, НМЦ, критерии,
            договорные условия и первичную выжимку. Задача сотрудника: загрузить
            все документы закупки для первичного анализа.
          </p>
        </div>

        <div className="grid gap-6 border-b border-slate-200 bg-slate-50 px-8 py-6 lg:grid-cols-3">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6">
            <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              Что делает сотрудник
            </div>
            <div className="mt-4 space-y-3">
              {employeeRole.map((item, index) => (
                <div
                  key={item}
                  className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-700"
                >
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#0d5bd7] text-xs font-semibold text-white">
                    {index + 1}
                  </div>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-6">
            <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              Что система сделает сама
            </div>
            <div className="mt-4 space-y-3">
              {systemSteps.map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm leading-6 text-slate-700"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-6">
            <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              Что получится на выходе
            </div>
            <div className="mt-4 space-y-3">
              {aiResult.map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-sky-100 bg-sky-50 px-4 py-3 text-sm leading-6 text-slate-700"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>

        <form action={createTenderProcurementAction} className="px-8 py-8">
          <input type="hidden" name="actorName" value={currentUser.name || currentUser.email || "Сотрудник"} />

          <div className="grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
            <div className="space-y-8">
              <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-5">
                  <h2 className="text-2xl font-bold tracking-tight text-[#081a4b]">
                    Загрузить пакет документации
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Добавь все документы, которые есть по закупке: извещение, ТЗ,
                    проект договора, приложения, формы заказчика, расчёт НМЦК,
                    таблицы и архивы с формами.
                  </p>
                </div>

                <div className="space-y-5">
                  <Field
                    label="Документы закупки"
                    required
                    hint="Можно загрузить сразу несколько файлов любых доступных форматов."
                  >
                    <input
                      name="documents"
                      type="file"
                      multiple
                      required
                      className={`${inputClassName} cursor-pointer file:mr-4 file:rounded-xl file:border-0 file:bg-[#0d5bd7] file:px-4 file:py-2 file:text-sm file:font-medium file:text-white`}
                    />
                  </Field>

                  <Field
                    label="Ссылка на закупку"
                    hint="Необязательно. Если есть ссылка из агрегатора или ЭТП, приложи её для удобства."
                  >
                    <input
                      name="sourceUrl"
                      type="url"
                      className={inputClassName}
                      placeholder="https://..."
                    />
                  </Field>

                  <Field
                    label="Текст документации, если он уже есть"
                    hint="Необязательно. Это запасной вариант, если текст уже выгружен из закупки и его можно сразу отдать на анализ."
                  >
                    <textarea
                      name="sourceText"
                      className={textareaClassName}
                      placeholder="Можно вставить текст извещения, ТЗ или всего пакета документации. Если не вставлять, система сначала попробует извлечь текст из загруженных файлов сама."
                    />
                  </Field>
                </div>
              </section>
            </div>

            <aside className="space-y-6">
              <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[#0d5bd7]">
                  Маршрут после загрузки
                </div>
                <div className="mt-3 text-2xl font-bold tracking-tight text-[#081a4b]">
                  Что произойдёт дальше
                </div>
                <div className="mt-5 space-y-4">
                  {[
                    "Сохраняем всю исходную документацию в карточке закупки.",
                    "Пытаемся извлечь текст и запускаем первичный AI-анализ.",
                    "Автоматически строим основной вывод и ФАС-ветку.",
                    "Подсвечиваем, что заполнено, а что ещё требует проверки человеком.",
                  ].map((item, index) => (
                    <div
                      key={item}
                      className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#081a4b] text-sm font-semibold text-white">
                        {index + 1}
                      </div>
                      <div className="text-sm leading-6 text-slate-700">{item}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[2rem] border border-amber-200 bg-amber-50 p-6">
                <div className="text-lg font-bold tracking-tight text-[#081a4b]">
                  Что система может не понять сразу
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Если часть файлов окажется в сложном формате или внутри будет
                  мало извлекаемого текста, система всё равно сохранит документы,
                  заполнит то, что смогла определить, и отдельно покажет, что
                  нужно проверить вручную.
                </p>
              </div>
            </aside>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-4 border-t border-slate-200 pt-6">
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-full bg-[#0d5bd7] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#0a4db7]"
            >
              Загрузить документы и запустить первичный анализ
            </button>

            <Link
              href="/procurements"
              className="inline-flex items-center justify-center rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
            >
              Вернуться в реестр
            </Link>
          </div>
        </form>
      </section>
    </main>
  );
}
