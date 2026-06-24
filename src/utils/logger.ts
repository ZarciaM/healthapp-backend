import winston from "winston";
import { env } from "../config/env.js";

const logger = winston.createLogger({
  level: env.NODE_ENV === "production" ? "info" : "debug",
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    debug: 3,
  },
  format:
    env.NODE_ENV === "production"
      ? winston.format.json()
      : winston.format.combine(
          winston.format.colorize(),
          winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
          winston.format.printf(({ timestamp, level, message, ...meta }) => {
            const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";
            return `${timestamp} ${level}: ${message}${metaStr}`;
          }),
        ),
  transports: [new winston.transports.Console()],
});

export default logger;
