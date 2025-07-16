import { Router } from "express";
import authRoutes from "./auth.routes";
import companyRoutes from "./company.routes"
import accountMainRoutes from "./account-main.routes";
import transactionRoutes from "./transaction.routes";
import reportRoutes from "./reports.routes";
import banksRoutes from "./banks.routes";
const router=Router()

router.use('/auth',authRoutes)
router.use('/company',companyRoutes)
router.use('/account-main',accountMainRoutes)
router.use('/transaction',transactionRoutes)
router.use('/report',reportRoutes)
router.use('/banks',banksRoutes)

export default router;