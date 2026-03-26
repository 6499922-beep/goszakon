import { getPrisma } from "@/lib/prisma";
import { executeTenderPrimaryAnalysisJob } from "@/lib/tender-primary-analysis";

const RUNNER_INTERVAL_MS = 15_000;
const STALE_RUNNING_MS = 10 * 60 * 1000;

type TenderRunnerState = {
  started: boolean;
  timer: NodeJS.Timeout | null;
  processing: boolean;
};

function getRunnerState(): TenderRunnerState {
  const globalState = globalThis as typeof globalThis & {
    __goszakonTenderRunnerState?: TenderRunnerState;
  };

  if (!globalState.__goszakonTenderRunnerState) {
    globalState.__goszakonTenderRunnerState = {
      started: false,
      timer: null,
      processing: false,
    };
  }

  return globalState.__goszakonTenderRunnerState;
}

async function pickNextProcurementId() {
  const prisma = getPrisma();
  const staleBefore = new Date(Date.now() - STALE_RUNNING_MS);

  const staleRunning = await prisma.tenderProcurement.findFirst({
    where: {
      aiAnalysisStatus: "running",
      updatedAt: { lt: staleBefore },
      sourceText: { not: null },
    },
    orderBy: { updatedAt: "asc" },
    select: { id: true },
  });

  if (staleRunning) {
    await prisma.tenderProcurement.update({
      where: { id: staleRunning.id },
      data: {
        aiAnalysisStatus: "queued",
        aiAnalysisError:
          "Предыдущий запуск анализа завис и был автоматически поставлен в повторную очередь.",
      },
    });
  }

  const queued = await prisma.tenderProcurement.findFirst({
    where: {
      aiAnalysisStatus: "queued",
      sourceText: { not: null },
    },
    orderBy: [{ updatedAt: "asc" }, { id: "asc" }],
    select: { id: true, sourceText: true },
  });

  return queued?.id ?? null;
}

async function runNextQueuedProcurement() {
  const state = getRunnerState();
  if (state.processing) {
    return;
  }

  state.processing = true;

  try {
    const procurementId = await pickNextProcurementId();
    if (!procurementId) {
      return;
    }

    const prisma = getPrisma();
    const procurement = await prisma.tenderProcurement.findUnique({
      where: { id: procurementId },
      select: {
        id: true,
        sourceText: true,
      },
    });

    if (!procurement?.sourceText?.trim()) {
      await prisma.tenderProcurement.update({
        where: { id: procurementId },
        data: {
          aiAnalysisStatus: "needs_text",
          aiAnalysisError: "Для закупки не найден исходный текст для анализа.",
        },
      });
      return;
    }

    await executeTenderPrimaryAnalysisJob({
      procurementId,
      sourceText: procurement.sourceText,
    });
  } catch (error) {
    console.error("[tender-analysis-runner] queued job failed", error);
  } finally {
    state.processing = false;
  }
}

export function ensureTenderAnalysisRunner() {
  const state = getRunnerState();
  if (state.started) {
    return;
  }

  state.started = true;
  state.timer = setInterval(() => {
    void runNextQueuedProcurement();
  }, RUNNER_INTERVAL_MS);
  state.timer.unref?.();

  void runNextQueuedProcurement();
}

export function kickTenderAnalysisRunner() {
  ensureTenderAnalysisRunner();
  void runNextQueuedProcurement();
}
