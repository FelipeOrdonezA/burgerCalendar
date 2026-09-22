export interface Snapshot<T> {
  items: T[];
  version: string | null;
}

export interface Repository<T extends { id: string }> {
  readSnapshot(): Promise<Snapshot<T>>;
  findAll(): Promise<T[]>;
  findById(id: string): Promise<T | undefined>;
  saveAll(items: T[], expectedVersion: string | null): Promise<void>;
}

export class StorageError extends Error {
  constructor(message = "No fue posible acceder al almacenamiento.") {
    super(message);
    this.name = "StorageError";
  }
}

export class StorageConflictError extends StorageError {
  constructor() {
    super("Los datos cambiaron mientras guardabas. Recarga la pagina y vuelve a aplicar tus cambios.");
    this.name = "StorageConflictError";
  }
}

export function parseCollection<T extends { id: string }>(content: string): T[] {
  const items: unknown = JSON.parse(content);
  if (!Array.isArray(items) || items.some((item) =>
    !item || typeof item !== "object" || typeof item.id !== "string" || !item.id
  )) {
    throw new StorageError("El archivo de datos no contiene una coleccion valida.");
  }
  if (new Set(items.map((item) => item.id)).size !== items.length) {
    throw new StorageError("El archivo de datos contiene identificadores duplicados.");
  }
  return items as T[];
}
