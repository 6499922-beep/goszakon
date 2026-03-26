type ExtraDoc = {
  label: string;
  href: string;
};

const CASE_EXTRA_DOCS: Record<string, ExtraDoc[]> = {
  "83-nikimt-atomstroj-tretejskaya-ogovorka-i-odnostoronnij-zachet-077-07-00-3237-2026":
    [
      {
        label: "Предписание Московского УФАС",
        href: "/fas-decisions/2026/nikimt-atomstroj-predpisanie-077-07-00-3237-2026.pdf",
      },
    ],
};

export function getCaseExtraDocs(slug: string): ExtraDoc[] {
  return CASE_EXTRA_DOCS[slug] ?? [];
}
