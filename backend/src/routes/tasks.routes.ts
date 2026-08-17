import { Router } from "express";
import { getTask, getTasks, patchTask, postTask, removeTask } from "../controllers/tasks.controller";

const tasksRoutes = Router();

tasksRoutes.get("/", getTasks);
tasksRoutes.get("/:id", getTask);
tasksRoutes.post("/", postTask);
tasksRoutes.patch("/:id", patchTask);
tasksRoutes.put("/:id", patchTask);
tasksRoutes.delete("/:id", removeTask);

export default tasksRoutes;
