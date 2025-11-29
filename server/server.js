require("dotenv").config();
const app = require("./app");
const cron = require("node-cron");
const connectDB = require("./config/db");
const logger = require("./config/logger");
const Appointment = require("./models/Appointment");
const User = require("./models/User");
const { sendVerificationEmail } = require("./controllers/authController");

const PORT = process.env.PORT || 5001;

if (process.nextTick.NODE_ENV !== "test") {
}
// MongoDB bağlantısı
connectDB();

// Server başlat
const server = app.listen(PORT, () => {
  logger.info(
    `Server ${process.env.NODE_ENV} modunda ${PORT} portunda çalışıyor`
  );
});

cron.schedule("0 * * * *", async () => {
  console.log("Cron job çalıştı:", new Date());
  try {
    const now = new Date();
    const next24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    // Sadece 24 saat sonra başlayacak randevuları bul (ör: 24-25 saat arası)
    const appointments = await Appointment.find({
      date: {
        $gte: next24h,
        $lt: new Date(next24h.getTime() + 60 * 60 * 1000), // 24-25 saat arası
      },
      reminderSent: { $ne: true },
    }).populate("patient");

    for (const appointment of appointments) {
      if (appointment.patient && appointment.patient.email) {
        await sendVerificationEmail(
          appointment.patient.email,
          null,
          "Randevu Hatırlatma",
          `Sayın ${appointment.patient.name},\n\nYarın saat ${appointment.start}'de doktor randevunuz bulunmaktadır.`
        );
        appointment.reminderSent = true;
        await appointment.save();
        console.log("Hatırlatma gönderildi:", appointment._id);
      }
    }
  } catch (err) {
    logger.error("Randevu hatırlatma cron job hatası:", err);
  }
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
