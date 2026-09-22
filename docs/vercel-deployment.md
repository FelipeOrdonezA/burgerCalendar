# Despliegue en Vercel desde GitHub

## Configuracion del proyecto

Conecta el repositorio completo. Usa **Root Directory: raiz del repositorio**
(sin seleccionar `backend` ni `frontend`), **Framework Preset: Express** y
**Node.js: 24.x**.

| Campo | Valor |
| --- | --- |
| Build Command | `npm run build` |
| Output Directory | Dejar el valor predeterminado de Express (`N/A`), con Override desactivado |
| Install Command | `npm ci && npm --prefix backend ci` |
| Development Command | Dejar predeterminado, con Override desactivado |

`vercel.json` ya declara el framework, la instalacion y el build. No configures
`backend/dist` como Output Directory: contiene el backend, no el sitio estatico.
El adaptador de Express sirve automaticamente los archivos de `public/`.
Development Command no inicia los procesos de produccion.

Los dos `npm ci` instalan las dependencias de los dos `package-lock.json`.
El build ejecuta TypeScript en `backend`, genera `backend/dist` y copia solo
`index.html`, `app.js` y `styles.css` del frontend a `public/`.
Vercel empaqueta `app.js` de la raiz como una funcion Express y sirve el frontend
desde su CDN. `/api/*` conserva todas las rutas existentes.

Un push a la rama configurada como Production Branch despliega produccion.
Las ramas y PR habilitados para Preview generan despliegues de prueba.
No se ejecuta `npm run dev` ni `npm run frontend` durante el despliegue.
No se necesita un comando de deploy local.

## Almacenamiento

1. Crea un Blob store **Private** para Production y conectalo al proyecto.
2. Crea otro store **Private** para Preview y conectalo solo a Preview.
3. Configura `STORAGE_DRIVER=blob` en ambos entornos.
4. Conserva las variables que genera la conexion del store. El SDK utiliza
   `BLOB_STORE_ID` y `VERCEL_OIDC_TOKEN`, o `BLOB_READ_WRITE_TOKEN` como alternativa.
5. Despliega de nuevo si cambias la conexion o las variables.

Los archivos se guardan con rutas estables:

```text
data/calendars.json
data/categories.json
data/employees.json
data/sites.json
data/staff-requirements.json
data/tasks.json
```

Sin configuracion, un despliegue Vercel usa Blob y un proceso local usa disco.
Se rechaza `STORAGE_DRIVER=local` en despliegues Vercel para no perder datos.
En local, las credenciales de Blob no activan Blob por si solas.
La carpeta local predeterminada es `backend/src/data`, independientemente del
directorio de ejecucion. `DATA_DIR` permite cambiarla mediante una variable del
proceso. Los comandos de desarrollo no cargan `.env.local` automaticamente.

Una coleccion inexistente se lee como vacia y se crea al guardar por primera vez.
Errores de permisos, red o JSON corrupto producen HTTP 503 y no inicializan datos.
Las lecturas de Blob omiten la cache. Las escrituras usan el ETag de la lectura
como precondicion: si otra solicitud modifico ese archivo, la API devuelve 409.
Recarga la pagina y vuelve a aplicar tus cambios si aparece ese mensaje.
Esto protege operaciones concurrentes del servidor; no detecta un formulario
antiguo que un usuario envie despues de que otra operacion ya haya terminado.
No existen transacciones entre distintos archivos. En local, el bloqueo de
escritura coordina un unico proceso del servidor, no multiples procesos.

La API permanece abierta por decision del MVP. Los archivos de Blob son privados,
pero cualquier persona con acceso a la API puede consultar y modificar los datos.
Las credenciales tecnicas nunca se incluyen en el frontend.

## Desarrollo y pruebas locales

Con Node.js 24, instala desde la raiz:

```bash
npm ci
npm --prefix backend ci
```

Inicia ambos procesos desde la raiz con:

```bash
npm run dev:all
```

O usa dos terminales con `npm run dev` y `npm run frontend`.
La interfaz esta en `http://localhost:5173` y la API en `http://localhost:3000/api`.

```bash
npm run build
npm test
```

Las pruebas usan carpetas temporales, no los JSON operativos. Incluyen servicios,
persistencia local, un cliente Blob simulado y respuestas HTTP. No requieren un
store real. La validacion remota debe hacerse en Preview: guardar un calendario,
recargar, aprobar/reabrir y comprobar que sobrevive a otro despliegue.

En PowerShell, si la politica del equipo bloquea `npm.ps1`, usa `npm.cmd` en lugar
de `npm`; por ejemplo, `npm.cmd run dev:all`.

## Importacion unica de los datos locales

El despliegue no importa datos ni ejecuta `data:reset`. Los JSON locales siguen
ignorados por Git. Para arrancar sin datos, simplemente usa la configuracion de
la aplicacion; las colecciones se crearan al guardar.

Para conservar los datos actuales:

1. Haz una copia de respaldo de `backend/src/data`.
2. Antes de utilizar la aplicacion remota, copia `.env.example` a `.env.local`
   en la raiz y configura `BLOB_READ_WRITE_TOKEN` del store destino. Evita mezclar
   credenciales de otros stores en el entorno del proceso.
3. Ejecuta desde la raiz:

   ```bash
   npm run data:import:blob -- --confirm
   ```

El script carga `.env.local`, valida que los seis JSON sean colecciones con IDs
no vacios y unicos, comprueba que ninguno de los seis archivos exista en el destino,
los sube sin modificar objetos ni IDs y verifica los datos mediante una lectura.
No exige que referencias historicas de calendarios sigan existiendo en catalogos.
La importacion nunca sobrescribe archivos, incluso si hay una carrera con otra
solicitud. No se ejecuta como parte del build ni de las pruebas.

La importacion de seis archivos no es una transaccion: si falla a mitad, algunos
pueden haberse subido. Revisa el destino y los mensajes antes de repetir; el script
rechazara los archivos ya existentes. No uses la app mientras importas.

## Verificacion despues del primer despliegue

- `/` muestra el frontend y carga CSS/JavaScript.
- `/api/health` devuelve `ok: true` (solo comprueba que la API responde).
- `/api/tasks` comprueba ademas el acceso a Blob.
- Crear y editar una tarea persiste despues de recargar y de redesplegar.
- Production y Preview muestran datos independientes.

## Referencias

- [Express en Vercel](https://vercel.com/docs/frameworks/backend/express)
- [SDK de Blob](https://vercel.com/docs/vercel-blob/using-blob-sdk)
- [Conexion de Blob](https://vercel.com/docs/vercel-blob/server-upload)
