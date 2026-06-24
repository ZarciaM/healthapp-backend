import mongoose from "mongoose";
import app from "./app.js";
import { env } from "./config/env.js";
import { connectDB } from "./config/db.js";
import logger from "./utils/logger.js";

async function start(): Promise<void> {
  await connectDB();

  const server = app.listen(env.PORT, () => {
    logger.info(`Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
  });

  const gracefulShutdown = async (signal: string, exitCode = 0) => {
    logger.info(`${signal} received — shutting down gracefully`);

    const shutdownTimeout = setTimeout(() => {
      logger.error("Shutdown timed out, forcing exit");
      process.exit(1);
    }, 10000); // 10 second grace period

    server.close(() => {
      logger.info("HTTP server closed");
      mongoose.connection.close(false).then(() => {
        logger.info("MongoDB connection closed");
        clearTimeout(shutdownTimeout);
        process.exit(exitCode);
      });
    });
  };

  process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
  process.on("SIGINT", () => gracefulShutdown("SIGINT"));

  process.on("unhandledRejection", (reason) => {
    logger.error("Unhandled rejection:", reason);
    gracefulShutdown("unhandledRejection", 1);
  });
}

start().catch((error) => {
  logger.error(`Failed to start server: ${error instanceof Error ? error.stack || error.message : String(error)}`);
  process.exit(1);
});
