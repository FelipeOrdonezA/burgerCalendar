import express, { type Request, type Response } from "express";
import cors from "cors";
import employeesRoutes from "../routes/employees.routes";

const app = express();

app.use(cors());
app.use(express.json());


app.get("/", (_req: Request, res: Response) => {
  res.send("Servidor Express con TypeScript y Node.js funcionando correctamente");
});

app.use("/api/employees", employeesRoutes);

app.get("/api/health", (_req: Request, res: Response) => {
  res.json({
    ok: true,
    message: "API Cronogramas Burger Paisa funcionando",
  });
});

export default app;