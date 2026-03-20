import Link from "next/link";
import { getPrisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function Home() {
  const prisma = getPrisma();

  const stats = [
    { label: "Заседаний ФАС ежедневно", value: "3–5" },
    { label: "Обоснованных жалоб", value: "≈ 50%" },
    { label: "Специализация", value: "223-ФЗ" },
    { label: "Кейсов в базе", value: "50+" },
  ];

  const trustItems = [
    {
      title: "Ежедневная практика в ФАС",
      text: "Мы регулярно участвуем в заседаниях и работаем с реальными закупками, нарушениями документации и жалобами поставщиков.",
    },
    {
      title: "Узкая специализация по 223-ФЗ",
      text: "Фокус только на закупках по 223-ФЗ позволяет глубже понимать логику споров, позиции сторон и перспективу обращения.",
    },
    {
      title: "Реальные кейсы вместо общих обещаний",
      text: "Портал строится на практических делах: решениях, результатах жалоб, категориях нарушений и прикладных выводах.",
    },
    {
      title: "Понимание логики рассмотрения жалоб",
      text: "Важно не просто увидеть нарушение, а правильно выстроить позицию, которая действительно будет работать в ФАС.",
    },
    {
      title: "Фокус на интересах поставщика",
      text: "Наша задача — защитить поставщика, оценить перспективу жалобы и сопровождать дело до практического результата.",
    },
    {
      title: "Доверие через прозрачную практику",
      text: "Посетитель видит предмет закупки, категорию нарушения, регион и итог рассмотрения, а не абстрактную рекламу.",
    },
  ];

  const services = [
    {
      title: "Подготовка жалоб в ФАС",
      text: "Анализ закупочной документации, выявление нарушений, подготовка жалобы и сопровождение поставщика на стадии рассмотрения.",
      href: null,
    },
    {
      title: "Проверка закупки",
      text: "Оценка перспектив обращения в ФАС по конкретной закупке.",
      href: "/#request",
    },
    {
      title: "Защита интересов поставщика",
      text: "Формирование правовой позиции и участие в заседаниях.",
      href: null,
    },
  ];

  const featuredCase =
    (await prisma.case.findFirst({
      where: { isFeatured: true },
      include: { category: true },
    })) ??
    (await prisma.case.findFirst({
      orderBy: { id: "asc" },
      include: { category: true },
    }));

  const latestCases = await prisma.case.findMany({
    where: {
      id: {
        not: featuredCase?.id,
      },
    },
    include: {
      category: true,
    },
    take: 3,
    orderBy: {
      id: "desc",
    },
  });

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
          <div>
            <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600">
              Экспертный портал для поставщиков по 223-ФЗ
            </div>

            <h1 className="mt-6 text-5xl font-bold leading-[1.02] tracking-tight text-[#081a4b] md:text-7xl">
              Защищаем интересы поставщиков в ФАС
            </h1>

            <p className="mt-6 max-w-2xl text-xl leading-9 text-slate-700">
              GOSZAKON — экспертный портал и практическая юридическая база по
              жалобам в ФАС по 223-ФЗ.
            </p>

            <div className="mt-8 flex gap-3">
              <a
                href="#request"
                className="rounded-2xl bg-[#081a4b] px-7 py-4 text-white"
              >
                Проверить закупку
              </a>

              <Link
                href="/cases"
                className="rounded-2xl border border-slate-300 px-7 py-4"
              >
                Смотреть практику ФАС
              </Link>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {stats.map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-slate-200 bg-white p-6"
              >
                <div className="text-4xl font-bold text-[#081a4b]">
                  {item.value}
                </div>
                <div className="mt-4 text-base text-slate-600">
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {featuredCase && (
        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-7xl px-6 py-20">
            <h2 className="text-4xl font-bold text-[#081a4b]">
              Ключевой кейс
            </h2>

            <div className="mt-8 rounded-3xl border border-slate-200 p-8">
              <h3 className="text-2xl font-semibold">
                {featuredCase.title}
              </h3>

              <p className="mt-4 text-slate-700">
                {featuredCase.result}
              </p>

              <div className="mt-6 flex gap-4">
                <Link
                  href={`/cases/${featuredCase.id}`}
                  className="rounded-xl bg-[#081a4b] px-5 py-3 text-white"
                >
                  Смотреть кейс
                </Link>

                {featuredCase.pdfUrl && (
                  <a
                    href={featuredCase.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    PDF
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <h2 className="text-4xl font-bold text-[#081a4b]">
            Почему поставщики нам доверяют
          </h2>

          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {trustItems.map((item) => (
              <article
                key={item.title}
                className="rounded-3xl border border-slate-200 bg-slate-50 p-6"
              >
                <h3 className="text-xl font-semibold text-[#081a4b]">
                  {item.title}
                </h3>

                <p className="mt-3 text-slate-700">
                  {item.text}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <h2 className="text-4xl font-bold text-[#081a4b]">
            Чем можем помочь
          </h2>

          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {services.map((item) => (
              <article
                key={item.title}
                className="rounded-3xl border border-slate-200 bg-white p-6"
              >
                <h3 className="text-xl font-semibold text-[#081a4b]">
                  {item.title}
                </h3>

                <p className="mt-3 text-slate-700">
                  {item.text}
                </p>

                {item.href ? (
                  <Link
                    href={item.href}
                    className="mt-4 inline-block text-[#081a4b]"
                  >
                    Подробнее →
                  </Link>
                ) : null}
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <h2 className="text-4xl font-bold text-[#081a4b]">
            Последние кейсы
          </h2>

          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {latestCases.map((item) => (
              <article
                key={item.id}
                className="rounded-3xl border border-slate-200 bg-white p-6"
              >
                <h3 className="text-xl font-semibold">
                  {item.title}
                </h3>

                <p className="mt-3 text-slate-700">
                  {item.result}
                </p>

                <Link
                  href={`/cases/${item.id}${item.slug ? `-${item.slug}` : ""}`}
                  className="mt-4 inline-block text-[#081a4b]"
                >
                  Смотреть →
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}