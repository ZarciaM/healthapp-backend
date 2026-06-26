import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { validateObjectId } from "../../middlewares/validateObjectId.middleware.js";
import { createMedicationReminderSchema, updateMedicationReminderSchema } from "./medication.validation.js";
import * as controller from "./medication.controller.js";

const router = Router();

router.post("/", authMiddleware, validate(createMedicationReminderSchema), controller.create);
router.get("/", authMiddleware, controller.getAll);
router.patch("/:id", authMiddleware, validateObjectId(), validate(updateMedicationReminderSchema), controller.update);
router.patch("/:id/deactivate", authMiddleware, validateObjectId(), controller.deactivate);
router.delete("/:id", authMiddleware, validateObjectId(), controller.remove);

export default router;
