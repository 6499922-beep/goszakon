import Link from "next/link";
import { createTenderProcurementAction } from "@/app/tender/actions";
import { Field } from "@/app/tender/_components/field";

export const dynamic = "force-dynamic";

const inputClassName =
  "w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#0d5bd7] focus:ring-4 focus:ring-[#0d5bd7]/10";

const textareaClassName = `${inputClassName} min-h-32 resize-y`;

export default function NewTenderProcurementPage() {
  return (
    <main className="space-y-8">
      <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 bg-[linear-gradient(135deg,#081a4b_0%,#0d5bd7_100%)] px-8 py-8 text-white">
          <div className="text-sm font-medium uppercase tracking-[0.16em] text-white/70">
            Новая закупка
          </div>
          <h1 className="mt-3 max-w-3xl text-4xl font-bold tracking-tight">
            Занести закупку в систему и собрать первичную карточку анализа.
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-white/80">
            Эта форма покрывает первый рабочий шаг: сотрудник вручную заносит
            ключевые данные закупки, а затем система ведёт её по этапам
            анализа, предпросчёта и подготовки пакета документов.
          </p>
        </div>

        <div className="grid gap-6 border-b border-slate-200 bg-slate-50 px-8 py-6 lg:grid-cols-3">
          {[
            "Сначала фиксируем заказчика, сроки, НМЦ и состав лота.",
            "Потом заносим выжимку: критерии, документы, нестандартные условия.",
            "После сохранения открывается карточка закупки с удобными блоками.",
          ].map((item) => (
            <div
              key={item}
              className="rounded-3xl border border-white bg-white/90 px-5 py-4 text-sm leading-6 text-slate-600"
            >
              {item}
            </div>
          ))}
        </div>

        <form action={createTenderProcurementAction} className="px-8 py-8">
          <input type="hidden" name="actorName" value="Сотрудник-загрузчик" />
          <div className="grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
            <div className="space-y-8">
              <section>
                <div className="mb-5">
                  <h2 className="text-2xl font-bold tracking-tight text-[#081a4b]">
                    Основные сведения
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Всё, что нужно для идентификации закупки и быстрой передачи в
                    работу.
                  </p>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <Field label="Название закупки" required>
                      <input
                        name="title"
                        required
                        className={inputClassName}
                        placeholder="Например: Поставка кабельно-проводниковой продукции"
                      />
                    </Field>
                  </div>

                  <div className="md:col-span-2">
                    <Field
                      label="Ссылка на закупку"
                      hint="Сюда можно вставить ссылку из агрегатора или ЭТП."
                    >
                      <input
                        name="sourceUrl"
                        type="url"
                        className={inputClassName}
                        placeholder="https://..."
                      />
                    </Field>
                  </div>

                  <Field label="Заказчик">
                    <input
                      name="customerName"
                      className={inputClassName}
                      placeholder="АО Восточный Порт"
                    />
                  </Field>

                  <Field label="ИНН заказчика">
                    <input
                      name="customerInn"
                      className={inputClassName}
                      placeholder="2508000000"
                    />
                  </Field>

                  <Field label="Номер закупки">
                    <input
                      name="procurementNumber"
                      className={inputClassName}
                      placeholder="32615804162"
                    />
                  </Field>

                  <Field label="Площадка">
                    <input
                      name="platform"
                      className={inputClassName}
                      placeholder="РТС-Тендер / B2B / АСТ ГОЗ"
                    />
                  </Field>

                  <Field label="Окончание подачи">
                    <input name="deadline" type="datetime-local" className={inputClassName} />
                  </Field>

                  <Field label="Вид закупки">
                    <input
                      name="purchaseType"
                      className={inputClassName}
                      placeholder="Товары / инструмент / оборудование"
                    />
                  </Field>

                  <Field label="НМЦ, руб.">
                    <input
                      name="nmck"
                      className={inputClassName}
                      placeholder="4446300.76"
                    />
                  </Field>

                  <Field label="НМЦ без НДС, руб.">
                    <input
                      name="nmckWithoutVat"
                      className={inputClassName}
                      placeholder="3644508.82"
                    />
                  </Field>

                  <Field label="Количество позиций">
                    <input
                      name="itemsCount"
                      type="number"
                      min={1}
                      className={inputClassName}
                      placeholder="6"
                    />
                  </Field>

                  <Field label="Ответственный">
                    <input
                      name="assignedTo"
                      className={inputClassName}
                      placeholder="ФИО сотрудника"
                    />
                  </Field>
                </div>
              </section>

              <section>
                <div className="mb-5">
                  <h2 className="text-2xl font-bold tracking-tight text-[#081a4b]">
                    Первичная выжимка
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Та самая структурная выкладка, по которой вы принимаете
                    решение брать закупку или нет.
                  </p>
                </div>

                <div className="space-y-5">
                  <Field label="Краткая суть закупки">
                    <textarea
                      name="summary"
                      className={textareaClassName}
                      placeholder="Короткая выжимка по предмету закупки, условиям и важным ограничениям..."
                    />
                  </Field>

                  <Field label="Критерии отбора">
                    <textarea
                      name="selectionCriteria"
                      className={textareaClassName}
                      placeholder="Цена 100%, опыт 0% или иная логика оценки..."
                    />
                  </Field>

                  <Field
                    label="Требуемая документация до подачи"
                    hint="Один документ на строку."
                  >
                    <textarea
                      name="requiredDocuments"
                      className={textareaClassName}
                      placeholder={"Заявка по форме заказчика\nКоммерческое предложение\nУстав\nВыписка ЕГРЮЛ"}
                    />
                  </Field>

                  <Field
                    label="Нестандартные требования"
                    hint="Один пункт на строку."
                  >
                    <textarea
                      name="nonstandardRequirements"
                      className={textareaClassName}
                      placeholder={"Аналоги не рассматриваются\nТовар должен быть новым\nНужны паспорта качества"}
                    />
                  </Field>
                </div>
              </section>
            </div>

            <div className="space-y-8">
              <section className="rounded-[2rem] border border-slate-200 bg-slate-50 p-6">
                <div className="mb-5">
                  <h2 className="text-2xl font-bold tracking-tight text-[#081a4b]">
                    Условия договора
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Самые чувствительные условия для операционного решения.
                  </p>
                </div>

                <div className="space-y-5">
                  <Field label="Сроки и место поставки">
                    <textarea
                      name="deliveryTerms"
                      className={textareaClassName}
                      placeholder="60 календарных дней, склад покупателя, доставка за счет поставщика..."
                    />
                  </Field>

                  <Field label="Сроки оплаты">
                    <textarea
                      name="paymentTerms"
                      className={textareaClassName}
                      placeholder="7 рабочих дней после приемки и подписания УПД..."
                    />
                  </Field>

                  <Field label="Срок действия договора">
                    <textarea
                      name="contractTerm"
                      className={textareaClassName}
                      placeholder="С момента подписания до полного исполнения обязательств..."
                    />
                  </Field>

                  <Field label="Ответственность и неустойка">
                    <textarea
                      name="penaltyTerms"
                      className={textareaClassName}
                      placeholder="0,1% за день просрочки, 1% после 14 дней..."
                    />
                  </Field>
                </div>
              </section>

              <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-5">
                  <h2 className="text-2xl font-bold tracking-tight text-[#081a4b]">
                    Стоп-факторы
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Можно кратко зафиксировать результат проверки до подключения
                    автоматического rule engine.
                  </p>
                </div>

                <Field label="Итог по стоп-факторам">
                  <textarea
                    name="stopFactorsSummary"
                    className={textareaClassName}
                    placeholder="Стоп-фактора не выявлено / Есть признаки по монобренду / Нужна ручная проверка..."
                  />
                </Field>
              </section>

              <section className="rounded-[2rem] border border-[#081a4b]/10 bg-[linear-gradient(180deg,#f8fbff_0%,#eef5ff_100%)] p-6">
                <div className="text-sm font-medium uppercase tracking-[0.14em] text-[#0d5bd7]">
                  Подсказка оператору
                </div>
                <div className="mt-3 text-lg font-semibold leading-8 text-[#081a4b]">
                  Не обязательно заполнять всё идеально с первого раза.
                </div>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  Важнее занести закупку быстро и аккуратно, чтобы команда видела
                  её в системе. На следующем шаге карточку можно будет
                  дообогащать, передавать в предпросчёт и собирать пакет
                  документов.
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    type="submit"
                    className="rounded-2xl bg-[#081a4b] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#0d2568]"
                  >
                    Сохранить закупку
                  </button>

                  <Link
                    href="/procurements"
                    className="rounded-2xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Вернуться в реестр
                  </Link>
                </div>
              </section>
            </div>
          </div>
        </form>
      </section>
    </main>
  );
}
