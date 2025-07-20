import { Router } from "express";
import { authenticateUser } from "../middlewares/auth.middleware";
import { getCashFlowLoanReportController, getCashFlowSummaryReportController, getInterestRateFlatReportController, getInterestRateReportController } from "../controllers/reports.controller";

const router = Router();

router.get('/get-cash-flow-loan-report', authenticateUser, getCashFlowLoanReportController);
router.get('/get-cash-flow-summary-report', authenticateUser, getCashFlowSummaryReportController);
router.get('/getbyInterestRate',getInterestRateReportController)
router.get('/getbyIntRateFlat',getInterestRateFlatReportController)
export default router;