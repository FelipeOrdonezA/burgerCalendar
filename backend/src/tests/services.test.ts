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
import {
  approveCalendar,
  getCalendarByWeek,
  listCalendars,
  reopenCalendarDraft,
  saveCalendarDraft,
} from "../services/calendars.service";
import {
  createTask,
  deleteTask,
  getTaskById,
  listTasks,
  updateTask,
} from "../services/tasks.service";

const categoriesFile = resolve(process.cwd(), "src", "data", "categories.json");
const employeesFile = resolve(process.cwd(), "src", "data", "employees.json");
const sitesFile = resolve(process.cwd(), "src", "data", "sites.json");
const staffRequirementsFile = resolve(process.cwd(), "src", "data", "staff-requirements.json");
const calendarsFile = resolve(process.cwd(), "src", "data", "calendars.json");
const tasksFile = resolve(process.cwd(), "src", "data", "tasks.json");

async function run(): Promise<void> {
  const originalCategories = await readFile(categoriesFile, "utf-8");
  const originalEmployees = await readFile(employeesFile, "utf-8");
  const originalSites = await readFile(sitesFile, "utf-8");
  const originalStaffRequirements = await readFile(staffRequirementsFile, "utf-8");
  const originalCalendars = await readFile(calendarsFile, "utf-8");
  const originalTasks = await readFile(tasksFile, "utf-8");

  try {
    await resetData();
    await testCategoriesService();
    await testEmployeesService();
    await testSitesService();
    await testStaffRequirementsService();
    await testCalendarsService();
    await testTasksService();
    console.log("Service tests passed");
  } finally {
    await writeFile(categoriesFile, originalCategories, "utf-8");
    await writeFile(employeesFile, originalEmployees, "utf-8");
    await writeFile(sitesFile, originalSites, "utf-8");
    await writeFile(staffRequirementsFile, originalStaffRequirements, "utf-8");
    await writeFile(calendarsFile, originalCalendars, "utf-8");
    await writeFile(tasksFile, originalTasks, "utf-8");
  }
}

async function resetData(): Promise<void> {
  await writeFile(categoriesFile, "[]\n", "utf-8");
  await writeFile(employeesFile, "[]\n", "utf-8");
  await writeFile(sitesFile, "[]\n", "utf-8");
  await writeFile(staffRequirementsFile, "[]\n", "utf-8");
  await writeFile(calendarsFile, "[]\n", "utf-8");
  await writeFile(tasksFile, "[]\n", "utf-8");
}

async function testCategoriesService(): Promise<void> {
  const category = await createCategory({
    name: "Planchero",
    description: "Personal de cocina",
    temporary: true,
    calendarPriority: 3,
  });

  assert.ok(category.id);
  assert.equal(category.name, "Planchero");
  assert.equal(category.description, "Personal de cocina");
  assert.equal(category.temporary, true);
  assert.equal(category.calendarPriority, 3);
  assert.equal(category.active, true);

  const categories = await listCategories();
  assert.equal(categories.length, 1);

  const foundCategory = await getCategoryById(category.id);
  assert.equal(foundCategory?.id, category.id);

  const updatedCategory = await updateCategory(category.id, {
    name: "Cocina",
    temporary: false,
    calendarPriority: 2,
    active: false,
  });
  assert.equal(updatedCategory?.name, "Cocina");
  assert.equal(updatedCategory?.temporary, false);
  assert.equal(updatedCategory?.calendarPriority, 2);
  assert.equal(updatedCategory?.active, false);

  await assert.rejects(
    () => createCategory({ name: "Cocina" }),
    /CATEGORY_NAME_DUPLICATED/,
  );

  await assert.rejects(
    () => updateCategory(category.id, { calendarPriority: 0 }),
    /CATEGORY_CALENDAR_PRIORITY_INVALID/,
  );

  const deleted = await deleteCategory(category.id);
  assert.equal(deleted, true);
  assert.equal((await listCategories()).length, 0);
}

async function testEmployeesService(): Promise<void> {
  const category = await createCategory({ name: "Caja" });
  const backupCategory = await createCategory({ name: "Planchero" });
  const site = await createSite({ name: "Burger Centro", location: "Centro" });

  const employee = await createEmployee({
    name: "Carlos Gomez",
    categoryId: category.id,
    preferredSiteId: site.id,
    backupCategoryIds: [backupCategory.id],
    teamLeader: true,
    phone: "3001234567",
    notes: "Disponible fines de semana",
  });

  assert.ok(employee.id);
  assert.equal(employee.name, "Carlos Gomez");
  assert.equal(employee.categoryId, category.id);
  assert.equal(employee.preferredSiteId, site.id);
  assert.deepEqual(employee.backupCategoryIds, [backupCategory.id]);
  assert.equal(employee.teamLeader, true);

  const employees = await listEmployees();
  assert.equal(employees.length, 1);

  const foundEmployee = await getEmployeeById(employee.id);
  assert.equal(foundEmployee?.id, employee.id);

  const updatedEmployee = await updateEmployee(employee.id, {
    name: "Carlos G.",
    backupCategoryIds: [],
    teamLeader: false,
    active: false,
  });
  assert.equal(updatedEmployee?.name, "Carlos G.");
  assert.deepEqual(updatedEmployee?.backupCategoryIds, []);
  assert.equal(updatedEmployee?.teamLeader, false);
  assert.equal(updatedEmployee?.active, false);

  await assert.rejects(
    () => createEmployee({ name: "Sin categoria", categoryId: "categoria-inexistente" }),
    /EMPLOYEE_CATEGORY_NOT_FOUND/,
  );

  await assert.rejects(
    () => createEmployee({ name: "Sede invalida", categoryId: category.id, preferredSiteId: "sede-inexistente" }),
    /EMPLOYEE_PREFERRED_SITE_NOT_FOUND/,
  );

  const deleted = await deleteEmployee(employee.id);
  assert.equal(deleted, true);
  assert.equal((await listEmployees()).length, 0);

  await deleteSite(site.id);
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

async function testCalendarsService(): Promise<void> {
  const calendar = await saveCalendarDraft({
    weekStartDate: "2026-08-17",
    weekEndDate: "2026-08-23",
    assignments: [
      {
        slotId: "site-monday-category-0",
        siteId: "site",
        siteName: "Burger La 16",
        dayKey: "monday",
        categoryId: "category",
        categoryName: "Caja",
        slotIndex: 1,
        employeeId: "employee",
        employeeName: "Ana",
      },
    ],
    tasks: [
      {
        id: "task-entry",
        siteId: "site",
        siteName: "Burger La 16",
        dayKey: "monday",
        taskId: "task",
        taskName: "Aseo general",
        assignmentMode: "team",
        employeeId: "",
        employeeName: "",
      },
    ],
    exceptions: [
      {
        alertId: "rest-many:employee",
        type: "rest-many",
        title: "Ana tiene 2 descansos",
        detail: "Tiene descanso el lunes y el jueves.",
        justification: "Acuerdo operativo aprobado.",
        createdAt: "2026-08-17T00:00:00.000Z",
      },
    ],
  });

  assert.ok(calendar.id);
  assert.equal(calendar.status, "draft");
  assert.equal(calendar.name, "Semana del 2026-08-17 al 2026-08-23");
  assert.equal(calendar.assignments.length, 1);
  assert.equal(calendar.tasks.length, 1);
  assert.equal(calendar.exceptions.length, 1);

  const foundByWeek = await getCalendarByWeek("2026-08-17");
  assert.equal(foundByWeek?.id, calendar.id);

  const updatedDraft = await saveCalendarDraft({
    weekStartDate: "2026-08-17",
    weekEndDate: "2026-08-23",
    notes: "Ajustado",
    assignments: [],
    tasks: [],
    exceptions: [],
  });
  assert.equal(updatedDraft.id, calendar.id);
  assert.equal(updatedDraft.notes, "Ajustado");
  assert.equal(updatedDraft.assignments.length, 0);
  assert.equal(updatedDraft.tasks.length, 0);
  assert.equal(updatedDraft.exceptions.length, 0);

  const approved = await approveCalendar(calendar.id);
  assert.equal(approved?.status, "approved");

  await assert.rejects(
    () => saveCalendarDraft({ weekStartDate: "2026-08-17", weekEndDate: "2026-08-23" }),
    /CALENDAR_APPROVED_LOCKED/,
  );

  const reopened = await reopenCalendarDraft(calendar.id);
  assert.equal(reopened?.status, "draft");

  const calendars = await listCalendars();
  assert.equal(calendars.length, 1);
}

async function testTasksService(): Promise<void> {
  const task = await createTask({
    name: "Aseo general",
    description: "Limpieza de cierre",
    assignmentMode: "team",
  });

  assert.ok(task.id);
  assert.equal(task.name, "Aseo general");
  assert.equal(task.description, "Limpieza de cierre");
  assert.equal(task.assignmentMode, "team");
  assert.equal(task.active, true);

  const tasks = await listTasks();
  assert.equal(tasks.length, 1);

  const foundTask = await getTaskById(task.id);
  assert.equal(foundTask?.id, task.id);

  const updatedTask = await updateTask(task.id, {
    name: "Picar papa",
    assignmentMode: "person",
    active: false,
  });
  assert.equal(updatedTask?.name, "Picar papa");
  assert.equal(updatedTask?.assignmentMode, "person");
  assert.equal(updatedTask?.active, false);

  await assert.rejects(
    () => createTask({ name: "Picar papa" }),
    /TASK_NAME_DUPLICATED/,
  );

  await assert.rejects(
    () => createTask({ name: "Tipo invalido", assignmentMode: "otro" as never }),
    /TASK_ASSIGNMENT_MODE_INVALID/,
  );

  const deleted = await deleteTask(task.id);
  assert.equal(deleted, true);
  assert.equal((await listTasks()).length, 0);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
