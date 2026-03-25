"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type TenderIntakeUploadFormProps = {
  actorName: string;
  compact?: boolean;
  resetToken?: string;
};

export function TenderIntakeUploadForm({
  actorName,
  compact = false,
  resetToken,
}: TenderIntakeUploadFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isPending, setIsPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [progressLabel, setProgressLabel] = useState<string | null>(null);
  const estimatedSeconds =
    selectedFiles.length === 0
      ? null
      : Math.min(180, Math.max(20, selectedFiles.length * 12));
  const selectedFilesLabel =
    selectedFiles.length === 1
      ? "файл"
      : selectedFiles.length < 5
        ? "файла"
        : "файлов";

  useEffect(() => {
    setSelectedFiles([]);
    setIsPending(false);
    setErrorMessage(null);
    setProgressLabel(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [resetToken]);

  return (
    <form
      onSubmit={async (event) => {
        event.preventDefault();
        setErrorMessage(null);
        setProgressLabel(null);
        setIsPending(true);

        try {
          if (selectedFiles.length === 0) {
            setErrorMessage("Сначала выбери документы для загрузки.");
            setIsPending(false);
            return;
          }

          setProgressLabel("Создаём карточку закупки...");
          const startResponse = await fetch("/api/tender/intake/start", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              actorName,
              fileNames: selectedFiles.map((file) => file.name),
            }),
          });

          const startPayload =
            ((await startResponse.json().catch(() => null)) as
              | { ok?: boolean; error?: string; procurementId?: number }
              | null) ?? null;

          if (!startResponse.ok || !startPayload?.ok || !startPayload.procurementId) {
            setErrorMessage(
              startPayload?.error || "Не удалось создать карточку закупки."
            );
            setIsPending(false);
            return;
          }

          const procurementId = startPayload.procurementId;

          for (let index = 0; index < selectedFiles.length; index += 1) {
            const file = selectedFiles[index];
            setProgressLabel(
              `Загружаем файл ${index + 1} из ${selectedFiles.length}: ${file.name}`
            );

            const uploadResponse = await fetch("/api/tender/intake/file", {
              method: "POST",
              headers: {
                "Content-Type": file.type || "application/octet-stream",
                "X-Procurement-Id": String(procurementId),
                "X-File-Name": encodeURIComponent(file.name),
              },
              body: file,
            });

            const uploadPayload =
              ((await uploadResponse.json().catch(() => null)) as
                | { ok?: boolean; error?: string }
                | null) ?? null;

            if (!uploadResponse.ok || !uploadPayload?.ok) {
              setErrorMessage(
                uploadPayload?.error ||
                  `Не удалось загрузить файл "${file.name}".`
              );
              setIsPending(false);
              return;
            }
          }

          setProgressLabel("Запускаем первичный анализ...");
          const finalizeResponse = await fetch("/api/tender/intake/finalize", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ procurementId }),
          });

          const finalizePayload =
            ((await finalizeResponse.json().catch(() => null)) as
              | { ok?: boolean; error?: string }
              | null) ?? null;

          if (!finalizeResponse.ok || !finalizePayload?.ok) {
            if (finalizeResponse.status === 413) {
              setErrorMessage(
                "Пакет документов слишком большой для одной отправки. Раздели его на две части или уменьши общий вес файлов."
              );
              setIsPending(false);
              return;
            }

            setErrorMessage(
              finalizePayload?.error ||
                "Не удалось завершить загрузку и запустить анализ."
            );
            setIsPending(false);
            return;
          }

          setSelectedFiles([]);
          setProgressLabel(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }

          router.push(`/procurements/new?uploaded=${procurementId}`);
          router.refresh();
        } catch (error) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Не удалось загрузить документы и запустить анализ."
          );
          setIsPending(false);
        }
      }}
      className="space-y-3"
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
          setSelectedFiles(files);
          setErrorMessage(null);
          setProgressLabel(null);
        }}
      />

      <div className={`group flex w-full flex-col rounded-[2rem] border-2 border-dashed border-[#0d5bd7]/30 bg-[radial-gradient(circle_at_top,#eef5ff_0%,#ffffff_55%)] text-center transition hover:border-[#0d5bd7]/60 hover:bg-[radial-gradient(circle_at_top,#e6f0ff_0%,#ffffff_60%)] ${compact ? "px-4 py-4" : "px-5 py-4"}`}>
        <div className="max-w-3xl self-center">
          <div className={`${compact ? "text-xl" : "text-2xl"} font-bold tracking-tight text-[#081a4b]`}>
            {isPending
              ? "Загружаем документы и запускаем анализ..."
              : compact
                ? "Добавить ещё одну закупку"
                : "Загрузить всю документацию по закупке"}
          </div>
          {!compact ? (
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Только один шаг: загрузи весь пакет документов. Система сама создаст карточку, распознает базовые поля и проверит стоп-факторы.
            </p>
          ) : (
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Можно сразу загрузить следующий пакет документов, пока предыдущие закупки уже стоят в таблице ниже.
            </p>
          )}
        </div>

        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isPending}
            className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#0d5bd7] shadow-sm ring-1 ring-[#0d5bd7]/10 transition group-hover:ring-[#0d5bd7]/30 disabled:cursor-wait disabled:opacity-80"
          >
            {isPending ? "Пожалуйста, подожди..." : "Выбрать документы"}
          </button>
        </div>

        {!compact ? (
          <div className="mt-2 text-xs leading-5 text-slate-500">
            PDF, DOCX, XLSX, TXT и архивы тоже сохраняются. Если часть текста не получится извлечь, система прямо покажет это справа.
          </div>
        ) : null}

        {selectedFiles.length > 0 ? (
          <div className="mt-4 w-full rounded-[1.75rem] border border-slate-200 bg-white/95 p-4 text-left shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Подготовлено к загрузке
                </div>
                <div className="mt-1 text-xl font-bold tracking-tight text-[#081a4b]">
                  {selectedFiles.length} {selectedFilesLabel}
                </div>
              </div>

              {estimatedSeconds ? (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm leading-6 text-slate-700">
                  Ориентир по первичному анализу: около {estimatedSeconds} сек.
                </div>
              ) : null}
            </div>

            <div className="mt-3 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-3">
              <div className={`grid gap-2 ${selectedFiles.length > 8 ? "lg:grid-cols-2" : "grid-cols-1"}`}>
                {selectedFiles.map((file, index) => (
                  <div
                    key={`${file.name}-${index}`}
                    className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-2.5 text-sm text-slate-700"
                  >
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#081a4b] text-xs font-semibold text-white">
                      {index + 1}
                    </div>
                    <span className="truncate">{file.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {progressLabel ? (
              <div className="mt-4 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm leading-6 text-blue-800">
                {progressLabel}
              </div>
            ) : null}

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                type="submit"
                disabled={isPending}
                className="inline-flex items-center justify-center rounded-full bg-[#0d5bd7] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#0a4db7] disabled:cursor-wait disabled:opacity-80"
              >
                {isPending
                  ? "Загружаем документы и запускаем анализ..."
                  : compact
                    ? "Загрузить и распознать"
                    : "Запустить анализ"}
              </button>
              {!isPending ? (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
                >
                  Заменить документы
                </button>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="mt-5 rounded-[2rem] border border-slate-200 bg-white/80 px-5 py-4 text-sm leading-6 text-slate-500">
            Выбери весь пакет документов по закупке. После выбора список сразу
            появится в этом же окне без прокрутки страницы.
          </div>
        )}
      </div>

      {errorMessage ? (
        <div className="rounded-[2rem] border border-rose-200 bg-rose-50 px-5 py-4 text-sm leading-6 text-rose-700">
          {errorMessage}
        </div>
      ) : null}
    </form>
  );
}
