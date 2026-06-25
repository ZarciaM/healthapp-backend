import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { validateObjectId } from "../../middlewares/validateObjectId.middleware.js";
import {
  createHeartRateEntrySchema,
  calculateZonesQuerySchema,
} from "./heartRate.validation.js";
import * as controller from "./heartRate.controller.js";

const router = Router();

router.get("/zones", authMiddleware, validate(calculateZonesQuerySchema), controller.getZones);
router.post("/", authMiddleware, validate(createHeartRateEntrySchema), controller.create);
router.get("/history", authMiddleware, controller.getHistory);
router.get("/latest", authMiddleware, controller.getLatest);
router.get("/averages", authMiddleware, controller.getAverages);
router.delete("/:id", authMiddleware, validateObjectId(), controller.remove);

export default router;
