"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type TenderAnalysisQueueRunnerProps = {
  procurementId: number;
  view?: string;
};

export function TenderAnalysisQueueRunner({
  procurementId,
  view,
}: TenderAnalysisQueueRunnerProps) {
  const router = useRouter();
  const hasStartedRef = useRef(false);
  const [statusLabel, setStatusLabel] = useState("Идёт первичный анализ...");
  const nextLink = useMemo(() => {
    return view ? `/procurements?view=${encodeURIComponent(view)}` : "/procurements";
  }, [view]);

  useEffect(() => {
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;

    void (async () => {
      try {
        const response = await fetch("/api/tender/process-queue", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ procurementId }),
        });

        if (!response.ok) {
          setStatusLabel("Не удалось автоматически запустить анализ. Обновите список.");
          return;
        }

        setStatusLabel("Анализ запущен. Можно переходить к следующей закупке.");
        router.refresh();

        const refreshTimer = window.setInterval(() => {
          router.refresh();
        }, 5000);

        window.setTimeout(() => {
          window.clearInterval(refreshTimer);
        }, 60000);
      } catch {
        setStatusLabel("Не удалось автоматически запустить анализ. Обновите список.");
      }
    })();
  }, [procurementId]);

  return (
    <div className="rounded-[2rem] border border-[#0d5bd7]/15 bg-[linear-gradient(135deg,#eef5ff_0%,#ffffff_70%)] p-5 shadow-sm">
      <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[#0d5bd7]">
        Очередь анализа
      </div>
      <div className="mt-2 text-xl font-bold tracking-tight text-[#081a4b]">
        Закупка принята в работу
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-600">
        Система уже запустила первичный анализ по загруженным документам. Можно
        сразу открыть следующую закупку и загрузить ещё один пакет файлов.
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <a
          href="/procurements/new"
          className="inline-flex items-center justify-center rounded-full bg-[#0d5bd7] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0a4db7]"
        >
          Добавить ещё одну закупку
        </a>
        <a
          href={nextLink}
          className="rounded-full bg-white px-4 py-2 text-sm text-slate-600 ring-1 ring-slate-200 transition hover:text-slate-900"
        >
          {statusLabel}
        </a>
      </div>
    </div>
  );
}
