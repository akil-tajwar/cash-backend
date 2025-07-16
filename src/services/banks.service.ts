import { db } from "../config/database";
import { banksModel } from "../schemas";
import { BadRequestError } from "./utils/errors.utils";

  export const getAllBanks = async () => {
    const banks = await db.select().from(banksModel);
  
    // console.log(banks);
  
    if (!banks.length) {
      throw BadRequestError("No banks found");
    }
  
    return banks;
  };