import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { validateQuery } from "../../middlewares/validate.middleware.js";
import { calculateWaterQuerySchema } from "./water.validation.js";
import * as controller from "./water.controller.js";

const router = Router();

router.get(
  "/",
  authMiddleware,
  validateQuery(calculateWaterQuerySchema),
  controller.calculate,
);

export default router;
