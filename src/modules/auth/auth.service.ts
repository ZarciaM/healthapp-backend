import User from "../user/user.model.js";
import { ApiError } from "../../utils/ApiError.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../../utils/jwt.js";
import type { AuthTokens } from "./auth.types.js";
import type { RegisterInput, LoginInput } from "./auth.validation.js";

export async function register(
  data: RegisterInput,
): Promise<{ user: unknown; tokens: AuthTokens }> {
  const existing = await User.findOne({ email: data.email });
  if (existing) {
    throw ApiError.conflict("Un compte avec cet email existe déjà");
  }

  const user = await User.create({
    ...data,
    dateOfBirth: new Date(data.dateOfBirth),
    authProvider: "local",
  });

  const accessToken = generateAccessToken(user._id.toString());
  const refreshToken = generateRefreshToken(user._id.toString());

  user.refreshTokens.push({
    token: refreshToken,
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  await user.save();

  return { user, tokens: { accessToken, refreshToken } };
}

export async function login(
  data: LoginInput,
): Promise<{ user: unknown; tokens: AuthTokens }> {
  const user = await User.findOne({ email: data.email }).select("+password");

  if (
    !user ||
    user.authProvider !== "local" ||
    !(await user.comparePassword(data.password))
  ) {
    throw ApiError.unauthorized("Email ou mot de passe incorrect");
  }

  const accessToken = generateAccessToken(user._id.toString());
  const refreshToken = generateRefreshToken(user._id.toString());

  user.refreshTokens.push({
    token: refreshToken,
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  await user.save();

  return { user, tokens: { accessToken, refreshToken } };
}

export async function refreshTokens(
  incomingRefreshToken: string,
): Promise<AuthTokens> {
  const { userId } = verifyRefreshToken(incomingRefreshToken);

  const user = await User.findById(userId);
  if (!user) {
    throw ApiError.unauthorized("Refresh token invalide");
  }

  const tokenIndex = user.refreshTokens.findIndex(
    (rt) => rt.token === incomingRefreshToken,
  );

  if (tokenIndex === -1) {
    throw ApiError.unauthorized("Refresh token invalide");
  }

  user.refreshTokens.splice(tokenIndex, 1);

  const accessToken = generateAccessToken(user._id.toString());
  const refreshToken = generateRefreshToken(user._id.toString());

  user.refreshTokens.push({
    token: refreshToken,
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  await user.save();

  return { accessToken, refreshToken };
}

export async function logout(
  userId: string,
  refreshToken: string,
): Promise<void> {
  await User.findByIdAndUpdate(userId, {
    $pull: { refreshTokens: { token: refreshToken } },
  });
}
