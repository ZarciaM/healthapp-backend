import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { genderGuard } from "../../middlewares/genderGuard.middleware.js";
import { sharedAccessGuard } from "../../middlewares/sharedAccessGuard.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { validateObjectId } from "../../middlewares/validateObjectId.middleware.js";
import { createCycleEntrySchema } from "./menstrualCycle.validation.js";
import * as controller from "./menstrualCycle.controller.js";

const router = Router();

router.post("/", authMiddleware, genderGuard(["female"]), validate(createCycleEntrySchema), controller.create);
router.get("/:ownerId/history", authMiddleware, validateObjectId("ownerId"), sharedAccessGuard("menstrual_cycle"), controller.getHistory);
router.get("/:ownerId/stats", authMiddleware, validateObjectId("ownerId"), sharedAccessGuard("menstrual_cycle"), controller.getStats);
router.get("/:ownerId/prediction", authMiddleware, validateObjectId("ownerId"), sharedAccessGuard("menstrual_cycle"), controller.getPrediction);
router.get("/:ownerId/fertile-window", authMiddleware, validateObjectId("ownerId"), sharedAccessGuard("menstrual_cycle"), controller.getFertileWindow);
router.delete("/:ownerId/:id", authMiddleware, genderGuard(["female"]), validateObjectId("ownerId"), validateObjectId("id"), controller.remove);

export default router;
