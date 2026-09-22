import type { Response } from "express";
import { StorageConflictError, StorageError } from "../repositories/repository";

export function respondToStorageError(error: unknown, res: Response): boolean {
  if (!(error instanceof StorageError)) return false;
  res.status(error instanceof StorageConflictError ? 409 : 503)
    .json({ ok: false, message: error.message });
  return true;
}
