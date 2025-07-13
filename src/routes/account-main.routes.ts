
import { Router } from "express";
import {
  createAccountMainController,
  getAccountMainByIdController,
  getAllAccountMainsController,
  updateAccountMainController,
  deleteAccountMainController,
} from "../controllers/account-main.controller";
import { authenticateUser } from "../middlewares/auth.middleware";

const router = Router();

router.post("/create-account-main/", authenticateUser, createAccountMainController);
router.get("/get-account-main/:id", authenticateUser, getAccountMainByIdController);
router.get("/get-all-account-mains/", authenticateUser, getAllAccountMainsController);
router.put("/update-account-main/:id", authenticateUser, updateAccountMainController);
router.delete("/delete-account-main/:id", authenticateUser, deleteAccountMainController);

export default router;
