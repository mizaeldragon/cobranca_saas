import type { Request, Response } from "express";
import { ChargesService } from "./charges.service";

export const ChargesController = {
  async list(req: Request, res: Response) {
    const companyId = req.auth!.companyId;
    const items = await ChargesService.list(companyId);
    res.json(items);
  },

  async getById(req: Request, res: Response) {
    const companyId = req.auth!.companyId;
    const item = await ChargesService.getById(companyId, req.params.id);
    res.json(item);
  },

  async createManual(req: Request, res: Response) {
    const companyId = req.auth!.companyId;
    const created = await ChargesService.createManual(companyId, req.body);
    res.status(201).json(created);
  },

  async markPaid(req: Request, res: Response) {
    const companyId = req.auth!.companyId;
    const updated = await ChargesService.markPaid(companyId, req.params.id, { source: "manual" });
    res.json(updated);
  },
};
