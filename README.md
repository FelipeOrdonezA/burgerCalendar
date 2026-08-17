# Burger Calendar

Aplicación web para configurar, construir, validar y aprobar cronogramas semanales del equipo de Burger Paisa.

El proyecto busca reducir errores en la programación del personal de varias sedes, controlar descansos, asignaciones, tareas operativas y requerimientos por cargo. El MVP actual ya es funcional y está listo para pruebas en ambiente real con datos limpios.

## Estado actual

El proyecto alcanzó el hito de **MVP funcional del programador**.

Este hito incluye:

- Configuración inicial de cargos, empleados, sedes, requerimientos y tareas.
- Programador semanal con selección de semana.
- Cronograma por sede y día.
- Asignación manual de colaboradores.
- Colaboradores adicionales por eventos o necesidades especiales.
- Tareas por sede y día, con o sin responsable.
- Persistencia de calendarios en JSON.
- Estados de calendario: `borrador` y `aprobado`.
- Alertas visuales y sección centralizada de alertas.
- Excepciones justificadas para alertas.
- Bloqueo de aprobación cuando existen alertas sin justificar.
- Vistas informativas de equipo y demanda.
- Exportación PNG por sede cuando el calendario está aprobado.
- Script para limpiar datos de prueba y dejar los JSON listos para carga real.

## Problema que resuelve

Burger Paisa administra varias sedes con necesidades de personal diferentes según el día, el cargo y la operación.

La elaboración manual de cronogramas puede generar problemas como:

- Falta de personal requerido en una sede.
- Asignación de una persona a un cargo no permitido.
- Asignación simultánea de una persona más de una vez el mismo día.
- Colaboradores sin descanso semanal.
- Colaboradores con más de un descanso.
- Descansos en días de alta demanda.
- Falta de claridad sobre tareas puntuales de la semana.

Burger Calendar centraliza esta información y ayuda a detectar inconsistencias antes de aprobar el calendario.

## Tecnologías

### Backend

- Node.js
- Express
- TypeScript
- CORS
- Persistencia en archivos JSON

### Frontend

- HTML
- CSS
- JavaScript
- `serve` para entorno local
- `html-to-image` por CDN para exportar PNG

### Herramientas

- Git
- GitHub
- npm
- ts-node
- ts-node-dev

## Estructura general

```text
burgerCalendar/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── data/
│   │   ├── repositories/
│   │   ├── routes/
│   │   ├── scripts/
│   │   ├── services/
│   │   ├── tests/
│   │   ├── types/
│   │   └── utils/
│   └── package.json
├── frontend/
│   ├── app.js
│   ├── index.html
│   └── styles.css
├── package.json
└── README.md
```

## Arquitectura del backend

El backend separa responsabilidades por capas:

- **Routes:** definen los endpoints.
- **Controllers:** reciben peticiones HTTP y devuelven respuestas.
- **Services:** contienen lógica de negocio y validaciones.
- **Repositories:** abstraen lectura y escritura en JSON.
- **Types:** definen interfaces TypeScript.
- **Scripts:** contienen tareas manuales, como limpieza de datos.
- **Data:** contiene los archivos JSON usados como almacenamiento del MVP.
- **Utils:** contiene la app Express y el arranque del servidor.

## Persistencia

Durante el MVP no se usa base de datos externa. La información se guarda en archivos JSON locales dentro de `backend/src/data`.

Archivos reales usados actualmente por la aplicación:

```text
calendars.json
categories.json
employees.json
sites.json
staff-requirements.json
tasks.json
```

Estos archivos contienen información operativa real o de prueba local, por eso quedan ignorados por Git. El repositorio conserva plantillas de referencia en:

```text
backend/src/data/samples/
```

Cada archivo real puede iniciar vacío con:

```json
[]
```

También existen carpetas antiguas dentro de `backend/src/data`, pero el MVP actual usa los JSON listados arriba.

## Limpieza de datos

Para borrar datos de prueba y volver a un estado vacío:

```bash
cd backend
npm run data:reset
```

El script reinicia automáticamente todos los archivos `.json` ubicados directamente en `backend/src/data`. No modifica los archivos de ejemplo ubicados en `backend/src/data/samples`.

## Configuración inicial

La vista de configuración inicial permite administrar los datos base de la aplicación.

### Categorías

Representan cargos o roles operativos, por ejemplo cajero, planchero o atención.

Campos principales:

- Nombre.
- Descripción.
- Ordenamiento en calendario.
- Categoría temporal.
- Activo.

El ordenamiento define el orden visual de los cargos en el cronograma. El número menor aparece primero.

La marca temporal permite excluir empleados de esa categoría de validaciones de descanso semanal.

### Empleados

Campos principales:

- Nombre.
- Categoría principal.
- Sede habitual.
- Categorías que puede reemplazar.
- Líder de equipo.
- Teléfono.
- Notas.
- Activo.

Los empleados inactivos no aparecen en los selectores del calendario.

### Sedes

Representan puntos de venta o lugares de operación.

Campos principales:

- Nombre.
- Ubicación.

### Requerimientos

Definen cuántas personas se necesitan por sede, categoría y día de la semana.

Cada requerimiento guarda cantidades para:

- Lunes.
- Martes.
- Miércoles.
- Jueves.
- Viernes.
- Sábado.
- Domingo.
- Festivo.

### Tareas

Permiten configurar tareas operativas que luego se asignan en el programador.

Campos principales:

- Nombre.
- Tipo de asignación:
  - Equipo completo.
  - Responsable específico.
- Descripción.

## Programador

El Programador es la pantalla principal del MVP. Está dividido en:

- Cronograma.
- Equipo.
- Demanda.
- Alertas.

### Cronograma

Permite seleccionar una semana y construir el calendario por sede.

Incluye:

- Tabla semanal por sede.
- Días de lunes a domingo.
- Puestos generados desde los requerimientos.
- Selectores de empleados activos.
- Colaboradores adicionales por día.
- Tareas por sede y día.
- Resumen de descansos.
- Guardado como borrador.
- Aprobación.
- Reapertura de calendario aprobado a borrador.
- Exportación PNG por sede cuando el calendario está aprobado.

Los calendarios se identifican por semana de trabajo. No se permite duplicar calendarios para el mismo rango semanal.

### Equipo

Vista informativa con los colaboradores activos involucrados en la semana.

Muestra una tabla con:

- Colaborador.
- Tipo: `fijo` o `temporal`.
- Descanso.
- Asignaciones.
- Detalle colapsable por empleado.

El detalle muestra información adicional como categoría, sede habitual, reemplazos, teléfono, líder, estado, asignaciones y notas.

### Demanda

Vista informativa de requerimientos configurados.

Muestra una tarjeta por sede y, dentro de cada sede, las cantidades requeridas por día y categoría.

### Alertas

Centraliza las inconsistencias detectadas en el calendario.

La sección tiene dos bloques:

- **Alertas:** situaciones pendientes.
- **Excepciones:** alertas omitidas con justificación.

Cada alerta puede omitirse con justificación. Al hacerlo, pasa a Excepciones y queda guardada dentro del calendario.

## Validaciones actuales

El MVP valida en frontend:

- Empleado que descansa más de un día.
- Empleado que descansa cero días.
- Empleado asignado más de una vez el mismo día.
- Empleado asignado con categoría incompatible.
- Descansos en viernes, sábado o domingo.

Además, en la vista de cronograma se resaltan visualmente:

- Descansos repetidos.
- Descansos en días no permitidos.
- Doble asignación.
- Categoría incompatible.

Cada alerta visual incluye un mensaje al pasar el mouse.

## Aprobación de calendarios

Un calendario puede estar en estado:

- `draft`: borrador.
- `approved`: aprobado.

Para aprobar un calendario:

1. Debe existir un borrador guardado.
2. No debe haber alertas pendientes.
3. Si existen alertas, todas deben estar justificadas como excepciones.

Cuando el calendario está aprobado:

- Se bloquea la edición del cronograma.
- Se bloquea la edición de tareas del calendario.
- Se bloquean colaboradores adicionales.
- Se habilita la descarga PNG por sede.

Para modificar un calendario aprobado, primero debe volver a borrador.

## Exportación PNG

Cada sede puede descargarse como imagen PNG cuando el calendario está aprobado.

La exportación captura únicamente la caja de la sede seleccionada, sin incluir el botón de descarga dentro de la imagen.

El navegador decide si descarga automáticamente en la carpeta de descargas o si pregunta la ubicación, según la configuración local del usuario.

## Endpoints principales

La API expone recursos REST:

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/categories` | Listar categorías |
| GET | `/api/categories/:id` | Consultar categoría |
| POST | `/api/categories` | Crear categoría |
| PATCH/PUT | `/api/categories/:id` | Actualizar categoría |
| DELETE | `/api/categories/:id` | Eliminar categoría |
| GET | `/api/employees` | Listar empleados |
| GET | `/api/employees/:id` | Consultar empleado |
| POST | `/api/employees` | Crear empleado |
| PATCH/PUT | `/api/employees/:id` | Actualizar empleado |
| DELETE | `/api/employees/:id` | Eliminar empleado |
| GET | `/api/sites` | Listar sedes |
| GET | `/api/sites/:id` | Consultar sede |
| POST | `/api/sites` | Crear sede |
| PATCH/PUT | `/api/sites/:id` | Actualizar sede |
| DELETE | `/api/sites/:id` | Eliminar sede |
| GET | `/api/staff-requirements` | Listar requerimientos |
| GET | `/api/staff-requirements/:id` | Consultar requerimiento |
| POST | `/api/staff-requirements` | Crear requerimiento |
| PATCH/PUT | `/api/staff-requirements/:id` | Actualizar requerimiento |
| DELETE | `/api/staff-requirements/:id` | Eliminar requerimiento |
| GET | `/api/tasks` | Listar tareas |
| GET | `/api/tasks/:id` | Consultar tarea |
| POST | `/api/tasks` | Crear tarea |
| PATCH/PUT | `/api/tasks/:id` | Actualizar tarea |
| DELETE | `/api/tasks/:id` | Eliminar tarea |
| GET | `/api/calendars` | Listar calendarios |
| GET | `/api/calendars/:id` | Consultar calendario |
| GET | `/api/calendars/week/:weekStartDate` | Consultar calendario por semana |
| POST | `/api/calendars` | Guardar borrador |
| PATCH | `/api/calendars/:id/approve` | Aprobar calendario |
| PATCH | `/api/calendars/:id/reopen` | Volver calendario aprobado a borrador |

## Instalación

Clonar el repositorio:

```bash
git clone <URL_DEL_REPOSITORIO>
cd burgerCalendar
```

Instalar dependencias de la raíz:

```bash
npm install
```

Instalar dependencias del backend:

```bash
cd backend
npm install
```

## Ejecución en desarrollo

Levantar backend:

```bash
cd backend
npm run dev
```

La API queda disponible en:

```text
http://localhost:3000
```

En otra terminal, levantar frontend desde la raíz:

```bash
npm run frontend
```

La aplicación queda disponible en:

```text
http://localhost:5173
```

## Scripts útiles

Desde `backend`:

```bash
npm run dev
npm run build
npm run test:services
npm run data:reset
```

Desde la raíz:

```bash
npm run frontend
```

## Pruebas

Las pruebas actuales validan servicios del backend sin levantar el servidor HTTP.

Desde `backend`:

```bash
npm run test:services
```

Actualmente cubren:

- Categorías.
- Empleados.
- Sedes.
- Requerimientos.
- Tareas.
- Calendarios.
- Persistencia de asignaciones, tareas y excepciones.
- Bloqueo de edición sobre calendario aprobado.

## Estado para pruebas reales

El repositorio quedó sincronizado con:

- MVP funcional del programador.
- JSON de datos limpios.
- Pruebas pasando.
- Build del backend pasando.
- Frontend validado sintácticamente.

Esto permite iniciar la carga de datos reales desde la configuración inicial y probar el flujo completo hasta aprobación y exportación PNG.

## Próximos pasos sugeridos

- Probar el MVP con datos reales.
- Revisar experiencia visual del PNG exportado en WhatsApp.
- Definir si las validaciones deben pasar del frontend al backend.
- Preparar despliegue en un ambiente real.
- Evaluar autenticación y roles de usuario.
- Mejorar manejo centralizado de errores.
- Documentar ejemplos de payload por endpoint si se requiere integración externa.

## Objetivo de aprendizaje

Este proyecto también funciona como ejercicio de formación en ingeniería de software.

Durante su construcción se practican:

- Diseño de API REST.
- Arquitectura backend por capas.
- TypeScript.
- Persistencia en JSON.
- Validaciones de negocio.
- Pruebas automatizadas.
- Diseño de UI/UX progresivo.
- Git y control de versiones.
- Preparación de hitos funcionales.

## Autor

German Felipe Ordoñez Arbelaez
