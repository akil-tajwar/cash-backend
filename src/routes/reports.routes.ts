import { Router } from "express";
import { authenticateUser } from "../middlewares/auth.middleware";
import { getTransactionReportController } from "../controllers/reports.controller";

const router = Router();

router.get('/get-transaction-report',authenticateUser, getTransactionReportController);

export default router;