import type { Metadata } from "next";
import { SeriesHubPage } from "@/app/_components/series-pages";
import {
  COURT_PRACTICE_HUB,
  COURT_PRACTICE_PAGES,
} from "@/lib/court-practice-pages";

export const metadata: Metadata = {
  title: "Практика судов по закупочным спорам | GOSZAKON",
  description:
    "Раздел по практике судов: снижение неустойки, отмена решений ФАС, неоплата и удержание спорных сумм.",
};

export default function CourtPracticeHubPage() {
  return (
    <SeriesHubPage config={COURT_PRACTICE_HUB} items={COURT_PRACTICE_PAGES} />
  );
}
