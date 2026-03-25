import type { Metadata } from "next";
import { SeriesHubPage } from "@/app/_components/series-pages";
import { FAS_OR_COURT_HUB, FAS_OR_COURT_PAGES } from "@/lib/fas-or-court-pages";

export const metadata: Metadata = {
  title: "ФАС или суд: куда идти со спором | GOSZAKON",
  description:
    "Раздел о выборе маршрута закупочного спора: когда идти в ФАС, когда сразу в суд и когда продолжать спор после отказа ФАС.",
};

export default function FasOrCourtHubPage() {
  return <SeriesHubPage config={FAS_OR_COURT_HUB} items={FAS_OR_COURT_PAGES} />;
}
