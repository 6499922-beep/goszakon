"use client";

import { useState } from "react";

type RequestFormProps = {
  title?: string;
  subtitle?: string;
  className?: string;
};

export default function RequestForm({
  title = "Отправьте документы и опишите ситуацию",
  subtitle = "Мы изучим обстоятельства, оценим риски и предложим следующий шаг.",
  className = "",
}: RequestFormProps) {
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [procurementLink, setProcurementLink] = useState("");
  const [problem, setProblem] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone,
          email,
          procurementLink,
          problem,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result?.ok) {
        setError(result?.error || "Не удалось отправить заявку.");
        return;
      }

      setSuccess("Заявка отправлена. Мы свяжемся с вами в ближайшее время.");
      setPhone("");
      setEmail("");
      setProcurementLink("");
      setProblem("");
    } catch {
      setError("Не удалось отправить заявку. Попробуйте еще раз.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div
      id="request"
      className={`rounded-3xl border border-slate-200 bg-white p-8 shadow-sm ${className}`}
    >
      <div className="max-w-3xl">
        <h2 className="text-3xl font-bold tracking-tight text-[#081a4b] md:text-4xl">
          {title}
        </h2>
        <p className="mt-4 text-lg leading-8 text-slate-700">{subtitle}</p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 grid gap-5 lg:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Телефон
          </label>
          <input
            type="text"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="+7 (___) ___-__-__"
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
          />
        </div>

        <div className="lg:col-span-2">
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Ссылка на закупку или дело
          </label>
          <input
            type="url"
            value={procurementLink}
            onChange={(event) => setProcurementLink(event.target.value)}
            placeholder="https://..."
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
          />
        </div>

        <div className="lg:col-span-2">
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Опишите проблему
          </label>
          <textarea
            rows={6}
            value={problem}
            onChange={(event) => setProblem(event.target.value)}
            placeholder="Что произошло, какой риск или спор возник, на какой стадии вы сейчас находитесь?"
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
          />
        </div>

        <div className="lg:col-span-2 flex flex-wrap items-center gap-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-2xl bg-[#081a4b] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#0d2568] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "Отправляем..." : "Отправить заявку"}
          </button>

          {success ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {success}
            </div>
          ) : null}

          {error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}
        </div>
      </form>
    </div>
  );
}
