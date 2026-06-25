import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import {
  createWeightEntrySchema,
  setWeightGoalSchema,
} from "./weight.validation.js";
import * as controller from "./weight.controller.js";

const router = Router();

router.post("/", authMiddleware, validate(createWeightEntrySchema), controller.recordEntry);
router.get("/history", authMiddleware, controller.getHistory);
router.get("/current", authMiddleware, controller.getCurrent);
router.post("/goal", authMiddleware, validate(setWeightGoalSchema), controller.setGoal);
router.get("/progress", authMiddleware, controller.getProgress);

export default router;
