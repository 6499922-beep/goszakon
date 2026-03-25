import type { Metadata } from "next";
import { SeriesHubPage } from "@/app/_components/series-pages";
import {
  BID_REJECTION_HUB,
  BID_REJECTION_PAGES,
} from "@/lib/bid-rejection-pages";

export const metadata: Metadata = {
  title: "Отклонение заявки в закупке | GOSZAKON",
  description:
    "Раздел по отклонению заявки: незаконное отклонение, формальные основания, характеристики товара, реестровые записи и нацрежим.",
};

export default function BidRejectionHubPage() {
  return <SeriesHubPage config={BID_REJECTION_HUB} items={BID_REJECTION_PAGES} />;
}
