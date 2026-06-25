import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { validateObjectId } from "../../middlewares/validateObjectId.middleware.js";
import { createSleepEntrySchema } from "./sleep.validation.js";
import * as controller from "./sleep.controller.js";

const router = Router();

router.post("/", authMiddleware, validate(createSleepEntrySchema), controller.create);
router.get("/history", authMiddleware, controller.getHistory);
router.get("/latest", authMiddleware, controller.getLatest);
router.get("/averages", authMiddleware, controller.getAverages);
router.delete("/:id", authMiddleware, validateObjectId(), controller.remove);

export default router;
