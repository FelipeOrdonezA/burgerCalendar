import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { BlobJsonRepository } from "../repositories/blob-json.repository";
import { parseCollection } from "../repositories/repository";
import { DATA_FILES, localDataDirectory } from "../repositories/storage-config";

async function run(): Promise<void> {
  if (!process.argv.includes("--confirm")) {
    throw new Error("Importacion manual: configura las credenciales del store destino en .env.local y ejecuta npm run data:import:blob -- --confirm. No sobrescribe archivos existentes.");
  }
  if (!process.env.BLOB_READ_WRITE_TOKEN &&
      !(process.env.BLOB_STORE_ID && process.env.VERCEL_OIDC_TOKEN)) {
    throw new Error("Faltan las credenciales del Blob store destino.");
  }

  // Validate every source and every destination before making the first write.
  const files = await Promise.all(DATA_FILES.map(async (fileName) => ({
    fileName,
    items: parseCollection(await readFile(resolve(localDataDirectory(), fileName), "utf-8")),
    repository: new BlobJsonRepository(fileName),
  })));
  for (const file of files) {
    if ((await file.repository.readSnapshot()).version !== null) {
      throw new Error(`El destino ya contiene ${file.fileName}. Importacion cancelada antes de escribir.`);
    }
  }

  // Preserve the original objects, IDs and historical snapshots without edits.
  // This is not a multi-file transaction: stop using the app while importing.
  for (const file of files) {
    await file.repository.saveAll(file.items, null);
    assert.deepEqual(await file.repository.findAll(), file.items);
    console.log(`Importado y verificado: ${file.fileName} (${file.items.length} registros)`);
  }
}

run().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "La importacion fallo.");
  process.exitCode = 1;
});
