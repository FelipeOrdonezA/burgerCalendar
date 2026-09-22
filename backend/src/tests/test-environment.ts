import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

// Import this before services: repositories are constructed on module load.
export const testDataDirectory = mkdtempSync(join(tmpdir(), "burger-calendar-test-"));
process.env.DATA_DIR = testDataDirectory;
process.env.STORAGE_DRIVER = "local";
delete process.env.VERCEL;
