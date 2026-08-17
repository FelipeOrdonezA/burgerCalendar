import type { Request, Response } from "express";
import {
  approveCalendar,
  getCalendarById,
  getCalendarByWeek,
  listCalendars,
  reopenCalendarDraft,
  saveCalendarDraft,
} from "../services/calendars.service";

export async function getCalendars(_req: Request, res: Response): Promise<void> {
  const calendars = await listCalendars();
  res.status(200).json({ ok: true, data: calendars });
}

export async function getCalendar(req: Request, res: Response): Promise<void> {
  const calendar = await getCalendarById(String(req.params.id || ""));
  if (!calendar) {
    res.status(404).json({ ok: false, message: "Calendario no encontrado" });
    return;
  }

  res.status(200).json({ ok: true, data: calendar });
}

export async function getCalendarForWeek(req: Request, res: Response): Promise<void> {
  const calendar = await getCalendarByWeek(String(req.params.weekStartDate || ""));
  if (!calendar) {
    res.status(404).json({ ok: false, message: "Calendario no encontrado" });
    return;
  }

  res.status(200).json({ ok: true, data: calendar });
}

export async function postCalendarDraft(req: Request, res: Response): Promise<void> {
  try {
    const calendar = await saveCalendarDraft(req.body);
    res.status(200).json({ ok: true, data: calendar });
  } catch (error) {
    res.status(400).json({ ok: false, message: calendarErrorMessage(error) });
  }
}

export async function patchCalendarApproved(req: Request, res: Response): Promise<void> {
  const calendar = await approveCalendar(String(req.params.id || ""));
  if (!calendar) {
    res.status(404).json({ ok: false, message: "Calendario no encontrado" });
    return;
  }

  res.status(200).json({ ok: true, data: calendar });
}

export async function patchCalendarDraft(req: Request, res: Response): Promise<void> {
  const calendar = await reopenCalendarDraft(String(req.params.id || ""));
  if (!calendar) {
    res.status(404).json({ ok: false, message: "Calendario no encontrado" });
    return;
  }

  res.status(200).json({ ok: true, data: calendar });
}

function calendarErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    const messages: Record<string, string> = {
      CALENDAR_WEEK_START_REQUIRED: "La fecha inicial de la semana es obligatoria",
      CALENDAR_WEEK_END_REQUIRED: "La fecha final de la semana es obligatoria",
      CALENDAR_ASSIGNMENTS_INVALID: "Las asignaciones del calendario no son validas",
      CALENDAR_WEEK_DUPLICATED: "Ya existe un calendario para esa semana",
      CALENDAR_APPROVED_LOCKED: "El calendario aprobado debe volver a borrador antes de editarse",
    };

    return messages[error.message] || "No fue posible guardar el calendario";
  }

  return "No fue posible guardar el calendario";
}
