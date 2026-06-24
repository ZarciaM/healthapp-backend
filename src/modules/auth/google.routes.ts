import { Router } from "express";
import passport from "passport";
import { env } from "../../config/env.js";
import { googleCallback } from "./google.controller.js";

const router = Router();

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"], session: false }),
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${env.CLIENT_URL}/login?error=google_auth_failed`,
  }),
  googleCallback,
);

export default router;
