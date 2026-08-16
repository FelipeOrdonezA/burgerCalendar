import { Router } from "express";
import {
  getCategories,
  getCategory,
  patchCategory,
  postCategory,
  removeCategory,
} from "../controllers/categories.controller";

const categoriesRoutes = Router();

categoriesRoutes.get("/", getCategories);
categoriesRoutes.get("/:id", getCategory);
categoriesRoutes.post("/", postCategory);
categoriesRoutes.patch("/:id", patchCategory);
categoriesRoutes.put("/:id", patchCategory);
categoriesRoutes.delete("/:id", removeCategory);

export default categoriesRoutes;
