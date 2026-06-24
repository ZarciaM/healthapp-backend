import { Response } from "express";
import { env } from "../config/env.js";
import type { AuthTokens } from "../modules/auth/auth.types.js";

export function parseTimeToMs(time: string): number {
  const match = time.match(/^(\d+)\s*(s|m|h|d)$/);
  if (!match) {
    throw new Error(`Invalid time format: "${time}". Expected a number followed by s, m, h, or d.`);
  }

  const value = parseInt(match[1], 10);
  const unit = match[2];
  const multipliers: Record<string, number> = {
    s: 1000,
    m: 60_000,
    h: 3_600_000,
    d: 86_400_000,
  };

  return value * (multipliers[unit] ?? 0);
}

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "strict" as const,
  path: "/",
};

export function setAuthCookies(res: Response, tokens: AuthTokens): void {
  res.cookie("accessToken", tokens.accessToken, {
    ...COOKIE_OPTIONS,
    maxAge: parseTimeToMs(env.JWT_ACCESS_EXPIRES_IN),
  });

  res.cookie("refreshToken", tokens.refreshToken, {
    ...COOKIE_OPTIONS,
    maxAge: parseTimeToMs(env.JWT_REFRESH_EXPIRES_IN),
  });
}

export function clearAuthCookies(res: Response): void {
  res.clearCookie("accessToken", { path: "/" });
  res.clearCookie("refreshToken", { path: "/" });
}
