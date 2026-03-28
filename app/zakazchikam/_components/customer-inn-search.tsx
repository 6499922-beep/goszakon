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
      className="hero-panel rounded-3xl p-6"
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

      <div className="mt-5">
        <label className="block text-sm font-medium text-slate-700">
          ИНН или название заказчика
        </label>

        <div className="mt-2 grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Например: 7701234567 или Мосводоканал"
            className="h-14 w-full rounded-2xl border border-slate-300 bg-white px-5 text-base outline-none focus:border-[#081a4b]"
          />

          <button
            type="submit"
            className="inline-flex h-14 items-center justify-center rounded-2xl bg-[#081a4b] px-6 text-sm font-semibold text-white transition hover:bg-[#0d2568]"
          >
            Проверить
          </button>
        </div>
      </div>

      {error ? (
        <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : (
        <div className="mt-5 border-t border-[color:var(--line)]/70 pt-4 text-sm leading-6 text-slate-500">
          По ИНН откроется сразу карточка заказчика, по названию покажем список
          найденных совпадений и дальше можно перейти к кейсам и рискам по этому
          заказчику.
        </div>
      )}
    </form>
  );
}
