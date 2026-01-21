import type { Request, Response } from "express";
import { SubscriptionsService } from "./subscriptions.service";

export const SubscriptionsController = {
  async list(req: Request, res: Response) {
    const companyId = req.auth!.companyId;
    const result = await SubscriptionsService.listPaged(companyId, req.query);
    res.json(result);
  },

  async create(req: Request, res: Response) {
    const companyId = req.auth!.companyId;
    const created = await SubscriptionsService.create(companyId, req.body);
    res.status(201).json(created);
  },

  async update(req: Request, res: Response) {
    const companyId = req.auth!.companyId;
    const updated = await SubscriptionsService.update(companyId, req.params.id, req.body);
    res.json(updated);
  },

  async remove(req: Request, res: Response) {
    const companyId = req.auth!.companyId;
    await SubscriptionsService.remove(companyId, req.params.id);
    res.status(204).send();
  },
};
