const { createLogger, format, transports } = require("winston");

const logger = createLogger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  format: format.combine(
    format.timestamp({
      format: "YYYY-MM-DD HH:mm:ss",
    }),
    format.errors({ stack: true }),
    format.printf(({ level, message, timestamp, stack }) => {
      return `${timestamp} [${level.toUpperCase()}]: ${stack || message}`;
    })
  ),
  transports: [
    new transports.Console({
      format: format.combine(format.colorize(), format.simple()),
    }),
  ],
});

// Production'da dosyaya da log yaz
if (process.env.NODE_ENV === "production") {
  logger.add(
    new transports.File({
      filename: "logs/health-error.log",
      level: "error",
    })
  );
  logger.add(
    new transports.File({
      filename: "logs/health-combined.log",
    })
  );
}

module.exports = logger;
