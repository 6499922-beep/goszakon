import { cases } from "../../data/cases";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const caseItem = cases.find((item) => item.id === Number(id));

  if (!caseItem) {
    return (
      <main style={{ padding: "40px", fontFamily: "Arial" }}>
        <h1>Кейс не найден</h1>
        <p>ID: {id}</p>
      </main>
    );
  }

  return (
    <main
      style={{
        padding: "40px",
        maxWidth: "900px",
        margin: "0 auto",
        fontFamily: "Arial",
      }}
    >
      <h1>{caseItem.title}</h1>

      <p>
        <b>Закупка:</b> №{caseItem.number}
      </p>

      <p>
        <b>Регион:</b> {caseItem.region}
      </p>

      <p>
        <b>Предмет закупки:</b> {caseItem.subject}
      </p>

      <h2>Суть нарушения</h2>
      <p>{caseItem.violation}</p>

      <h2>Позиция заявителя</h2>
      <p>{caseItem.applicantPosition}</p>

      <h2>Решение ФАС</h2>
      <p>{caseItem.decision}</p>

      <h2>Результат</h2>
      <p>{caseItem.result}</p>

      <h2>Документы</h2>
      <a
        href={caseItem.pdf}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: "inline-block",
          padding: "12px 18px",
          background: "#0f172a",
          color: "white",
          borderRadius: "10px",
          textDecoration: "none",
        }}
      >
        Открыть PDF решения ФАС
      </a>

      <hr style={{ margin: "40px 0" }} />

      <p>
        Жалоба подготовлена специалистами <b>GOSZAKON</b>
      </p>
    </main>
  );
}