import type { Request, Response } from "express";
import { UsersService } from "./users.service";
import { signAccess, signRefresh } from "../../utils/jwt";
import bcrypt from "bcryptjs";
import { query } from "../../config/db";

export const UsersController = {
  async me(req: Request, res: Response) {
    const companyId = req.auth!.companyId;
    const userId = req.user!.id;
    res.json(await UsersService.getById(companyId, userId));
  },

  async list(req: Request, res: Response) {
    const companyId = req.auth!.companyId;
    res.json(await UsersService.listPaged(companyId, req.query));
  },
  async create(req: Request, res: Response) {
    const companyId = req.auth!.companyId;
    res.status(201).json(await UsersService.create(companyId, req.body));
  },
  async update(req: Request, res: Response) {
    const companyId = req.auth!.companyId;
    res.json(await UsersService.update(companyId, req.params.id, req.body));
  },

  async updateMe(req: Request, res: Response) {
    const companyId = req.auth!.companyId;
    const userId = req.user!.id;
    const result = await UsersService.updateMe(companyId, userId, req.body);

    if (result.emailChanged) {
      const payload = { companyId, email: result.user.email };
      const accessToken = signAccess(payload);
      const refreshToken = signRefresh(payload);
      const token_hash = await bcrypt.hash(refreshToken, 10);
      await query(`INSERT INTO refresh_tokens (company_id, token_hash) VALUES ($1,$2)`, [companyId, token_hash]);

      return res.json({
        user: result.user,
        auth: { companyId, userId: result.user.id, role: result.user.role, accessToken, refreshToken },
        passwordChanged: result.passwordChanged,
      });
    }

    return res.json({ user: result.user, passwordChanged: result.passwordChanged });
  },
};
