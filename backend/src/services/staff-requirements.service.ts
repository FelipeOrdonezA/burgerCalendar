import { randomUUID } from "node:crypto";
import { JsonFileRepository } from "../repositories/json-file.repository";
import type {
  StaffRequirement,
  StaffRequirementInput,
  WeeklyStaffRequirement,
} from "../types/staff-requirement";
import { getCategoryById } from "./categories.service";
import { getSiteById } from "./sites.service";

const requirementsRepository = new JsonFileRepository<StaffRequirement>("staff-requirements.json");
const WEEKLY_KEYS: Array<keyof WeeklyStaffRequirement> = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
  "holiday",
];

export async function listStaffRequirements(): Promise<StaffRequirement[]> {
  return requirementsRepository.findAll();
}

export async function getStaffRequirementById(id: string): Promise<StaffRequirement | undefined> {
  return requirementsRepository.findById(id);
}

export async function createStaffRequirement(input: StaffRequirementInput): Promise<StaffRequirement> {
  const siteId = input.siteId?.trim();
  const categoryId = input.categoryId?.trim();
  const weeklyQuantities = normalizeWeeklyQuantities(input.weeklyQuantities);

  await validateStaffRequirement(siteId, categoryId, weeklyQuantities);

  const requirements = await requirementsRepository.findAll();
  const exists = requirements.some(
    (requirement) => requirement.siteId === siteId && requirement.categoryId === categoryId,
  );
  if (exists) {
    throw new Error("STAFF_REQUIREMENT_DUPLICATED");
  }

  const now = new Date().toISOString();
  const requirement: StaffRequirement = {
    id: randomUUID(),
    siteId: siteId as string,
    categoryId: categoryId as string,
    weeklyQuantities,
    notes: input.notes?.trim() || "",
    active: input.active ?? true,
    createdAt: now,
    updatedAt: now,
  };

  requirements.push(requirement);
  await requirementsRepository.saveAll(requirements);
  return requirement;
}

export async function updateStaffRequirement(
  id: string,
  input: StaffRequirementInput,
): Promise<StaffRequirement | undefined> {
  const requirements = await requirementsRepository.findAll();
  const index = requirements.findIndex((requirement) => requirement.id === id);
  if (index === -1) return undefined;

  const current = requirements[index] as StaffRequirement;
  const siteId = input.siteId?.trim() || current.siteId;
  const categoryId = input.categoryId?.trim() || current.categoryId;
  const weeklyQuantities = input.weeklyQuantities !== undefined
    ? normalizeWeeklyQuantities(input.weeklyQuantities)
    : current.weeklyQuantities;

  await validateStaffRequirement(siteId, categoryId, weeklyQuantities);

  const duplicated = requirements.some(
    (requirement) =>
      requirement.id !== id && requirement.siteId === siteId && requirement.categoryId === categoryId,
  );
  if (duplicated) {
    throw new Error("STAFF_REQUIREMENT_DUPLICATED");
  }

  const updated: StaffRequirement = {
    ...current,
    siteId,
    categoryId,
    weeklyQuantities,
    notes: input.notes !== undefined ? input.notes.trim() : current.notes,
    active: input.active ?? current.active,
    updatedAt: new Date().toISOString(),
  };

  requirements[index] = updated;
  await requirementsRepository.saveAll(requirements);
  return updated;
}

export async function deleteStaffRequirement(id: string): Promise<boolean> {
  const requirements = await requirementsRepository.findAll();
  const nextRequirements = requirements.filter((requirement) => requirement.id !== id);
  if (nextRequirements.length === requirements.length) return false;

  await requirementsRepository.saveAll(nextRequirements);
  return true;
}

async function validateStaffRequirement(
  siteId: string | undefined,
  categoryId: string | undefined,
  weeklyQuantities: WeeklyStaffRequirement,
): Promise<void> {
  if (!siteId) {
    throw new Error("STAFF_REQUIREMENT_SITE_REQUIRED");
  }
  if (!(await getSiteById(siteId))) {
    throw new Error("STAFF_REQUIREMENT_SITE_NOT_FOUND");
  }
  if (!categoryId) {
    throw new Error("STAFF_REQUIREMENT_CATEGORY_REQUIRED");
  }
  if (!(await getCategoryById(categoryId))) {
    throw new Error("STAFF_REQUIREMENT_CATEGORY_NOT_FOUND");
  }
  if (WEEKLY_KEYS.some((key) => !Number.isInteger(weeklyQuantities[key]) || weeklyQuantities[key] < 0)) {
    throw new Error("STAFF_REQUIREMENT_QUANTITY_INVALID");
  }
}

function normalizeWeeklyQuantities(input: Partial<WeeklyStaffRequirement> | undefined): WeeklyStaffRequirement {
  return {
    monday: Number(input?.monday ?? 0),
    tuesday: Number(input?.tuesday ?? 0),
    wednesday: Number(input?.wednesday ?? 0),
    thursday: Number(input?.thursday ?? 0),
    friday: Number(input?.friday ?? 0),
    saturday: Number(input?.saturday ?? 0),
    sunday: Number(input?.sunday ?? 0),
    holiday: Number(input?.holiday ?? 0),
  };
}
