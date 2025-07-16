  import { eq } from "drizzle-orm";
  import { db } from "../config/database";
  import { AccountMain, accountMainModel, banksModel, companyModel } from "../schemas";
  import { BadRequestError } from "./utils/errors.utils";

  export const createAccountMain = async (
    accountMainData: typeof accountMainModel.$inferInsert
  ) => {
    try {
      const [newAccountMain] = await db
        .insert(accountMainModel)
        .values(accountMainData)
        .$returningId();

      return newAccountMain;
    } catch (error) {
      throw error;
    }
  };

  // Get account main by ID
  export const getAccountMainById = async (id: number) => {
    const accountMain = await db
      .select()
      .from(accountMainModel)
      .where(eq(accountMainModel.id, id))
      .limit(1);

    if (!accountMain.length) {
      throw BadRequestError("Account main not found");
    }

    return accountMain[0];
  };

  // get all account mains
  export const getAllAccountMains = async () => {
    const accountMains = await db
      .select({
        id: accountMainModel.id,
        bankId: accountMainModel.bankId,
        bankName: banksModel.bankName,
        accountType: accountMainModel.accountType,
        accountNo: accountMainModel.accountNo,
        limit: accountMainModel.limit,
        interestRate: accountMainModel.interestRate,
        balance: accountMainModel.balance,
        term: accountMainModel.term,
        companyId: accountMainModel.companyId,
        companyName: companyModel.companyName,
      })
      .from(accountMainModel)
      .leftJoin(companyModel, eq(accountMainModel.companyId, companyModel.companyId))
      .leftJoin(banksModel, eq(accountMainModel.bankId, banksModel.id));

    if (!accountMains.length) {
      throw BadRequestError("No account mains found");
    }

    return accountMains;
  };

  // Update account main
  export const updateAccountMain = async (
    id: number,
    accountMainData: Partial<AccountMain>
  ) => {
    await getAccountMainById(id); // Check if account main exists

    const [updatedAccountMain] = await db
      .update(accountMainModel)
      .set(accountMainData)
      .where(eq(accountMainModel.id, id));

    return updatedAccountMain;
  };

  // Delete account main
  export const deleteAccountMain = async (id: number) => {
    await getAccountMainById(id); // Check if account main exists

    await db.delete(accountMainModel).where(eq(accountMainModel.id, id));

    return { message: "Account main deleted successfully" };
  };
