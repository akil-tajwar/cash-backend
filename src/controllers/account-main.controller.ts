
import { Request, Response } from "express";
import {
  createAccountMain,
  getAccountMainById,
  getAllAccountMains,
  updateAccountMain,
  deleteAccountMain,
} from "../services/account-main.service";

export const createAccountMainController = async (req: Request, res: Response) => {
  try {
    const accountMain = await createAccountMain(req.body);
    res.status(201).json(accountMain);
  } catch (error) {
    throw error
  }
};

export const getAccountMainByIdController = async (req: Request, res: Response) => {
  try {
    const accountMain = await getAccountMainById(Number(req.params.id));
    res.status(200).json(accountMain);
  } catch (error) {
    throw error
  }
};

export const getAllAccountMainsController = async (_req: Request, res: Response) => {
  try {
    const accountMains = await getAllAccountMains();
    res.status(200).json(accountMains);
  } catch (error) {
    throw error
  }
};

export const updateAccountMainController = async (req: Request, res: Response) => {
  try {
    const accountMain = await updateAccountMain(Number(req.params.id), req.body);
    res.status(200).json(accountMain);
  } catch (error) {
    throw error
  }
};

export const deleteAccountMainController = async (req: Request, res: Response) => {
  try {
    const result = await deleteAccountMain(Number(req.params.id));
    res.status(200).json(result);
  } catch (error) {
    throw error
  }
};
