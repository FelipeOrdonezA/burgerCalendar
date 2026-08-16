import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

export class JsonFileRepository<T extends { id: string }> {
  private readonly filePath: string;

  constructor(fileName: string) {
    this.filePath = resolve(process.cwd(), "src", "data", fileName);
  }

  async findAll(): Promise<T[]> {
    await this.ensureFile();
    const content = await readFile(this.filePath, "utf-8");
    return JSON.parse(content) as T[];
  }

  async findById(id: string): Promise<T | undefined> {
    const items = await this.findAll();
    return items.find((item) => item.id === id);
  }

  async saveAll(items: T[]): Promise<void> {
    await mkdir(dirname(this.filePath), { recursive: true });
    await writeFile(this.filePath, `${JSON.stringify(items, null, 2)}\n`, "utf-8");
  }

  private async ensureFile(): Promise<void> {
    try {
      await readFile(this.filePath, "utf-8");
    } catch {
      await this.saveAll([]);
    }
  }
}
