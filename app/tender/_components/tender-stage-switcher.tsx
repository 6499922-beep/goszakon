"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

function stageLinkClass(isActive: boolean) {
  if (isActive) {
    return "inline-flex items-center rounded-full bg-[#081a4b] px-4 py-2 text-sm font-semibold text-white";
  }

  return "inline-flex items-center rounded-full border border-sky-200 bg-sky-50 px-4 py-2 text-sm font-semibold text-sky-700 transition hover:border-sky-300 hover:bg-sky-100";
}

export function TenderStageSwitcher() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [clientPath, setClientPath] = useState(pathname);
  const [clientSearch, setClientSearch] = useState(searchParams.toString());

  useEffect(() => {
    if (typeof window === "undefined") return;
    setClientPath(window.location.pathname);
    setClientSearch(window.location.search);
  }, [pathname, searchParams]);

  const normalizedPath = (clientPath || pathname).replace(/^\/tender/, "");
  const effectiveSearchParams = new URLSearchParams(clientSearch || searchParams.toString());
  const stageParam = effectiveSearchParams.get("stage");
  const isPricing =
    normalizedPath.startsWith("/procurements/pricing") ||
    (normalizedPath.startsWith("/procurements/recognition/") &&
      stageParam === "pricing");

  return (
    <div className="mt-3 flex flex-wrap items-center gap-3">
      <Link href="/procurements/new" className={stageLinkClass(!isPricing)}>
        1. Анализ
      </Link>
      <div className="text-slate-300">→</div>
      <Link href="/procurements/pricing" className={stageLinkClass(isPricing)}>
        2. Просчёт
      </Link>
    </div>
  );
}
