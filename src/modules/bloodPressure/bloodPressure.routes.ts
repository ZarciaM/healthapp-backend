import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { validateObjectId } from "../../middlewares/validateObjectId.middleware.js";
import { createBloodPressureEntrySchema } from "./bloodPressure.validation.js";
import * as controller from "./bloodPressure.controller.js";

const router = Router();

router.post("/", authMiddleware, validate(createBloodPressureEntrySchema), controller.create);
router.get("/history", authMiddleware, controller.getHistory);
router.get("/latest", authMiddleware, controller.getLatest);
router.get("/averages", authMiddleware, controller.getAverages);
router.delete("/:id", authMiddleware, validateObjectId(), controller.remove);

export default router;
