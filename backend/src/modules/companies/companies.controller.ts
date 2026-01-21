import type { Request, Response } from "express";
import { CompaniesService } from "./companies.service";

export const CompaniesController = {
  async me(req: Request, res: Response) {
    const companyId = req.auth!.companyId;
    const company = await CompaniesService.getMe(companyId);
    res.json(company);
  },

  async updateMe(req: Request, res: Response) {
    const companyId = req.auth!.companyId;
    const updated = await CompaniesService.updateMe(companyId, req.body);
    res.json(updated);
  },
};
