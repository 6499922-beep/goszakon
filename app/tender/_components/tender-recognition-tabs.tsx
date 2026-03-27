"use client";

import { useState } from "react";

type TenderRecognitionTabsProps = {
  about: React.ReactNode;
  contract: React.ReactNode;
  requirements: React.ReactNode;
  sourceDocuments: React.ReactNode;
  submissionDocuments: React.ReactNode;
  goods: React.ReactNode;
  chat?: React.ReactNode;
};

export function TenderRecognitionTabs({
  about,
  contract,
  requirements,
  sourceDocuments,
  submissionDocuments,
  goods,
  chat,
}: TenderRecognitionTabsProps) {
  const [activeTab, setActiveTab] = useState<
    | "about"
    | "contract"
    | "requirements"
    | "sourceDocuments"
    | "submissionDocuments"
    | "goods"
  >("about");

  const tabs = [
    { key: "about" as const, label: "О закупке" },
    { key: "contract" as const, label: "Договор" },
    { key: "requirements" as const, label: "Нестандартные требования" },
    { key: "sourceDocuments" as const, label: "Файлы закупки" },
    { key: "submissionDocuments" as const, label: "Документы до подачи" },
    { key: "goods" as const, label: "Позиции / НМЦК" },
  ];

  const tabClassName = (isActive: boolean) =>
    `rounded-2xl px-4 py-3 text-sm font-semibold transition ${
      isActive
        ? "bg-[#0d5bd7] text-white shadow-sm"
        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
    }`;

  return (
    <div className={`grid gap-4 ${chat ? "xl:grid-cols-[minmax(0,1fr)_380px]" : ""}`}>
      <div className="space-y-4">
        <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-7">
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
        <div hidden={activeTab !== "contract"}>{contract}</div>
        <div hidden={activeTab !== "requirements"}>{requirements}</div>
        <div hidden={activeTab !== "sourceDocuments"}>{sourceDocuments}</div>
        <div hidden={activeTab !== "submissionDocuments"}>{submissionDocuments}</div>
        <div hidden={activeTab !== "goods"}>{goods}</div>
      </div>

      {chat ? <div className="xl:sticky xl:top-4 xl:self-start">{chat}</div> : null}
    </div>
  );
}
