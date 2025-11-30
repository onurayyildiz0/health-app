const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const hpp = require("hpp");

// 🛡 sanitize fonksiyonu (NoSQL injection ve XSS temizliği için)
function sanitize(obj) {
  if (typeof obj !== "object" || obj === null) return obj;

  for (let key in obj) {
    if (/^\$/.test(key) || key.includes(".")) {
      delete obj[key];
    } else {
      obj[key] = sanitize(obj[key]);
    }
  }
  return obj;
}

const applySecurity = (app) => {
  // Helmet
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
    })
  );

  // --- GÜNCELLENMİŞ CORS AYARI ---
  const corsOptions = {
    origin: (origin, callback) => {
      // 1. Env değişkenini al, virgüle böl ve BOŞLUKLARI TEMİZLE (.trim())
      const allowedOrigins = (process.env.CORS_ORIGINS || "")
        .split(",")
        .map((origin) => origin.trim()) // Boşluk hatasını önler
        .filter(Boolean);

      // 2. DEBUG: Render Loglarında ne olup bittiğini görmek için
      // (Sorun çözülünce bu console.log'ları silebilirsin)
      console.log("Gelen İstek Origin:", origin);
      console.log("İzin Verilenler:", allowedOrigins);

      // 3. Kontrol Mantığı
      // !origin: Postman, Mobile App veya Server-to-Server istekler için izin ver
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.error("CORS Engellendi:", origin);
        callback(new Error("CORS policy tarafindan engellenmis origin: " + origin));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  };

  app.use(cors(corsOptions));

  // Rate limiting
  const limiter = rateLimit({
    windowMs: Number(process.env.RATE_LIMIT_WINDOW || 15) * 60 * 1000,
    max: Number(process.env.RATE_LIMIT_MAX || 100),
    message: {
      success: false,
      message: "Çok fazla istek gönderildi, lütfen daha sonra tekrar deneyin",
    },
    standardHeaders: true,
    legacyHeaders: false,
  });

  app.use("/api", limiter);

  // XSS + NoSQL temizleme
  app.use((req, res, next) => {
    if (req.body) req.body = sanitize(req.body);
    if (req.query) req.query = sanitize({ ...req.query });
    if (req.params) req.params = sanitize(req.params);
    next();
  });

  // HPP
  app.use(
    hpp({
      whitelist: ["sort", "fields", "page", "limit", "category"],
    })
  );
};

module.exports = applySecurity;