type RelatedContentLink = {
  title: string;
  text: string;
  href: string;
};

export function getCaseSupportLinks(input: {
  categoryName?: string | null;
  violation?: string | null;
  result?: string | null;
}) {
  const source = [
    input.categoryName || "",
    input.violation || "",
    input.result || "",
  ]
    .join(" ")
    .toLowerCase();

  if (source.includes("рнп")) {
    return [
      {
        title: "Раздел РНП",
        text: "Материалы о включении в реестр, рисках для поставщика и защите позиции в ФАС.",
        href: "/rnp",
      },
      {
        title: "Практика по РНП",
        text: "Посмотрите связанные кейсы и решения по спорам о включении в РНП.",
        href: "/cases?q=%D0%A0%D0%9D%D0%9F",
      },
      {
        title: "Услуга: риск РНП",
        text: "Если есть риск включения в реестр, важно заранее собрать позицию и документы.",
        href: "/uslugi/risk-rnp",
      },
      {
        title: "Судебная защита",
        text: "Если спор выходит за пределы административной стадии, может потребоваться дальнейшая защита в суде.",
        href: "/sudebnaya-zashita-v-zakupkah",
      },
    ] satisfies RelatedContentLink[];
  }

  if (source.includes("неоплат")) {
    return [
      {
        title: "Неоплата по госконтракту",
        text: "Разбор типовых схем задержки оплаты, позиции заказчика и способов взыскания денег.",
        href: "/neoplata-po-goskontraktu",
      },
      {
        title: "Практика по неоплате",
        text: "Кейсы и решения по спорам, где заказчик затягивал расчет или создавал искусственные препятствия для оплаты.",
        href: "/cases?q=%D0%9D%D0%B5%D0%BE%D0%BF%D0%BB%D0%B0%D1%82%D0%B0",
      },
      {
        title: "Заказчик затягивает приемку",
        text: "Отдельная страница о том, как приемку используют для сдвига оплаты, удержаний и последующих санкций.",
        href: "/zatyagivanie-priemki-po-goskontraktu",
      },
      {
        title: "Заказчик не подписывает УПД",
        text: "Материал о том, как через формальные замечания к УПД и документооборот заказчик блокирует оплату.",
        href: "/zakazchik-ne-podpisyvaet-upd",
      },
      {
        title: "Заказчик удержал деньги из оплаты",
        text: "Отдельная страница о том, когда заказчик просто уменьшает платеж на спорную неустойку, штраф или другую сумму.",
        href: "/uderzhanie-deneg-iz-oplaty",
      },
      {
        title: "Спорная практика: внутренние документы заказчика",
        text: "Когда оплату незаконно ставят в зависимость от акта, системы или других внутренних процедур.",
        href: "/spornye-praktiki/vnutrennie-sistemy-oplaty",
      },
      {
        title: "Снижение неустойки поставщику",
        text: "Если заказчик удержал санкции из оплаты, спор часто нужно вести сразу по двум направлениям.",
        href: "/sudebnaya-zashita-v-zakupkah/snizhenie-neustojki-postavshiku",
      },
    ] satisfies RelatedContentLink[];
  }

  if (
    source.includes("товар") ||
    source.includes("знак") ||
    source.includes("националь") ||
    source.includes("конкуренц")
  ) {
    return [
      {
        title: "Категории нарушений",
        text: "Посмотрите связанные категории нарушений и основания для жалобы в ФАС.",
        href: "/narusheniya",
      },
      {
        title: "Практика по нарушениям",
        text: "Подборка кейсов по товарному знаку, национальному режиму и ограничению конкуренции.",
        href: "/cases?q=%D0%BD%D0%B0%D1%80%D1%83%D1%88%D0%B5%D0%BD",
      },
      {
        title: "Услуга: жалоба в ФАС",
        text: "Если по закупке есть спорные условия документации, следующим шагом обычно становится подготовка жалобы.",
        href: "/uslugi/zhaloba-v-fas",
      },
      {
        title: "Услуга: проверка закупки",
        text: "Если нужно сначала оценить перспективу спора и силу позиции, начните с проверки закупки.",
        href: "/uslugi/proverka-zakupki",
      },
    ] satisfies RelatedContentLink[];
  }

  return [
    {
      title: "Практика ФАС",
      text: "Посмотрите другие материалы из практики по жалобам, закупочным спорам и решениям комиссии.",
      href: "/cases",
    },
    {
      title: "Спорные практики",
      text: "Раздел о перекосах и условиях в закупках, которые мы считаем недопустимыми.",
      href: "/spornye-praktiki/vnutrennie-sistemy-oplaty",
    },
    {
      title: "Услуги поставщикам",
      text: "Если у вас похожая ситуация, можно перейти к страницам услуг и выбрать подходящий формат защиты.",
      href: "/uslugi",
    },
    {
      title: "Судебная защита",
      text: "Если спор требует продолжения после ФАС, посмотрите раздел о судебной защите в закупочных конфликтах.",
      href: "/sudebnaya-zashita-v-zakupkah",
    },
  ] satisfies RelatedContentLink[];
}
