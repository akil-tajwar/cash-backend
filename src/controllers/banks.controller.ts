import { Request, Response, NextFunction } from "express";
import { getAllBanks } from "../services/banks.service";
import { requirePermission } from "../services/utils/jwt.utils";

export const getAllBanksController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    requirePermission(req, 'view_banks');
    const banks = await getAllBanks();
    res.json(banks);
  } catch (error) {
    next(error);
  }
};