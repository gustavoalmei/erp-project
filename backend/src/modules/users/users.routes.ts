import { Router } from "express";
import { usersController } from "./users.controller";
import { authMiddleware } from "../../middlewares/auth.middlewares";

const router = Router();

router.use(authMiddleware);

router.get("/me", usersController.getProfile);
router.put("/me", usersController.updateProfile);
router.patch("/me/password", usersController.changePassword);

export default router;
