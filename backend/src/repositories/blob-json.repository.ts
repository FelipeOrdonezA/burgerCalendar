import { get, put, BlobPreconditionFailedError } from "@vercel/blob";
import { parseCollection, StorageConflictError, StorageError, type Repository, type Snapshot } from "./repository";

export interface BlobClient { get: typeof get; put: typeof put }
export const blobClient: BlobClient = { get, put };

export class BlobJsonRepository<T extends { id: string }> implements Repository<T> {
  private readonly pathname: string;

  constructor(fileName: string, private readonly client: BlobClient = blobClient) {
    this.pathname = `data/${fileName}`;
  }

  async readSnapshot(): Promise<Snapshot<T>> {
    try {
      const result = await this.client.get(this.pathname, { access: "private", useCache: false });
      if (!result) return { items: [], version: null };
      if (!result.stream || !result.blob.etag) throw new StorageError();
      const content = await new Response(result.stream).text();
      return { items: parseCollection<T>(content), version: result.blob.etag };
    } catch {
      throw new StorageError();
    }
  }

  async findAll(): Promise<T[]> {
    return (await this.readSnapshot()).items;
  }

  async findById(id: string): Promise<T | undefined> {
    return (await this.findAll()).find((item) => item.id === id);
  }

  async saveAll(items: T[], expectedVersion: string | null): Promise<void> {
    try {
      await this.client.put(this.pathname, `${JSON.stringify(items, null, 2)}\n`, {
        access: "private",
        contentType: "application/json",
        addRandomSuffix: false,
        allowOverwrite: expectedVersion !== null,
        ...(expectedVersion !== null ? { ifMatch: expectedVersion } : {}),
      });
    } catch (error) {
      if (error instanceof BlobPreconditionFailedError) {
        throw new StorageConflictError();
      }
      // The SDK reports a create collision as a generic BlobError. Confirm
      // existence instead of depending on a vendor error-message string.
      if (expectedVersion === null && (await this.readSnapshot()).version !== null) {
        throw new StorageConflictError();
      }
      throw new StorageError();
    }
  }
}
