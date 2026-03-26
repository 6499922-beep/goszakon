import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { cases } from "./import-fas-decisions-2025.mjs";
import { materials } from "./import-court-materials.mjs";
import {
  buildCategoryMap,
  createPrisma,
  filterByOnlySlugs,
  upsertCases,
  upsertMaterials,
} from "./import-runtime.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");

const prisma = createPrisma();

function ensureCaseFilesExist(items) {
  for (const item of items) {
    const pdfPath = item.pdfUrl
      ? path.join(repoRoot, "public", item.pdfUrl.replace(/^\//, ""))
      : null;

    if (pdfPath && !fs.existsSync(pdfPath)) {
      throw new Error(`PDF file is missing: ${pdfPath}`);
    }
  }
}

async function importCases() {
  const itemsToImport = filterByOnlySlugs(cases);

  if (itemsToImport.length === 0) {
    console.log("No cases selected for import.");
    return;
  }

  ensureCaseFilesExist(itemsToImport);

  const categoryMap = await buildCategoryMap(prisma, itemsToImport);
  await upsertCases(prisma, itemsToImport, categoryMap);
}

async function importMaterials() {
  const itemsToImport = filterByOnlySlugs(materials);

  if (itemsToImport.length === 0) {
    console.log("No materials selected for import.");
    return;
  }

  await upsertMaterials(prisma, itemsToImport);
}

async function main() {
  const mode = process.argv[2];

  if (!mode || !["fas", "court", "all"].includes(mode)) {
    console.error("Usage: node scripts/import-content.mjs <fas|court|all>");
    process.exit(1);
  }

  if (mode === "fas" || mode === "all") {
    await importCases();
  }

  if (mode === "court" || mode === "all") {
    await importMaterials();
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
