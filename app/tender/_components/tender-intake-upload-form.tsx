"use client";

import { useRef, useState, useTransition } from "react";
import { createTenderProcurementAction } from "@/app/tender/actions";

type TenderIntakeUploadFormProps = {
  actorName: string;
};

export function TenderIntakeUploadForm({
  actorName,
}: TenderIntakeUploadFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();
  const estimatedSeconds =
    selectedFiles.length === 0
      ? null
      : Math.min(180, Math.max(20, selectedFiles.length * 12));

  return (
    <form
      action={(formData) => {
        startTransition(() => {
          createTenderProcurementAction(formData);
        });
      }}
      className="space-y-6"
    >
      <input type="hidden" name="actorName" value={actorName} />

      <input
        ref={fileInputRef}
        name="documents"
        type="file"
        multiple
        required
        className="sr-only"
        onChange={(event) => {
          const files = Array.from(event.target.files ?? []);
          setSelectedFiles(files.map((file) => file.name));
        }}
      />

      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={isPending}
        className="group flex min-h-[28rem] w-full flex-col rounded-[2.5rem] border-2 border-dashed border-[#0d5bd7]/30 bg-[radial-gradient(circle_at_top,#eef5ff_0%,#ffffff_55%)] px-8 py-10 text-center transition hover:border-[#0d5bd7]/60 hover:bg-[radial-gradient(circle_at_top,#e6f0ff_0%,#ffffff_60%)] disabled:cursor-wait disabled:opacity-80"
      >
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#0d5bd7] text-3xl text-white shadow-lg shadow-[#0d5bd7]/20">
          +
        </div>

        <div className="mt-8 max-w-3xl self-center">
          <div className="text-3xl font-bold tracking-tight text-[#081a4b]">
            {isPending
              ? "Загружаем документы и ставим закупку в очередь анализа..."
              : "Загрузить всю документацию по закупке"}
          </div>
          <p className="mt-4 text-base leading-7 text-slate-600">
            Нажми на это поле и выбери весь пакет файлов: извещение, ТЗ, проект
            договора, приложения, формы заказчика, расчёт НМЦК, таблицы и другие
            материалы. После загрузки закупка сама уйдёт в фоновый анализ, а ты
            сможешь сразу перейти к следующей.
          </p>
        </div>

        <div className="mt-8 rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#0d5bd7] shadow-sm ring-1 ring-[#0d5bd7]/10 transition group-hover:ring-[#0d5bd7]/30">
          {isPending ? "Пожалуйста, подожди..." : "Выбрать документы"}
        </div>

        <div className="mt-8 text-sm leading-6 text-slate-500">
          Поддерживаются PDF, DOCX, XLSX, TXT и другие файлы закупки. Архивы и
          сложные форматы тоже сохранятся в карточке, даже если текст из них не
          получится извлечь сразу.
        </div>

        {selectedFiles.length > 0 ? (
          <div className="mt-8 w-full rounded-[2rem] border border-slate-200 bg-white/90 p-5 text-left shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Подготовлено к загрузке
                </div>
                <div className="mt-2 text-2xl font-bold tracking-tight text-[#081a4b]">
                  {selectedFiles.length}{" "}
                  {selectedFiles.length === 1
                    ? "файл"
                    : selectedFiles.length < 5
                      ? "файла"
                      : "файлов"}
                </div>
              </div>

              {estimatedSeconds ? (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-slate-700">
                  Ориентир по первичному анализу: около {estimatedSeconds} сек.
                </div>
              ) : null}
            </div>

            <div className="mt-4 max-h-64 overflow-y-auto rounded-[1.5rem] border border-slate-200 bg-slate-50 p-3">
              <div className="grid gap-2">
                {selectedFiles.map((fileName, index) => (
                  <div
                    key={`${fileName}-${index}`}
                    className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-3 text-sm text-slate-700"
                  >
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#081a4b] text-xs font-semibold text-white">
                      {index + 1}
                    </div>
                    <span className="truncate">{fileName}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </button>

      {selectedFiles.length > 0 ? (
        <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-5">
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center justify-center rounded-full bg-[#0d5bd7] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#0a4db7] disabled:cursor-wait disabled:opacity-80"
            >
              {isPending
                ? "Загружаем и ставим в очередь..."
                : "Загрузить документы и запустить анализ"}
            </button>

            <button
              type="button"
              disabled={isPending}
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center justify-center rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900 disabled:opacity-60"
            >
              Добавить или заменить файлы
            </button>
          </div>

          <div className="mt-4 text-sm leading-6 text-slate-500">
            После отправки закупка сама уйдёт в обработку. Не нужно ждать в этой
            форме: можно будет сразу вернуться и загрузить следующую закупку.
          </div>
        </div>
      ) : (
        <div className="rounded-[2rem] border border-slate-200 bg-slate-50 px-5 py-4 text-sm leading-6 text-slate-500">
          Выбери весь пакет документов по закупке. После выбора ты увидишь полный
          список файлов и сможешь отправить его в анализ одним действием.
        </div>
      )}
    </form>
  );
}
