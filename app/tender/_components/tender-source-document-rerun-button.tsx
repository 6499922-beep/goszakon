"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { rerunTenderSourceDocumentDeepAnalysisAction } from "@/app/tender/actions";

type TenderSourceDocumentRerunButtonProps = {
  sourceDocumentId: number;
  procurementId: number;
  actorName: string;
};

export function TenderSourceDocumentRerunButton({
  sourceDocumentId,
  procurementId,
  actorName,
}: TenderSourceDocumentRerunButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("sourceDocumentId", String(sourceDocumentId));
      formData.set("procurementId", String(procurementId));
      formData.set("actorName", actorName);
      await rerunTenderSourceDocumentDeepAnalysisAction(formData);
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className="inline-flex items-center rounded-full border border-[#0d5bd7]/20 bg-[#0d5bd7]/5 px-4 py-2 text-sm font-medium text-[#0d5bd7] transition hover:border-[#0d5bd7]/40 hover:bg-[#0d5bd7]/10 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isPending ? "Запускаем..." : "Доп. анализ"}
    </button>
  );
}
