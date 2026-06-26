import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { validateObjectId } from "../../middlewares/validateObjectId.middleware.js";
import { createBodyFatEntrySchema } from "./bodyFat.validation.js";
import * as controller from "./bodyFat.controller.js";

const router = Router();

router.post("/", authMiddleware, validate(createBodyFatEntrySchema), controller.create);
router.get("/history", authMiddleware, controller.getHistory);
router.get("/latest", authMiddleware, controller.getLatest);
router.delete("/:id", authMiddleware, validateObjectId(), controller.remove);

export default router;
