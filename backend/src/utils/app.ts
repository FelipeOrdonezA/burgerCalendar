import express, { type Request, type Response, type NextFunction } from "express";
import { respondToStorageError } from "./storage-error-response";
import cors from "cors";
import categoriesRoutes from "../routes/categories.routes";
import employeesRoutes from "../routes/employees.routes";
import sitesRoutes from "../routes/sites.routes";
import staffRequirementsRoutes from "../routes/staff-requirements.routes";
import calendarsRoutes from "../routes/calendars.routes";
import tasksRoutes from "../routes/tasks.routes";

const app = express();

app.use(cors());
app.use(express.json({ limit: "4mb" }));
app.use("/api", (_req, res, next) => {
  res.setHeader("Cache-Control", "no-store");
  next();
});

app.use("/api/categories", categoriesRoutes);
app.use("/api/employees", employeesRoutes);
app.use("/api/sites", sitesRoutes);
app.use("/api/staff-requirements", staffRequirementsRoutes);
app.use("/api/calendars", calendarsRoutes);
app.use("/api/tasks", tasksRoutes);

app.get("/api/health", (_req: Request, res: Response) => {
  res.json({
    ok: true,
    message: "API Cronogramas Burger Paisa funcionando",
  });
});

app.use("/api", (_req, res) => {
  res.status(404).json({ ok: false, message: "Recurso no encontrado." });
});

app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (respondToStorageError(error, res)) return;
  const status = (error as { status?: number })?.status;
  if (status === 400 || status === 413) {
    res.status(status).json({ ok: false, message: status === 413
      ? "La solicitud excede el limite de 4 MB."
      : "El cuerpo de la solicitud no es un JSON valido." });
    return;
  }
  console.error("API request failed", error instanceof Error ? error.name : "UnknownError");
  res.status(500).json({ ok: false, message: "No fue posible completar la operacion." });
});

export default app;
