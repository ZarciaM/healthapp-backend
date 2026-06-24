import crypto from "node:crypto";
import User from "../user/user.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { parseTimeToMs } from "../../utils/cookies.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../../utils/jwt.js";
import { env } from "../../config/env.js";
import type { AuthTokens } from "./auth.types.js";
import type { RegisterInput, LoginInput } from "./auth.validation.js";

const MAX_REFRESH_TOKENS = 5;

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function issueTokensForUser(
  userId: string,
): Promise<AuthTokens> {
  const accessToken = generateAccessToken(userId);
  const refreshToken = generateRefreshToken(userId);

  await User.findByIdAndUpdate(userId, {
    $pull: {
      refreshTokens: { expiresAt: { $lte: new Date() } },
    },
  });

  await User.findByIdAndUpdate(userId, {
    $push: {
      refreshTokens: {
        $each: [
          {
            token: hashToken(refreshToken),
            createdAt: new Date(),
            expiresAt: new Date(
              Date.now() + parseTimeToMs(env.JWT_REFRESH_EXPIRES_IN),
            ),
          },
        ],
        $position: 0,
        $slice: MAX_REFRESH_TOKENS,
      },
    },
  });

  return { accessToken, refreshToken };
}

export async function register(
  data: RegisterInput,
): Promise<{ user: unknown; tokens: AuthTokens }> {
  const existing = await User.findOne({ email: data.email });
  if (existing) {
    throw ApiError.conflict("Un compte avec cet email existe déjà");
  }

  const user = await User.create({
    ...data,
    authProvider: "local",
  });

  const tokens = await issueTokensForUser(user._id.toString());

  return { user, tokens };
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

  const tokens = await issueTokensForUser(user._id.toString());

  return { user, tokens };
}

export async function refreshTokens(
  incomingRefreshToken: string,
): Promise<AuthTokens> {
  const { userId } = verifyRefreshToken(incomingRefreshToken);

  const user = await User.findById(userId);
  if (!user) {
    throw ApiError.unauthorized("Refresh token invalide");
  }

  const hashed = hashToken(incomingRefreshToken);
  const tokenIndex = user.refreshTokens.findIndex(
    (rt) => rt.token === hashed,
  );

  if (tokenIndex === -1) {
    throw ApiError.unauthorized("Refresh token invalide");
  }

  user.refreshTokens.splice(tokenIndex, 1);

  const accessToken = generateAccessToken(user._id.toString());
  const refreshToken = generateRefreshToken(user._id.toString());

  user.refreshTokens.push({
    token: hashToken(refreshToken),
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + parseTimeToMs(env.JWT_REFRESH_EXPIRES_IN)),
  });

  await user.save();

  return { accessToken, refreshToken };
}

export async function logout(
  userId: string,
  refreshToken: string,
): Promise<void> {
  await User.findByIdAndUpdate(userId, {
    $pull: { refreshTokens: { token: hashToken(refreshToken) } },
  });
}
