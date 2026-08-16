const API_URL = "http://localhost:3000/api";

const state = {
  categories: [],
  employees: [],
};

const elements = {
  refreshButton: document.getElementById("refreshButton"),
  statusMessage: document.getElementById("statusMessage"),
  categoryForm: document.getElementById("categoryForm"),
  categoryName: document.getElementById("categoryName"),
  categoryDescription: document.getElementById("categoryDescription"),
  categoriesList: document.getElementById("categoriesList"),
  employeeForm: document.getElementById("employeeForm"),
  employeeName: document.getElementById("employeeName"),
  employeeCategory: document.getElementById("employeeCategory"),
  employeePhone: document.getElementById("employeePhone"),
  employeeNotes: document.getElementById("employeeNotes"),
  employeesList: document.getElementById("employeesList"),
};

elements.refreshButton.addEventListener("click", loadData);
elements.categoryForm.addEventListener("submit", createCategory);
elements.employeeForm.addEventListener("submit", createEmployee);

loadData();

async function loadData() {
  try {
    const [categories, employees] = await Promise.all([
      request("/categories"),
      request("/employees"),
    ]);

    state.categories = categories.data;
    state.employees = employees.data;
    render();
  } catch {
    showStatus("No fue posible conectar con la API. Verifica que el backend este encendido.", "error");
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
}

function renderCategories() {
  elements.employeeCategory.innerHTML = state.categories.length
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
