import type { Metadata } from "next";
import { SeriesHubPage } from "@/app/_components/series-pages";
import { WHAT_TO_DO_HUB, WHAT_TO_DO_PAGES } from "@/lib/what-to-do-pages";

export const metadata: Metadata = {
  title: "Что делать, если... в закупочном споре | GOSZAKON",
  description:
    "Серия быстрых страниц для поставщиков: что делать, если заказчик не платит, отклонили заявку, грозит РНП, удержали неустойку или ФАС отказал.",
};

export default function WhatToDoHubPage() {
  return <SeriesHubPage config={WHAT_TO_DO_HUB} items={WHAT_TO_DO_PAGES} />;
}
