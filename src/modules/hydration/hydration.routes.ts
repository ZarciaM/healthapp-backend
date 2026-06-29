import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { createHydrationReminderSchema } from "./hydration.validation.js";
import * as controller from "./hydration.controller.js";

const router = Router();

router.post("/", authMiddleware, validate(createHydrationReminderSchema), controller.createOrUpdate);
router.get("/", authMiddleware, controller.getReminder);
router.patch("/deactivate", authMiddleware, controller.deactivate);
router.patch("/reactivate", authMiddleware, controller.reactivate);
router.delete("/", authMiddleware, controller.deleteReminder);

export default router;
