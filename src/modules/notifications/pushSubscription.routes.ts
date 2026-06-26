import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import * as controller from "./pushSubscription.controller.js";

const router = Router();

router.post("/", authMiddleware, controller.subscribe);
router.delete("/", authMiddleware, controller.unsubscribe);
router.get("/vapid-public-key", controller.getVapidPublicKey);

export default router;
