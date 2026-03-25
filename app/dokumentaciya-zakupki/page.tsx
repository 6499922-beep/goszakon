import type { Metadata } from "next";
import { SeriesHubPage } from "@/app/_components/series-pages";
import {
  PROCUREMENT_DOC_HUB,
  PROCUREMENT_DOC_PAGES,
} from "@/lib/procurement-doc-pages";

export const metadata: Metadata = {
  title: "Документация закупки: спорные условия и ошибки | GOSZAKON",
  description:
    "Раздел по документации закупки: товарный знак, национальный режим, сроки поставки, проект договора и другие условия, которые чаще всего ломают закупку.",
};

export default function ProcurementDocsHubPage() {
  return (
    <SeriesHubPage config={PROCUREMENT_DOC_HUB} items={PROCUREMENT_DOC_PAGES} />
  );
}
