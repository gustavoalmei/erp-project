import { Router } from "express";
import { customersController } from "./customers.controller";
import { authMiddleware } from "../../middlewares/auth.middlewares";

const router = Router();

// Todas as rotas de clientes são protegidas
router.use(authMiddleware);

router.get("/", customersController.list);
router.get("/:id", customersController.getById);
router.post("/", customersController.create);
router.put("/:id", customersController.update);
router.delete("/:id", customersController.delete);

export default router;
