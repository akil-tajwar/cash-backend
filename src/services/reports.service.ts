import { and, eq, lt, lte, sql } from "drizzle-orm";
import { db } from "../config/database";
import { accountMainModel, banksModel, companyModel, transactionModel } from "../schemas";
import { BadRequestError } from "./utils/errors.utils";

export const cashFlowLoanReport = async (reportDate: string) => {
  const accounts = await db
    .select({
      id: accountMainModel.id,
      accountNo: accountMainModel.accountNo,
      limit: accountMainModel.limit,
      interestRate: accountMainModel.interestRate,
      accountType: accountMainModel.accountType,
      bankId: accountMainModel.bankId,
      bankName: banksModel.bankName,
      initialBalance: accountMainModel.balance,
      companyId: accountMainModel.companyId,
      companyName: companyModel.companyName
    })
    .from(accountMainModel)
    .leftJoin(companyModel, eq(accountMainModel.companyId, companyModel.companyId))
    .leftJoin(banksModel, eq(accountMainModel.bankId, banksModel.id));


  const reportData = await Promise.all(
    accounts.map(async (account) => {
      // 1. Find last closing balance before the report date
      const previousTransactions = await db
        .select({
          amount: sql<number>`CASE WHEN transaction_type = 'Withdraw' THEN -amount ELSE amount END`
        })
        .from(transactionModel)
        .where(
  and(
    lt(sql`DATE(${transactionModel.transactionDate})`, reportDate),
    eq(transactionModel.accountId, account.id) // ✅ FIXED
  )
)


      const totalPrevious = previousTransactions.reduce((sum, tx) => sum + tx.amount, 0);
      const openingBalance = Number(account.initialBalance) + totalPrevious;

      // 2. Transactions on the report date
      const transactionsToday = await db
        .select({
          transactionType: transactionModel.transactionType,
          amount: transactionModel.amount
        })
        .from(transactionModel)
        .where(
  and(
    eq(sql`DATE(${transactionModel.transactionDate})`, reportDate),
    eq(transactionModel.accountId, account.id) // ✅ FIXED
  )
)


      const deposit = transactionsToday
        .filter(tx => tx.transactionType === 'Deposit')
        .reduce((sum, tx) => sum + tx.amount, 0);

      const withdrawal = transactionsToday
        .filter(tx => tx.transactionType === 'Withdraw')
        .reduce((sum, tx) => sum + tx.amount, 0);

      const closingBalance = openingBalance + deposit - withdrawal;

      return {
        companyId: account.companyId,
        companyName: account.companyName,
        accountNo: account.accountNo,
        limit: account.limit,
        typeId: account.accountType,
        interestRate: account.interestRate,
        bankId: account.bankId,
        bankName: account.bankName,
        openingBalance,
        deposit,
        withdrawal,
        closingBalance
      };
    })
  );

  // 3. Group by company
  const groupedByCompany: Record<string, typeof reportData> = {};
  for (const row of reportData) {
    const companyKey = row.companyName ?? "Unknown";
    if (!groupedByCompany[companyKey]) {
      groupedByCompany[companyKey] = [];
    }
    groupedByCompany[companyKey].push(row);
  }

  return groupedByCompany;
};

export const getCashFlowSummaryReport = async (reportDate: string) => {
  const transactions = await db
    .select({
      id: transactionModel.id,
      bankAccountId: transactionModel.accountId,
      transactionType: transactionModel.transactionType,
      details: transactionModel.details,
      amount: transactionModel.amount,
      accountNumber: accountMainModel.accountNo,
    })
    .from(transactionModel)
    .leftJoin(accountMainModel, eq(transactionModel.accountId, accountMainModel.id))
    .where(
  sql`DATE(${transactionModel.transactionDate}) = DATE(${sql.raw(`'${reportDate}'`)})`
)


  if (!transactions.length) {
    throw BadRequestError("No transactions found for the given date");
  }

  return transactions;
};


