import { randomUUID } from "node:crypto";
import { JsonFileRepository } from "../repositories/json-file.repository";
import type { Task, TaskAssignmentMode, TaskInput } from "../types/task";

const tasksRepository = new JsonFileRepository<Task>("tasks.json");
const ASSIGNMENT_MODES: TaskAssignmentMode[] = ["team", "person"];

export async function listTasks(): Promise<Task[]> {
  return tasksRepository.findAll();
}

export async function getTaskById(id: string): Promise<Task | undefined> {
  return tasksRepository.findById(id);
}

export async function createTask(input: TaskInput): Promise<Task> {
  const name = input.name?.trim();
  const assignmentMode = normalizeAssignmentMode(input.assignmentMode);
  if (!name) {
    throw new Error("TASK_NAME_REQUIRED");
  }

  const tasks = await tasksRepository.findAll();
  const exists = tasks.some((task) => task.name.toLowerCase() === name.toLowerCase());
  if (exists) {
    throw new Error("TASK_NAME_DUPLICATED");
  }

  const now = new Date().toISOString();
  const task: Task = {
    id: randomUUID(),
    name,
    description: input.description?.trim() || "",
    assignmentMode,
    active: input.active ?? true,
    createdAt: now,
    updatedAt: now,
  };

  tasks.push(task);
  await tasksRepository.saveAll(tasks);
  return task;
}

export async function updateTask(id: string, input: TaskInput): Promise<Task | undefined> {
  const tasks = await tasksRepository.findAll();
  const index = tasks.findIndex((task) => task.id === id);
  if (index === -1) return undefined;

  const current = tasks[index] as Task;
  const nextName = input.name?.trim();
  if (nextName) {
    const duplicated = tasks.some((task) => task.id !== id && task.name.toLowerCase() === nextName.toLowerCase());
    if (duplicated) {
      throw new Error("TASK_NAME_DUPLICATED");
    }
  }

  const updated: Task = {
    ...current,
    name: nextName || current.name,
    description: input.description !== undefined ? input.description.trim() : current.description,
    assignmentMode: input.assignmentMode !== undefined
      ? normalizeAssignmentMode(input.assignmentMode)
      : current.assignmentMode,
    active: input.active ?? current.active,
    updatedAt: new Date().toISOString(),
  };

  tasks[index] = updated;
  await tasksRepository.saveAll(tasks);
  return updated;
}

export async function deleteTask(id: string): Promise<boolean> {
  const tasks = await tasksRepository.findAll();
  const nextTasks = tasks.filter((task) => task.id !== id);
  if (nextTasks.length === tasks.length) return false;

  await tasksRepository.saveAll(nextTasks);
  return true;
}

function normalizeAssignmentMode(assignmentMode: TaskAssignmentMode | undefined): TaskAssignmentMode {
  if (!assignmentMode) return "team";
  if (!ASSIGNMENT_MODES.includes(assignmentMode)) {
    throw new Error("TASK_ASSIGNMENT_MODE_INVALID");
  }

  return assignmentMode;
}
