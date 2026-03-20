import { Router } from "express";
import { usersController } from "./users.controller";
import { authMiddleware } from "../../middlewares/auth.middlewares";

const router = Router();

router.use(authMiddleware);

router.get("/me", usersController.getProfile);
router.put("/me", usersController.updateProfile);
router.patch("/me/password", usersController.changePassword);
router.get("/all", usersController.getAll);
router.put("/:id", usersController.updateUser);
router.delete("/:id", usersController.deleteUser);

export default router;
