import { Router } from "express";
import {
  getEmployees,
  getEmployee,
  createEmployee,
  deleteEmployee,
  updateEmployee,
} from "../controllers/employees.controller";

const employeesRoutes = Router();

employeesRoutes.get("/", getEmployees);
employeesRoutes.get("/:id", getEmployee);
employeesRoutes.post("/", createEmployee);
employeesRoutes.put("/:id", updateEmployee);
employeesRoutes.patch("/:id", updateEmployee);
employeesRoutes.delete("/:id", deleteEmployee);

export default employeesRoutes;
