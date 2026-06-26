import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { validateObjectId } from "../../middlewares/validateObjectId.middleware.js";
import { createInvitationSchema, respondInvitationSchema } from "./dataSharing.validation.js";
import * as controller from "./dataSharing.controller.js";

const router = Router();

router.post("/invitations", authMiddleware, validate(createInvitationSchema), controller.create);
router.post("/invitations/accept", authMiddleware, validate(respondInvitationSchema), controller.accept);
router.post("/invitations/decline", authMiddleware, validate(respondInvitationSchema), controller.decline);
router.get("/owner", authMiddleware, controller.getSharesAsOwner);
router.get("/partner", authMiddleware, controller.getSharesAsPartner);
router.post("/:id/resend", authMiddleware, validateObjectId("id"), controller.resend);
router.delete("/:id", authMiddleware, controller.revoke);

export default router;
