const API_URL = "http://localhost:3000/api";
const DAYS = [
  ["monday", "Lunes"],
  ["tuesday", "Martes"],
  ["wednesday", "Miercoles"],
  ["thursday", "Jueves"],
  ["friday", "Viernes"],
  ["saturday", "Sabado"],
  ["sunday", "Domingo"],
];

const state = {
  categories: [],
  employees: [],
  sites: [],
  requirements: [],
  tasks: [],
  calendars: [],
  currentCalendar: null,
  selectedWeek: null,
  calendarAssignments: {},
  calendarTasks: {},
  visibleTaskSections: {},
  editing: {
    categoryId: null,
    employeeId: null,
    siteId: null,
    requirementId: null,
    taskId: null,
  },
};

const elements = {
  appViews: document.querySelectorAll(".app-view"),
  homeView: document.getElementById("homeView"),
  configView: document.getElementById("configView"),
  schedulerView: document.getElementById("schedulerView"),
  collapseSidebarButton: document.getElementById("collapseSidebarButton"),
  expandSidebarButton: document.getElementById("expandSidebarButton"),
  refreshButton: document.getElementById("refreshButton"),
  schedulerRefreshButton: document.getElementById("schedulerRefreshButton"),
  statusMessage: document.getElementById("statusMessage"),
  tabs: document.querySelectorAll("[data-config-tab]"),
  tabPanels: document.querySelectorAll(".config-tab-panel"),
  clearCalendarButton: document.getElementById("clearCalendarButton"),
  calendarWeekSelect: document.getElementById("calendarWeekSelect"),
  calendarStatusBadge: document.getElementById("calendarStatusBadge"),
  calendarMeta: document.getElementById("calendarMeta"),
  saveDraftButton: document.getElementById("saveDraftButton"),
  approveCalendarButton: document.getElementById("approveCalendarButton"),
  reopenCalendarButton: document.getElementById("reopenCalendarButton"),
  calendarGrid: document.getElementById("calendarGrid"),
  restsGrid: document.getElementById("restsGrid"),
  categoryForm: document.getElementById("categoryForm"),
  categoryName: document.getElementById("categoryName"),
  categoryDescription: document.getElementById("categoryDescription"),
  categoryTemporary: document.getElementById("categoryTemporary"),
  categorySubmitButton: document.getElementById("categorySubmitButton"),
  categoryCancelButton: document.getElementById("categoryCancelButton"),
  categoriesList: document.getElementById("categoriesList"),
  employeeForm: document.getElementById("employeeForm"),
  employeeName: document.getElementById("employeeName"),
  employeeCategory: document.getElementById("employeeCategory"),
  employeePreferredSite: document.getElementById("employeePreferredSite"),
  employeeBackupCategories: document.getElementById("employeeBackupCategories"),
  employeePhone: document.getElementById("employeePhone"),
  employeeNotes: document.getElementById("employeeNotes"),
  employeeActive: document.getElementById("employeeActive"),
  employeeStatusFilter: document.getElementById("employeeStatusFilter"),
  employeeSubmitButton: document.getElementById("employeeSubmitButton"),
  employeeCancelButton: document.getElementById("employeeCancelButton"),
  employeesList: document.getElementById("employeesList"),
  siteForm: document.getElementById("siteForm"),
  siteName: document.getElementById("siteName"),
  siteLocation: document.getElementById("siteLocation"),
  siteSubmitButton: document.getElementById("siteSubmitButton"),
  siteCancelButton: document.getElementById("siteCancelButton"),
  sitesList: document.getElementById("sitesList"),
  requirementForm: document.getElementById("requirementForm"),
  requirementSite: document.getElementById("requirementSite"),
  requirementCategory: document.getElementById("requirementCategory"),
  requirementMonday: document.getElementById("requirementMonday"),
  requirementTuesday: document.getElementById("requirementTuesday"),
  requirementWednesday: document.getElementById("requirementWednesday"),
  requirementThursday: document.getElementById("requirementThursday"),
  requirementFriday: document.getElementById("requirementFriday"),
  requirementSaturday: document.getElementById("requirementSaturday"),
  requirementSunday: document.getElementById("requirementSunday"),
  requirementHoliday: document.getElementById("requirementHoliday"),
  requirementNotes: document.getElementById("requirementNotes"),
  requirementSubmitButton: document.getElementById("requirementSubmitButton"),
  requirementCancelButton: document.getElementById("requirementCancelButton"),
  requirementsList: document.getElementById("requirementsList"),
  taskForm: document.getElementById("taskForm"),
  taskName: document.getElementById("taskName"),
  taskAssignmentMode: document.getElementById("taskAssignmentMode"),
  taskDescription: document.getElementById("taskDescription"),
  taskSubmitButton: document.getElementById("taskSubmitButton"),
  taskCancelButton: document.getElementById("taskCancelButton"),
  tasksList: document.getElementById("tasksList"),
};

elements.refreshButton.addEventListener("click", loadData);
elements.schedulerRefreshButton.addEventListener("click", loadData);
elements.categoryForm.addEventListener("submit", saveCategory);
elements.employeeForm.addEventListener("submit", saveEmployee);
elements.siteForm.addEventListener("submit", saveSite);
elements.requirementForm.addEventListener("submit", saveRequirement);
elements.taskForm.addEventListener("submit", saveTask);
elements.categoryCancelButton.addEventListener("click", resetCategoryForm);
elements.employeeCancelButton.addEventListener("click", resetEmployeeForm);
elements.employeeStatusFilter.addEventListener("change", renderEmployees);
elements.siteCancelButton.addEventListener("click", resetSiteForm);
elements.requirementCancelButton.addEventListener("click", resetRequirementForm);
elements.taskCancelButton.addEventListener("click", resetTaskForm);
elements.employeeCategory.addEventListener("change", () => renderEmployeeBackupOptions());
elements.clearCalendarButton.addEventListener("click", clearCalendarAssignments);
elements.calendarWeekSelect.addEventListener("change", selectCalendarWeek);
elements.saveDraftButton.addEventListener("click", saveCalendarDraft);
elements.approveCalendarButton.addEventListener("click", approveCurrentCalendar);
elements.reopenCalendarButton.addEventListener("click", reopenCurrentCalendar);
elements.collapseSidebarButton.addEventListener("click", () => toggleSchedulerSidebar(true));
elements.expandSidebarButton.addEventListener("click", () => toggleSchedulerSidebar(false));
elements.tabs.forEach((tab) => tab.addEventListener("click", () => switchTab(tab.dataset.configTab)));
window.addEventListener("hashchange", renderRoute);

renderRoute();
loadData();

async function loadData() {
  try {
    const [categories, employees, sites, requirements, tasks, calendars] = await Promise.all([
      request("/categories"),
      request("/employees"),
      request("/sites"),
      request("/staff-requirements"),
      request("/tasks"),
      request("/calendars"),
    ]);

    state.categories = categories.data;
    state.employees = employees.data;
    state.sites = sites.data;
    state.requirements = requirements.data;
    state.tasks = tasks.data;
    state.calendars = calendars.data;
    ensureSelectedWeek();
    syncCurrentCalendarFromWeek();
    render();
  } catch {
    showStatus("No fue posible conectar con la API. Verifica que el backend este encendido.", "error");
  }
}

async function saveSite(event) {
  event.preventDefault();
  const siteId = state.editing.siteId;

  try {
    await request(siteId ? `/sites/${siteId}` : "/sites", {
      method: siteId ? "PATCH" : "POST",
      body: JSON.stringify({
        name: elements.siteName.value,
        location: elements.siteLocation.value,
      }),
    });

    resetSiteForm();
    showStatus(siteId ? "Sede actualizada correctamente." : "Sede creada correctamente.", "success");
    await loadData();
  } catch (error) {
    showStatus(error.message, "error");
  }
}

async function saveRequirement(event) {
  event.preventDefault();
  const requirementId = state.editing.requirementId;

  try {
    await request(requirementId ? `/staff-requirements/${requirementId}` : "/staff-requirements", {
      method: requirementId ? "PATCH" : "POST",
      body: JSON.stringify({
        siteId: elements.requirementSite.value,
        categoryId: elements.requirementCategory.value,
        weeklyQuantities: {
          monday: Number(elements.requirementMonday.value),
          tuesday: Number(elements.requirementTuesday.value),
          wednesday: Number(elements.requirementWednesday.value),
          thursday: Number(elements.requirementThursday.value),
          friday: Number(elements.requirementFriday.value),
          saturday: Number(elements.requirementSaturday.value),
          sunday: Number(elements.requirementSunday.value),
          holiday: Number(elements.requirementHoliday.value),
        },
        notes: elements.requirementNotes.value,
      }),
    });

    resetRequirementForm();
    showStatus(
      requirementId ? "Requerimiento actualizado correctamente." : "Requerimiento creado correctamente.",
      "success",
    );
    await loadData();
  } catch (error) {
    showStatus(error.message, "error");
  }
}

async function saveTask(event) {
  event.preventDefault();
  const taskId = state.editing.taskId;

  try {
    await request(taskId ? `/tasks/${taskId}` : "/tasks", {
      method: taskId ? "PATCH" : "POST",
      body: JSON.stringify({
        name: elements.taskName.value,
        assignmentMode: elements.taskAssignmentMode.value,
        description: elements.taskDescription.value,
      }),
    });

    resetTaskForm();
    showStatus(taskId ? "Tarea actualizada correctamente." : "Tarea creada correctamente.", "success");
    await loadData();
  } catch (error) {
    showStatus(error.message, "error");
  }
}

async function saveCategory(event) {
  event.preventDefault();
  const categoryId = state.editing.categoryId;

  try {
    await request(categoryId ? `/categories/${categoryId}` : "/categories", {
      method: categoryId ? "PATCH" : "POST",
      body: JSON.stringify({
        name: elements.categoryName.value,
        description: elements.categoryDescription.value,
        temporary: elements.categoryTemporary.checked,
      }),
    });

    resetCategoryForm();
    showStatus(categoryId ? "Categoria actualizada correctamente." : "Categoria creada correctamente.", "success");
    await loadData();
  } catch (error) {
    showStatus(error.message, "error");
  }
}

async function saveEmployee(event) {
  event.preventDefault();
  const employeeId = state.editing.employeeId;

  try {
    await request(employeeId ? `/employees/${employeeId}` : "/employees", {
      method: employeeId ? "PATCH" : "POST",
      body: JSON.stringify({
        name: elements.employeeName.value,
        categoryId: elements.employeeCategory.value,
        preferredSiteId: elements.employeePreferredSite.value,
        backupCategoryIds: getSelectedValues(elements.employeeBackupCategories),
        phone: elements.employeePhone.value,
        notes: elements.employeeNotes.value,
        active: elements.employeeActive.checked,
      }),
    });

    resetEmployeeForm();
    showStatus(employeeId ? "Empleado actualizado correctamente." : "Empleado creado correctamente.", "success");
    await loadData();
  } catch (error) {
    showStatus(error.message, "error");
  }
}

async function deleteCategory(id) {
  try {
    await request(`/categories/${id}`, { method: "DELETE" });
    showStatus("Categoria eliminada correctamente.", "success");
    await loadData();
  } catch (error) {
    showStatus(error.message, "error");
  }
}

async function deleteEmployee(id) {
  try {
    await request(`/employees/${id}`, { method: "DELETE" });
    showStatus("Empleado eliminado correctamente.", "success");
    await loadData();
  } catch (error) {
    showStatus(error.message, "error");
  }
}

async function deleteSite(id) {
  try {
    await request(`/sites/${id}`, { method: "DELETE" });
    showStatus("Sede eliminada correctamente.", "success");
    await loadData();
  } catch (error) {
    showStatus(error.message, "error");
  }
}

async function deleteRequirement(id) {
  try {
    await request(`/staff-requirements/${id}`, { method: "DELETE" });
    showStatus("Requerimiento eliminado correctamente.", "success");
    await loadData();
  } catch (error) {
    showStatus(error.message, "error");
  }
}

async function deleteTask(id) {
  try {
    await request(`/tasks/${id}`, { method: "DELETE" });
    showStatus("Tarea eliminada correctamente.", "success");
    await loadData();
  } catch (error) {
    showStatus(error.message, "error");
  }
}

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (response.status === 204) return { ok: true };

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.message || "La operacion no pudo completarse");
  }

  return payload;
}

function render() {
  renderWeekSelector();
  renderCalendarHeader();
  renderCalendar();
  renderCategories();
  renderEmployees();
  renderSites();
  renderRequirements();
  renderTasks();
}

function ensureSelectedWeek() {
  if (state.selectedWeek) return;

  const monday = getMonday(new Date());
  state.selectedWeek = buildWeekOption(monday);
  syncCurrentCalendarFromWeek();
}

function renderWeekSelector() {
  const weeks = buildWeekOptions();

  elements.calendarWeekSelect.innerHTML = weeks.map((week) => {
    const calendar = findCalendarByWeek(week.start);
    const status = calendar ? ` - ${formatCalendarStatus(calendar.status)}` : " - Disponible";
    const statusClass = calendar ? `calendar-option-${calendar.status}` : "calendar-option-available";
    return `
      <option class="${statusClass}" value="${week.start}" ${week.start === state.selectedWeek?.start ? "selected" : ""}>
        ${week.label}${status}
      </option>
    `;
  }).join("");
}

function renderCalendarHeader() {
  const calendar = state.currentCalendar;
  const isApproved = calendar?.status === "approved";

  elements.calendarStatusBadge.textContent = calendar
    ? formatCalendarStatus(calendar.status)
    : "Nuevo borrador";
  elements.calendarStatusBadge.classList.toggle("approved", isApproved);
  elements.calendarMeta.textContent = calendar
    ? `${calendar.name} · Actualizado ${formatShortDate(calendar.updatedAt.slice(0, 10))}`
    : `${state.selectedWeek?.label || "Semana sin seleccionar"} · Sin guardar`;

  elements.saveDraftButton.disabled = isApproved;
  elements.approveCalendarButton.disabled = isApproved || !calendar;
  elements.reopenCalendarButton.hidden = !isApproved;
  elements.clearCalendarButton.disabled = isApproved;
}

function renderCalendar() {
  if (!state.sites.length || !state.categories.length || !state.requirements.length) {
    elements.calendarGrid.innerHTML = `
      <p class="empty">Crea sedes, categorias y requerimientos para ver el calendario.</p>
    `;
    elements.restsGrid.innerHTML = "";
    return;
  }

  elements.calendarGrid.innerHTML = state.sites.map(renderSiteCalendar).join("");
  elements.restsGrid.innerHTML = renderRestsSummary();

  elements.calendarGrid.querySelectorAll("[data-calendar-slot]").forEach((select) => {
    select.addEventListener("change", () => {
      state.calendarAssignments[select.dataset.calendarSlot] = select.value;
      renderCalendar();
    });
  });

  elements.calendarGrid.querySelectorAll("[data-toggle-site-tasks]").forEach((button) => {
    button.addEventListener("click", () => {
      const siteId = button.dataset.toggleSiteTasks;
      state.visibleTaskSections[siteId] = !state.visibleTaskSections[siteId];
      renderCalendar();
    });
  });

  elements.calendarGrid.querySelectorAll("[data-add-calendar-task]").forEach((button) => {
    button.addEventListener("click", () => addCalendarTask(button.dataset.addCalendarTask, button.dataset.dayKey));
  });

  elements.calendarGrid.querySelectorAll("[data-calendar-task]").forEach((select) => {
    select.addEventListener("change", () => updateCalendarTask(select.dataset.calendarTask, { taskId: select.value }));
  });

  elements.calendarGrid.querySelectorAll("[data-calendar-task-responsible]").forEach((select) => {
    select.addEventListener("change", () => updateCalendarTask(select.dataset.calendarTaskResponsible, { employeeId: select.value }));
  });

  elements.calendarGrid.querySelectorAll("[data-delete-calendar-task]").forEach((button) => {
    button.addEventListener("click", () => deleteCalendarTask(button.dataset.deleteCalendarTask));
  });
}

function renderSiteCalendar(site) {
  const siteRequirements = state.requirements.filter((requirement) => requirement.siteId === site.id);
  const totalWeeklySlots = DAYS.reduce((sum, [dayKey]) => {
    return sum + siteRequirements.reduce((daySum, requirement) => {
      return daySum + Number(requirement.weeklyQuantities?.[dayKey] || 0);
    }, 0);
  }, 0);
  const filledWeeklySlots = getSiteFilledSlots(site.id);
  const hasTaskSection = Boolean(state.visibleTaskSections[site.id]);
  const isApproved = state.currentCalendar?.status === "approved";

  return `
    <section class="calendar-site">
      <div class="calendar-site-header">
        <div>
          <h3>${escapeHtml(site.name)}</h3>
          <p>${filledWeeklySlots}/${totalWeeklySlots} puestos asignados</p>
        </div>
        <div class="calendar-site-actions">
          <span class="pill">${escapeHtml(site.location || "Sin ubicacion")}</span>
          <button class="secondary compact-button" type="button" data-toggle-site-tasks="${site.id}" ${isApproved ? "disabled" : ""}>
            ${hasTaskSection ? "Ocultar tareas" : "Agregar tareas"}
          </button>
        </div>
      </div>
      <div class="calendar-table">
        <div class="calendar-head">
          ${DAYS.map(([, label]) => `<div>${label}</div>`).join("")}
        </div>
        <div class="calendar-row">
          ${DAYS.map(([dayKey, label]) => renderDayCalendarCell(site, siteRequirements, dayKey, label)).join("")}
        </div>
      </div>
    </section>
  `;
}

function renderDayCalendarCell(site, siteRequirements, dayKey, dayLabel) {
  const slots = buildDaySlots(site.id, siteRequirements, dayKey);
  const filled = slots.filter((slot) => state.calendarAssignments[slot.id]).length;

  return `
    <div class="calendar-day">
      <div class="calendar-day-summary">
        <strong>${dayLabel}</strong>
        <span>${filled}/${slots.length}</span>
      </div>
      ${slots.length ? slots.map(renderCalendarSlot).join("") : `<p class="empty">Sin requerimientos</p>`}
      ${state.visibleTaskSections[site.id] ? renderDayTasks(site.id, dayKey) : ""}
    </div>
  `;
}

function buildDaySlots(siteId, siteRequirements, dayKey) {
  return siteRequirements.flatMap((requirement) => {
    const category = state.categories.find((item) => item.id === requirement.categoryId);
    const quantity = Number(requirement.weeklyQuantities?.[dayKey] || 0);

    return Array.from({ length: quantity }, (_, index) => ({
      id: `${siteId}-${dayKey}-${requirement.categoryId}-${index}`,
      siteId,
      dayKey,
      categoryId: requirement.categoryId,
      categoryName: category?.name || "Categoria no encontrada",
      slotIndex: index + 1,
    }));
  });
}

function renderCalendarSlot(slot) {
  const selectedEmployeeId = state.calendarAssignments[slot.id] || "";
  const activeEmployees = state.employees.filter((employee) => employee.active !== false);
  const isApproved = state.currentCalendar?.status === "approved";

  return `
    <label class="calendar-slot">
      ${escapeHtml(slot.categoryName)} ${slot.slotIndex}
      <select data-calendar-slot="${slot.id}" ${isApproved ? "disabled" : ""}>
        <option value="">Sin asignar</option>
        ${activeEmployees.map((employee) => `
          <option value="${employee.id}" ${employee.id === selectedEmployeeId ? "selected" : ""}>
            ${escapeHtml(formatEmployeeOption(employee, selectedEmployeeId))}
          </option>
        `).join("")}
      </select>
    </label>
  `;
}

function renderDayTasks(siteId, dayKey) {
  const entries = getCalendarTaskEntries(siteId, dayKey);
  const isApproved = state.currentCalendar?.status === "approved";

  return `
    <div class="day-tasks">
      <div class="day-tasks-header">
        <span>Tareas</span>
        <button class="tiny-button" type="button" data-add-calendar-task="${siteId}" data-day-key="${dayKey}" ${isApproved ? "disabled" : ""}>+</button>
      </div>
      <div class="day-task-list">
        ${entries.length ? entries.map((entry) => renderCalendarTaskEntry(entry)).join("") : `<p class="empty task-empty">Sin tareas</p>`}
      </div>
    </div>
  `;
}

function renderCalendarTaskEntry(entry) {
  const task = state.tasks.find((item) => item.id === entry.taskId);
  const selectedTask = task || null;
  const assignedEmployees = getAssignedEmployeesForSiteDay(entry.siteId, entry.dayKey);
  const selectedEmployee = state.employees.find((employee) => employee.id === entry.employeeId);
  const isPersonTask = selectedTask?.assignmentMode === "person";
  const isApproved = state.currentCalendar?.status === "approved";
  const isComplete = selectedTask && (!isPersonTask || selectedEmployee);
  const preview = isPersonTask
    ? `${selectedTask.name}: ${selectedEmployee?.name || "Sin responsable"}`
    : selectedTask?.name || "Tarea de equipo";

  if (isComplete) {
    return `
      <span class="task-pill">
        ${escapeHtml(preview)}
        <button class="task-pill-remove" type="button" data-delete-calendar-task="${entry.id}" ${isApproved ? "disabled" : ""}>x</button>
      </span>
    `;
  }

  return `
    <article class="calendar-task-card is-editing">
      <div class="calendar-task-fields">
        <select data-calendar-task="${entry.id}" ${isApproved ? "disabled" : ""}>
          <option value="">Selecciona tarea</option>
          ${state.tasks.map((taskOption) => `
            <option value="${taskOption.id}" ${taskOption.id === entry.taskId ? "selected" : ""}>
              ${escapeHtml(taskOption.name)}
            </option>
          `).join("")}
        </select>
        ${isPersonTask ? `
          <select data-calendar-task-responsible="${entry.id}" ${isApproved ? "disabled" : ""}>
            <option value="">Selecciona responsable</option>
            ${assignedEmployees.map((employee) => `
              <option value="${employee.id}" ${employee.id === entry.employeeId ? "selected" : ""}>
                ${escapeHtml(employee.name)}
              </option>
            `).join("")}
          </select>
        ` : ""}
      </div>
      <div class="calendar-task-preview">
        <span>${escapeHtml(preview)}</span>
        <button class="tiny-button danger-button" type="button" data-delete-calendar-task="${entry.id}" ${isApproved ? "disabled" : ""}>x</button>
      </div>
    </article>
  `;
}

function renderRestsSummary() {
  return `
    <section class="calendar-site rests-card">
      <div class="calendar-site-header">
        <div>
          <h3>Descansos</h3>
          <p>Personas sin asignacion por dia</p>
        </div>
      </div>
      <div class="calendar-table">
        <div class="calendar-head">
          ${DAYS.map(([, label]) => `<div>${label}</div>`).join("")}
        </div>
        <div class="calendar-row">
          ${DAYS.map(([dayKey]) => `
            <div class="calendar-day">
              <div class="rest-list">
                ${getRestingEmployees(dayKey).map((employee) => `<span class="pill">${escapeHtml(employee.name)}</span>`).join("") || `<span class="empty">Sin descansos</span>`}
              </div>
            </div>
          `).join("")}
        </div>
      </div>
    </section>
  `;
}

function getRestingEmployees(dayKey) {
  const assignedEmployeeIds = new Set(
    Object.entries(state.calendarAssignments)
      .filter(([slotId, employeeId]) => employeeId && slotId.includes(`-${dayKey}-`))
      .map(([, employeeId]) => employeeId),
  );

  return state.employees.filter((employee) => !assignedEmployeeIds.has(employee.id));
}

function getSiteFilledSlots(siteId) {
  return Object.entries(state.calendarAssignments)
    .filter(([slotId, employeeId]) => slotId.startsWith(`${siteId}-`) && employeeId)
    .length;
}

function clearCalendarAssignments() {
  if (state.currentCalendar?.status === "approved") return;

  state.calendarAssignments = {};
  state.calendarTasks = {};
  state.visibleTaskSections = {};
  renderCalendar();
  showStatus("Asignaciones del calendario limpiadas.", "success");
}

function selectCalendarWeek() {
  const weekStartDate = elements.calendarWeekSelect.value;
  const week = buildWeekOption(parseLocalDate(weekStartDate));
  state.selectedWeek = week;
  syncCurrentCalendarFromWeek();
  renderCalendarHeader();
  renderCalendar();
}

function syncCurrentCalendarFromWeek() {
  const calendar = findCalendarByWeek(state.selectedWeek?.start);
  state.currentCalendar = calendar || null;
  state.calendarAssignments = calendar ? assignmentsFromCalendar(calendar) : {};
  state.calendarTasks = calendar ? tasksFromCalendar(calendar) : {};
  state.visibleTaskSections = calendar ? visibleTaskSectionsFromTasks(calendar.tasks || []) : {};
}

async function saveCalendarDraft() {
  if (state.currentCalendar?.status === "approved") {
    showStatus("El calendario aprobado debe volver a borrador antes de editarse.", "error");
    return;
  }

  try {
    const payload = buildCalendarPayload();
    const response = await request("/calendars", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    state.currentCalendar = response.data;
    await loadData();
    showStatus("Borrador del calendario guardado correctamente.", "success");
  } catch (error) {
    showStatus(error.message, "error");
  }
}

async function approveCurrentCalendar() {
  if (!state.currentCalendar) {
    showStatus("Guarda primero el calendario como borrador.", "error");
    return;
  }

  try {
    const response = await request(`/calendars/${state.currentCalendar.id}/approve`, { method: "PATCH" });
    state.currentCalendar = response.data;
    await loadData();
    showStatus("Calendario aprobado correctamente.", "success");
  } catch (error) {
    showStatus(error.message, "error");
  }
}

async function reopenCurrentCalendar() {
  if (!state.currentCalendar || state.currentCalendar.status !== "approved") return;

  const confirmed = window.confirm("Este calendario aprobado volvera a borrador para permitir cambios. Deseas continuar?");
  if (!confirmed) return;

  try {
    const response = await request(`/calendars/${state.currentCalendar.id}/reopen`, { method: "PATCH" });
    state.currentCalendar = response.data;
    await loadData();
    showStatus("Calendario reabierto como borrador.", "success");
  } catch (error) {
    showStatus(error.message, "error");
  }
}

function buildCalendarPayload() {
  const week = state.selectedWeek;
  return {
    name: week.label,
    weekStartDate: week.start,
    weekEndDate: week.end,
    assignments: buildAssignmentSnapshots(),
    tasks: buildCalendarTaskSnapshots(),
  };
}

function buildAssignmentSnapshots() {
  const slots = state.sites.flatMap((site) => {
    const siteRequirements = state.requirements.filter((requirement) => requirement.siteId === site.id);
    return DAYS.flatMap(([dayKey]) => buildDaySlots(site.id, siteRequirements, dayKey));
  });

  return slots.flatMap((slot) => {
    const employeeId = state.calendarAssignments[slot.id];
    const site = state.sites.find((item) => item.id === slot.siteId);
    const employee = state.employees.find((item) => item.id === employeeId);

    if (!employeeId || !site || !employee) return [];

    return {
      slotId: slot.id,
      siteId: slot.siteId,
      siteName: site.name,
      dayKey: slot.dayKey,
      categoryId: slot.categoryId,
      categoryName: slot.categoryName,
      slotIndex: slot.slotIndex,
      employeeId,
      employeeName: employee.name,
    };
  });
}

function assignmentsFromCalendar(calendar) {
  return Object.fromEntries(
    (calendar.assignments || []).map((assignment) => [assignment.slotId, assignment.employeeId]),
  );
}

function addCalendarTask(siteId, dayKey) {
  if (state.currentCalendar?.status === "approved") return;
  if (!state.tasks.length) {
    showStatus("Crea tareas en configuracion inicial antes de asignarlas al calendario.", "error");
    return;
  }

  const key = getCalendarTaskKey(siteId, dayKey);
  state.calendarTasks[key] = [
    ...(state.calendarTasks[key] || []),
    {
      id: createCalendarTaskEntryId(),
      siteId,
      dayKey,
      taskId: "",
      employeeId: "",
    },
  ];
  state.visibleTaskSections[siteId] = true;
  renderCalendar();
}

function updateCalendarTask(entryId, changes) {
  if (state.currentCalendar?.status === "approved") return;

  state.calendarTasks = Object.fromEntries(
    Object.entries(state.calendarTasks).map(([key, entries]) => [
      key,
      entries.map((entry) => {
        if (entry.id !== entryId) return entry;
        const nextEntry = { ...entry, ...changes };
        const selectedTask = state.tasks.find((task) => task.id === nextEntry.taskId);

        if (changes.taskId && selectedTask?.assignmentMode !== "person") {
          nextEntry.employeeId = "";
        }

        if (nextEntry.employeeId) {
          const assignedEmployeeIds = getAssignedEmployeesForSiteDay(nextEntry.siteId, nextEntry.dayKey)
            .map((employee) => employee.id);
          if (!assignedEmployeeIds.includes(nextEntry.employeeId)) {
            nextEntry.employeeId = "";
          }
        }

        return nextEntry;
      }),
    ]),
  );
  renderCalendar();
}

function deleteCalendarTask(entryId) {
  if (state.currentCalendar?.status === "approved") return;

  state.calendarTasks = Object.fromEntries(
    Object.entries(state.calendarTasks).map(([key, entries]) => [
      key,
      entries.filter((entry) => entry.id !== entryId),
    ]),
  );
  renderCalendar();
}

function getCalendarTaskEntries(siteId, dayKey) {
  return state.calendarTasks[getCalendarTaskKey(siteId, dayKey)] || [];
}

function getCalendarTaskKey(siteId, dayKey) {
  return `${siteId}::${dayKey}`;
}

function createCalendarTaskEntryId() {
  if (window.crypto?.randomUUID) return window.crypto.randomUUID();
  return `task-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function getAssignedEmployeesForSiteDay(siteId, dayKey) {
  const siteRequirements = state.requirements.filter((requirement) => requirement.siteId === siteId);
  const slots = buildDaySlots(siteId, siteRequirements, dayKey);
  const employeeIds = new Set(slots.map((slot) => state.calendarAssignments[slot.id]).filter(Boolean));

  return state.employees.filter((employee) => employeeIds.has(employee.id));
}

function buildCalendarTaskSnapshots() {
  return Object.values(state.calendarTasks).flat().flatMap((entry) => {
    const site = state.sites.find((item) => item.id === entry.siteId);
    const task = state.tasks.find((item) => item.id === entry.taskId);
    const employee = state.employees.find((item) => item.id === entry.employeeId);

    if (!site || !task) return [];

    return {
      id: entry.id,
      siteId: entry.siteId,
      siteName: site.name,
      dayKey: entry.dayKey,
      taskId: task.id,
      taskName: task.name,
      assignmentMode: task.assignmentMode,
      employeeId: task.assignmentMode === "person" ? entry.employeeId || "" : "",
      employeeName: task.assignmentMode === "person" ? employee?.name || "" : "",
    };
  });
}

function tasksFromCalendar(calendar) {
  return (calendar.tasks || []).reduce((groupedTasks, task) => {
    const key = getCalendarTaskKey(task.siteId, task.dayKey);
    groupedTasks[key] = [
      ...(groupedTasks[key] || []),
      {
        id: task.id || createCalendarTaskEntryId(),
        siteId: task.siteId,
        dayKey: task.dayKey,
        taskId: task.taskId,
        employeeId: task.employeeId || "",
      },
    ];
    return groupedTasks;
  }, {});
}

function visibleTaskSectionsFromTasks(tasks) {
  return tasks.reduce((sections, task) => {
    sections[task.siteId] = true;
    return sections;
  }, {});
}

function buildWeekOptions() {
  const currentMonday = getMonday(new Date());
  return Array.from({ length: 78 }, (_, index) => {
    const weekDate = addDays(currentMonday, (index - 12) * 7);
    return buildWeekOption(weekDate);
  });
}

function buildWeekOption(monday) {
  const sunday = addDays(monday, 6);
  const start = formatDateValue(monday);
  const end = formatDateValue(sunday);

  return {
    start,
    end,
    label: `Semana del ${formatShortDate(start)} al ${formatShortDate(end)}`,
  };
}

function findCalendarByWeek(weekStartDate) {
  return state.calendars.find((calendar) => calendar.weekStartDate === weekStartDate);
}

function getMonday(date) {
  const monday = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = monday.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  monday.setDate(monday.getDate() + diff);
  return monday;
}

function addDays(date, amount) {
  const nextDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  nextDate.setDate(nextDate.getDate() + amount);
  return nextDate;
}

function parseLocalDate(value) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatDateValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatShortDate(value) {
  return parseLocalDate(value).toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatCalendarStatus(status) {
  return status === "approved" ? "Aprobado" : "Borrador";
}

function renderCategories() {
  elements.employeeCategory.innerHTML = state.categories.length
    ? state.categories
        .map((category) => `<option value="${category.id}">${escapeHtml(category.name)}</option>`)
        .join("")
    : `<option value="">Crea una categoria primero</option>`;

  elements.requirementCategory.innerHTML = state.categories.length
    ? state.categories
        .map((category) => `<option value="${category.id}">${escapeHtml(category.name)}</option>`)
        .join("")
    : `<option value="">Crea una categoria primero</option>`;

  renderEmployeeBackupOptions(getSelectedValues(elements.employeeBackupCategories));

  elements.categoriesList.innerHTML = state.categories.length
    ? state.categories.map(renderCategory).join("")
    : `<p class="empty">Todavia no hay categorias.</p>`;

  elements.categoriesList.querySelectorAll("[data-delete-category]").forEach((button) => {
    button.addEventListener("click", () => deleteCategory(button.dataset.deleteCategory));
  });
  elements.categoriesList.querySelectorAll("[data-edit-category]").forEach((button) => {
    button.addEventListener("click", () => editCategory(button.dataset.editCategory));
  });
}

function renderSites() {
  elements.requirementSite.innerHTML = state.sites.length
    ? state.sites.map((site) => `<option value="${site.id}">${escapeHtml(site.name)}</option>`).join("")
    : `<option value="">Crea una sede primero</option>`;

  elements.employeePreferredSite.innerHTML = `
    <option value="">Sin sede habitual</option>
    ${state.sites.map((site) => `<option value="${site.id}">${escapeHtml(site.name)}</option>`).join("")}
  `;

  elements.sitesList.innerHTML = state.sites.length
    ? state.sites.map(renderSite).join("")
    : `<p class="empty">Todavia no hay sedes.</p>`;

  elements.sitesList.querySelectorAll("[data-delete-site]").forEach((button) => {
    button.addEventListener("click", () => deleteSite(button.dataset.deleteSite));
  });
  elements.sitesList.querySelectorAll("[data-edit-site]").forEach((button) => {
    button.addEventListener("click", () => editSite(button.dataset.editSite));
  });
}

function renderRequirements() {
  elements.requirementsList.innerHTML = state.requirements.length
    ? state.requirements.map(renderRequirement).join("")
    : `<p class="empty">Todavia no hay requerimientos.</p>`;

  elements.requirementsList.querySelectorAll("[data-delete-requirement]").forEach((button) => {
    button.addEventListener("click", () => deleteRequirement(button.dataset.deleteRequirement));
  });
  elements.requirementsList.querySelectorAll("[data-edit-requirement]").forEach((button) => {
    button.addEventListener("click", () => editRequirement(button.dataset.editRequirement));
  });
}

function renderTasks() {
  elements.tasksList.innerHTML = state.tasks.length
    ? state.tasks.map(renderTask).join("")
    : `<p class="empty">Todavia no hay tareas.</p>`;

  elements.tasksList.querySelectorAll("[data-delete-task]").forEach((button) => {
    button.addEventListener("click", () => deleteTask(button.dataset.deleteTask));
  });
  elements.tasksList.querySelectorAll("[data-edit-task]").forEach((button) => {
    button.addEventListener("click", () => editTask(button.dataset.editTask));
  });
}

function renderEmployees() {
  const filteredEmployees = getFilteredEmployees();

  elements.employeesList.innerHTML = filteredEmployees.length
    ? filteredEmployees.map(renderEmployee).join("")
    : `<p class="empty">No hay empleados para este filtro.</p>`;

  elements.employeesList.querySelectorAll("[data-delete-employee]").forEach((button) => {
    button.addEventListener("click", () => deleteEmployee(button.dataset.deleteEmployee));
  });
  elements.employeesList.querySelectorAll("[data-edit-employee]").forEach((button) => {
    button.addEventListener("click", () => editEmployee(button.dataset.editEmployee));
  });
}

function renderCategory(category) {
  return `
    <details class="item">
      <summary>
        <span>${escapeHtml(category.name)}</span>
        <span class="item-chevron">Ver</span>
      </summary>
      <div class="item-body">
        <p>${escapeHtml(category.description || "Sin descripcion")}</p>
        <p>${category.temporary ? "Temporal: no valida descanso semanal" : "Permanente"}</p>
        <div class="item-actions">
          <button class="secondary" type="button" data-edit-category="${category.id}">Editar</button>
          <button class="secondary" type="button" data-delete-category="${category.id}">Eliminar</button>
        </div>
      </div>
    </details>
  `;
}

function renderEmployee(employee) {
  const category = state.categories.find((item) => item.id === employee.categoryId);
  const preferredSite = state.sites.find((item) => item.id === employee.preferredSiteId);
  const backupCategories = (employee.backupCategoryIds || [])
    .map((categoryId) => state.categories.find((item) => item.id === categoryId)?.name)
    .filter(Boolean)
    .join(", ");

  return `
    <details class="item">
      <summary>
        <span>${escapeHtml(employee.name)}</span>
        <span class="item-chevron">Ver</span>
      </summary>
      <div class="item-body">
        <p>Categoria principal: ${escapeHtml(category?.name || "Categoria no encontrada")}</p>
        <p>Sede habitual: ${escapeHtml(preferredSite?.name || "Sin sede habitual")}</p>
        <p>Puede reemplazar: ${escapeHtml(backupCategories || "Sin reemplazos configurados")}</p>
        <p>Estado: ${employee.active === false ? "Inactivo" : "Activo"}</p>
        <p>${escapeHtml(employee.phone || "Sin telefono")}</p>
        <p>${escapeHtml(employee.notes || "Sin notas")}</p>
        <div class="item-actions">
          <button class="secondary" type="button" data-edit-employee="${employee.id}">Editar</button>
          <button class="secondary" type="button" data-delete-employee="${employee.id}">Eliminar</button>
        </div>
      </div>
    </details>
  `;
}

function renderSite(site) {
  return `
    <details class="item">
      <summary>
        <span>${escapeHtml(site.name)}</span>
        <span class="item-chevron">Ver</span>
      </summary>
      <div class="item-body">
        <p>${escapeHtml(site.location || "Sin ubicacion")}</p>
        <div class="item-actions">
          <button class="secondary" type="button" data-edit-site="${site.id}">Editar</button>
          <button class="secondary" type="button" data-delete-site="${site.id}">Eliminar</button>
        </div>
      </div>
    </details>
  `;
}

function renderRequirement(requirement) {
  const site = state.sites.find((item) => item.id === requirement.siteId);
  const category = state.categories.find((item) => item.id === requirement.categoryId);

  return `
    <details class="item">
      <summary>
        <span>${escapeHtml(site?.name || "Sede no encontrada")} · ${escapeHtml(category?.name || "Categoria no encontrada")}</span>
        <span class="item-chevron">Ver</span>
      </summary>
      <div class="item-body">
        <p>${formatWeeklyQuantities(requirement.weeklyQuantities)}</p>
        <p>${escapeHtml(requirement.notes || "Sin notas")}</p>
        <div class="item-actions">
          <button class="secondary" type="button" data-edit-requirement="${requirement.id}">Editar</button>
          <button class="secondary" type="button" data-delete-requirement="${requirement.id}">Eliminar</button>
        </div>
      </div>
    </details>
  `;
}

function renderTask(task) {
  return `
    <details class="item">
      <summary>
        <span>${escapeHtml(task.name)}</span>
        <span class="item-chevron">Ver</span>
      </summary>
      <div class="item-body">
        <p>Asignacion: ${escapeHtml(formatTaskAssignmentMode(task.assignmentMode))}</p>
        <p>${escapeHtml(task.description || "Sin descripcion")}</p>
        <div class="item-actions">
          <button class="secondary" type="button" data-edit-task="${task.id}">Editar</button>
          <button class="secondary" type="button" data-delete-task="${task.id}">Eliminar</button>
        </div>
      </div>
    </details>
  `;
}

function editCategory(id) {
  const category = state.categories.find((item) => item.id === id);
  if (!category) return;

  state.editing.categoryId = id;
  elements.categoryName.value = category.name;
  elements.categoryDescription.value = category.description || "";
  elements.categoryTemporary.checked = Boolean(category.temporary);
  elements.categorySubmitButton.textContent = "Guardar categoria";
  elements.categoryCancelButton.hidden = false;
  elements.categoryName.focus();
}

function editEmployee(id) {
  const employee = state.employees.find((item) => item.id === id);
  if (!employee) return;

  state.editing.employeeId = id;
  elements.employeeName.value = employee.name;
  elements.employeeCategory.value = employee.categoryId;
  elements.employeePreferredSite.value = employee.preferredSiteId || "";
  renderEmployeeBackupOptions(employee.backupCategoryIds || []);
  elements.employeePhone.value = employee.phone || "";
  elements.employeeNotes.value = employee.notes || "";
  elements.employeeActive.checked = employee.active !== false;
  elements.employeeSubmitButton.textContent = "Guardar empleado";
  elements.employeeCancelButton.hidden = false;
  elements.employeeName.focus();
}

function editSite(id) {
  const site = state.sites.find((item) => item.id === id);
  if (!site) return;

  state.editing.siteId = id;
  elements.siteName.value = site.name;
  elements.siteLocation.value = site.location || "";
  elements.siteSubmitButton.textContent = "Guardar sede";
  elements.siteCancelButton.hidden = false;
  elements.siteName.focus();
}

function editRequirement(id) {
  const requirement = state.requirements.find((item) => item.id === id);
  if (!requirement) return;

  state.editing.requirementId = id;
  elements.requirementSite.value = requirement.siteId;
  elements.requirementCategory.value = requirement.categoryId;
  elements.requirementMonday.value = Number(requirement.weeklyQuantities?.monday || 0);
  elements.requirementTuesday.value = Number(requirement.weeklyQuantities?.tuesday || 0);
  elements.requirementWednesday.value = Number(requirement.weeklyQuantities?.wednesday || 0);
  elements.requirementThursday.value = Number(requirement.weeklyQuantities?.thursday || 0);
  elements.requirementFriday.value = Number(requirement.weeklyQuantities?.friday || 0);
  elements.requirementSaturday.value = Number(requirement.weeklyQuantities?.saturday || 0);
  elements.requirementSunday.value = Number(requirement.weeklyQuantities?.sunday || 0);
  elements.requirementHoliday.value = Number(requirement.weeklyQuantities?.holiday || 0);
  elements.requirementNotes.value = requirement.notes || "";
  elements.requirementSubmitButton.textContent = "Guardar requerimiento";
  elements.requirementCancelButton.hidden = false;
  elements.requirementSite.focus();
}

function editTask(id) {
  const task = state.tasks.find((item) => item.id === id);
  if (!task) return;

  state.editing.taskId = id;
  elements.taskName.value = task.name;
  elements.taskAssignmentMode.value = task.assignmentMode;
  elements.taskDescription.value = task.description || "";
  elements.taskSubmitButton.textContent = "Guardar tarea";
  elements.taskCancelButton.hidden = false;
  elements.taskName.focus();
}

function resetCategoryForm() {
  state.editing.categoryId = null;
  elements.categoryForm.reset();
  elements.categorySubmitButton.textContent = "Crear categoria";
  elements.categoryCancelButton.hidden = true;
}

function resetEmployeeForm() {
  state.editing.employeeId = null;
  elements.employeeForm.reset();
  elements.employeeActive.checked = true;
  renderEmployeeBackupOptions();
  elements.employeeSubmitButton.textContent = "Crear empleado";
  elements.employeeCancelButton.hidden = true;
}

function getFilteredEmployees() {
  const filter = elements.employeeStatusFilter.value;

  if (filter === "inactive") {
    return state.employees.filter((employee) => employee.active === false);
  }

  if (filter === "all") {
    return state.employees;
  }

  return state.employees.filter((employee) => employee.active !== false);
}

function resetSiteForm() {
  state.editing.siteId = null;
  elements.siteForm.reset();
  elements.siteSubmitButton.textContent = "Crear sede";
  elements.siteCancelButton.hidden = true;
}

function resetRequirementForm() {
  state.editing.requirementId = null;
  elements.requirementForm.reset();
  elements.requirementSubmitButton.textContent = "Crear requerimiento";
  elements.requirementCancelButton.hidden = true;
}

function resetTaskForm() {
  state.editing.taskId = null;
  elements.taskForm.reset();
  elements.taskSubmitButton.textContent = "Crear tarea";
  elements.taskCancelButton.hidden = true;
}

function renderEmployeeBackupOptions(selectedCategoryIds = []) {
  const primaryCategoryId = elements.employeeCategory.value;
  const availableCategories = state.categories.filter((category) => category.id !== primaryCategoryId);

  elements.employeeBackupCategories.innerHTML = availableCategories.length
    ? availableCategories
        .map((category) => `
          <option value="${category.id}" ${selectedCategoryIds.includes(category.id) ? "selected" : ""}>
            ${escapeHtml(category.name)}
          </option>
        `)
        .join("")
    : `<option value="">Sin categorias adicionales</option>`;
}

function formatWeeklyQuantities(weeklyQuantities) {
  const labels = [
    ["Lun", "monday"],
    ["Mar", "tuesday"],
    ["Mie", "wednesday"],
    ["Jue", "thursday"],
    ["Vie", "friday"],
    ["Sab", "saturday"],
    ["Dom", "sunday"],
    ["Fest", "holiday"],
  ];

  return labels
    .map(([label, key]) => `${label}: ${Number(weeklyQuantities?.[key] || 0)}`)
    .join(" · ");
}

function formatTaskAssignmentMode(assignmentMode) {
  return assignmentMode === "person" ? "Responsable especifico" : "Equipo completo";
}

function formatEmployeeOption(employee, selectedEmployeeId) {
  if (employee.id === selectedEmployeeId) return employee.name;

  const category = state.categories.find((item) => item.id === employee.categoryId);
  return `${employee.name} (${category?.name || "Sin categoria"})`;
}

function switchTab(tabName) {
  elements.tabs.forEach((tab) => tab.classList.toggle("is-active", tab.dataset.configTab === tabName));
  elements.tabPanels.forEach((panel) => panel.classList.remove("is-visible"));
  document.getElementById(`${tabName}Panel`).classList.add("is-visible");
}

function renderRoute() {
  const route = window.location.hash || "#/";
  const viewByRoute = {
    "#/": elements.homeView,
    "#/config": elements.configView,
    "#/scheduler": elements.schedulerView,
  };
  const activeView = viewByRoute[route] || elements.homeView;

  elements.appViews.forEach((view) => view.classList.toggle("is-visible", view === activeView));
}

function toggleSchedulerSidebar(isCollapsed) {
  elements.schedulerView.classList.toggle("is-sidebar-collapsed", isCollapsed);
  elements.expandSidebarButton.hidden = !isCollapsed;
}

function showStatus(message, type) {
  elements.statusMessage.textContent = message;
  elements.statusMessage.className = `status-message ${type}`;
  elements.statusMessage.hidden = false;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getSelectedValues(select) {
  return Array.from(select.selectedOptions).map((option) => option.value);
}
