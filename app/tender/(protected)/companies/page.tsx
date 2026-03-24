import {
  saveTenderCompanyDocumentAction,
  saveTenderCompanyProfileAction,
} from "@/app/tender/actions";
import { Field } from "@/app/tender/_components/field";
import { getPrisma } from "@/lib/prisma";

const documentTypeLabels = {
  COMPANY_CARD: "Карточка компании",
  CHARTER: "Устав",
  TIN_CERTIFICATE: "ИНН / КПП",
  OGRN_CERTIFICATE: "ОГРН / лист записи",
  DIRECTOR_APPOINTMENT: "Назначение директора",
  EGRUL_EXTRACT: "Выписка ЕГРЮЛ",
  POWER_OF_ATTORNEY: "Доверенность",
  BANK_DETAILS: "Банковские реквизиты",
  DECLARATION: "Декларация",
  OTHER: "Прочее",
} as const;

function DocumentForm({
  companies,
}: {
  companies: Array<{ id: number; name: string; inn: string | null }>;
}) {
  return (
    <form action={saveTenderCompanyDocumentAction} className="space-y-4">
      <Field label="Компания" required>
        <select
          name="companyId"
          required
          className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-[#2f5bea] focus:ring-4 focus:ring-[#2f5bea]/10"
        >
          <option value="">Выбери компанию</option>
          {companies.map((company) => (
            <option key={company.id} value={company.id}>
              {company.name}
              {company.inn ? ` • ИНН ${company.inn}` : ""}
            </option>
          ))}
        </select>
      </Field>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Тип документа" required>
          <select
            name="documentType"
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-[#2f5bea] focus:ring-4 focus:ring-[#2f5bea]/10"
            defaultValue="OTHER"
          >
            {Object.entries(documentTypeLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Название в базе" required>
          <input
            name="title"
            required
            placeholder="Например: Устав ООО Вега"
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-[#2f5bea] focus:ring-4 focus:ring-[#2f5bea]/10"
          />
        </Field>
      </div>

      <Field label="Имя файла">
        <input
          name="fileName"
          placeholder="Например: УСТАВ подписанный ЭЦП .pdf"
          className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-[#2f5bea] focus:ring-4 focus:ring-[#2f5bea]/10"
        />
      </Field>

      <Field label="Путь к файлу или ссылка">
        <input
          name="storagePath"
          placeholder="Можно оставить пустым сейчас и добавить позже"
          className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-[#2f5bea] focus:ring-4 focus:ring-[#2f5bea]/10"
        />
      </Field>

      <Field label="Комментарий">
        <textarea
          name="notes"
          rows={3}
          placeholder="Например: брать версию с ЭЦП, шаблон не использовать для подачи"
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#2f5bea] focus:ring-4 focus:ring-[#2f5bea]/10"
        />
      </Field>

      <button className="inline-flex h-12 items-center justify-center rounded-2xl bg-[#081a4b] px-5 text-sm font-semibold text-white transition hover:bg-[#0d2568]">
        Добавить документ в библиотеку
      </button>
    </form>
  );
}

export const dynamic = "force-dynamic";

function formatDate(value: Date | null) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(value);
}

function CompanyForm() {
  return (
    <form action={saveTenderCompanyProfileAction} className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Короткое название" required hint="Например: Вега, ООО">
          <input
            name="name"
            required
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-[#2f5bea] focus:ring-4 focus:ring-[#2f5bea]/10"
          />
        </Field>
        <Field label="Полное наименование">
          <input
            name="legalName"
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-[#2f5bea] focus:ring-4 focus:ring-[#2f5bea]/10"
          />
        </Field>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Field label="ИНН">
          <input
            name="inn"
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-[#2f5bea] focus:ring-4 focus:ring-[#2f5bea]/10"
          />
        </Field>
        <Field label="КПП">
          <input
            name="kpp"
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-[#2f5bea] focus:ring-4 focus:ring-[#2f5bea]/10"
          />
        </Field>
        <Field label="ОГРН">
          <input
            name="ogrn"
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-[#2f5bea] focus:ring-4 focus:ring-[#2f5bea]/10"
          />
        </Field>
        <Field label="Дата регистрации">
          <input
            type="date"
            name="registrationDate"
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-[#2f5bea] focus:ring-4 focus:ring-[#2f5bea]/10"
          />
        </Field>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Field label="Руководитель">
          <input
            name="directorName"
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-[#2f5bea] focus:ring-4 focus:ring-[#2f5bea]/10"
          />
        </Field>
        <Field label="Телефон">
          <input
            name="phone"
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-[#2f5bea] focus:ring-4 focus:ring-[#2f5bea]/10"
          />
        </Field>
        <Field label="Email">
          <input
            type="email"
            name="email"
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-[#2f5bea] focus:ring-4 focus:ring-[#2f5bea]/10"
          />
        </Field>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Юридический адрес">
          <textarea
            name="legalAddress"
            rows={3}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#2f5bea] focus:ring-4 focus:ring-[#2f5bea]/10"
          />
        </Field>
        <Field label="Почтовый адрес">
          <textarea
            name="postalAddress"
            rows={3}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#2f5bea] focus:ring-4 focus:ring-[#2f5bea]/10"
          />
        </Field>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Field label="ОКПО">
          <input
            name="okpo"
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-[#2f5bea] focus:ring-4 focus:ring-[#2f5bea]/10"
          />
        </Field>
        <Field label="ОКТМО">
          <input
            name="oktmo"
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-[#2f5bea] focus:ring-4 focus:ring-[#2f5bea]/10"
          />
        </Field>
        <Field label="Код деятельности">
          <input
            name="activityCode"
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-[#2f5bea] focus:ring-4 focus:ring-[#2f5bea]/10"
          />
        </Field>
        <Field label="Описание деятельности">
          <input
            name="activityDescription"
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-[#2f5bea] focus:ring-4 focus:ring-[#2f5bea]/10"
          />
        </Field>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Field label="Банк">
          <input
            name="bankName"
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-[#2f5bea] focus:ring-4 focus:ring-[#2f5bea]/10"
          />
        </Field>
        <Field label="БИК">
          <input
            name="bankBik"
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-[#2f5bea] focus:ring-4 focus:ring-[#2f5bea]/10"
          />
        </Field>
        <Field label="Расчётный счёт">
          <input
            name="bankAccount"
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-[#2f5bea] focus:ring-4 focus:ring-[#2f5bea]/10"
          />
        </Field>
        <Field label="Корр. счёт">
          <input
            name="correspondentAccount"
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-[#2f5bea] focus:ring-4 focus:ring-[#2f5bea]/10"
          />
        </Field>
      </div>

      <Field label="Заметки">
        <textarea
          name="notes"
          rows={3}
          placeholder="Например: основная компания для подачи, нужен отдельный комплект доверенностей, особенности подписанта."
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#2f5bea] focus:ring-4 focus:ring-[#2f5bea]/10"
        />
      </Field>

      <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
        <input type="checkbox" name="isPrimary" className="size-4 rounded border-slate-300" />
        Сделать основной компанией по умолчанию
      </label>

      <button className="inline-flex h-12 items-center justify-center rounded-2xl bg-[#2f5bea] px-5 text-sm font-semibold text-white transition hover:bg-[#2448ba]">
        Сохранить компанию
      </button>
    </form>
  );
}

export default async function TenderCompaniesPage() {
  const prisma = getPrisma();
  const companies = await prisma.tenderCompanyProfile.findMany({
    orderBy: [{ isPrimary: "desc" }, { updatedAt: "desc" }],
    include: {
      documents: {
        orderBy: [{ documentType: "asc" }, { createdAt: "desc" }],
      },
      procurements: {
        select: { id: true },
      },
    },
  });

  return (
    <main className="space-y-6">
      <section className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm">
        <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="bg-[radial-gradient(circle_at_top_left,_rgba(47,91,234,0.18),_transparent_45%),linear-gradient(135deg,#081a4b,#102a72)] px-6 py-8 text-white md:px-8">
            <div className="text-sm font-medium uppercase tracking-[0.18em] text-blue-100/80">
              База компаний
            </div>
            <h1 className="mt-3 text-3xl font-bold tracking-tight">
              Наши компании для участия в торгах
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-blue-100/90 md:text-base">
              Здесь мы собираем постоянные реквизиты ваших юрлиц, с которых вы
              участвуете в закупках: банковские данные, адреса, коды
              деятельности и будущий комплект типовых документов. На этапе
              согласования руководитель будет выбирать, с какой именно компании
              подавать конкретную заявку.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
                <div className="text-2xl font-semibold">{companies.length}</div>
                <div className="mt-1 text-sm text-blue-100/80">Компаний в базе</div>
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
                <div className="text-2xl font-semibold">
                  {companies.filter((company) => company.isPrimary).length}
                </div>
                <div className="mt-1 text-sm text-blue-100/80">Основных компаний</div>
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
                <div className="text-2xl font-semibold">
                  {companies.reduce((sum, company) => sum + company.documents.length, 0)}
                </div>
                <div className="mt-1 text-sm text-blue-100/80">Документов в библиотеке</div>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200 bg-slate-50 px-6 py-8 md:px-8 lg:border-l lg:border-t-0">
            <div className="mb-4 text-lg font-semibold text-[#081a4b]">
              Добавить нашу компанию
            </div>
            <p className="mb-5 text-sm leading-6 text-slate-600">
              Начинаем с двух компаний для участия в торгах, а дальше будем
              расширять базу по одной папке документов за шаг.
            </p>
            <CompanyForm />
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_1.1fr]">
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="text-sm font-medium uppercase tracking-[0.14em] text-slate-400">
            Шаг 1
          </div>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-[#081a4b]">
            Библиотека документов компании
          </h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            Здесь фиксируем, какие постоянные документы уже собраны по каждой
            вашей компании. Позже к этим записям добавим фактическую загрузку
            файлов и автоподбор в пакет заявки.
          </p>
          <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-800">
            По текущему пакету для <span className="font-semibold">Вега, ООО</span>{" "}
            уже вижу: устав, ИНН/КПП, приказ на директора, решения учредителя,
            решение о смене адреса и банковские реквизиты. Часть решений
            выглядит как версии одного и того же документа, поэтому в базе лучше
            сразу помечать, какая версия рабочая, а какая шаблон.
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-6 shadow-sm">
          <div className="mb-4 text-lg font-semibold text-[#081a4b]">
            Добавить документ в библиотеку
          </div>
          <DocumentForm
            companies={companies.map((company) => ({
              id: company.id,
              name: company.name,
              inn: company.inn,
            }))}
          />
        </div>
      </section>

      {companies.length === 0 ? (
        <section className="rounded-[28px] border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-500">
          В базе пока нет ваших компаний-участников. Я уже снял реквизиты из двух
          карточек, так что следующим шагом мы сможем быстро занести их сюда и
          перейти к типовым документам.
        </section>
      ) : (
        <section className="grid gap-5 xl:grid-cols-2">
          {companies.map((company) => (
            <article
              key={company.id}
              className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold text-[#081a4b]">
                    {company.name}
                  </h2>
                  <div className="mt-1 text-sm text-slate-500">
                    {company.legalName ?? "Полное наименование пока не заполнено"}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {company.isPrimary ? (
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                      Основная
                    </span>
                  ) : null}
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                    {company.documents.length} док.
                  </span>
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                    {company.procurements.length} заявок
                  </span>
                </div>
              </div>

              <div className="mt-5 grid gap-5 md:grid-cols-2">
                <div className="space-y-2 text-sm text-slate-600">
                  <div>
                    <span className="font-medium text-slate-900">ИНН:</span>{" "}
                    {company.inn ?? "—"}
                  </div>
                  <div>
                    <span className="font-medium text-slate-900">КПП:</span>{" "}
                    {company.kpp ?? "—"}
                  </div>
                  <div>
                    <span className="font-medium text-slate-900">ОГРН:</span>{" "}
                    {company.ogrn ?? "—"}
                  </div>
                  <div>
                    <span className="font-medium text-slate-900">Дата регистрации:</span>{" "}
                    {formatDate(company.registrationDate)}
                  </div>
                  <div>
                    <span className="font-medium text-slate-900">Руководитель:</span>{" "}
                    {company.directorName ?? "—"}
                  </div>
                  <div>
                    <span className="font-medium text-slate-900">Телефон:</span>{" "}
                    {company.phone ?? "—"}
                  </div>
                  <div>
                    <span className="font-medium text-slate-900">Email:</span>{" "}
                    {company.email ?? "—"}
                  </div>
                </div>

                <div className="space-y-2 text-sm text-slate-600">
                  <div>
                    <span className="font-medium text-slate-900">ОКПО:</span>{" "}
                    {company.okpo ?? "—"}
                  </div>
                  <div>
                    <span className="font-medium text-slate-900">ОКТМО:</span>{" "}
                    {company.oktmo ?? "—"}
                  </div>
                  <div>
                    <span className="font-medium text-slate-900">Вид деятельности:</span>{" "}
                    {company.activityCode ?? "—"}
                  </div>
                  <div className="leading-6">
                    <span className="font-medium text-slate-900">Описание:</span>{" "}
                    {company.activityDescription ?? "—"}
                  </div>
                  <div>
                    <span className="font-medium text-slate-900">Банк:</span>{" "}
                    {company.bankName ?? "—"}
                  </div>
                  <div>
                    <span className="font-medium text-slate-900">БИК:</span>{" "}
                    {company.bankBik ?? "—"}
                  </div>
                  <div className="leading-6">
                    <span className="font-medium text-slate-900">Р/с:</span>{" "}
                    {company.bankAccount ?? "—"}
                  </div>
                  <div className="leading-6">
                    <span className="font-medium text-slate-900">К/с:</span>{" "}
                    {company.correspondentAccount ?? "—"}
                  </div>
                </div>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                    Юридический адрес
                  </div>
                  <div className="mt-2 text-sm leading-6 text-slate-700">
                    {company.legalAddress ?? "Не заполнен"}
                  </div>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                    Почтовый адрес
                  </div>
                  <div className="mt-2 text-sm leading-6 text-slate-700">
                    {company.postalAddress ?? "Не заполнен"}
                  </div>
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                <span className="font-medium text-slate-900">Следующий шаг:</span>{" "}
                загрузить типовой пакет документов именно по этой компании для
                участия:
                устав, ИНН, ОГРН/лист записи, приказ о директоре, выписку ЕГРЮЛ,
                реквизиты и частые декларации.
              </div>

              {company.documents.length > 0 ? (
                <div className="mt-5 space-y-3">
                  {company.documents.map((document) => (
                    <div
                      key={document.id}
                      className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="text-sm font-semibold text-[#081a4b]">
                          {document.title}
                        </div>
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                          {
                            documentTypeLabels[
                              document.documentType as keyof typeof documentTypeLabels
                            ]
                          }
                        </span>
                      </div>
                      <div className="mt-2 text-sm text-slate-500">
                        {document.fileName ?? "Имя файла пока не указано"}
                      </div>
                      {document.notes ? (
                        <div className="mt-2 text-sm leading-6 text-slate-700">
                          {document.notes}
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
                  По этой компании документы ещё не занесены в библиотеку.
                </div>
              )}
            </article>
          ))}
        </section>
      )}
    </main>
  );
}
