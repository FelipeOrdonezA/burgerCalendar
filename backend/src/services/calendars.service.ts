import { randomUUID } from "node:crypto";
import { JsonFileRepository } from "../repositories/json-file.repository";
import type {
  Calendar,
  CalendarAssignmentSnapshot,
  CalendarExceptionSnapshot,
  CalendarInput,
  CalendarTaskSnapshot,
} from "../types/calendar";

const calendarsRepository = new JsonFileRepository<Calendar>("calendars.json");

export async function listCalendars(): Promise<Calendar[]> {
  const calendars = await calendarsRepository.findAll();
  return calendars.sort((a, b) => a.weekStartDate.localeCompare(b.weekStartDate));
}

export async function getCalendarById(id: string): Promise<Calendar | undefined> {
  return calendarsRepository.findById(id);
}

export async function getCalendarByWeek(weekStartDate: string): Promise<Calendar | undefined> {
  const calendars = await calendarsRepository.findAll();
  return calendars.find((calendar) => calendar.weekStartDate === weekStartDate);
}

export async function saveCalendarDraft(input: CalendarInput): Promise<Calendar> {
  const weekStartDate = normalizeDate(input.weekStartDate, "CALENDAR_WEEK_START_REQUIRED");
  const weekEndDate = normalizeDate(input.weekEndDate, "CALENDAR_WEEK_END_REQUIRED");
  const assignments = normalizeAssignments(input.assignments);
  const tasks = normalizeTasks(input.tasks);
  const exceptions = normalizeExceptions(input.exceptions);
  const calendars = await calendarsRepository.findAll();
  const index = calendars.findIndex((calendar) => calendar.weekStartDate === weekStartDate);
  const now = new Date().toISOString();

  if (index >= 0) {
    const current = calendars[index] as Calendar;
    if (current.status === "approved") {
      throw new Error("CALENDAR_APPROVED_LOCKED");
    }

    const updated: Calendar = {
      ...current,
      name: input.name?.trim() || buildCalendarName(weekStartDate, weekEndDate),
      weekEndDate,
      assignments,
      tasks,
      exceptions,
      notes: input.notes?.trim() || "",
      updatedAt: now,
    };

    calendars[index] = updated;
    await calendarsRepository.saveAll(calendars);
    return updated;
  }

  const duplicatedRange = calendars.some((calendar) => calendar.weekEndDate === weekEndDate);
  if (duplicatedRange) {
    throw new Error("CALENDAR_WEEK_DUPLICATED");
  }

  const calendar: Calendar = {
    id: randomUUID(),
    name: input.name?.trim() || buildCalendarName(weekStartDate, weekEndDate),
    weekStartDate,
    weekEndDate,
    status: "draft",
    assignments,
    tasks,
    exceptions,
    notes: input.notes?.trim() || "",
    createdAt: now,
    updatedAt: now,
  };

  calendars.push(calendar);
  await calendarsRepository.saveAll(calendars);
  return calendar;
}

export async function approveCalendar(id: string): Promise<Calendar | undefined> {
  const calendars = await calendarsRepository.findAll();
  const index = calendars.findIndex((calendar) => calendar.id === id);
  if (index === -1) return undefined;

  const current = calendars[index] as Calendar;
  const now = new Date().toISOString();
  const updated: Calendar = {
    ...current,
    status: "approved",
    approvedAt: now,
    updatedAt: now,
  };

  calendars[index] = updated;
  await calendarsRepository.saveAll(calendars);
  return updated;
}

export async function reopenCalendarDraft(id: string): Promise<Calendar | undefined> {
  const calendars = await calendarsRepository.findAll();
  const index = calendars.findIndex((calendar) => calendar.id === id);
  if (index === -1) return undefined;

  const current = calendars[index] as Calendar;
  const { approvedAt: _approvedAt, ...draftCalendar } = current;
  const updated: Calendar = {
    ...draftCalendar,
    status: "draft",
    updatedAt: new Date().toISOString(),
  };

  calendars[index] = updated;
  await calendarsRepository.saveAll(calendars);
  return updated;
}

function normalizeDate(value: string | undefined, errorCode: string): string {
  const date = value?.trim();
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new Error(errorCode);
  }

  return date;
}

function normalizeAssignments(assignments: CalendarAssignmentSnapshot[] | undefined): CalendarAssignmentSnapshot[] {
  if (!assignments) return [];
  if (!Array.isArray(assignments)) {
    throw new Error("CALENDAR_ASSIGNMENTS_INVALID");
  }

  return assignments.filter((assignment) => assignment.employeeId);
}

function normalizeTasks(tasks: CalendarTaskSnapshot[] | undefined): CalendarTaskSnapshot[] {
  if (!tasks) return [];
  if (!Array.isArray(tasks)) {
    throw new Error("CALENDAR_TASKS_INVALID");
  }

  return tasks.filter((task) => task.taskId);
}

function normalizeExceptions(exceptions: CalendarExceptionSnapshot[] | undefined): CalendarExceptionSnapshot[] {
  if (!exceptions) return [];
  if (!Array.isArray(exceptions)) {
    throw new Error("CALENDAR_EXCEPTIONS_INVALID");
  }

  return exceptions.filter((exception) => exception.alertId && exception.justification?.trim());
}

function buildCalendarName(weekStartDate: string, weekEndDate: string): string {
  return `Semana del ${weekStartDate} al ${weekEndDate}`;
}
