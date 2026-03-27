import Link from "next/link";
import { redirect } from "next/navigation";
import { TenderProcurementChat } from "@/app/tender/_components/tender-procurement-chat";
import { getCurrentTenderUser } from "@/lib/admin-auth";
import { formatTenderMoscowFullDateTime } from "@/lib/tender-format";
import { getPrisma } from "@/lib/prisma";
import { tenderHasCapability } from "@/lib/tender-permissions";

export const dynamic = "force-dynamic";

function extractStoredDocumentPath(note: string | null | undefined) {
  const match = note?.match(/Файл сохранён:\s*(.+)$/m);
  return match?.[1]?.trim() ?? null;
}

function buildRawDocumentHref(documentId: number, storedPath?: string | null) {
  return `/api/tender/source-document/${documentId}`;
}

function buildViewerHref(procurementId: number, documentId: number) {
  return `/procurements/recognition/${procurementId}/documents/${documentId}`;
}

function cleanDocumentDisplayName(value: string | null | undefined) {
  const normalized = String(value ?? "")
    .trim()
    .split("/")
    .filter(Boolean)
    .pop()
    ?.replace(/\s+/g, " ")
    .trim();

  return normalized || "Документ";
}

function formatDateTime(value: Date | null | undefined) {
  return formatTenderMoscowFullDateTime(value);
}

export default async function TenderRecognitionDocumentPage({
  params,
}: {
  params: Promise<{ id: string; documentId: string }>;
}) {
  const currentUser = await getCurrentTenderUser();

  if (!currentUser || !tenderHasCapability(currentUser.role, "procurement_create")) {
    redirect("/procurements/new");
  }

  const { id, documentId } = await params;
  const procurementId = Number(id);
  const sourceDocumentId = Number(documentId);

  if (!Number.isInteger(procurementId) || procurementId <= 0) {
    redirect("/procurements/new");
  }

  if (!Number.isInteger(sourceDocumentId) || sourceDocumentId <= 0) {
    redirect(`/procurements/recognition/${procurementId}`);
  }

  const prisma = getPrisma();
  const procurement = await prisma.tenderProcurement.findUnique({
    where: { id: procurementId },
    include: {
      sourceDocuments: {
        orderBy: { id: "asc" },
        select: {
          id: true,
          title: true,
          fileName: true,
          note: true,
          contentSnippet: true,
        },
      },
      stageComments: {
        where: { stageKey: "gpt_chat" },
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          body: true,
          authorName: true,
          createdAt: true,
        },
      },
    },
  });

  if (!procurement) {
    redirect("/procurements/new");
  }

  const sourceDocument = procurement.sourceDocuments.find((item) => item.id === sourceDocumentId);
  if (!sourceDocument) {
    redirect(`/procurements/recognition/${procurementId}`);
  }

  const storedPath = extractStoredDocumentPath(sourceDocument.note);
  const rawHref = buildRawDocumentHref(sourceDocument.id, storedPath);
  const sourceDocuments = procurement.sourceDocuments.map((item) => ({
    title: cleanDocumentDisplayName(item.title || item.fileName),
    href: buildViewerHref(procurement.id, item.id),
  }));
  const procurementChatMessages = procurement.stageComments.map((item) => ({
    id: item.id,
    role: item.authorName === "GPT" ? ("assistant" as const) : ("user" as const),
    authorName: item.authorName?.trim() || "Сотрудник",
    body: item.body,
    createdAt: item.createdAt.toISOString(),
  }));

  return (
    <main className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href={`/procurements/recognition/${procurementId}`}
            className="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
          >
            Назад к закупке
          </Link>
          <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            Документ закупки
          </span>
        </div>
        <div className="text-sm text-slate-500">
          Добавлена: {formatDateTime(procurement.createdAt)}
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="text-2xl font-bold text-[#081a4b]">
                {cleanDocumentDisplayName(sourceDocument.title || sourceDocument.fileName)}
              </div>
              <div className="mt-2 text-sm text-slate-500">
                Файл открыт в отдельной вкладке и относится к текущей закупке.
              </div>
            </div>
            <a
              href={rawHref}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center rounded-full bg-[#081a4b] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#0d2568]"
            >
              Открыть оригинал файла
            </a>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-[#081a4b]">Просмотр файла</div>
            <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <iframe
                src={rawHref}
                title={cleanDocumentDisplayName(sourceDocument.title || sourceDocument.fileName)}
                className="h-[72vh] w-full"
              />
            </div>
            <div className="mt-3 text-xs leading-5 text-slate-500">
              Если браузер не может встроенно показать формат файла, нажми `Открыть оригинал файла`.
            </div>
          </div>

          {sourceDocument.contentSnippet?.trim() ? (
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-sm font-semibold text-[#081a4b]">Распознанный фрагмент</div>
              <div className="mt-3 whitespace-pre-wrap rounded-2xl bg-white px-4 py-3 text-sm leading-6 text-slate-700">
                {sourceDocument.contentSnippet.trim()}
              </div>
            </div>
          ) : null}
        </section>

        <TenderProcurementChat
          procurementId={procurement.id}
          initialMessages={procurementChatMessages}
          sourceDocuments={sourceDocuments}
        />
      </div>
    </main>
  );
}
