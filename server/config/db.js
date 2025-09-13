const mongoose = require("mongoose");
const logger = require("./logger");

const connectDB = async () => {
  try {
    // MONGO_URL kontrolü
    if (!process.env.MONGO_URL) {
      throw new Error(
        "MONGO_URL çevre değişkeni tanımlanmamış. Lütfen .env dosyasını kontrol edin."
      );
    }

    const conn = await mongoose.connect(process.env.MONGO_URL);
    logger.info(`MongoDB bağlandı: ${conn.connection.host}`);
  } catch (error) {
    logger.error("MongoDB bağlantı hatası:", error);
    process.exit(1);
  }
};

module.exports = connectDB;
