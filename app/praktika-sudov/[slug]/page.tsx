import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SeriesDetailPage } from "@/app/_components/series-pages";
import { getSeriesItem } from "@/lib/series-pages";
import { COURT_PRACTICE_PAGES } from "@/lib/court-practice-pages";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return COURT_PRACTICE_PAGES.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const item = getSeriesItem(COURT_PRACTICE_PAGES, slug);
  if (!item) return {};

  return {
    title: `${item.title} | GOSZAKON`,
    description: item.description,
  };
}

export default async function CourtPracticeDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const item = getSeriesItem(COURT_PRACTICE_PAGES, slug);
  if (!item) notFound();

  return (
    <SeriesDetailPage
      item={item}
      items={COURT_PRACTICE_PAGES}
      hubHref="/praktika-sudov"
      hubLabel="Все темы практики судов"
    />
  );
}
