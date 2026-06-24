import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendSuccess } from "../../utils/ApiResponse.js";
import { setAuthCookies, clearAuthCookies } from "../../utils/cookies.js";
import { ApiError } from "../../utils/ApiError.js";
import User from "../user/user.model.js";
import * as authService from "./auth.service.js";

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { user, tokens } = await authService.register(req.body);
  setAuthCookies(res, tokens);
  sendSuccess(res, 201, "Compte créé avec succès", { user });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { user, tokens } = await authService.login(req.body);
  setAuthCookies(res, tokens);
  sendSuccess(res, 200, "Connexion réussie", { user });
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.refreshToken;
  if (!refreshToken) {
    throw ApiError.unauthorized("Refresh token manquant");
  }

  const tokens = await authService.refreshTokens(refreshToken);
  setAuthCookies(res, tokens);
  sendSuccess(res, 200, "Token rafraîchi avec succès");
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  await authService.logout(req.user.userId, req.cookies?.refreshToken);
  clearAuthCookies(res);
  sendSuccess(res, 200, "Déconnexion réussie");
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.user.userId);
  sendSuccess(res, 200, "Profil récupéré", { user });
});
