import type { Request, Response } from "express";
import { UsersService } from "./users.service";

export const UsersController = {
  async list(req: Request, res: Response) {
    const companyId = req.auth!.companyId;
    res.json(await UsersService.list(companyId));
  },
  async create(req: Request, res: Response) {
    const companyId = req.auth!.companyId;
    res.status(201).json(await UsersService.create(companyId, req.body));
  },
  async update(req: Request, res: Response) {
    const companyId = req.auth!.companyId;
    res.json(await UsersService.update(companyId, req.params.id, req.body));
  },
};
