import { createHash, randomUUID } from "node:crypto";
import { mkdir, readFile, rename, unlink, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { localDataDirectory } from "./storage-config";
import { parseCollection, StorageConflictError, StorageError, type Repository, type Snapshot } from "./repository";

// Serialize compare-and-write within the local server process.
const writes = new Map<string, Promise<void>>();

export class JsonFileRepository<T extends { id: string }> implements Repository<T> {
  private readonly filePath: string;

  constructor(fileName: string) {
    this.filePath = resolve(localDataDirectory(), fileName);
  }

  async readSnapshot(): Promise<Snapshot<T>> {
    try {
      const content = await readFile(this.filePath, "utf-8");
      return { items: parseCollection<T>(content), version: createHash("sha256").update(content).digest("hex") };
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        return { items: [], version: null };
      }
      throw new StorageError();
    }
  }

  async findAll(): Promise<T[]> {
    return (await this.readSnapshot()).items;
  }

  async findById(id: string): Promise<T | undefined> {
    const items = await this.findAll();
    return items.find((item) => item.id === id);
  }

  async saveAll(items: T[], expectedVersion: string | null): Promise<void> {
    const previous = writes.get(this.filePath) ?? Promise.resolve();
    const operation = previous.catch(() => {}).then(async () => {
      const temporary = `${this.filePath}.${randomUUID()}.tmp`;
      try {
        const current = await this.readSnapshot();
        if (current.version !== expectedVersion) throw new StorageConflictError();
        await mkdir(dirname(this.filePath), { recursive: true });
        await writeFile(temporary, `${JSON.stringify(items, null, 2)}\n`, "utf-8");
        await rename(temporary, this.filePath);
      } catch (error) {
        if (error instanceof StorageError) throw error;
        throw new StorageError();
      } finally {
        await unlink(temporary).catch(() => {});
      }
    });
    writes.set(this.filePath, operation);
    try {
      await operation;
    } finally {
      if (writes.get(this.filePath) === operation) writes.delete(this.filePath);
    }
  }
}
