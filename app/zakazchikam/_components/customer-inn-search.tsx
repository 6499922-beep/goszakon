"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CustomerInnSearch() {
  const router = useRouter();
  const [inn, setInn] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalized = inn.replace(/\D/g, "");

    if (normalized.length !== 10 && normalized.length !== 12) {
      setError("Введите корректный ИНН: 10 или 12 цифр.");
      return;
    }

    setError("");
    router.push(`/zakazchik/${normalized}`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <div className="text-sm font-medium uppercase tracking-[0.14em] text-slate-400">
        Проверка заказчика
      </div>

      <h2 className="mt-3 text-2xl font-bold tracking-tight text-[#081a4b]">
        Найти заказчика по ИНН
      </h2>

      <p className="mt-3 text-base leading-8 text-slate-700">
        Покажем кейсы по заказчику, количество жалоб и краткий вывод по рискам.
      </p>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          value={inn}
          onChange={(event) => setInn(event.target.value)}
          inputMode="numeric"
          placeholder="Например: 7701234567"
          className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
        />

        <button
          type="submit"
          className="rounded-2xl bg-[#081a4b] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#0d2568]"
        >
          Проверить
        </button>
      </div>

      {error ? (
        <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}
    </form>
  );
}
