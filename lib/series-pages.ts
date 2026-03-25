export type SeriesPageItem = {
  slug: string;
  title: string;
  description: string;
  eyebrow: string;
  intro: string;
  whyImportant: string;
  whatToDo: string[];
  whereRisk: string[];
  whatCheckFirst: string[];
  relatedLinks: Array<{
    title: string;
    href: string;
    description: string;
  }>;
};

export type SeriesHubConfig = {
  eyebrow: string;
  title: string;
  description: string;
  primaryCta: {
    href: string;
    label: string;
  };
  secondaryCta: {
    href: string;
    label: string;
  };
  helperTitle: string;
  helperText: string;
};

export function getSeriesItem(
  items: SeriesPageItem[],
  slug: string,
): SeriesPageItem | undefined {
  return items.find((item) => item.slug === slug);
}
