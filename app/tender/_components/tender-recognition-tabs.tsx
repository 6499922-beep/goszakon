"use client";

import { useState } from "react";

type TenderRecognitionTabsProps = {
  about: React.ReactNode;
  pricing: React.ReactNode;
  requirements: React.ReactNode;
  documents: React.ReactNode;
  goods: React.ReactNode;
};

export function TenderRecognitionTabs({
  about,
  pricing,
  requirements,
  documents,
  goods,
}: TenderRecognitionTabsProps) {
  const [activeTab, setActiveTab] = useState<
    "about" | "pricing" | "requirements" | "documents" | "goods"
  >("about");

  const tabs = [
    { key: "about" as const, label: "О закупке" },
    { key: "pricing" as const, label: "Обеспечение и отбор" },
    { key: "requirements" as const, label: "Нестандартные требования" },
    { key: "documents" as const, label: "Документация" },
    { key: "goods" as const, label: "Позиции по заказу" },
  ];

  const tabClassName = (isActive: boolean) =>
    `rounded-2xl px-4 py-3 text-sm font-semibold transition ${
      isActive
        ? "bg-[#0d5bd7] text-white shadow-sm"
        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
    }`;

  return (
    <div className="space-y-4">
      <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-5">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={tabClassName(activeTab === tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div hidden={activeTab !== "about"}>{about}</div>
      <div hidden={activeTab !== "pricing"}>{pricing}</div>
      <div hidden={activeTab !== "requirements"}>{requirements}</div>
      <div hidden={activeTab !== "documents"}>{documents}</div>
      <div hidden={activeTab !== "goods"}>{goods}</div>
    </div>
  );
}
