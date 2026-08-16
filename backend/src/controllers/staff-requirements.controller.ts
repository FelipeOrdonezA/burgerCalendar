import type { Request, Response } from "express";
import {
  createStaffRequirement,
  deleteStaffRequirement,
  getStaffRequirementById,
  listStaffRequirements,
  updateStaffRequirement,
} from "../services/staff-requirements.service";

export async function getStaffRequirements(_req: Request, res: Response): Promise<void> {
  const requirements = await listStaffRequirements();
  res.status(200).json({ ok: true, data: requirements });
}

export async function getStaffRequirement(req: Request, res: Response): Promise<void> {
  const requirement = await getStaffRequirementById(String(req.params.id || ""));
  if (!requirement) {
    res.status(404).json({ ok: false, message: "Requerimiento no encontrado" });
    return;
  }

  res.status(200).json({ ok: true, data: requirement });
}

export async function postStaffRequirement(req: Request, res: Response): Promise<void> {
  try {
    const requirement = await createStaffRequirement(req.body);
    res.status(201).json({ ok: true, data: requirement });
  } catch (error) {
    res.status(400).json({ ok: false, message: staffRequirementErrorMessage(error) });
  }
}

export async function patchStaffRequirement(req: Request, res: Response): Promise<void> {
  try {
    const requirement = await updateStaffRequirement(String(req.params.id || ""), req.body);
    if (!requirement) {
      res.status(404).json({ ok: false, message: "Requerimiento no encontrado" });
      return;
    }

    res.status(200).json({ ok: true, data: requirement });
  } catch (error) {
    res.status(400).json({ ok: false, message: staffRequirementErrorMessage(error) });
  }
}

export async function removeStaffRequirement(req: Request, res: Response): Promise<void> {
  const deleted = await deleteStaffRequirement(String(req.params.id || ""));
  if (!deleted) {
    res.status(404).json({ ok: false, message: "Requerimiento no encontrado" });
    return;
  }

  res.status(204).send();
}

function staffRequirementErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    const messages: Record<string, string> = {
      STAFF_REQUIREMENT_SITE_REQUIRED: "La sede es obligatoria",
      STAFF_REQUIREMENT_SITE_NOT_FOUND: "La sede indicada no existe",
      STAFF_REQUIREMENT_CATEGORY_REQUIRED: "La categoria es obligatoria",
      STAFF_REQUIREMENT_CATEGORY_NOT_FOUND: "La categoria indicada no existe",
      STAFF_REQUIREMENT_QUANTITY_INVALID: "Las cantidades deben ser numeros enteros iguales o mayores a cero",
      STAFF_REQUIREMENT_DUPLICATED: "Ya existe un requerimiento para esa sede y categoria",
    };

    return messages[error.message] || "No fue posible guardar el requerimiento";
  }

  return "No fue posible guardar el requerimiento";
}
