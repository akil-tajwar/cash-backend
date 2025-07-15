import { Router } from "express";
import { authenticateUser } from "../middlewares/auth.middleware";
import { getCashFlowLoanReportController } from "../controllers/reports.controller";

const router = Router();

router.get('/get-cash-flow-loan-report', authenticateUser, getCashFlowLoanReportController);

export default router;