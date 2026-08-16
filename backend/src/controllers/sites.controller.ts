import type { Request, Response } from "express";
import { createSite, deleteSite, getSiteById, listSites, updateSite } from "../services/sites.service";

export async function getSites(_req: Request, res: Response): Promise<void> {
  const sites = await listSites();
  res.status(200).json({ ok: true, data: sites });
}

export async function getSite(req: Request, res: Response): Promise<void> {
  const site = await getSiteById(String(req.params.id || ""));
  if (!site) {
    res.status(404).json({ ok: false, message: "Sede no encontrada" });
    return;
  }

  res.status(200).json({ ok: true, data: site });
}

export async function postSite(req: Request, res: Response): Promise<void> {
  try {
    const site = await createSite(req.body);
    res.status(201).json({ ok: true, data: site });
  } catch (error) {
    res.status(400).json({ ok: false, message: siteErrorMessage(error) });
  }
}

export async function patchSite(req: Request, res: Response): Promise<void> {
  try {
    const site = await updateSite(String(req.params.id || ""), req.body);
    if (!site) {
      res.status(404).json({ ok: false, message: "Sede no encontrada" });
      return;
    }

    res.status(200).json({ ok: true, data: site });
  } catch (error) {
    res.status(400).json({ ok: false, message: siteErrorMessage(error) });
  }
}

export async function removeSite(req: Request, res: Response): Promise<void> {
  const deleted = await deleteSite(String(req.params.id || ""));
  if (!deleted) {
    res.status(404).json({ ok: false, message: "Sede no encontrada" });
    return;
  }

  res.status(204).send();
}

function siteErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message === "SITE_NAME_DUPLICATED") {
    return "Ya existe una sede con ese nombre";
  }

  return "El nombre de la sede es obligatorio";
}
