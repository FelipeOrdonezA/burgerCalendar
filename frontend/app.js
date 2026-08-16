const API_URL = "http://localhost:3000/api";

const state = {
  categories: [],
  employees: [],
  sites: [],
  requirements: [],
};

const elements = {
  refreshButton: document.getElementById("refreshButton"),
  statusMessage: document.getElementById("statusMessage"),
  tabs: document.querySelectorAll("[data-tab]"),
  tabPanels: document.querySelectorAll(".tab-panel"),
  categoryForm: document.getElementById("categoryForm"),
  categoryName: document.getElementById("categoryName"),
  categoryDescription: document.getElementById("categoryDescription"),
  categoryTemporary: document.getElementById("categoryTemporary"),
  categoriesList: document.getElementById("categoriesList"),
  employeeForm: document.getElementById("employeeForm"),
  employeeName: document.getElementById("employeeName"),
  employeeCategory: document.getElementById("employeeCategory"),
  employeePhone: document.getElementById("employeePhone"),
  employeeNotes: document.getElementById("employeeNotes"),
  employeesList: document.getElementById("employeesList"),
  siteForm: document.getElementById("siteForm"),
  siteName: document.getElementById("siteName"),
  siteLocation: document.getElementById("siteLocation"),
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
  requirementsList: document.getElementById("requirementsList"),
};

elements.refreshButton.addEventListener("click", loadData);
elements.categoryForm.addEventListener("submit", createCategory);
elements.employeeForm.addEventListener("submit", createEmployee);
elements.siteForm.addEventListener("submit", createSite);
elements.requirementForm.addEventListener("submit", createRequirement);
elements.tabs.forEach((tab) => tab.addEventListener("click", () => switchTab(tab.dataset.tab)));

loadData();

async function loadData() {
  try {
    const [categories, employees, sites, requirements] = await Promise.all([
      request("/categories"),
      request("/employees"),
      request("/sites"),
      request("/staff-requirements"),
    ]);

    state.categories = categories.data;
    state.employees = employees.data;
    state.sites = sites.data;
    state.requirements = requirements.data;
    render();
  } catch {
    showStatus("No fue posible conectar con la API. Verifica que el backend este encendido.", "error");
  }
}

async function createSite(event) {
  event.preventDefault();

  try {
    await request("/sites", {
      method: "POST",
      body: JSON.stringify({
        name: elements.siteName.value,
        location: elements.siteLocation.value,
      }),
    });

    elements.siteForm.reset();
    showStatus("Sede creada correctamente.", "success");
    await loadData();
  } catch (error) {
    showStatus(error.message, "error");
  }
}

async function createRequirement(event) {
  event.preventDefault();

  try {
    await request("/staff-requirements", {
      method: "POST",
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

    elements.requirementForm.reset();
    showStatus("Requerimiento creado correctamente.", "success");
    await loadData();
  } catch (error) {
    showStatus(error.message, "error");
  }
}

async function createCategory(event) {
  event.preventDefault();

  try {
    await request("/categories", {
      method: "POST",
      body: JSON.stringify({
        name: elements.categoryName.value,
        description: elements.categoryDescription.value,
        temporary: elements.categoryTemporary.checked,
      }),
    });

    elements.categoryForm.reset();
    showStatus("Categoria creada correctamente.", "success");
    await loadData();
  } catch (error) {
    showStatus(error.message, "error");
  }
}

async function createEmployee(event) {
  event.preventDefault();

  try {
    await request("/employees", {
      method: "POST",
      body: JSON.stringify({
        name: elements.employeeName.value,
        categoryId: elements.employeeCategory.value,
        phone: elements.employeePhone.value,
        notes: elements.employeeNotes.value,
      }),
    });

    elements.employeeForm.reset();
    showStatus("Empleado creado correctamente.", "success");
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
  renderCategories();
  renderEmployees();
  renderSites();
  renderRequirements();
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

  elements.categoriesList.innerHTML = state.categories.length
    ? state.categories.map(renderCategory).join("")
    : `<p class="empty">Todavia no hay categorias.</p>`;

  elements.categoriesList.querySelectorAll("[data-delete-category]").forEach((button) => {
    button.addEventListener("click", () => deleteCategory(button.dataset.deleteCategory));
  });
}

function renderSites() {
  elements.requirementSite.innerHTML = state.sites.length
    ? state.sites.map((site) => `<option value="${site.id}">${escapeHtml(site.name)}</option>`).join("")
    : `<option value="">Crea una sede primero</option>`;

  elements.sitesList.innerHTML = state.sites.length
    ? state.sites.map(renderSite).join("")
    : `<p class="empty">Todavia no hay sedes.</p>`;

  elements.sitesList.querySelectorAll("[data-delete-site]").forEach((button) => {
    button.addEventListener("click", () => deleteSite(button.dataset.deleteSite));
  });
}

function renderRequirements() {
  elements.requirementsList.innerHTML = state.requirements.length
    ? state.requirements.map(renderRequirement).join("")
    : `<p class="empty">Todavia no hay requerimientos.</p>`;

  elements.requirementsList.querySelectorAll("[data-delete-requirement]").forEach((button) => {
    button.addEventListener("click", () => deleteRequirement(button.dataset.deleteRequirement));
  });
}

function renderEmployees() {
  elements.employeesList.innerHTML = state.employees.length
    ? state.employees.map(renderEmployee).join("")
    : `<p class="empty">Todavia no hay empleados.</p>`;

  elements.employeesList.querySelectorAll("[data-delete-employee]").forEach((button) => {
    button.addEventListener("click", () => deleteEmployee(button.dataset.deleteEmployee));
  });
}

function renderCategory(category) {
  return `
    <article class="item">
      <h3>${escapeHtml(category.name)}</h3>
      <p>${escapeHtml(category.description || "Sin descripcion")}</p>
      <p>${category.temporary ? "Temporal: no valida descanso semanal" : "Permanente"}</p>
      <div class="item-actions">
        <button class="secondary" type="button" data-delete-category="${category.id}">Eliminar</button>
      </div>
    </article>
  `;
}

function renderEmployee(employee) {
  const category = state.categories.find((item) => item.id === employee.categoryId);

  return `
    <article class="item">
      <h3>${escapeHtml(employee.name)}</h3>
      <p>${escapeHtml(category?.name || "Categoria no encontrada")}</p>
      <p>${escapeHtml(employee.phone || "Sin telefono")}</p>
      <p>${escapeHtml(employee.notes || "Sin notas")}</p>
      <div class="item-actions">
        <button class="secondary" type="button" data-delete-employee="${employee.id}">Eliminar</button>
      </div>
    </article>
  `;
}

function renderSite(site) {
  return `
    <article class="item">
      <h3>${escapeHtml(site.name)}</h3>
      <p>${escapeHtml(site.location || "Sin ubicacion")}</p>
      <div class="item-actions">
        <button class="secondary" type="button" data-delete-site="${site.id}">Eliminar</button>
      </div>
    </article>
  `;
}

function renderRequirement(requirement) {
  const site = state.sites.find((item) => item.id === requirement.siteId);
  const category = state.categories.find((item) => item.id === requirement.categoryId);

  return `
    <article class="item">
      <h3>${escapeHtml(site?.name || "Sede no encontrada")}</h3>
      <p>${escapeHtml(category?.name || "Categoria no encontrada")}</p>
      <p>${formatWeeklyQuantities(requirement.weeklyQuantities)}</p>
      <p>${escapeHtml(requirement.notes || "Sin notas")}</p>
      <div class="item-actions">
        <button class="secondary" type="button" data-delete-requirement="${requirement.id}">Eliminar</button>
      </div>
    </article>
  `;
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

function switchTab(tabName) {
  elements.tabs.forEach((tab) => tab.classList.toggle("is-active", tab.dataset.tab === tabName));
  elements.tabPanels.forEach((panel) => panel.classList.remove("is-visible"));
  document.getElementById(`${tabName}Panel`).classList.add("is-visible");
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
