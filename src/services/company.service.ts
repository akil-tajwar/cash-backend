import { eq } from "drizzle-orm";
import { db } from "../config/database";
import { companyModel, NewCompany } from "../schemas";
import { BadRequestError } from "./utils/errors.utils";

export const createCompany = async (
    companyData: NewCompany
  ) => {
    try {
      const [newCompany] = await db
        .insert(companyModel)
        .values(companyData)
        .$returningId();
      
      return newCompany;
    } catch (error) {
      throw error;
    }
  };
  
  // Get company by ID
  export const getCompanyById = async (companyId: number) => {
    const company = await db
      .select()
      .from(companyModel)
      .where(eq(companyModel.companyId, companyId))
      .limit(1);
    console.log(company);
  
    if (!company.length) {
      throw BadRequestError("Company not found");
    }
  
    return company[0];
  };
  
  // get company by all
  
  export const getAllCompanies = async () => {
    const companies = await db.select().from(companyModel);
  
    // console.log(companies);
  
    if (!companies.length) {
      throw BadRequestError("No companies found");
    }
  
    return companies;
  };
  
  // Update company
  export const updateCompany = async (
    companyId: number,
    companyData: Partial<NewCompany>
  ) => {
    const existingCompany = await getCompanyById(companyId);
  
    if (
      companyData.companyName &&
      companyData.companyName !== existingCompany.companyName
    ) {
      const nameExists = await db
        .select()
        .from(companyModel)
        .where(eq(companyModel.companyName, companyData.companyName))
        .limit(1);
  
      if (nameExists.length > 0) {
        throw BadRequestError("Company name already exists");
      }
    }
  
    const [updatedCompany] = await db
      .update(companyModel)
      .set(companyData)
      .where(eq(companyModel.companyId, companyId));
  
    return updatedCompany;
  };
  
  // Delete company
  export const deleteCompany = async (companyId: number) => {
    await getCompanyById(companyId); // Check if company exists
  
    await db.delete(companyModel).where(eq(companyModel.companyId, companyId));
  
    return { message: "Company deleted successfully" };
  };
  