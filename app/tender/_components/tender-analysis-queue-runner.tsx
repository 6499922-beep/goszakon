"use client";

import { useMemo } from "react";

type TenderAnalysisQueueRunnerProps = {
  procurementId: number;
  view?: string;
};

export function TenderAnalysisQueueRunner({
  procurementId,
  view,
}: TenderAnalysisQueueRunnerProps) {
  const nextLink = useMemo(() => {
    return view ? `/procurements?view=${encodeURIComponent(view)}` : "/procurements";
  }, [view]);

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
          Обновить список
        </a>
      </div>
    </div>
  );
}
