"use client";

import { useRef, useState, useTransition } from "react";
import { createTenderProcurementAction } from "@/app/tender/actions";

type TenderIntakeUploadFormProps = {
  actorName: string;
};

export function TenderIntakeUploadForm({
  actorName,
}: TenderIntakeUploadFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();

  return (
    <form
      ref={formRef}
      action={createTenderProcurementAction}
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

          if (!files.length) {
            return;
          }

          startTransition(() => {
            formRef.current?.requestSubmit();
          });
        }}
      />

      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={isPending}
        className="group flex min-h-[24rem] w-full flex-col items-center justify-center rounded-[2.5rem] border-2 border-dashed border-[#0d5bd7]/30 bg-[radial-gradient(circle_at_top,#eef5ff_0%,#ffffff_55%)] px-10 py-12 text-center transition hover:border-[#0d5bd7]/60 hover:bg-[radial-gradient(circle_at_top,#e6f0ff_0%,#ffffff_60%)] disabled:cursor-wait disabled:opacity-80"
      >
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#0d5bd7] text-3xl text-white shadow-lg shadow-[#0d5bd7]/20">
          +
        </div>

        <div className="mt-8 max-w-3xl">
          <div className="text-3xl font-bold tracking-tight text-[#081a4b]">
            {isPending
              ? "Загружаем документы и запускаем первичный анализ..."
              : "Загрузить всю документацию по закупке"}
          </div>
          <p className="mt-4 text-base leading-7 text-slate-600">
            Нажми на это поле и выбери весь пакет файлов: извещение, ТЗ, проект
            договора, приложения, формы заказчика, расчёт НМЦК, таблицы и другие
            материалы. После выбора система сама создаст закупку и начнёт анализ.
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
      </button>

      {selectedFiles.length > 0 ? (
        <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-5">
          <div className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">
            Выбранные файлы
          </div>
          <div className="mt-4 grid gap-2">
            {selectedFiles.map((fileName) => (
              <div
                key={fileName}
                className="rounded-2xl border border-white bg-white px-4 py-3 text-sm text-slate-700"
              >
                {fileName}
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </form>
  );
}
