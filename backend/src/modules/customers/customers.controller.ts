import type { Request, Response } from "express";
import { CustomersService } from "./customers.service";

export const CustomersController = {
  async list(req: Request, res: Response) {
    const companyId = req.auth!.companyId;
    const result = await CustomersService.listPaged(companyId, req.query);
    res.json(result);
  },

  async create(req: Request, res: Response) {
    const companyId = req.auth!.companyId;
    const created = await CustomersService.create(companyId, req.body);
    res.status(201).json(created);
  },

  async update(req: Request, res: Response) {
    const companyId = req.auth!.companyId;
    const updated = await CustomersService.update(companyId, req.params.id, req.body);
    res.json(updated);
  },

  async remove(req: Request, res: Response) {
    const companyId = req.auth!.companyId;
    await CustomersService.remove(companyId, req.params.id);
    res.status(204).send();
  },
};
