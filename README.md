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

El proyecto se encuentra en desarrollo y ya alcanzo su primer hito funcional: la configuracion inicial de la aplicacion.

Este hito cubre las entidades que se configuran al inicio y luego solo se modifican cuando cambia la operacion:

- Categorias o cargos operativos.
- Empleados asociados a una categoria.
- Sedes o puntos de venta.
- Requerimientos de personal por sede, categoria, dia de la semana y festivo.

La informacion se persiste en archivos JSON dentro de `backend/src/data`, sin base de datos externa para esta fase del MVP.

## Tecnologías

### Backend

- Node.js
- Express
- TypeScript
- CORS

### Frontend

- HTML
- CSS
- JavaScript
- Servidor estatico local con `serve`

### Herramientas de desarrollo

- Git
- GitHub
- npm
- Nodemon

## Arquitectura inicial

El backend utiliza una separación por responsabilidades:

```text
src/
├── controllers/
├── data/
├── repositories/
├── routes/
├── scripts/
├── services/
├── tests/
├── types/
├── utils/
│   └── app.ts
│   └── server.ts
```

### Responsabilidad de cada capa

- **Routes:** definen los endpoints y conectan cada ruta con su controlador.
- **Controllers:** reciben la petición HTTP y construyen la respuesta.
- **Services:** contienen la lógica de negocio.
- **Repositories:** administran el acceso a la base de datos.
- **Middlewares:** procesan peticiones antes o después de los controladores.
- **Schemas:** validan la estructura de los datos recibidos.
- **Types:** contienen tipos e interfaces de TypeScript.
- **Scripts:** contienen tareas manuales de mantenimiento, como reiniciar archivos JSON.
- **Data:** contiene los archivos JSON que actuan como almacenamiento del MVP.

## Hito 1: configuracion inicial

La primera fase funcional permite administrar los datos base que necesita el futuro generador de cronogramas.

### Categorias

Las categorias representan cargos o tipos de personal, por ejemplo:

- Cajero.
- Planchero.
- Atencion.
- Apoyo temporal.

Cada categoria puede marcarse como temporal. Esta marca se usara mas adelante para excluir empleados temporales de validaciones como descanso semanal obligatorio.

### Empleados

Los empleados se crean con:

- Nombre.
- Categoria.
- Telefono opcional.
- Notas opcionales.

La categoria permite que el sistema entienda que rol puede cumplir la persona.

### Sedes

Las sedes representan los puntos de venta o lugares de operacion. Por ahora tienen:

- Nombre.
- Ubicacion.

### Requerimientos de personal

Los requerimientos definen cuantas personas se necesitan por sede y categoria.

Cada requerimiento guarda cantidades para:

- Lunes.
- Martes.
- Miercoles.
- Jueves.
- Viernes.
- Sabado.
- Domingo.
- Festivo.

Esto permite modelar casos como una sede que requiere dos plancheros de lunes a jueves, tres de viernes a domingo y tres en festivos.

## Persistencia en JSON

Durante esta fase no se usa base de datos. Cada entidad se guarda en un archivo JSON dentro de `backend/src/data`:

```text
categories.json
employees.json
sites.json
staff-requirements.json
```

Para limpiar los datos de prueba y volver a un estado vacio:

```bash
cd backend
npm run data:reset
```

El script detecta automaticamente los archivos `.json` ubicados directamente en `backend/src/data` y los reinicia a arreglos vacios.

## Endpoints principales

La API expone recursos REST para la configuracion inicial:

| Metodo | Endpoint | Descripcion |
|---|---|---|
| GET | `/api/categories` | Listar categorias |
| POST | `/api/categories` | Crear categoria |
| PATCH | `/api/categories/:id` | Actualizar categoria |
| DELETE | `/api/categories/:id` | Eliminar categoria |
| GET | `/api/employees` | Listar empleados |
| POST | `/api/employees` | Crear empleado |
| PATCH | `/api/employees/:id` | Actualizar empleado |
| DELETE | `/api/employees/:id` | Eliminar empleado |
| GET | `/api/sites` | Listar sedes |
| POST | `/api/sites` | Crear sede |
| PATCH | `/api/sites/:id` | Actualizar sede |
| DELETE | `/api/sites/:id` | Eliminar sede |
| GET | `/api/staff-requirements` | Listar requerimientos |
| POST | `/api/staff-requirements` | Crear requerimiento |
| PATCH | `/api/staff-requirements/:id` | Actualizar requerimiento |
| DELETE | `/api/staff-requirements/:id` | Eliminar requerimiento |

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

## Pruebas

El backend cuenta con pruebas de servicios para validar la logica sin levantar el servidor HTTP.

Desde `backend`:

```bash
npm run test:services
```

Actualmente las pruebas cubren:

- Categorias.
- Empleados.
- Sedes.
- Requerimientos de personal.

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

## Ejemplo de creacion de un requerimiento

Petición:

```http
POST /api/staff-requirements
Content-Type: application/json
```

Cuerpo:

```json
{
  "siteId": "id-de-la-sede",
  "categoryId": "id-de-la-categoria",
  "weeklyQuantities": {
    "monday": 2,
    "tuesday": 2,
    "wednesday": 2,
    "thursday": 2,
    "friday": 3,
    "saturday": 3,
    "sunday": 3,
    "holiday": 3
  },
  "notes": "Refuerzo de fin de semana"
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

- Mejorar la edicion desde frontend.
- Implementar manejo centralizado de errores.
- Modelar restricciones y reglas del cronograma.
- Implementar el generador de horarios.
- Validar descanso semanal excluyendo categorias temporales.
- Generar una propuesta semanal de turnos.
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
