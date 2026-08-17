import { Router } from "express";
import {
  getCalendar,
  getCalendarForWeek,
  getCalendars,
  patchCalendarApproved,
  patchCalendarDraft,
  postCalendarDraft,
} from "../controllers/calendars.controller";

const calendarsRoutes = Router();

calendarsRoutes.get("/", getCalendars);
calendarsRoutes.get("/week/:weekStartDate", getCalendarForWeek);
calendarsRoutes.get("/:id", getCalendar);
calendarsRoutes.post("/", postCalendarDraft);
calendarsRoutes.patch("/:id/approve", patchCalendarApproved);
calendarsRoutes.patch("/:id/reopen", patchCalendarDraft);

export default calendarsRoutes;
