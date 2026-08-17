import type { Request, Response } from "express";
import {
  createCategory,
  deleteCategory,
  getCategoryById,
  listCategories,
  updateCategory,
} from "../services/categories.service";

export async function getCategories(_req: Request, res: Response): Promise<void> {
  const categories = await listCategories();
  res.status(200).json({ ok: true, data: categories });
}

export async function getCategory(req: Request, res: Response): Promise<void> {
  const category = await getCategoryById(String(req.params.id || ""));
  if (!category) {
    res.status(404).json({ ok: false, message: "Categoria no encontrada" });
    return;
  }

  res.status(200).json({ ok: true, data: category });
}

export async function postCategory(req: Request, res: Response): Promise<void> {
  try {
    const category = await createCategory(req.body);
    res.status(201).json({ ok: true, data: category });
  } catch (error) {
    res.status(400).json({ ok: false, message: categoryErrorMessage(error) });
  }
}

export async function patchCategory(req: Request, res: Response): Promise<void> {
  try {
    const category = await updateCategory(String(req.params.id || ""), req.body);
    if (!category) {
      res.status(404).json({ ok: false, message: "Categoria no encontrada" });
      return;
    }

    res.status(200).json({ ok: true, data: category });
  } catch (error) {
    res.status(400).json({ ok: false, message: categoryErrorMessage(error) });
  }
}

export async function removeCategory(req: Request, res: Response): Promise<void> {
  const deleted = await deleteCategory(String(req.params.id || ""));
  if (!deleted) {
    res.status(404).json({ ok: false, message: "Categoria no encontrada" });
    return;
  }

  res.status(204).send();
}

function categoryErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message === "CATEGORY_NAME_DUPLICATED") {
    return "Ya existe una categoria con ese nombre";
  }

  if (error instanceof Error && error.message === "CATEGORY_CALENDAR_PRIORITY_INVALID") {
    return "El ordenamiento en el calendario debe ser un numero entero mayor a cero";
  }

  return "El nombre de la categoria es obligatorio";
}
