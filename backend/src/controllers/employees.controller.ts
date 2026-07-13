import { Request, Response } from "express";

export function getEmployees(_req: Request, res: Response): void {
  res.status(200).json({
    ok: true,
    message: "Empleados obtenidos correctamente",
  });
}

export function createEmployee(req: Request, res: Response): void {
  res.status(201).json(req.body);
}

export function updateEmployee(req: Request, res: Response): void {
  res.status(200).json(req.body);
}

export function deleteEmployee(req: Request, res: Response): void {
  res.status(200).json({
    ok: true,
    message: "Empleado eliminado correctamente",
  });
}