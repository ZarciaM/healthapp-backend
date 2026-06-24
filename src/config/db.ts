import mongoose from "mongoose";
import { env } from "./env.js";
import logger from "../utils/logger.js";

export async function connectDB(): Promise<void> {
  try {
    await mongoose.connect(env.MONGODB_URI);
    logger.info("MongoDB connected");
  } catch (error) {
    logger.error(`MongoDB connection failed: ${error instanceof Error ? error.stack || error.message : String(error)}`);
    process.exit(1);
  }

  mongoose.connection.on("disconnected", () => {
    logger.warn("MongoDB disconnected");
  });

  mongoose.connection.on("error", (err) => {
    logger.error("MongoDB connection error:", err);
  });
}
