"use client";

import Link from "next/link";

function stageLinkClass(isActive: boolean) {
  if (isActive) {
    return "inline-flex items-center rounded-full bg-[#081a4b] px-4 py-2 text-sm font-semibold text-white";
  }

  return "inline-flex items-center rounded-full border border-sky-200 bg-sky-50 px-4 py-2 text-sm font-semibold text-sky-700 transition hover:border-sky-300 hover:bg-sky-100";
}

export function TenderStageSwitcher() {
  return (
    <div className="mt-3 flex flex-wrap items-center gap-3">
      <Link href="/procurements/new" className={stageLinkClass(true)}>
        1. Анализ
      </Link>
    </div>
  );
}
