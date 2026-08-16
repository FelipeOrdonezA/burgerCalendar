import { randomUUID } from "node:crypto";
import { JsonFileRepository } from "../repositories/json-file.repository";
import type { Category, CategoryInput } from "../types/category";

const categoriesRepository = new JsonFileRepository<Category>("categories.json");

export async function listCategories(): Promise<Category[]> {
  return categoriesRepository.findAll();
}

export async function getCategoryById(id: string): Promise<Category | undefined> {
  return categoriesRepository.findById(id);
}

export async function createCategory(input: CategoryInput): Promise<Category> {
  const name = input.name?.trim();
  if (!name) {
    throw new Error("CATEGORY_NAME_REQUIRED");
  }

  const categories = await categoriesRepository.findAll();
  const exists = categories.some((category) => category.name.toLowerCase() === name.toLowerCase());
  if (exists) {
    throw new Error("CATEGORY_NAME_DUPLICATED");
  }

  const now = new Date().toISOString();
  const category: Category = {
    id: randomUUID(),
    name,
    description: input.description?.trim() || "",
    temporary: input.temporary ?? false,
    active: input.active ?? true,
    createdAt: now,
    updatedAt: now,
  };

  categories.push(category);
  await categoriesRepository.saveAll(categories);
  return category;
}

export async function updateCategory(id: string, input: CategoryInput): Promise<Category | undefined> {
  const categories = await categoriesRepository.findAll();
  const index = categories.findIndex((category) => category.id === id);
  if (index === -1) return undefined;

  const current = categories[index] as Category;
  const nextName = input.name?.trim();
  if (nextName) {
    const duplicated = categories.some(
      (category) => category.id !== id && category.name.toLowerCase() === nextName.toLowerCase(),
    );
    if (duplicated) {
      throw new Error("CATEGORY_NAME_DUPLICATED");
    }
  }

  const updated: Category = {
    ...current,
    name: nextName || current.name,
    description: input.description !== undefined ? input.description.trim() : current.description,
    temporary: input.temporary ?? current.temporary,
    active: input.active ?? current.active,
    updatedAt: new Date().toISOString(),
  };

  categories[index] = updated;
  await categoriesRepository.saveAll(categories);
  return updated;
}

export async function deleteCategory(id: string): Promise<boolean> {
  const categories = await categoriesRepository.findAll();
  const nextCategories = categories.filter((category) => category.id !== id);
  if (nextCategories.length === categories.length) return false;

  await categoriesRepository.saveAll(nextCategories);
  return true;
}
