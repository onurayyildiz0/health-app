require("dotenv").config();
const app = require("./app");
const connectDB = require("./config/db");
const logger = require("./config/logger");

const PORT = process.env.PORT || 5001;

// MongoDB bağlantısı
connectDB();

// Server başlat
const server = app.listen(PORT, () => {
  logger.info(
    `Server ${process.env.NODE_ENV} modunda ${PORT} portunda çalışıyor`
  );
});

// Graceful shutdown
process.on("SIGTERM", () => {
  logger.info("SIGTERM sinyali alındı, sunucu kapatılıyor...");
  server.close(() => {
    logger.info("Sunucu kapatıldı");
    process.exit(0);
  });
});

process.on("unhandledRejection", (err) => {
  logger.error("Unhandled Promise Rejection:", err);
  server.close(() => {
    process.exit(1);
  });
});

module.exports = server;
