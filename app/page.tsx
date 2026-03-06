import Link from "next/link";
import { cases } from "./data/cases";

export default function Home() {

  const categories = [
    { title: "Национальный режим", href: null },
    { title: "Товарный знак", href: "/narusheniya-tovarnyj-znak" },
    { title: "Документация", href: null },
    { title: "Ограничение конкуренции", href: "/narusheniya-ogranichenie-konkurencii" },
    { title: "Процедура", href: null },
    { title: "ОКПД2", href: null },
    { title: "Неоплата", href: null },
    { title: "Судебная практика", href: null },
  ];

  return (
    <main className="min-h-screen bg-white text-slate-900">

      <section className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-20">

          <div className="mb-8">
            <h2 className="text-4xl font-bold tracking-tight text-[#081a4b]">
              Категории нарушений
            </h2>

            <p className="mt-3 max-w-3xl text-lg leading-8 text-slate-700">
              Основные категории нарушений в закупках по 223-ФЗ, по которым формируется практика ФАС.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

            {categories.map((category) =>
              category.href ? (
                <Link
                  key={category.title}
                  href={category.href}
                  className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="text-lg font-semibold leading-8 text-[#081a4b]">
                    {category.title}
                  </div>

                  <div className="mt-3 text-sm font-medium text-[#081a4b]">
                    Открыть категорию →
                  </div>
                </Link>
              ) : (
                <div
                  key={category.title}
                  className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <div className="text-lg font-semibold leading-8 text-slate-700">
                    {category.title}
                  </div>
                </div>
              )
            )}

          </div>

        </div>
      </section>

    </main>
  );
}