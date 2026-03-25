import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SeriesDetailPage } from "@/app/_components/series-pages";
import { getSeriesItem } from "@/lib/series-pages";
import { FAS_OR_COURT_PAGES } from "@/lib/fas-or-court-pages";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return FAS_OR_COURT_PAGES.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const item = getSeriesItem(FAS_OR_COURT_PAGES, slug);
  if (!item) return {};

  return {
    title: `${item.title} | GOSZAKON`,
    description: item.description,
  };
}

export default async function FasOrCourtDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const item = getSeriesItem(FAS_OR_COURT_PAGES, slug);
  if (!item) notFound();

  return (
    <SeriesDetailPage
      item={item}
      items={FAS_OR_COURT_PAGES}
      hubHref="/fas-ili-sud"
      hubLabel="Все маршруты спора"
    />
  );
}
