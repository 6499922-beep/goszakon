import { TenderChatThreadKind, TenderChatMessageRole } from "@prisma/client";
import { redirect } from "next/navigation";
import { TenderGeneralChat } from "@/app/tender/_components/tender-general-chat";
import { getCurrentTenderUser } from "@/lib/admin-auth";
import { getPrisma } from "@/lib/prisma";
import { tenderHasCapability } from "@/lib/tender-permissions";

export const dynamic = "force-dynamic";

export default async function TenderGeneralChatPage() {
  const currentUser = await getCurrentTenderUser();

  if (!currentUser) {
    redirect("/signin");
  }

  if (!tenderHasCapability(currentUser.role, "procurement_comments")) {
    redirect("/procurements/new");
  }

  const prisma = getPrisma();
  const thread =
    (await prisma.tenderChatThread.findFirst({
      where: {
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
    (await prisma.tenderChatThread.create({
      data: {
        ownerId: currentUser.id,
        title: "Личный чат",
        kind: TenderChatThreadKind.GENERAL,
      },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
          take: 100,
        },
      },
    }));

  return (
    <TenderGeneralChat
      threadId={thread.id}
      threadTitle={thread.title}
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
