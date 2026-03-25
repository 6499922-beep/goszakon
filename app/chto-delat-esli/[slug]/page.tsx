import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SeriesDetailPage } from "@/app/_components/series-pages";
import { getSeriesItem } from "@/lib/series-pages";
import { WHAT_TO_DO_PAGES } from "@/lib/what-to-do-pages";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return WHAT_TO_DO_PAGES.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const item = getSeriesItem(WHAT_TO_DO_PAGES, slug);
  if (!item) return {};

  return {
    title: `${item.title} | GOSZAKON`,
    description: item.description,
  };
}

export default async function WhatToDoDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const item = getSeriesItem(WHAT_TO_DO_PAGES, slug);
  if (!item) notFound();

  return (
    <SeriesDetailPage
      item={item}
      items={WHAT_TO_DO_PAGES}
      hubHref="/chto-delat-esli"
      hubLabel="Все ситуации"
    />
  );
}
