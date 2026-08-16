# Burger Calendar

Aplicación web para la gestión y generación de cronogramas semanales del equipo de Burger Paisa.

El proyecto busca centralizar la programación del personal de los diferentes puntos de venta, aplicar reglas de negocio y reducir errores en la asignación de trabajadores, cargos y días de descanso.

## Problema que resuelve

Burger Paisa administra varios puntos de venta con necesidades de personal diferentes según el día de la semana, el cargo y las condiciones operativas.

La elaboración manual de los cronogramas puede generar problemas como:

- Falta de personal en un punto de venta.
- Asignación incorrecta de cargos.
- Trabajadores sin su descanso semanal.
- Descansos en días de alta demanda.
- Asignación simultánea de un trabajador en dos puntos.
- Incumplimiento de restricciones especiales de una semana.

Burger Calendar busca automatizar y validar este proceso.

## Puntos de venta

Actualmente el sistema contempla los siguientes establecimientos:

- Burger Zona Rosa.
- Burger La 16.
- Arepaisa.

## Funcionalidades previstas

- Gestión de empleados.
- Gestión de cargos.
- Gestión de puntos de venta.
- Configuración de necesidades mínimas de personal.
- Registro de restricciones semanales.
- Asignación de descansos.
- Generación de cronogramas.
- Validación de cobertura por punto de venta y cargo.
- Consulta de cronogramas semanales.
- Detección de conflictos en las asignaciones.

## Estado actual

El proyecto se encuentra en desarrollo.

Actualmente se está implementando la API REST del backend y se han creado las primeras rutas CRUD para el recurso de empleados.

Por el momento, los controladores devuelven respuestas de prueba para validar correctamente el flujo:

```text
Petición HTTP
    ↓
Ruta
    ↓
Controlador
    ↓
Respuesta HTTP
```

## Tecnologías

### Backend

- Node.js
- Express
- TypeScript
- CORS

### Herramientas de desarrollo

- Git
- GitHub
- npm
- Nodemon

## Arquitectura inicial

El backend utiliza una separación por responsabilidades:

```text
src/
├── utils/
│   └── app.ts
│   └──server.ts
├── routes/
│   └── employees.routes.ts
├── controllers/
│   └── employees.controller.ts
├── services/
├── repositories/
├── middlewares/
├── schemas/
└── types/
```

### Responsabilidad de cada capa

- **Routes:** definen los endpoints y conectan cada ruta con su controlador.
- **Controllers:** reciben la petición HTTP y construyen la respuesta.
- **Services:** contienen la lógica de negocio.
- **Repositories:** administran el acceso a la base de datos.
- **Middlewares:** procesan peticiones antes o después de los controladores.
- **Schemas:** validan la estructura de los datos recibidos.
- **Types:** contienen tipos e interfaces de TypeScript.

## Endpoints de empleados

La API utiliza el prefijo:

```http
/api/employees
```

Endpoints CRUD previstos:

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/employees` | Obtener todos los empleados |
| GET | `/api/employees/:id` | Obtener un empleado por identificador |
| POST | `/api/employees` | Crear un empleado |
| PATCH | `/api/employees/:id` | Actualizar parcialmente un empleado |
| DELETE | `/api/employees/:id` | Eliminar un empleado |

## Códigos HTTP utilizados

| Código | Significado | Uso |
|---|---|---|
| 200 | OK | Consulta o actualización exitosa |
| 201 | Created | Recurso creado correctamente |
| 204 | No Content | Operación exitosa sin cuerpo de respuesta |
| 400 | Bad Request | Petición o datos inválidos |
| 401 | Unauthorized | Usuario no autenticado |
| 403 | Forbidden | Usuario sin permisos |
| 404 | Not Found | Recurso no encontrado |
| 409 | Conflict | Conflicto con datos existentes |
| 422 | Unprocessable Entity | Incumplimiento de una regla de validación |
| 500 | Internal Server Error | Error interno inesperado |

## Instalación

Clona el repositorio:

```bash
git clone <URL_DEL_REPOSITORIO>
```

Ingresa a la carpeta del proyecto:

```bash
cd burgerCalendar
```

Instala las dependencias:

```bash
npm install
```

Si el backend tiene su propio `package.json`, ingresa a la carpeta correspondiente:

```bash
cd backend
npm install
```

## Ejecución en desarrollo

Levanta el backend desde la carpeta `backend`:

```bash
cd backend
npm run dev
```

La API inicia en:

```text
http://localhost:3000
```

En otra terminal, desde la raiz del proyecto, levanta el frontend:

```bash
npm run frontend
```

La vista web inicia en:

```text
http://localhost:5173
```

## Endpoints de verificación

### Ruta principal

```http
GET /
```

Respuesta esperada:

```text
Servidor Express con TypeScript y Node.js funcionando correctamente
```

### Estado de la API

```http
GET /api/health
```

Respuesta esperada:

```json
{
  "ok": true,
  "message": "API Cronogramas Burger Paisa funcionando"
}
```

## Ejemplo de creación de un empleado

Petición:

```http
POST /api/employees
Content-Type: application/json
```

Cuerpo:

```json
{
  "name": "Carlos Gómez",
  "role": "cashier",
  "store": "Burger Zona Rosa"
}
```

Respuesta de prueba:

```json
{
  "ok": true,
  "message": "Empleado creado correctamente",
  "data": {
    "name": "Carlos Gómez",
    "role": "cashier",
    "store": "Burger Zona Rosa"
  }
}
```

## Convenciones del proyecto

### Archivos

Se utiliza minúscula y sufijo de responsabilidad:

```text
employees.routes.ts
employees.controller.ts
employees.service.ts
employees.repository.ts
```

### Código

- Clases e interfaces: `PascalCase`.
- Variables y funciones: `camelCase`.
- Constantes globales: `UPPER_SNAKE_CASE`.
- URLs: minúsculas y recursos en plural.

Ejemplos:

```ts
interface Employee {}

function createEmployee() {}

const DEFAULT_PORT = 3000;
```

## Principios de diseño

El proyecto busca aplicar:

- Separación de responsabilidades.
- Arquitectura modular.
- API REST orientada a recursos.
- Tipado estático con TypeScript.
- Validación de datos.
- Manejo coherente de códigos HTTP.
- Reglas de negocio independientes de Express.
- Código mantenible y testeable.

## Próximos pasos

- Definir el modelo de datos de empleados.
- Implementar validaciones de entrada.
- Crear la capa de servicios.
- Configurar la conexión con la base de datos.
- Persistir empleados.
- Implementar manejo centralizado de errores.
- Crear pruebas unitarias.
- Modelar restricciones y reglas del cronograma.
- Implementar el generador de horarios.
- Documentar la API.

## Objetivo de aprendizaje

Este proyecto también se desarrolla como ejercicio de formación en ingeniería de software.

Durante su construcción se practican conceptos como:

- Diseño de APIs REST.
- Arquitectura backend.
- TypeScript.
- Manejo de errores.
- Persistencia de datos.
- Pruebas automatizadas.
- Git y control de versiones.
- Despliegue de aplicaciones Node.js.

## Autor

German Felipe Ordoñez Arbelaez
