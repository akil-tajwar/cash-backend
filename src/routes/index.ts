import { Router } from "express";
import authRoutes from "./auth.routes";
import companyRoutes from "./company.routes"
import accountMainRoutes from "./account-main.routes";
const router=Router()

router.use('/auth',authRoutes)
router.use('/company',companyRoutes)
router.use('/account-main',accountMainRoutes)

export default router;