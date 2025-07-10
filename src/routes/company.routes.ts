import { Router } from "express";
import { createCompanyController, getAllCompaniesController, getCompanyControllerById } from "../controllers/company.controller";
import { authenticateUser } from "../middlewares/auth.middleware";



const router = Router();

router.post("/create-company",authenticateUser, createCompanyController);
router.get('/get-all-companies',authenticateUser, getAllCompaniesController);
router.get('/get-company-by-id/:id',authenticateUser, getCompanyControllerById);


export default router;