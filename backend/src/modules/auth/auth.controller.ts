import type { Request, Response } from "express";
import { AuthService } from "./auth.service";

export const AuthController = {
  async register(req: Request, res: Response) {
    const result = await AuthService.register(req.body);
    res.status(201).json(result);
  },

  async login(req: Request, res: Response) {
    const result = await AuthService.login(req.body);
    res.json(result);
  },

  async refresh(req: Request, res: Response) {
    const result = await AuthService.refresh(req.body.refreshToken);
    res.json(result);
  },

  async logout(req: Request, res: Response) {
    await AuthService.logout(req.body.refreshToken);
    res.status(204).send();
  },
};
