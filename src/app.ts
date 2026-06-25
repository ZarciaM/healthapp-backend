import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import passport from "passport";
import rateLimit from "express-rate-limit";
import { env } from "./config/env.js";
import { initializePassport } from "./config/passport.js";
import { notFoundHandler } from "./middlewares/notFound.middleware.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import authRoutes from "./modules/auth/auth.routes.js";
import googleAuthRoutes from "./modules/auth/google.routes.js";
import healthProfileRoutes from "./modules/healthProfile/healthProfile.routes.js";
import bmiRoutes from "./modules/bmi/bmi.routes.js";

const app = express();

app.use(helmet());
app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

initializePassport();
app.use(passport.initialize());

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
});
app.use("/api", globalLimiter);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/auth", authRoutes);
app.use("/api/auth", googleAuthRoutes);
app.use("/api/health-profile", healthProfileRoutes);
app.use("/api/bmi", bmiRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
