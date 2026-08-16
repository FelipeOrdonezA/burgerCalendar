import { Router } from "express";
import { getSite, getSites, patchSite, postSite, removeSite } from "../controllers/sites.controller";

const sitesRoutes = Router();

sitesRoutes.get("/", getSites);
sitesRoutes.get("/:id", getSite);
sitesRoutes.post("/", postSite);
sitesRoutes.patch("/:id", patchSite);
sitesRoutes.put("/:id", patchSite);
sitesRoutes.delete("/:id", removeSite);

export default sitesRoutes;
