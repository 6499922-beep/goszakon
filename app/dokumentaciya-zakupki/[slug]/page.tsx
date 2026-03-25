import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SeriesDetailPage } from "@/app/_components/series-pages";
import { getSeriesItem } from "@/lib/series-pages";
import { PROCUREMENT_DOC_PAGES } from "@/lib/procurement-doc-pages";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return PROCUREMENT_DOC_PAGES.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const item = getSeriesItem(PROCUREMENT_DOC_PAGES, slug);
  if (!item) return {};

  return {
    title: `${item.title} | GOSZAKON`,
    description: item.description,
  };
}

export default async function ProcurementDocDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const item = getSeriesItem(PROCUREMENT_DOC_PAGES, slug);
  if (!item) notFound();

  return (
    <SeriesDetailPage
      item={item}
      items={PROCUREMENT_DOC_PAGES}
      hubHref="/dokumentaciya-zakupki"
      hubLabel="Все темы документации"
    />
  );
}
