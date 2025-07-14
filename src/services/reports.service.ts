import { and, eq, lt, lte, sql } from "drizzle-orm";
import { db } from "../config/database";
import { transactionModel } from "../schemas";

export const transactionReport = async (date: string, accountMainId: number) => {
  // Get opening balance - sum of all transactions before the date
  const openingBalance = await db
    .select({
      balance: sql<number>`SUM(CASE WHEN transaction_type = 'Withdraw' THEN -amount ELSE amount END)`
    })
    .from(transactionModel)
    .where(
      and(
        lt(sql`DATE(${transactionModel.transactionDate})`, date),
        eq(transactionModel.id, accountMainId)
      )
    );

  // Get transactions for the specified date
  const transactions = await db
    .select({
      id: transactionModel.id,
      transactionDate: transactionModel.transactionDate,
      transactionType: transactionModel.transactionType,
      details: transactionModel.details,
      amount: transactionModel.amount,
      accountMainId: transactionModel.id
    })
    .from(transactionModel)
    .where(
      and(
        eq(sql`DATE(${transactionModel.transactionDate})`, date),
        eq(transactionModel.id, accountMainId)
      )
    );

  // Get closing balance - sum of all transactions up to and including the date
  const closingBalance = await db
    .select({
      balance: sql<number>`SUM(CASE WHEN transaction_type = 'Withdraw' THEN -amount ELSE amount END)`
    })
    .from(transactionModel)
    .where(
      and(
        lte(sql`DATE(${transactionModel.transactionDate})`, date),
        eq(transactionModel.id, accountMainId)
      )
    );

  return {
    openingBalance: openingBalance[0]?.balance || 0,
    transactions,
    closingBalance: closingBalance[0]?.balance || 0
  };
};
