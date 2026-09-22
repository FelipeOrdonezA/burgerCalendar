import { resolve } from "node:path";

export const DATA_FILES = [
  "calendars.json", "categories.json", "employees.json",
  "sites.json", "staff-requirements.json", "tasks.json",
] as const;

export function localDataDirectory(): string {
  // Works from both src/repositories and dist/repositories, regardless of cwd.
  return process.env.DATA_DIR
    ? resolve(process.env.DATA_DIR)
    : resolve(__dirname, "../../src/data");
}

export function storageDriver(): "local" | "blob" {
  const deployed = process.env.VERCEL === "1" && process.env.VERCEL_ENV !== "development";
  const driver = process.env.STORAGE_DRIVER || (deployed ? "blob" : "local");
  if (driver !== "local" && driver !== "blob") {
    throw new Error("STORAGE_DRIVER debe ser local o blob.");
  }
  if (deployed && driver === "local") {
    throw new Error("Los despliegues de Vercel requieren STORAGE_DRIVER=blob.");
  }
  return driver;
}
