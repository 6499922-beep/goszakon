"use client";

import { useState } from "react";
import Link from "next/link";
import { cases } from "../data/cases";

export default function CasesPage() {
  const [filter, setFilter] = useState("Все");
  const [search, setSearch] = useState("");

  const tags = ["Все", ...Array.from(new Set(cases.map((item) => item.tag)))];

  const filteredCases = cases.filter((item) => {
    const matchesFilter = filter === "Все" ? true : item.tag === filter;

    const q = search.toLowerCase().trim();

    const matchesSearch =
      q === ""
        ? true
        : item.title.toLowerCase().includes(q) ||
          String(item.number).toLowerCase().includes(q) ||
          item.region.toLowerCase().includes(q) ||
          item.subject.toLowerCase().includes(q) ||
          item.violation.toLowerCase().includes(q) ||
          item.tag.toLowerCase().includes(q);

    return matchesFilter && matchesSearch;
  });

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-16 md:py-20">
          <div className="max-w-4xl">
            <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600">
              База практики жалоб в ФАС по 223-ФЗ
            </div>

            <h1 className="mt-5 text-5xl font-bold tracking-tight text-[#081a4b] md:text-6xl">
              Практика ФАС
            </h1>

            <p className="mt-5 max-w-3xl text-lg leading-9 text-slate-700">
              Реальные кейсы по жалобам в ФАС: номера закупок, регионы, категории
              нарушений, результаты рассмотрения и документы по каждому делу.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <div className="text-sm uppercase tracking-[0.14em] text-slate-400">
                Кейсов в базе
              </div>
              <div className="mt-3 text-3xl font-bold tracking-tight text-[#081a4b]">
                {cases.length}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <div className="text-sm uppercase tracking-[0.14em] text-slate-400">
                Категорий нарушений
              </div>
              <div className="mt-3 text-3xl font-bold tracking-tight text-[#081a4b]">
                {tags.length - 1}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <div className="text-sm uppercase tracking-[0.14em] text-slate-400">
                Найдено по фильтру
              </div>
              <div className="mt-3 text-3xl font-bold tracking-tight text-[#081a4b]">
                {filteredCases.length}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-8 md:py-10">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
              <input
                type="text"
                placeholder="Поиск по номеру закупки, региону, предмету, нарушению..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-2xl border border-slate-300 px-5 py-4 text-base outline-none transition focus:border-slate-500"
              />

              <div className="text-base text-slate-500">
                Найдено кейсов:{" "}
                <span className="font-semibold text-slate-900">
                  {filteredCases.length}
                </span>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              {tags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setFilter(tag)}
                  className={`rounded-full border px-4 py-2.5 text-sm font-medium transition ${
                    filter === tag
                      ? "border-[#081a4b] bg-[#081a4b] text-white"
                      : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-6 py-10 md:py-14">
          <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
            {filteredCases.map((item) => (
              <article
                key={item.id}
                className="flex h-full flex-col rounded-3xl border border-slate-200 bg-slate-50 p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="mb-4 flex items-start justify-between gap-4">
                  <span className="inline-flex rounded-full bg-white px-3 py-1 text-sm font-medium text-slate-700">
                    {item.tag}
                  </span>
                  <span className="text-sm text-slate-400">Кейс #{item.id}</span>
                </div>

                <h2 className="text-2xl font-semibold leading-9 text-[#081a4b]">
                  {item.title}
                </h2>

                <div className="mt-5 space-y-3 text-base leading-8 text-slate-700">
                  <div>
                    <span className="font-medium text-slate-900">Закупка:</span>{" "}
                    №{item.number}
                  </div>
                  <div>
                    <span className="font-medium text-slate-900">Регион:</span>{" "}
                    {item.region}
                  </div>
                  <div>
                    <span className="font-medium text-slate-900">Предмет:</span>{" "}
                    {item.subject}
                  </div>
                </div>

                <div className="mt-5 flex-1 rounded-2xl border border-slate-200 bg-white p-5">
                  <div className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Результат
                  </div>
                  <div className="mt-3 text-base leading-8 text-slate-700">
                    {item.result}
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between gap-4">
                  <Link
                    href={`/cases/${item.id}`}
                    className="inline-flex rounded-2xl bg-[#081a4b] px-5 py-3 text-base font-medium text-white transition hover:bg-[#0d2568]"
                  >
                    Смотреть кейс
                  </Link>

                  <a
                    href={item.pdf}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-base font-medium text-slate-700 underline-offset-4 hover:underline"
                  >
                    PDF
                  </a>
                </div>
              </article>
            ))}
          </div>

          {filteredCases.length === 0 && (
            <div className="mt-10 rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-base text-slate-500">
              По вашему запросу кейсы не найдены.
            </div>
          )}
        </div>
      </section>
    </main>
  );
}