import type { Request, Response } from "express";
import {
  createEmployee as createEmployeeService,
  deleteEmployee as deleteEmployeeService,
  getEmployeeById,
  listEmployees,
  updateEmployee as updateEmployeeService,
} from "../services/employees.service";

export async function getEmployees(_req: Request, res: Response): Promise<void> {
  const employees = await listEmployees();
  res.status(200).json({ ok: true, data: employees });
}

export async function getEmployee(req: Request, res: Response): Promise<void> {
  const employee = await getEmployeeById(String(req.params.id || ""));
  if (!employee) {
    res.status(404).json({ ok: false, message: "Empleado no encontrado" });
    return;
  }

  res.status(200).json({ ok: true, data: employee });
}

export async function createEmployee(req: Request, res: Response): Promise<void> {
  try {
    const employee = await createEmployeeService(req.body);
    res.status(201).json({ ok: true, data: employee });
  } catch (error) {
    res.status(400).json({ ok: false, message: employeeErrorMessage(error) });
  }
}

export async function updateEmployee(req: Request, res: Response): Promise<void> {
  try {
    const employee = await updateEmployeeService(String(req.params.id || ""), req.body);
    if (!employee) {
      res.status(404).json({ ok: false, message: "Empleado no encontrado" });
      return;
    }

    res.status(200).json({ ok: true, data: employee });
  } catch (error) {
    res.status(400).json({ ok: false, message: employeeErrorMessage(error) });
  }
}

export async function deleteEmployee(req: Request, res: Response): Promise<void> {
  const deleted = await deleteEmployeeService(String(req.params.id || ""));
  if (!deleted) {
    res.status(404).json({ ok: false, message: "Empleado no encontrado" });
    return;
  }

  res.status(204).send();
}

function employeeErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message === "EMPLOYEE_CATEGORY_REQUIRED") {
    return "La categoria del empleado es obligatoria";
  }
  if (error instanceof Error && error.message === "EMPLOYEE_CATEGORY_NOT_FOUND") {
    return "La categoria indicada no existe";
  }
  if (error instanceof Error && error.message === "EMPLOYEE_PREFERRED_SITE_NOT_FOUND") {
    return "La sede habitual indicada no existe";
  }
  if (error instanceof Error && error.message === "EMPLOYEE_BACKUP_CATEGORIES_INVALID") {
    return "Las categorias de reemplazo no son validas";
  }
  if (error instanceof Error && error.message === "EMPLOYEE_BACKUP_CATEGORY_NOT_FOUND") {
    return "Una categoria de reemplazo indicada no existe";
  }

  return "El nombre del empleado es obligatorio";
}
