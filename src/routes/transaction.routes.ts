
import { Router } from "express";
import {
  createTransactionController,
  deleteTransactionController,
  getAllTransactionsController,
  getTransactionByIdController,
  updateTransactionController,
} from "../controllers/transaction.controller";
import { authenticateUser } from "../middlewares/auth.middleware";

const router = Router();

router.post("/create-transaction", authenticateUser, createTransactionController);
router.get("/get-transaction/:id", authenticateUser, getTransactionByIdController);
router.get("/get-all-transactions", authenticateUser, getAllTransactionsController);
router.put("/update-transaction/:id", authenticateUser, updateTransactionController);
router.delete("/delete-transaction/:id", authenticateUser, deleteTransactionController);

export default router;
