import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import * as controller from "./dashboard.controller.js";

const router = Router();

router.get("/", authMiddleware, controller.getDashboard);

export default router;
