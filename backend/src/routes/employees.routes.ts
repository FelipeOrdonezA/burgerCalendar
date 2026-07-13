import { Router } from "express";
import { getEmployees, createEmployee, deleteEmployee, updateEmployee } from "../controllers/employees.controller"; 

const employeesRoutes = Router();

employeesRoutes.get("/", getEmployees);
employeesRoutes.post("/", createEmployee);
employeesRoutes.put("/", updateEmployee);
employeesRoutes.patch("/", updateEmployee);
employeesRoutes.delete("/", deleteEmployee);

export default employeesRoutes;