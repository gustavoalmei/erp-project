import { Router } from "express";
import { productsController } from "./products.controller";
import { authMiddleware } from "../../middlewares/auth.middlewares";

const router = Router();

// Rotas públicas
router.get("/", productsController.list);
router.get("/low-stock", productsController.getLowStock);
router.get("/top-selling", productsController.topSelling);
router.get("/:id", productsController.getById);

// Rotas protegidas
router.post("/", authMiddleware, productsController.create);
router.put("/:id", authMiddleware, productsController.update);
router.delete("/:id", authMiddleware, productsController.delete);

export default router;
