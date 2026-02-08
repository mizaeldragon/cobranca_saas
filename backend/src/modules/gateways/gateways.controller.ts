import type { Request, Response } from "express";
import { GatewaysService } from "./gateways.service";

export const GatewaysController = {
  async list(req: Request, res: Response) {
    const companyId = req.auth?.companyId;
    if (!companyId) return res.status(401).json({ error: "Unauthorized" });
    const items = await GatewaysService.list(companyId);
    return res.json(items);
  },

  async create(req: Request, res: Response) {
    const companyId = req.auth?.companyId;
    if (!companyId) return res.status(401).json({ error: "Unauthorized" });
    const created = await GatewaysService.create(companyId, req.body);
    return res.status(201).json(created);
  },

  async update(req: Request, res: Response) {
    const companyId = req.auth?.companyId;
    if (!companyId) return res.status(401).json({ error: "Unauthorized" });
    const updated = await GatewaysService.update(companyId, req.params.id, req.body);
    return res.json(updated);
  },

  async activate(req: Request, res: Response) {
    const companyId = req.auth?.companyId;
    if (!companyId) return res.status(401).json({ error: "Unauthorized" });
    const updated = await GatewaysService.activate(companyId, req.params.id);
    return res.json(updated);
  },

  async remove(req: Request, res: Response) {
    const companyId = req.auth?.companyId;
    if (!companyId) return res.status(401).json({ error: "Unauthorized" });
    const removed = await GatewaysService.remove(companyId, req.params.id);
    return res.json(removed);
  },
};
