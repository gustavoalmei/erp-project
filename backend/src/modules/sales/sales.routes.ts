import { Router } from "express";
import { salesController } from "./sales.controller";
import { authMiddleware } from "../../middlewares/auth.middlewares";

const router = Router();

// Todas as rotas protegidas
router.use(authMiddleware);

router.get("/", salesController.list);
router.get("/:id", salesController.getById);
router.post("/", salesController.create);
router.patch("/:id/status", salesController.updateStatus);
router.delete("/:id", salesController.cancel);

export default router;
