import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import passport from "passport";
import rateLimit from "express-rate-limit";
import { env } from "./config/env.js";
import { initializePassport } from "./config/passport.js";
import { setupSwagger } from "./config/swagger.js";
import { notFoundHandler } from "./middlewares/notFound.middleware.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import authRoutes from "./modules/auth/auth.routes.js";
import googleAuthRoutes from "./modules/auth/google.routes.js";
import healthProfileRoutes from "./modules/healthProfile/healthProfile.routes.js";
import bmiRoutes from "./modules/bmi/bmi.routes.js";
import weightRoutes from "./modules/weight/weight.routes.js";
import caloriesRoutes from "./modules/calories/calories.routes.js";
import waterRoutes from "./modules/water/water.routes.js";
import sleepRoutes from "./modules/sleep/sleep.routes.js";
import bloodPressureRoutes from "./modules/bloodPressure/bloodPressure.routes.js";
import heartRateRoutes from "./modules/heartRate/heartRate.routes.js";
import bodyFatRoutes from "./modules/bodyFat/bodyFat.routes.js";
import pushSubscriptionRoutes from "./modules/notifications/pushSubscription.routes.js";
import medicationRoutes from "./modules/medication/medication.routes.js";
import dataSharingRoutes from "./modules/dataSharing/dataSharing.routes.js";
import menstrualCycleRoutes from "./modules/menstrualCycle/menstrualCycle.routes.js";
import pregnancyRoutes from "./modules/pregnancy/pregnancy.routes.js";
import hydrationRoutes from "./modules/hydration/hydration.routes.js";
import dashboardRoutes from "./modules/dashboard/dashboard.routes.js";

const app = express();

app.use(helmet());
app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

initializePassport();
app.use(passport.initialize());

setupSwagger(app);

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
app.use("/api/weight", weightRoutes);
app.use("/api/calories", caloriesRoutes);
app.use("/api/water", waterRoutes);
app.use("/api/sleep", sleepRoutes);
app.use("/api/blood-pressure", bloodPressureRoutes);
app.use("/api/heart-rate", heartRateRoutes);
app.use("/api/body-fat", bodyFatRoutes);
app.use("/api/push-subscriptions", pushSubscriptionRoutes);
app.use("/api/medications", medicationRoutes);
app.use("/api/data-sharing", dataSharingRoutes);
app.use("/api/menstrual-cycle", menstrualCycleRoutes);
app.use("/api/pregnancy", pregnancyRoutes);
app.use("/api/hydration", hydrationRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
