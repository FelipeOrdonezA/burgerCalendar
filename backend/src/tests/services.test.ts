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
import {
  createSite,
  deleteSite,
  getSiteById,
  listSites,
  updateSite,
} from "../services/sites.service";
import {
  createStaffRequirement,
  deleteStaffRequirement,
  getStaffRequirementById,
  listStaffRequirements,
  updateStaffRequirement,
} from "../services/staff-requirements.service";

const categoriesFile = resolve(process.cwd(), "src", "data", "categories.json");
const employeesFile = resolve(process.cwd(), "src", "data", "employees.json");
const sitesFile = resolve(process.cwd(), "src", "data", "sites.json");
const staffRequirementsFile = resolve(process.cwd(), "src", "data", "staff-requirements.json");

async function run(): Promise<void> {
  const originalCategories = await readFile(categoriesFile, "utf-8");
  const originalEmployees = await readFile(employeesFile, "utf-8");
  const originalSites = await readFile(sitesFile, "utf-8");
  const originalStaffRequirements = await readFile(staffRequirementsFile, "utf-8");

  try {
    await resetData();
    await testCategoriesService();
    await testEmployeesService();
    await testSitesService();
    await testStaffRequirementsService();
    console.log("Service tests passed");
  } finally {
    await writeFile(categoriesFile, originalCategories, "utf-8");
    await writeFile(employeesFile, originalEmployees, "utf-8");
    await writeFile(sitesFile, originalSites, "utf-8");
    await writeFile(staffRequirementsFile, originalStaffRequirements, "utf-8");
  }
}

async function resetData(): Promise<void> {
  await writeFile(categoriesFile, "[]\n", "utf-8");
  await writeFile(employeesFile, "[]\n", "utf-8");
  await writeFile(sitesFile, "[]\n", "utf-8");
  await writeFile(staffRequirementsFile, "[]\n", "utf-8");
}

async function testCategoriesService(): Promise<void> {
  const category = await createCategory({
    name: "Planchero",
    description: "Personal de cocina",
    temporary: true,
  });

  assert.ok(category.id);
  assert.equal(category.name, "Planchero");
  assert.equal(category.description, "Personal de cocina");
  assert.equal(category.temporary, true);
  assert.equal(category.active, true);

  const categories = await listCategories();
  assert.equal(categories.length, 1);

  const foundCategory = await getCategoryById(category.id);
  assert.equal(foundCategory?.id, category.id);

  const updatedCategory = await updateCategory(category.id, {
    name: "Cocina",
    temporary: false,
    active: false,
  });
  assert.equal(updatedCategory?.name, "Cocina");
  assert.equal(updatedCategory?.temporary, false);
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

async function testSitesService(): Promise<void> {
  const site = await createSite({
    name: "Burger Zona Rosa",
    location: "Zona Rosa",
  });

  assert.ok(site.id);
  assert.equal(site.name, "Burger Zona Rosa");
  assert.equal(site.location, "Zona Rosa");

  const sites = await listSites();
  assert.equal(sites.length, 1);

  const foundSite = await getSiteById(site.id);
  assert.equal(foundSite?.id, site.id);

  const updatedSite = await updateSite(site.id, {
    location: "Calle principal",
    active: false,
  });
  assert.equal(updatedSite?.location, "Calle principal");
  assert.equal(updatedSite?.active, false);

  await assert.rejects(
    () => createSite({ name: "Burger Zona Rosa" }),
    /SITE_NAME_DUPLICATED/,
  );

  const deleted = await deleteSite(site.id);
  assert.equal(deleted, true);
  assert.equal((await listSites()).length, 0);
}

async function testStaffRequirementsService(): Promise<void> {
  const category = await createCategory({ name: "Atencion" });
  const site = await createSite({ name: "Burger La 16", location: "La 16" });

  const requirement = await createStaffRequirement({
    siteId: site.id,
    categoryId: category.id,
    weeklyQuantities: {
      monday: 2,
      tuesday: 2,
      wednesday: 2,
      thursday: 2,
      friday: 3,
      saturday: 3,
      sunday: 3,
      holiday: 3,
    },
    notes: "Turno base",
  });

  assert.ok(requirement.id);
  assert.equal(requirement.siteId, site.id);
  assert.equal(requirement.categoryId, category.id);
  assert.equal(requirement.weeklyQuantities.monday, 2);
  assert.equal(requirement.weeklyQuantities.friday, 3);
  assert.equal(requirement.weeklyQuantities.holiday, 3);

  const requirements = await listStaffRequirements();
  assert.equal(requirements.length, 1);

  const foundRequirement = await getStaffRequirementById(requirement.id);
  assert.equal(foundRequirement?.id, requirement.id);

  const updatedRequirement = await updateStaffRequirement(requirement.id, {
    weeklyQuantities: {
      monday: 1,
      tuesday: 1,
      wednesday: 1,
      thursday: 1,
      friday: 2,
      saturday: 2,
      sunday: 2,
      holiday: 2,
    },
    active: false,
  });
  assert.equal(updatedRequirement?.weeklyQuantities.monday, 1);
  assert.equal(updatedRequirement?.active, false);

  await assert.rejects(
    () => createStaffRequirement({ siteId: site.id, categoryId: category.id, weeklyQuantities: { monday: 1 } }),
    /STAFF_REQUIREMENT_DUPLICATED/,
  );

  await assert.rejects(
    () => updateStaffRequirement(requirement.id, { weeklyQuantities: { monday: -1 } }),
    /STAFF_REQUIREMENT_QUANTITY_INVALID/,
  );

  const deleted = await deleteStaffRequirement(requirement.id);
  assert.equal(deleted, true);
  assert.equal((await listStaffRequirements()).length, 0);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
