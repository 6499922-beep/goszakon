export type PracticeHub = {
  title: string;
  description: string;
  href: string;
  cta: string;
};

export const PRACTICE_HUBS: PracticeHub[] = [
  {
    title: "Неоплата по контракту",
    description:
      "Кейсы, где заказчик задерживал оплату, удерживал деньги или создавал искусственные препятствия.",
    href: "/cases/neoplata",
    cta: "Открыть подборку",
  },
  {
    title: "РНП и защита поставщика",
    description:
      "Подборка решений по включению в реестр, добросовестности поставщика и защите в ФАС.",
    href: "/cases/rnp",
    cta: "Открыть подборку",
  },
  {
    title: "Неустойка и удержания",
    description:
      "Практика по завышенным санкциям, штрафам, удержаниям и спорным условиям контракта.",
    href: "/cases/neustoyka",
    cta: "Открыть подборку",
  },
  {
    title: "Товарный знак и ограничение конкуренции",
    description:
      "Решения по документации закупки, эквивалентам, ограничению конкуренции и спорным требованиям.",
    href: "/cases/dokumentaciya-i-konkurenciya",
    cta: "Открыть подборку",
  },
];
