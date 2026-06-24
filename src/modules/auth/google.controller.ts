import { Request, Response } from "express";
import { env } from "../../config/env.js";
import { setAuthCookies } from "../../utils/cookies.js";
import * as authService from "./auth.service.js";

export const googleCallback = async (req: Request, res: Response) => {
  const user = req.user as { _id: { toString(): string }; hasBasicProfileInfo: boolean } | undefined;

  if (!user) {
    res.redirect(`${env.CLIENT_URL}/login?error=google_auth_failed`);
    return;
  }

  const tokens = await authService.issueTokensForUser(user._id.toString());

  setAuthCookies(res, tokens);

  const redirectUrl = user.hasBasicProfileInfo
    ? `${env.CLIENT_URL}/auth/callback`
    : `${env.CLIENT_URL}/auth/callback?onboarding=true`;

  res.redirect(redirectUrl);
};
