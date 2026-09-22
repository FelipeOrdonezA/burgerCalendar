import { BlobJsonRepository } from "./blob-json.repository";
import { JsonFileRepository } from "./json-file.repository";
import type { Repository } from "./repository";
import { storageDriver } from "./storage-config";

export function createRepository<T extends { id: string }>(fileName: string): Repository<T> {
  return storageDriver() === "blob"
    ? new BlobJsonRepository<T>(fileName)
    : new JsonFileRepository<T>(fileName);
}
