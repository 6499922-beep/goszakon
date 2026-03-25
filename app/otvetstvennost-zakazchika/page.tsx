import type { Metadata } from "next";
import { SeriesHubPage } from "@/app/_components/series-pages";
import {
  CUSTOMER_LIABILITY_HUB,
  CUSTOMER_LIABILITY_PAGES,
} from "@/lib/customer-liability-pages";

export const metadata: Metadata = {
  title: "Ответственность заказчика в закупках | GOSZAKON",
  description:
    "Раздел по штрафам и ответственности заказчика: просрочка оплаты, слабая документация, ошибки по национальному режиму и процедурные нарушения.",
};

export default function CustomerLiabilityHubPage() {
  return (
    <SeriesHubPage
      config={CUSTOMER_LIABILITY_HUB}
      items={CUSTOMER_LIABILITY_PAGES}
    />
  );
}
