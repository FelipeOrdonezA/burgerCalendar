import { randomUUID } from "node:crypto";
import { JsonFileRepository } from "../repositories/json-file.repository";
import type { Employee, EmployeeInput } from "../types/employee";
import { getCategoryById } from "./categories.service";

const employeesRepository = new JsonFileRepository<Employee>("employees.json");

export async function listEmployees(): Promise<Employee[]> {
  return employeesRepository.findAll();
}

export async function getEmployeeById(id: string): Promise<Employee | undefined> {
  return employeesRepository.findById(id);
}

export async function createEmployee(input: EmployeeInput): Promise<Employee> {
  const name = input.name?.trim();
  const categoryId = input.categoryId?.trim();

  if (!name) {
    throw new Error("EMPLOYEE_NAME_REQUIRED");
  }
  if (!categoryId) {
    throw new Error("EMPLOYEE_CATEGORY_REQUIRED");
  }
  if (!(await getCategoryById(categoryId))) {
    throw new Error("EMPLOYEE_CATEGORY_NOT_FOUND");
  }

  const employees = await employeesRepository.findAll();
  const now = new Date().toISOString();
  const employee: Employee = {
    id: randomUUID(),
    name,
    categoryId,
    phone: input.phone?.trim() || "",
    notes: input.notes?.trim() || "",
    active: input.active ?? true,
    createdAt: now,
    updatedAt: now,
  };

  employees.push(employee);
  await employeesRepository.saveAll(employees);
  return employee;
}

export async function updateEmployee(id: string, input: EmployeeInput): Promise<Employee | undefined> {
  const employees = await employeesRepository.findAll();
  const index = employees.findIndex((employee) => employee.id === id);
  if (index === -1) return undefined;

  const current = employees[index] as Employee;
  const nextCategoryId = input.categoryId?.trim();
  if (nextCategoryId && !(await getCategoryById(nextCategoryId))) {
    throw new Error("EMPLOYEE_CATEGORY_NOT_FOUND");
  }

  const updated: Employee = {
    ...current,
    name: input.name?.trim() || current.name,
    categoryId: nextCategoryId || current.categoryId,
    phone: input.phone !== undefined ? input.phone.trim() : current.phone,
    notes: input.notes !== undefined ? input.notes.trim() : current.notes,
    active: input.active ?? current.active,
    updatedAt: new Date().toISOString(),
  };

  employees[index] = updated;
  await employeesRepository.saveAll(employees);
  return updated;
}

export async function deleteEmployee(id: string): Promise<boolean> {
  const employees = await employeesRepository.findAll();
  const nextEmployees = employees.filter((employee) => employee.id !== id);
  if (nextEmployees.length === employees.length) return false;

  await employeesRepository.saveAll(nextEmployees);
  return true;
}
