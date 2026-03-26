import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { cases } from "./data/fas-decisions.data.mjs";
import {
  buildCategoryMap,
  createPrisma,
  filterByOnlySlugs,
  upsertCases,
} from "./import-runtime.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");

const prisma = createPrisma();

export async function main() {
  const itemsToImport = filterByOnlySlugs(cases);

  if (itemsToImport.length === 0) {
    console.log("No cases selected for import.");
    return;
  }

  const categoryMap = await buildCategoryMap(prisma, itemsToImport);

  for (const item of itemsToImport) {
    const pdfPath = item.pdfUrl
      ? path.join(repoRoot, "public", item.pdfUrl.replace(/^\//, ""))
      : null;

    if (pdfPath && !fs.existsSync(pdfPath)) {
      throw new Error(`PDF file is missing: ${pdfPath}`);
    }
  }

  await upsertCases(prisma, itemsToImport, categoryMap);
}

const isDirectRun =
  Boolean(process.argv[1]) &&
  import.meta.url === pathToFileURL(process.argv[1]).href;

if (isDirectRun) {
  try {
    await main();
  } finally {
    await prisma.$disconnect();
  }
}
