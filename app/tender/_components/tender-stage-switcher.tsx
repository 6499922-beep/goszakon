"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function stageLinkClass(isActive: boolean) {
  if (isActive) {
    return "inline-flex items-center rounded-full bg-[#081a4b] px-4 py-2 text-sm font-semibold text-white";
  }

  return "inline-flex items-center rounded-full border border-sky-200 bg-sky-50 px-4 py-2 text-sm font-semibold text-sky-700 transition hover:border-sky-300 hover:bg-sky-100";
}

export function TenderStageSwitcher() {
  const pathname = usePathname();
  const isPricing = pathname.startsWith("/procurements/pricing");
  const isApproval = pathname.startsWith("/procurements/approval");

  return (
    <div className="mt-3 flex flex-wrap items-center gap-3">
      <Link href="/procurements/new" className={stageLinkClass(!isPricing && !isApproval)}>
        1. Анализ
      </Link>
      <Link href="/procurements/pricing" className={stageLinkClass(isPricing)}>
        2. Просчёт
      </Link>
      <Link href="/procurements/approval" className={stageLinkClass(isApproval)}>
        3. Согласование
      </Link>
    </div>
  );
}
