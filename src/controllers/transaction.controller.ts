
import { Request, Response } from "express";
import {
  createTransaction,
  deleteTransaction,
  getAllTransactions,
  getTransactionById,
  updateTransaction,
} from "../services/transaction.service";

export const createTransactionController = async (req: Request, res: Response) => {
  try {
    const transaction = await createTransaction(req.body);
    res.status(201).json(transaction);
  } catch (error) {
    throw error
  }
};

export const getTransactionByIdController = async (
  req: Request,
  res: Response
) => {
  try {
    const transaction = await getTransactionById(Number(req.params.id));
    res.status(200).json(transaction);
  } catch (error) {
    throw error
  }
};

export const getAllTransactionsController = async (
  req: Request,
  res: Response
) => {
  try {
    const transactions = await getAllTransactions();
    res.status(200).json(transactions);
  } catch (error) {
    throw error
  }
};

export const updateTransactionController = async (
  req: Request,
  res: Response
) => {
  try {
    const transaction = await updateTransaction(Number(req.params.id), req.body);
    res.status(200).json(transaction);
  } catch (error) {
    throw error
  }
};

export const deleteTransactionController = async (
  req: Request,
  res: Response
) => {
  try {
    const result = await deleteTransaction(Number(req.params.id));
    res.status(200).json(result);
  } catch (error) {
    throw error
  }
};
