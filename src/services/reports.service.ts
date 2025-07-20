import { and, between, eq, lt, lte, sql } from "drizzle-orm";
import { db } from "../config/database";
import { accountMainModel, accountTypeModel, banksModel, companyModel, transactionModel } from "../schemas";
import { BadRequestError } from "./utils/errors.utils";
import { alias } from "drizzle-orm/gel-core";

export const cashFlowLoanReport = async (reportDate: string) => {
  const accounts = await db
    .select({
      id: accountMainModel.id,
      accountNo: accountMainModel.accountNo,
      limit: accountMainModel.limit,
      interestRate: accountMainModel.interestRate,
      accountTypeModel: accountMainModel.accountType,
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
        typeId: account.accountTypeModel,
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
    throw BadRequestError("No transactionModel found for the given date");
  }

  return transactionModel;
};





const depositSummary = async(startDate:Date,endDate:Date) =>{await db
  .select({
    type:transactionModel.transactionType,
    details: transactionModel.details,
    totalAmount: sql<number>`SUM(${transactionModel.amount})`.as('totalAmount'),
  })
  .from(transactionModel)
  .where(
             between(transactionModel.transactionDate, startDate, endDate)
      )
 
  .groupBy(transactionModel.transactionType,transactionModel.details)}

  export const companyWiseSummary = async (startDate:Date,endDate:Date) => {
  return await db
    .select({
      companyId: companyModel.companyId,
      companyName: companyModel.companyName,
      totalLimit: sql<number>`SUM(${accountMainModel.limit})`.as("totalLimit"),
      totalBalance: sql<number>`SUM(${accountMainModel.balance})`.as("totalBalance"),
    })
    .from(accountMainModel).where(
             between(transactionModel.transactionDate, startDate, endDate)
      )
    .innerJoin(companyModel, eq(accountMainModel.companyId, companyModel.companyId))
    .groupBy(companyModel.companyId, companyModel.companyName);
};

export const getBalanceSummaryByType = async (asOfDate: Date) => {
  // Subquery to get net transactionModel per account before the date
  const netTx  = db
    .select({
      accountId: transactionModel.accountId,
      netChange: sql<number>`SUM(
        CASE 
          WHEN ${transactionModel.transactionType} = 'Deposit' THEN ${transactionModel.amount}
          WHEN ${transactionModel.transactionType} = 'Withdraw' THEN -${transactionModel.amount}
          ELSE 0
        END
      )`.as("netChange")
    })
    .from(transactionModel)
    .where(lte(transactionModel.transactionDate, asOfDate))
    .groupBy(transactionModel.accountId)
    .as("netTx")
   // const netTx = alias(netTxRaw, "netTx");

  // Join accounts + account_type + transactionModel subquery
  const result = await db
    .select({
      description: accountTypeModel.description,
      interestRate: accountMainModel.interestRate,
      totalLimit: sql<number>`SUM(${accountMainModel.limit})`.as("totalLimit"),
     
      balanceOnDate: sql<number>`SUM(${accountMainModel.balance} - 
      IFNULL(${netTx.netChange}, 0))`.as("balanceOnDate"),
    })
    .from(accountMainModel)
    .innerJoin(accountTypeModel, eq(accountMainModel.accountType, accountTypeModel.id))
    .leftJoin(netTx, eq(accountMainModel.id, netTx.accountId))
    .groupBy(accountTypeModel.description, accountMainModel.interestRate);
   
  // Calculate total balance from grouped result
  const totalBalance = result.reduce((sum, r) => sum + Number(r.balanceOnDate ?? 0), 0);

  // Add percentage field
  return result.map(row => ({
    ...row,
    balancePercent: totalBalance > 0 ? 
    Number(((Number(row.balanceOnDate) / totalBalance) * 100).toFixed(2)) : 0,
  }));
};

export const getBalanceSummaryByint = async (asOfDate: Date) => {
  // Subquery to get net transactionModel per account before the date
  const netTx  = db
    .select({
      accountId: transactionModel.accountId,
      netChange: sql<number>`SUM(
        CASE 
          WHEN ${transactionModel.transactionType} = 'Deposit' THEN ${transactionModel.amount}
          WHEN ${transactionModel.transactionType} = 'Withdraw' THEN -${transactionModel.amount}
          ELSE 0
        END
      )`.as("netChange")
    })
    .from(transactionModel)
    .where(lte(transactionModel.transactionDate, asOfDate))
    .groupBy(transactionModel.accountId)
    .as("netTx")
   // const netTx = alias(netTxRaw, "netTx");

  // Join accounts + account_type + transactionModel subquery
  const result = await db
    .select({
    
      interestRate: accountMainModel.interestRate,
    
     
      balanceOnDate: sql<number>`SUM(${accountMainModel.balance} - 
      IFNULL(${netTx.netChange}, 0))`.as("balanceOnDate"),
    })
    .from(accountMainModel)
    .innerJoin(accountTypeModel, eq(accountMainModel.accountType, accountTypeModel.id))
    .leftJoin(netTx, eq(accountMainModel.id, netTx.accountId))
    .groupBy( accountMainModel.interestRate);
   
  // Calculate total balance from grouped result
  const totalBalance = result.reduce((sum, r) => sum + Number(r.balanceOnDate ?? 0), 0);

  // Add percentage field
  return result.map(row => ({
    ...row,
    balancePercent: totalBalance > 0 ? 
    Number(((Number(row.balanceOnDate) / totalBalance) * 100).toFixed(2)) : 0,
  }));
};

