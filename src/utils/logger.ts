import winston from "winston";
import path from "path";
import fs from "fs";

const isVercel = !!process.env.VERCEL;
const logDir = "logs";

const transports: winston.transport[] = [
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    ),
  }),
];

// Local machine only
if (!isVercel) {
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  transports.push(
    new winston.transports.File({
      filename: path.join(logDir, "error.log"),
      level: "error",
    })
  );

  transports.push(
    new winston.transports.File({
      filename: path.join(logDir, "combined.log"),
    })
  );
}

export const logger = winston.createLogger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports,
});

export const stream = {
  write(message: string) {
    logger.info(message.trim());
  },
};