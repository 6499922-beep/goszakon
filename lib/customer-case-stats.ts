export type CustomerCaseStatItem = {
  result?: string | null;
  violation?: string | null;
  region?: string | null;
  customerName?: string | null;
  customerInn?: string | null;
};

export type ResultSummary = {
  justified: number;
  partial: number;
  rejected: number;
};

export type CountBadge = {
  title: string;
  count: number;
};

export type CustomerAggregate = {
  customerInn: string;
  customerName: string;
  totalCases: number;
  resultSummary: ResultSummary;
  topViolations: CountBadge[];
  topRegions: CountBadge[];
  successRate: number;
};

export function buildResultSummary(
  items: Array<Pick<CustomerCaseStatItem, "result">>,
): ResultSummary {
  let justified = 0;
  let partial = 0;
  let rejected = 0;

  for (const item of items) {
    const raw = (item.result || "").toLowerCase();

    if (raw.includes("част")) {
      partial += 1;
      continue;
    }

    if (
      raw.includes("обосн") ||
      raw.includes("удовлетвор") ||
      raw.includes("нарушени") ||
      raw.includes("выдано предписание")
    ) {
      justified += 1;
      continue;
    }

    if (
      raw.includes("необосн") ||
      raw.includes("отказ") ||
      raw.includes("не выявлено") ||
      raw.includes("оставлена без удовлетворения")
    ) {
      rejected += 1;
    }
  }

  return {
    justified,
    partial,
    rejected,
  };
}

function buildTopCounts(
  values: Array<string | null | undefined>,
  take: number,
): CountBadge[] {
  const counts = new Map<string, number>();

  for (const raw of values) {
    const value = (raw || "").trim();
    if (!value) continue;
    counts.set(value, (counts.get(value) || 0) + 1);
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, take)
    .map(([title, count]) => ({ title, count }));
}

export function buildTopViolations(
  items: Array<Pick<CustomerCaseStatItem, "violation">>,
  take = 4,
): CountBadge[] {
  return buildTopCounts(
    items.map((item) => item.violation),
    take,
  );
}

export function buildTopRegions(
  items: Array<Pick<CustomerCaseStatItem, "region">>,
  take = 3,
): CountBadge[] {
  return buildTopCounts(
    items.map((item) => item.region),
    take,
  );
}

export function buildSuccessRate(params: {
  totalCases: number;
  justified: number;
  partial: number;
}) {
  if (!params.totalCases) return 0;
  return Math.round(
    ((params.justified + params.partial) / params.totalCases) * 100,
  );
}

export function aggregateCustomerStats(
  items: CustomerCaseStatItem[],
): CustomerAggregate[] {
  const grouped = new Map<string, CustomerCaseStatItem[]>();
  const customerNames = new Map<string, string>();

  for (const item of items) {
    const customerInn = item.customerInn?.trim();
    const customerName = item.customerName?.trim();

    if (!customerInn || !customerName) continue;

    const bucket = grouped.get(customerInn);
    if (bucket) {
      bucket.push(item);
    } else {
      grouped.set(customerInn, [item]);
      customerNames.set(customerInn, customerName);
    }
  }

  return [...grouped.entries()]
    .map(([customerInn, customerItems]) => {
      const resultSummary = buildResultSummary(customerItems);
      const totalCases = customerItems.length;
      const topViolations = buildTopViolations(customerItems);
      const topRegions = buildTopRegions(customerItems);

      return {
        customerInn,
        customerName: customerNames.get(customerInn) || `Заказчик ${customerInn}`,
        totalCases,
        resultSummary,
        topViolations,
        topRegions,
        successRate: buildSuccessRate({
          totalCases,
          justified: resultSummary.justified,
          partial: resultSummary.partial,
        }),
      };
    })
    .sort((a, b) => {
      if (b.totalCases !== a.totalCases) return b.totalCases - a.totalCases;
      if (b.successRate !== a.successRate) return b.successRate - a.successRate;
      return a.customerName.localeCompare(b.customerName);
    });
}
