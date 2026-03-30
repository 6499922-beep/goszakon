import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentTenderUser } from "@/lib/admin-auth";
import { getPrisma } from "@/lib/prisma";
import { tenderHasCapability } from "@/lib/tender-permissions";

export const dynamic = "force-dynamic";

function buildRawHref(attachmentId: number) {
  return `/api/tender/general-chat/attachment/${attachmentId}`;
}

export default async function TenderChatAttachmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const currentUser = await getCurrentTenderUser();

  if (!currentUser || !tenderHasCapability(currentUser.role, "procurement_comments")) {
    redirect("/tender/chat");
  }

  const { id } = await params;
  const attachmentId = Number(id);

  if (!Number.isInteger(attachmentId) || attachmentId <= 0) {
    notFound();
  }

  const prisma = getPrisma();
  const attachment = await prisma.tenderChatAttachment.findFirst({
    where: {
      id: attachmentId,
      thread: {
        ownerId: currentUser.id,
      },
    },
    include: {
      thread: {
        include: {
          messages: {
            orderBy: { createdAt: "asc" },
            take: 30,
          },
        },
      },
    },
  });

  if (!attachment) {
    notFound();
  }

  const rawHref = buildRawHref(attachment.id);

  return (
    <main className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
      <section className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-400">
              Файл чата
            </div>
            <h1 className="mt-2 text-2xl font-bold text-[#081a4b]">
              {attachment.title || attachment.fileName}
            </h1>
            <div className="mt-2 text-sm text-slate-500">
              {attachment.documentKind || "Документ"}{attachment.extractionNote ? ` · ${attachment.extractionNote}` : ""}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/tender/chat"
              className="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
            >
              Назад к чату
            </Link>
            <a
              href={rawHref}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center rounded-full bg-[#081a4b] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#0d2568]"
            >
              Открыть оригинал
            </a>
          </div>
        </div>

        <div className="mt-5 overflow-hidden rounded-3xl border border-slate-200 bg-slate-50">
          <iframe
            src={rawHref}
            title={attachment.title || attachment.fileName}
            className="h-[78vh] w-full bg-white"
          />
        </div>
      </section>

      <aside className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-400">
          Последние сообщения ветки
        </div>
        <div className="mt-4 space-y-3">
          {attachment.thread.messages.length > 0 ? (
            attachment.thread.messages.slice(-8).map((message) => (
              <div
                key={message.id}
                className={`rounded-2xl px-4 py-3 text-sm leading-6 ${
                  message.role === "ASSISTANT"
                    ? "bg-slate-50 text-slate-700"
                    : "bg-[#111827] text-white"
                }`}
              >
                {message.body}
              </div>
            ))
          ) : (
            <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-500">
              В этой ветке пока нет сообщений.
            </div>
          )}
        </div>
      </aside>
    </main>
  );
}
