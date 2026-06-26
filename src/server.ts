import mongoose from "mongoose";
import app from "./app.js";
import { env } from "./config/env.js";
import { connectDB } from "./config/db.js";
import logger from "./utils/logger.js";
import { startScheduler } from "./modules/notifications/scheduler.service.js";

async function start(): Promise<void> {
  await connectDB();
  startScheduler();

  const server = app.listen(env.PORT, () => {
    logger.info(`Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
  });

  const SHUTDOWN_TIMEOUT = 10_000;

  const gracefulShutdown = async (
    signal: string,
    exitCode = 0
  ): Promise<void> => {
    logger.info(`${signal} received — shutting down gracefully`);

    const timer = setTimeout(() => {
      logger.error("Shutdown timed out — forcing exit");
      process.exit(exitCode || 1);
    }, SHUTDOWN_TIMEOUT);

    server.close(() => {
      logger.info("HTTP server closed");

      mongoose.connection.close(false).then(() => {
        logger.info("MongoDB connection closed");
        clearTimeout(timer);
        process.exit(exitCode);
      }).catch((err) => {
        logger.error("Failed to close MongoDB connection:", err);
        clearTimeout(timer);
        process.exit(exitCode);
      });
    });
  };

  process.on("SIGTERM", () => void gracefulShutdown("SIGTERM"));
  process.on("SIGINT", () => void gracefulShutdown("SIGINT"));

  process.on("unhandledRejection", (reason) => {
    logger.error("Unhandled rejection:", reason);
    void gracefulShutdown("unhandledRejection", 1);
  });
}

start().catch((error) => {
  logger.error(
    `Failed to start server: ${
      error instanceof Error
        ? error.stack ?? error.message
        : String(error)
    }`
  );

  process.exit(1);
});