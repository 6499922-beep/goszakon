"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CustomerInnSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmed = query.trim();
    const normalized = trimmed.replace(/\D/g, "");

    if (!trimmed) {
      setError("Введите ИНН или название заказчика.");
      return;
    }

    if (trimmed === normalized) {
      if (normalized.length !== 10 && normalized.length !== 12) {
        setError("Введите корректный ИНН: 10 или 12 цифр.");
        return;
      }

      setError("");
      router.push(`/zakazchik/${normalized}`);
      return;
    }

    setError("");
    router.push(`/zakazchikam?q=${encodeURIComponent(trimmed)}`);
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
        Найти заказчика по ИНН или названию
      </h2>

      <p className="mt-3 text-base leading-8 text-slate-700">
        Покажем кейсы по заказчику, количество жалоб и краткий вывод по рискам.
      </p>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Например: 7701234567 или Мосводоканал"
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
      ) : (
        <div className="mt-4 text-sm text-slate-500">
          По ИНН откроется сразу карточка заказчика, по названию покажем список найденных совпадений.
        </div>
      )}
    </form>
  );
}
