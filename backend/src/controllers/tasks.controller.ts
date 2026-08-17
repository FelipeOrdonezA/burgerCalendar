import type { Request, Response } from "express";
import {
  createTask,
  deleteTask,
  getTaskById,
  listTasks,
  updateTask,
} from "../services/tasks.service";

export async function getTasks(_req: Request, res: Response): Promise<void> {
  const tasks = await listTasks();
  res.status(200).json({ ok: true, data: tasks });
}

export async function getTask(req: Request, res: Response): Promise<void> {
  const task = await getTaskById(String(req.params.id || ""));
  if (!task) {
    res.status(404).json({ ok: false, message: "Tarea no encontrada" });
    return;
  }

  res.status(200).json({ ok: true, data: task });
}

export async function postTask(req: Request, res: Response): Promise<void> {
  try {
    const task = await createTask(req.body);
    res.status(201).json({ ok: true, data: task });
  } catch (error) {
    res.status(400).json({ ok: false, message: taskErrorMessage(error) });
  }
}

export async function patchTask(req: Request, res: Response): Promise<void> {
  try {
    const task = await updateTask(String(req.params.id || ""), req.body);
    if (!task) {
      res.status(404).json({ ok: false, message: "Tarea no encontrada" });
      return;
    }

    res.status(200).json({ ok: true, data: task });
  } catch (error) {
    res.status(400).json({ ok: false, message: taskErrorMessage(error) });
  }
}

export async function removeTask(req: Request, res: Response): Promise<void> {
  const deleted = await deleteTask(String(req.params.id || ""));
  if (!deleted) {
    res.status(404).json({ ok: false, message: "Tarea no encontrada" });
    return;
  }

  res.status(204).send();
}

function taskErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message === "TASK_NAME_DUPLICATED") {
    return "Ya existe una tarea con ese nombre";
  }
  if (error instanceof Error && error.message === "TASK_ASSIGNMENT_MODE_INVALID") {
    return "El tipo de asignacion de la tarea no es valido";
  }

  return "El nombre de la tarea es obligatorio";
}
