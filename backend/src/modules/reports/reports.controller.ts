import type { Request, Response } from "express";
import { ReportsService } from "./reports.service";

export const ReportsController = {
  async summary(req: Request, res: Response) {
    const companyId = req.auth!.companyId;
    const from = String(req.query.from ?? "").slice(0,10) || null;
    const to = String(req.query.to ?? "").slice(0,10) || null;
    res.json(await ReportsService.summary(companyId, { from, to }));
  },
  async mrr(req: Request, res: Response) {
    const companyId = req.auth!.companyId;
    res.json(await ReportsService.mrr(companyId));
  },
};
