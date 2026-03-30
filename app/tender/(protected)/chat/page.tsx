import { TenderChatThreadKind, TenderChatMessageRole } from "@prisma/client";
import { redirect } from "next/navigation";
import { TenderGeneralChat } from "@/app/tender/_components/tender-general-chat";
import { getCurrentTenderUser } from "@/lib/admin-auth";
import { getPrisma } from "@/lib/prisma";
import { tenderHasCapability } from "@/lib/tender-permissions";

export const dynamic = "force-dynamic";

type TenderGeneralChatPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function getSearchParamValue(
  value: string | string[] | undefined
): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function TenderGeneralChatPage({
  searchParams,
}: TenderGeneralChatPageProps) {
  const currentUser = await getCurrentTenderUser();

  if (!currentUser) {
    redirect("/signin");
  }

  if (!tenderHasCapability(currentUser.role, "procurement_comments")) {
    redirect("/procurements/new");
  }

  const prisma = getPrisma();
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const requestedThreadId = Number(getSearchParamValue(resolvedSearchParams.thread) ?? 0);
  const shouldCreateNewThread = Boolean(getSearchParamValue(resolvedSearchParams.new));

  if (shouldCreateNewThread) {
    const createdThread = await prisma.tenderChatThread.create({
      data: {
        ownerId: currentUser.id,
        title: "Новый чат",
        kind: TenderChatThreadKind.GENERAL,
      },
    });

    redirect(`/tender/chat?thread=${createdThread.id}`);
  }

  const availableThreads = await prisma.tenderChatThread.findMany({
    where: {
      ownerId: currentUser.id,
      kind: TenderChatThreadKind.GENERAL,
    },
    orderBy: [{ updatedAt: "desc" }],
    take: 20,
    include: {
      _count: {
        select: { messages: true },
      },
    },
  });

  const fallbackThread =
    availableThreads[0] ||
    (await prisma.tenderChatThread.create({
      data: {
        ownerId: currentUser.id,
        title: "Личный чат",
        kind: TenderChatThreadKind.GENERAL,
      },
    }));

  const selectedThreadId =
    Number.isInteger(requestedThreadId) && requestedThreadId > 0
      ? requestedThreadId
      : fallbackThread.id;

  const thread =
    (await prisma.tenderChatThread.findFirst({
      where: {
        id: selectedThreadId,
        ownerId: currentUser.id,
        kind: TenderChatThreadKind.GENERAL,
      },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
          take: 100,
        },
      },
    })) ||
    (await prisma.tenderChatThread.findFirst({
      where: {
        id: fallbackThread.id,
        ownerId: currentUser.id,
        kind: TenderChatThreadKind.GENERAL,
      },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
          take: 100,
        },
      },
    }));

  if (!thread) {
    redirect("/tender/chat");
  }

  const initialAttachments = await prisma.tenderChatAttachment.findMany({
    where: { threadId: thread.id },
    orderBy: { createdAt: "desc" },
    take: 20,
    select: {
      id: true,
      title: true,
      fileName: true,
      documentKind: true,
      extractionNote: true,
      storagePath: true,
      createdAt: true,
    },
  });

  return (
    <TenderGeneralChat
      threadId={thread.id}
      currentThreadId={thread.id}
      threadTitle={thread.title}
      initialAttachments={initialAttachments.map((item) => ({
        id: item.id,
        title: item.title,
        fileName: item.fileName,
        documentKind: item.documentKind || "Документ",
        extractionNote: item.extractionNote || "Файл сохранён на сервере",
        storagePath: item.storagePath,
        createdAt: item.createdAt.toISOString(),
      }))}
      threadOptions={availableThreads.map((item) => ({
        id: item.id,
        title: item.title,
        messageCount: item._count.messages,
      }))}
      userLabel={currentUser.name?.trim() || currentUser.email || "Вы"}
      initialMessages={thread.messages.map((message) => ({
        id: message.id,
        role: message.role === TenderChatMessageRole.ASSISTANT ? "assistant" : "user",
        authorName:
          message.authorName ||
          (message.role === TenderChatMessageRole.ASSISTANT ? "GPT" : currentUser.name || "Вы"),
        body: message.body,
        createdAt: message.createdAt.toISOString(),
      }))}
    />
  );
}
