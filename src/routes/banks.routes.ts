import { Router } from "express";
import { authenticateUser } from "../middlewares/auth.middleware";
import { getAllBanksController } from "../controllers/banks.controller";

const router = Router();

router.get('/get-all-banks', authenticateUser, getAllBanksController);

export default router;