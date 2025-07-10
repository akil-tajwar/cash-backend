// company.controller.ts
import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { createCompany, getAllCompanies, getCompanyById } from "../services/company.service";
import { createInsertSchema } from "drizzle-zod";
import { companyModel } from "../schemas";
import { requirePermission } from "../services/utils/jwt.utils";

// create company
export const createCompanyController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'create_company');
    const companydata = req.body
    const createCompanySchema = createInsertSchema(companyModel);
    
    const companyData = createCompanySchema.parse(companydata);
    const company = await createCompany(companyData);

    res.status(201).json({
      status: "success",
      data: {
        company,
      },
    });
  } catch (error) {
    next(error);
  }
};



//get company details by id  
export const getCompanyControllerById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    requirePermission(req, 'view_company');
    const companyId = parseInt(req.params.id, 10);
    const company = await getCompanyById(companyId);
    res.json(company);
  } catch (error) {
    throw error;
  }

};


//get all companies
export const getAllCompaniesController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    requirePermission(req, 'view_company');
    const companies = await getAllCompanies();
    res.json(companies);
  } catch (error) {
    next(error);
  }
};