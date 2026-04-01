import { readFile } from "node:fs/promises";
import path from "node:path";
import { getPrisma } from "@/lib/prisma";
import { prepareTenderUploadDocuments } from "@/lib/tender-intake";

export function startTenderChatAttachmentPreparationJob(input: {
  attachmentId: number;
  apiKey: string;
  model: string;
}) {
  setTimeout(async () => {
    const prisma = getPrisma();
    try {
      const attachment = await prisma.tenderChatAttachment.findUnique({
        where: { id: input.attachmentId },
        select: {
          id: true,
          title: true,
          fileName: true,
          mimeType: true,
          fileSize: true,
          storagePath: true,
          documentKind: true,
          extractionNote: true,
          extractedText: true,
        },
      });

      if (!attachment || attachment.extractedText?.trim() || !attachment.storagePath) {
        return;
      }

      const absoluteStoragePath = path.join(
        process.cwd(),
        "public",
        attachment.storagePath.replace(/^\/+/, "")
      );
      const buffer = await readFile(absoluteStoragePath);
      const preparedDocuments = await prepareTenderUploadDocuments({
        name: attachment.fileName || attachment.title,
        type: attachment.mimeType || "application/octet-stream",
        size: attachment.fileSize || buffer.byteLength,
        buffer,
      });

      const mergedText = preparedDocuments
        .map((item) => item.extractedText?.trim())
        .filter((item): item is string => Boolean(item))
        .join("\n\n---\n\n")
        .trim();

      const firstPrepared = preparedDocuments[0];

      await prisma.tenderChatAttachment.update({
        where: { id: input.attachmentId },
        data: {
          title: firstPrepared?.title || attachment.title,
          documentKind: firstPrepared?.documentKind || attachment.documentKind,
          extractionNote:
            firstPrepared?.extractionNote ||
            attachment.extractionNote ||
            "Файл прочитан в фоне.",
          extractedText: mergedText || null,
          summaryText: mergedText || null,
        },
      });
    } catch (error) {
      console.error("[general-chat] background attachment preparation failed", input.attachmentId, error);
      await prisma.tenderChatAttachment.update({
        where: { id: input.attachmentId },
        data: {
          extractionNote: "Файл не удалось прочитать автоматически.",
          extractedText: null,
          summaryText: null,
        },
      }).catch(() => undefined);
    }
  }, 0);
}
