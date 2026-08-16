import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import {
  createCategory,
  deleteCategory,
  getCategoryById,
  listCategories,
  updateCategory,
} from "../services/categories.service";
import {
  createEmployee,
  deleteEmployee,
  getEmployeeById,
  listEmployees,
  updateEmployee,
} from "../services/employees.service";

const categoriesFile = resolve(process.cwd(), "src", "data", "categories.json");
const employeesFile = resolve(process.cwd(), "src", "data", "employees.json");

async function run(): Promise<void> {
  const originalCategories = await readFile(categoriesFile, "utf-8");
  const originalEmployees = await readFile(employeesFile, "utf-8");

  try {
    await resetData();
    await testCategoriesService();
    await testEmployeesService();
    console.log("Service tests passed");
  } finally {
    await writeFile(categoriesFile, originalCategories, "utf-8");
    await writeFile(employeesFile, originalEmployees, "utf-8");
  }
}

async function resetData(): Promise<void> {
  await writeFile(categoriesFile, "[]\n", "utf-8");
  await writeFile(employeesFile, "[]\n", "utf-8");
}

async function testCategoriesService(): Promise<void> {
  const category = await createCategory({
    name: "Planchero",
    description: "Personal de cocina",
  });

  assert.ok(category.id);
  assert.equal(category.name, "Planchero");
  assert.equal(category.description, "Personal de cocina");
  assert.equal(category.active, true);

  const categories = await listCategories();
  assert.equal(categories.length, 1);

  const foundCategory = await getCategoryById(category.id);
  assert.equal(foundCategory?.id, category.id);

  const updatedCategory = await updateCategory(category.id, {
    name: "Cocina",
    active: false,
  });
  assert.equal(updatedCategory?.name, "Cocina");
  assert.equal(updatedCategory?.active, false);

  await assert.rejects(
    () => createCategory({ name: "Cocina" }),
    /CATEGORY_NAME_DUPLICATED/,
  );

  const deleted = await deleteCategory(category.id);
  assert.equal(deleted, true);
  assert.equal((await listCategories()).length, 0);
}

async function testEmployeesService(): Promise<void> {
  const category = await createCategory({ name: "Caja" });

  const employee = await createEmployee({
    name: "Carlos Gomez",
    categoryId: category.id,
    phone: "3001234567",
    notes: "Disponible fines de semana",
  });

  assert.ok(employee.id);
  assert.equal(employee.name, "Carlos Gomez");
  assert.equal(employee.categoryId, category.id);

  const employees = await listEmployees();
  assert.equal(employees.length, 1);

  const foundEmployee = await getEmployeeById(employee.id);
  assert.equal(foundEmployee?.id, employee.id);

  const updatedEmployee = await updateEmployee(employee.id, {
    name: "Carlos G.",
    active: false,
  });
  assert.equal(updatedEmployee?.name, "Carlos G.");
  assert.equal(updatedEmployee?.active, false);

  await assert.rejects(
    () => createEmployee({ name: "Sin categoria", categoryId: "categoria-inexistente" }),
    /EMPLOYEE_CATEGORY_NOT_FOUND/,
  );

  const deleted = await deleteEmployee(employee.id);
  assert.equal(deleted, true);
  assert.equal((await listEmployees()).length, 0);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
