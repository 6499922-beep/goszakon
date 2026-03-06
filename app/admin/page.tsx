"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

const TAG_OPTIONS = [
  "Национальный режим",
  "Товарный знак",
  "Процедура",
  "Ограничение конкуренции",
  "Документация",
  "ОКПД2",
  "Неоплата",
  "Судебная практика",
];

const ADMIN_KEY = "goszakon2026";

export default function AdminPage() {
  return (
    <Suspense fallback={<AdminLoading />}>
      <AdminPageContent />
    </Suspense>
  );
}

function AdminPageContent() {
  const searchParams = useSearchParams();
  const key = searchParams.get("key");

  if (key !== ADMIN_KEY) {
    return (
      <main
        style={{
          maxWidth: "700px",
          margin: "80px auto",
          padding: "40px",
          fontFamily: "Arial",
          textAlign: "center",
        }}
      >
        <h1 style={{ fontSize: "36px", marginBottom: "20px" }}>
          Доступ запрещён
        </h1>
        <p style={{ color: "#475569", fontSize: "18px", lineHeight: "1.7" }}>
          Эта страница доступна только по специальной ссылке.
        </p>
      </main>
    );
  }

  const [id, setId] = useState("4");
  const [title, setTitle] = useState("");
  const [number, setNumber] = useState("");
  const [region, setRegion] = useState("");
  const [subject, setSubject] = useState("");
  const [violation, setViolation] = useState("");
  const [applicantPosition, setApplicantPosition] = useState("");
  const [decision, setDecision] = useState("");
  const [result, setResult] = useState("");
  const [pdf, setPdf] = useState("/docs/case-4.pdf");
  const [tag, setTag] = useState(TAG_OPTIONS[0]);

  const generatedCase = useMemo(() => {
    return `{
  id: ${id},
  title: "${escapeString(title)}",
  number: "${escapeString(number)}",
  region: "${escapeString(region)}",
  subject: "${escapeString(subject)}",
  violation: "${escapeString(violation)}",
  applicantPosition: "${escapeString(applicantPosition)}",
  decision: "${escapeString(decision)}",
  result: "${escapeString(result)}",
  pdf: "${escapeString(pdf)}",
  tag: "${escapeString(tag)}",
}`;
  }, [
    id,
    title,
    number,
    region,
    subject,
    violation,
    applicantPosition,
    decision,
    result,
    pdf,
    tag,
  ]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedCase);
      alert("Кейс скопирован в буфер обмена");
    } catch {
      alert("Не удалось скопировать. Скопируйте вручную.");
    }
  };

  const clearForm = () => {
    setTitle("");
    setNumber("");
    setRegion("");
    setSubject("");
    setViolation("");
    setApplicantPosition("");
    setDecision("");
    setResult("");
    setTag(TAG_OPTIONS[0]);
  };

  const nextCase = () => {
    const nextId = String(Number(id) + 1);
    setId(nextId);
    setPdf(`/docs/case-${nextId}.pdf`);
    setTitle("");
    setNumber("");
    setRegion("");
    setSubject("");
    setViolation("");
    setApplicantPosition("");
    setDecision("");
    setResult("");
    setTag(TAG_OPTIONS[0]);
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px 14px",
    borderRadius: "10px",
    border: "1px solid #d1d5db",
    fontSize: "14px",
    boxSizing: "border-box",
  };

  const textareaStyle: React.CSSProperties = {
    width: "100%",
    minHeight: "110px",
    padding: "12px 14px",
    borderRadius: "10px",
    border: "1px solid #d1d5db",
    fontSize: "14px",
    resize: "vertical",
    boxSizing: "border-box",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    marginBottom: "8px",
    fontWeight: 600,
  };

  const cardStyle: React.CSSProperties = {
    border: "1px solid #e5e7eb",
    borderRadius: "16px",
    padding: "24px",
    background: "#fff",
  };

  return (
    <main
      style={{
        maxWidth: "1100px",
        margin: "0 auto",
        padding: "40px",
        fontFamily: "Arial",
      }}
    >
      <h1 style={{ fontSize: "34px", marginBottom: "10px" }}>
        Админка GOSZAKON
      </h1>
      <p style={{ color: "#475569", marginBottom: "30px" }}>
        Заполните поля, получите готовый объект кейса и вставьте его в файл
        <b> app/data/cases.ts</b>.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "30px",
          alignItems: "start",
        }}
      >
        <div style={cardStyle}>
          <div style={{ marginBottom: "16px" }}>
            <label style={labelStyle}>ID</label>
            <input
              style={inputStyle}
              value={id}
              onChange={(e) => setId(e.target.value)}
            />
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label style={labelStyle}>Заголовок</label>
            <input
              style={inputStyle}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label style={labelStyle}>Номер закупки</label>
            <input
              style={inputStyle}
              value={number}
              onChange={(e) => setNumber(e.target.value)}
            />
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label style={labelStyle}>Регион</label>
            <input
              style={inputStyle}
              value={region}
              onChange={(e) => setRegion(e.target.value)}
            />
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label style={labelStyle}>Предмет закупки</label>
            <input
              style={inputStyle}
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label style={labelStyle}>Суть нарушения</label>
            <textarea
              style={textareaStyle}
              value={violation}
              onChange={(e) => setViolation(e.target.value)}
            />
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label style={labelStyle}>Позиция заявителя</label>
            <textarea
              style={textareaStyle}
              value={applicantPosition}
              onChange={(e) => setApplicantPosition(e.target.value)}
            />
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label style={labelStyle}>Решение ФАС</label>
            <textarea
              style={textareaStyle}
              value={decision}
              onChange={(e) => setDecision(e.target.value)}
            />
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label style={labelStyle}>Результат</label>
            <textarea
              style={textareaStyle}
              value={result}
              onChange={(e) => setResult(e.target.value)}
            />
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label style={labelStyle}>PDF</label>
            <input
              style={inputStyle}
              value={pdf}
              onChange={(e) => setPdf(e.target.value)}
            />
            <div style={{ marginTop: "8px", color: "#64748b", fontSize: "13px" }}>
              Пример: /docs/case-{id}.pdf
            </div>
          </div>

          <div style={{ marginBottom: "0" }}>
            <label style={labelStyle}>Тег</label>
            <select
              style={inputStyle}
              value={tag}
              onChange={(e) => setTag(e.target.value)}
            >
              {TAG_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div
          style={{
            ...cardStyle,
            position: "sticky",
            top: "20px",
          }}
        >
          <h2 style={{ fontSize: "24px", marginBottom: "16px" }}>
            Готовый объект кейса
          </h2>

          <pre
            style={{
              background: "#0f172a",
              color: "#f8fafc",
              padding: "20px",
              borderRadius: "12px",
              overflowX: "auto",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              fontSize: "14px",
              lineHeight: "1.6",
            }}
          >
            {generatedCase}
          </pre>

          <div
            style={{
              display: "flex",
              gap: "12px",
              marginTop: "16px",
              flexWrap: "wrap",
            }}
          >
            <button onClick={copyToClipboard} style={primaryButton}>
              Скопировать кейс
            </button>

            <button onClick={clearForm} style={secondaryButton}>
              Очистить форму
            </button>

            <button onClick={nextCase} style={secondaryButton}>
              Следующий кейс
            </button>
          </div>

          <div style={{ marginTop: "24px", color: "#475569", lineHeight: "1.7" }}>
            <p>1. Заполните форму.</p>
            <p>
              2. Нажмите <b>Скопировать кейс</b>.
            </p>
            <p>
              3. Откройте <b>app/data/cases.ts</b>.
            </p>
            <p>4. Вставьте новый объект в массив кейсов.</p>
            <p>
              5. Положите PDF в <b>public/docs</b>.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

function AdminLoading() {
  return (
    <main
      style={{
        maxWidth: "700px",
        margin: "80px auto",
        padding: "40px",
        fontFamily: "Arial",
        textAlign: "center",
      }}
    >
      <h1 style={{ fontSize: "32px", marginBottom: "20px" }}>Загрузка...</h1>
      <p style={{ color: "#475569", fontSize: "18px", lineHeight: "1.7" }}>
        Подготавливаем админку GOSZAKON.
      </p>
    </main>
  );
}

function escapeString(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, " ");
}

const primaryButton: React.CSSProperties = {
  padding: "12px 18px",
  borderRadius: "10px",
  border: "none",
  background: "#0f172a",
  color: "#fff",
  cursor: "pointer",
  fontWeight: 600,
};

const secondaryButton: React.CSSProperties = {
  padding: "12px 18px",
  borderRadius: "10px",
  border: "1px solid #cbd5e1",
  background: "#fff",
  color: "#0f172a",
  cursor: "pointer",
  fontWeight: 600,
};