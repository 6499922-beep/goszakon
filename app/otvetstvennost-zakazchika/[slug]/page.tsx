import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SeriesDetailPage } from "@/app/_components/series-pages";
import { getSeriesItem } from "@/lib/series-pages";
import { CUSTOMER_LIABILITY_PAGES } from "@/lib/customer-liability-pages";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return CUSTOMER_LIABILITY_PAGES.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const item = getSeriesItem(CUSTOMER_LIABILITY_PAGES, slug);
  if (!item) return {};

  return {
    title: `${item.title} | GOSZAKON`,
    description: item.description,
  };
}

export default async function CustomerLiabilityDetailPage({
  params,
}: PageProps) {
  const { slug } = await params;
  const item = getSeriesItem(CUSTOMER_LIABILITY_PAGES, slug);
  if (!item) notFound();

  return (
    <SeriesDetailPage
      item={item}
      items={CUSTOMER_LIABILITY_PAGES}
      hubHref="/otvetstvennost-zakazchika"
      hubLabel="Все риски ответственности"
    />
  );
}
