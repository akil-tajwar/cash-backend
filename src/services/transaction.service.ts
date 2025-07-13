import { eq } from "drizzle-orm";
import { db } from "../config/database";
import { NewTransaction, Transaction, transactionModel } from "../schemas";
import { BadRequestError } from "./utils/errors.utils";

export const createTransaction = async (transactionData: NewTransaction) => {
  try {
    const [newTransaction] = await db
      .insert(transactionModel)
      .values(transactionData)
      .$returningId();

    return newTransaction;
  } catch (error) {
    throw error;
  }
};

// Get transaction by ID
export const getTransactionById = async (id: number) => {
  const transaction = await db
    .select()
    .from(transactionModel)
    .where(eq(transactionModel.id, id))
    .limit(1);

  if (!transaction.length) {
    throw BadRequestError("Transaction not found");
  }

  return transaction[0];
};

// get all transactions
export const getAllTransactions = async () => {
  const transactions = await db.select().from(transactionModel);

  if (!transactions.length) {
    throw BadRequestError("No transactions found");
  }

  return transactions;
};

// Update transaction
export const updateTransaction = async (
  id: number,
  transactionData: Partial<Transaction>
) => {
  await getTransactionById(id); // Check if transaction exists

  const [updatedTransaction] = await db
    .update(transactionModel)
    .set(transactionData)
    .where(eq(transactionModel.id, id));

  return updatedTransaction;
};

// Delete transaction
export const deleteTransaction = async (id: number) => {
  await getTransactionById(id); // Check if transaction exists

  await db.delete(transactionModel).where(eq(transactionModel.id, id));

  return { message: "Transaction deleted successfully" };
};
