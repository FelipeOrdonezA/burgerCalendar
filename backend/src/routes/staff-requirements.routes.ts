import { Router } from "express";
import {
  getStaffRequirement,
  getStaffRequirements,
  patchStaffRequirement,
  postStaffRequirement,
  removeStaffRequirement,
} from "../controllers/staff-requirements.controller";

const staffRequirementsRoutes = Router();

staffRequirementsRoutes.get("/", getStaffRequirements);
staffRequirementsRoutes.get("/:id", getStaffRequirement);
staffRequirementsRoutes.post("/", postStaffRequirement);
staffRequirementsRoutes.patch("/:id", patchStaffRequirement);
staffRequirementsRoutes.put("/:id", patchStaffRequirement);
staffRequirementsRoutes.delete("/:id", removeStaffRequirement);

export default staffRequirementsRoutes;
