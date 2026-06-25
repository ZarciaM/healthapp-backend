import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { validateQuery } from "../../middlewares/validate.middleware.js";
import { calculateCaloriesQuerySchema } from "./calories.validation.js";
import * as controller from "./calories.controller.js";

const router = Router();

router.get(
  "/",
  authMiddleware,
  validateQuery(calculateCaloriesQuerySchema),
  controller.calculate,
);

export default router;
