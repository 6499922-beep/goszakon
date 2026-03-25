import { redirect } from "next/navigation";
import { getCurrentTenderUser } from "@/lib/admin-auth";
import { tenderHasCapability } from "@/lib/tender-permissions";
import { TenderIntakeUploadForm } from "@/app/tender/_components/tender-intake-upload-form";

export const dynamic = "force-dynamic";

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
        <div className="bg-[linear-gradient(135deg,#081a4b_0%,#0d5bd7_100%)] px-8 py-8 text-white">
          <div className="text-sm font-medium uppercase tracking-[0.16em] text-white/70">
            Первый этап работы
          </div>
          <h1 className="mt-3 max-w-4xl text-3xl font-bold tracking-tight">
            Загрузите весь пакет документов по закупке.
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-white/80">
            Больше ничего вручную заполнять не нужно. После загрузки система сама
            создаст карточку, запустит анализ и подсветит, что не получилось
            определить автоматически.
          </p>
        </div>
        <div className="px-8 py-8">
          <TenderIntakeUploadForm actorName={actorName} />
        </div>
      </section>
    </main>
  );
}
