import { Router } from "express";
import authRoutes from "./auth.routes";
import companyRoutes from "./company.routes"
import accountMainRoutes from "./account-main.routes";
import transactionRoutes from "./transaction.routes";
const router=Router()

router.use('/auth',authRoutes)
router.use('/company',companyRoutes)
router.use('/account-main',accountMainRoutes)
router.use('/transaction',transactionRoutes)

export default router;