import crypto from "node:crypto";
import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import passport from "passport";
import { env } from "../../config/env.js";
import { googleCallback } from "./google.controller.js";

const router = Router();

router.get(
  "/google",
  (req: Request, res: Response, next: NextFunction) => {
    const state = crypto.randomBytes(16).toString("hex");
    res.cookie("oauth_state", state, {
      httpOnly: true,
      sameSite: "lax",
      secure: env.NODE_ENV === "production",
      maxAge: 10 * 60 * 1000,
    });
    passport.authenticate("google", {
      scope: ["profile", "email"],
      session: false,
      state,
    })(req, res, next);
  },
);

router.get(
  "/google/callback",
  (req: Request, res: Response, next: NextFunction) => {
    const savedState = req.cookies?.oauth_state;
    if (req.query.state !== savedState) {
      res.redirect(`${env.CLIENT_URL}/login?error=google_auth_failed`);
      return;
    }
    res.clearCookie("oauth_state");
    passport.authenticate("google", {
      session: false,
      failureRedirect: `${env.CLIENT_URL}/login?error=google_auth_failed`,
    })(req, res, next);
  },
  googleCallback,
);

export default router;
