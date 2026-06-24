import { Request, Response } from "express";
import { env } from "../../config/env.js";
import { setAuthCookies } from "../../utils/cookies.js";
import User from "../user/user.model.js";
import * as authService from "./auth.service.js";

export const googleCallback = async (req: Request, res: Response) => {
  const user = req.user as unknown as InstanceType<typeof User>;

  if (!user) {
    res.redirect(`${env.CLIENT_URL}/login?error=google_auth_failed`);
    return;
  }

  const tokens = await authService.issueTokensForUser(user);

  setAuthCookies(res, tokens);

  const redirectUrl = user.isProfileComplete
    ? `${env.CLIENT_URL}/auth/callback`
    : `${env.CLIENT_URL}/auth/callback?onboarding=true`;

  res.redirect(redirectUrl);
};
