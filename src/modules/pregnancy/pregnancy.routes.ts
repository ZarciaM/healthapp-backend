import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { genderGuard } from "../../middlewares/genderGuard.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { validateObjectId } from "../../middlewares/validateObjectId.middleware.js";
import { createPregnancyProfileSchema } from "./pregnancy.validation.js";
import * as controller from "./pregnancy.controller.js";

const router = Router();

router.post("/", authMiddleware, genderGuard(["female"]), validate(createPregnancyProfileSchema), controller.create);
router.get("/current", authMiddleware, genderGuard(["female"]), controller.getCurrent);
router.get("/progress", authMiddleware, genderGuard(["female"]), controller.getProgress);
router.patch("/:id/close", authMiddleware, genderGuard(["female"]), validateObjectId("id"), controller.close);
router.get("/history", authMiddleware, genderGuard(["female"]), controller.getHistory);

export default router;
