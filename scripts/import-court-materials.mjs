import {
  createPrisma,
  filterByOnlySlugs,
  upsertMaterials,
} from "./import-runtime.mjs";
import { pathToFileURL } from "node:url";
import { materials } from "./data/court-materials.data.mjs";

const prisma = createPrisma();

export async function main() {
  const itemsToImport = filterByOnlySlugs(materials);
  await upsertMaterials(prisma, itemsToImport);
}

const isDirectRun =
  Boolean(process.argv[1]) &&
  import.meta.url === pathToFileURL(process.argv[1]).href;

if (isDirectRun) {
  main()
    .catch((error) => {
      console.error(error);
      process.exitCode = 1;
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
