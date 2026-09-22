import { randomUUID } from "node:crypto";
import { createRepository } from "../repositories/repository-factory";
import type { Site, SiteInput } from "../types/site";

const sitesRepository = createRepository<Site>("sites.json");

export async function listSites(): Promise<Site[]> {
  return sitesRepository.findAll();
}

export async function getSiteById(id: string): Promise<Site | undefined> {
  return sitesRepository.findById(id);
}

export async function createSite(input: SiteInput): Promise<Site> {
  const name = input.name?.trim();
  if (!name) {
    throw new Error("SITE_NAME_REQUIRED");
  }

  const { items: sites, version } = await sitesRepository.readSnapshot();
  const exists = sites.some((site) => site.name.toLowerCase() === name.toLowerCase());
  if (exists) {
    throw new Error("SITE_NAME_DUPLICATED");
  }

  const now = new Date().toISOString();
  const site: Site = {
    id: randomUUID(),
    name,
    location: input.location?.trim() || "",
    active: input.active ?? true,
    createdAt: now,
    updatedAt: now,
  };

  sites.push(site);
  await sitesRepository.saveAll(sites, version);
  return site;
}

export async function updateSite(id: string, input: SiteInput): Promise<Site | undefined> {
  const { items: sites, version } = await sitesRepository.readSnapshot();
  const index = sites.findIndex((site) => site.id === id);
  if (index === -1) return undefined;

  const current = sites[index] as Site;
  const nextName = input.name?.trim();
  if (nextName) {
    const duplicated = sites.some((site) => site.id !== id && site.name.toLowerCase() === nextName.toLowerCase());
    if (duplicated) {
      throw new Error("SITE_NAME_DUPLICATED");
    }
  }

  const updated: Site = {
    ...current,
    name: nextName || current.name,
    location: input.location !== undefined ? input.location.trim() : current.location,
    active: input.active ?? current.active,
    updatedAt: new Date().toISOString(),
  };

  sites[index] = updated;
  await sitesRepository.saveAll(sites, version);
  return updated;
}

export async function deleteSite(id: string): Promise<boolean> {
  const { items: sites, version } = await sitesRepository.readSnapshot();
  const nextSites = sites.filter((site) => site.id !== id);
  if (nextSites.length === sites.length) return false;

  await sitesRepository.saveAll(nextSites, version);
  return true;
}
