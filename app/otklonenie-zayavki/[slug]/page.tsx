import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SeriesDetailPage } from "@/app/_components/series-pages";
import { getSeriesItem } from "@/lib/series-pages";
import { BID_REJECTION_PAGES } from "@/lib/bid-rejection-pages";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return BID_REJECTION_PAGES.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const item = getSeriesItem(BID_REJECTION_PAGES, slug);
  if (!item) return {};

  return {
    title: `${item.title} | GOSZAKON`,
    description: item.description,
  };
}

export default async function BidRejectionDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const item = getSeriesItem(BID_REJECTION_PAGES, slug);
  if (!item) notFound();

  return (
    <SeriesDetailPage
      item={item}
      items={BID_REJECTION_PAGES}
      hubHref="/otklonenie-zayavki"
      hubLabel="Все материалы по отклонению"
    />
  );
}
