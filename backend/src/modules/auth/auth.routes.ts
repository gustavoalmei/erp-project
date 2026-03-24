import { Router } from "express";
import { authController } from "./auth.controller";
import { authMiddleware } from "../../middlewares/auth.middlewares";

const router = Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/verify", authMiddleware, authController.verify);
router.post("/logout", authMiddleware, authController.logout);

export default router;
