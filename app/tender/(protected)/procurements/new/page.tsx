import { redirect } from "next/navigation";
import { getCurrentTenderUser } from "@/lib/admin-auth";
import { tenderHasCapability } from "@/lib/tender-permissions";
import { TenderIntakeUploadForm } from "@/app/tender/_components/tender-intake-upload-form";

export const dynamic = "force-dynamic";

const systemResults = [
  "создаст карточку закупки",
  "сохранит всю исходную документацию",
  "заполнит то, что сможет определить автоматически",
  "запустит основной анализ и ФАС-ветку",
  "подсветит, что не удалось заполнить",
];

export default async function NewTenderProcurementPage() {
  const currentUser = await getCurrentTenderUser();

  if (!currentUser || !tenderHasCapability(currentUser.role, "procurement_create")) {
    redirect("/procurements");
  }

  const actorName =
    currentUser.name?.trim() || currentUser.email?.trim() || "Сотрудник";

  return (
    <main className="space-y-8">
      <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 bg-[linear-gradient(135deg,#081a4b_0%,#0d5bd7_100%)] px-8 py-10 text-white">
          <div className="text-sm font-medium uppercase tracking-[0.16em] text-white/70">
            Первый этап работы
          </div>
          <h1 className="mt-3 max-w-4xl text-4xl font-bold tracking-tight">
            Здесь сотрудник делает только одно действие: загружает всю документацию
            закупки.
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-white/80">
            Не нужно вручную заполнять карточку, заносить НМЦ, заказчика, сроки,
            условия договора и первичную выжимку. Это система должна попытаться
            определить сама по загруженным документам.
          </p>
        </div>

        <div className="grid gap-6 border-b border-slate-200 bg-slate-50 px-8 py-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6">
            <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              Что делает сотрудник
            </div>
            <div className="mt-3 text-2xl font-bold tracking-tight text-[#081a4b]">
              Только загружает пакет документов
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              Сотрудник скачивает документы из агрегатора или ЭТП и загружает их
              в систему одним пакетом. На этом первый этап для него заканчивается.
            </p>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-6">
            <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              Что система сделает дальше
            </div>
            <div className="mt-4 grid gap-2">
              {systemResults.map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm leading-6 text-slate-700"
                >
                  Система {item}.
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="px-8 py-8">
          <TenderIntakeUploadForm actorName={actorName} />
        </div>
      </section>
    </main>
  );
}
