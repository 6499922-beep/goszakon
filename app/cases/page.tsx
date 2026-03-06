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
          item.number.toLowerCase().includes(q) ||
          item.region.toLowerCase().includes(q) ||
          item.subject.toLowerCase().includes(q) ||
          item.violation.toLowerCase().includes(q) ||
          item.tag.toLowerCase().includes(q);

    return matchesFilter && matchesSearch;
  });

  return (
    <main
      style={{
        padding: "40px",
        maxWidth: "1000px",
        margin: "0 auto",
        fontFamily: "Arial",
      }}
    >
      <h1 style={{ fontSize: "36px", marginBottom: "20px" }}>Практика ФАС</h1>

      <p style={{ marginBottom: "20px", color: "#475569" }}>
        Реальные кейсы жалоб в ФАС по 223-ФЗ.
      </p>

      <input
        type="text"
        placeholder="Поиск по номеру закупки, региону, нарушению..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          width: "100%",
          padding: "12px 16px",
          marginBottom: "20px",
          borderRadius: "12px",
          border: "1px solid #ddd",
          fontSize: "16px",
        }}
      />

      <div style={{ marginBottom: "30px" }}>
        {tags.map((tag) => (
          <button
            key={tag}
            onClick={() => setFilter(tag)}
            style={{
              marginRight: "10px",
              marginBottom: "10px",
              padding: "8px 14px",
              borderRadius: "10px",
              border: "1px solid #ddd",
              background: filter === tag ? "#0f172a" : "#fff",
              color: filter === tag ? "#fff" : "#000",
              cursor: "pointer",
            }}
          >
            {tag}
          </button>
        ))}
      </div>

      <p style={{ marginBottom: "20px", color: "#475569" }}>
        Найдено кейсов: {filteredCases.length}
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "20px",
        }}
      >
        {filteredCases.map((item) => (
          <div
            key={item.id}
            style={{
              border: "1px solid #e2e8f0",
              borderRadius: "16px",
              padding: "20px",
              background: "#fff",
            }}
          >
            <div
              style={{
                display: "inline-block",
                marginBottom: "10px",
                padding: "6px 10px",
                background: "#f1f5f9",
                borderRadius: "10px",
                fontSize: "13px",
              }}
            >
              {item.tag}
            </div>

            <h3 style={{ fontSize: "20px", marginBottom: "10px" }}>
              {item.title}
            </h3>

            <p>Закупка №{item.number}</p>
            <p>Регион: {item.region}</p>
            <p>Предмет закупки: {item.subject}</p>

            <p style={{ marginTop: "12px", marginBottom: "16px" }}>
              Результат: {item.result}
            </p>

            <Link
              href={`/cases/${item.id}`}
              style={{
                display: "inline-block",
                padding: "10px 16px",
                background: "#0f172a",
                color: "white",
                borderRadius: "10px",
                textDecoration: "none",
              }}
            >
              Смотреть кейс
            </Link>
          </div>
        ))}
      </div>
    </main>
  );
}