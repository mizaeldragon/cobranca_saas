import type { Request, Response } from "express";
import { ChargesService } from "./charges.service";

export const ChargesController = {
  async list(req: Request, res: Response) {
    const companyId = req.auth!.companyId;
    const result = await ChargesService.listPaged(companyId, req.query);
    res.json(result);
  },

  async getById(req: Request, res: Response) {
    const companyId = req.auth!.companyId;
    const item = await ChargesService.getById(companyId, req.params.id);
    res.json(item);
  },

  async update(req: Request, res: Response) {
    const companyId = req.auth!.companyId;
    const updated = await ChargesService.update(companyId, req.params.id, req.body);
    res.json(updated);
  },

  async cancel(req: Request, res: Response) {
    const companyId = req.auth!.companyId;
    const updated = await ChargesService.cancel(companyId, req.params.id);
    res.json(updated);
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

  async notify(req: Request, res: Response) {
    const companyId = req.auth!.companyId;
    const result = await ChargesService.notifyCharge(companyId, req.params.id);
    res.json(result);
  },
};
