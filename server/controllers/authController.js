const User = require("../models/User");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} = require("../utils/jwt");

// Kayıt
const register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new ApiError(400, "Bu email adresi zaten kayıtlı"));
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString("hex");

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      isVerified: false,
      verificationToken,
    });

    // 🔹 Response'u hemen dön
    res.status(201).json(
      new ApiResponse(201, "Kayıt başarılı. Lütfen e-postanızı doğrulayın.", {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified,
        },
      })
    );

    // 🔹 Maili arka planda gönder
    sendVerificationEmail(user.email, verificationToken);

  } catch (error) {
    next(error);
  }
});

// E-posta gönderme fonksiyonu
async function sendVerificationEmail(userEmail, token, subject, text) {
  try {
    // Environment değişkenlerini kontrol et
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      logger.error("❌ EMAIL_USER veya EMAIL_PASS environment değişkenleri tanımlanmamış!");
      logger.error("Lütfen Render Dashboard'da Environment Variables bölümünden bu değişkenleri ekleyin:");
      logger.error("EMAIL_USER: Gmail adresiniz (örn: ornekmail@gmail.com)");
      logger.error("EMAIL_PASS: Gmail app password (2FA açık olmalı)");
      return;
    }

    logger.info(`📧 Mail gönderiliyor: ${userEmail}`);

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",  // Gmail SMTP host
      port: 587,               // TLS portu
      secure: false,           // STARTTLS kullanacak
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // Gmail app password
      },
      tls: {
        rejectUnauthorized: false,   // Render ortamında TLS sorunlarını önler
      },
      connectionTimeout: 20000,      // 20 saniye
    });

    const mailOptions = {
      from: process.env.EMAIL_USER, // Gmail adresinizi from olarak kullanın
      to: userEmail,
      subject: subject || "Hesap Doğrulama",
      text:
        text ||
        `Hesabınızı doğrulamak için şu linke tıklayın: ${process.env.APP_URL}/api/auth/verify/${token}`,
    };

    // Mail gönder ve sonucu logla
    await transporter.sendMail(mailOptions);
    logger.info(`✅ Mail başarıyla gönderildi: ${userEmail}`);
  } catch (err) {
    logger.error("❌ Mail gönderilemedi:", {
      error: err.message,
      code: err.code,
      command: err.command,
      recipient: userEmail
    });
  }
}



const verifyEmail = asyncHandler(async (req, res, next) => {
  const { token } = req.params;
  const user = await User.findOne({ verificationToken: token });
  if (!user) {
    return next(
      new ApiError(400, "Geçersiz veya süresi dolmuş doğrulama linki.")
    );
  }
  user.isVerified = true;
  user.verificationToken = undefined;
  await user.save();
  res.json(
    new ApiResponse(
      200,
      "E-posta başarıyla doğrulandı. Artık giriş yapabilirsiniz."
    )
  );
});
// Giriş
const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Kullanıcı kontrolü
  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.comparePassword(password))) {
    return next(new ApiError(401, "Geçersiz email veya şifre"));
  }

  // E-posta doğrulama kontrolü
  if (!user.isVerified) {
    return next(
      new ApiError(401, "Lütfen önce e-posta adresinizi doğrulayın.")
    );
  }

  // Token'lar oluştur
  const payload = { id: user._id, role: user.role };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  // Refresh token'ı kaydet
  user.refreshTokens.push(refreshToken);
  await user.save();

  res.status(200).json(
    new ApiResponse(200, "Giriş başarılı", {
      user,
      tokens: {
        accessToken,
        refreshToken,
      },
    })
  );
});

// Token yenileme
const refresh = asyncHandler(async (req, res, next) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return next(new ApiError(401, "Refresh token gerekli"));
  }

  try {
    const payload = verifyRefreshToken(refreshToken);

    // Kullanıcı ve token kontrolü
    const user = await User.findById(payload.id);
    if (!user || !user.refreshTokens.includes(refreshToken)) {
      return next(new ApiError(401, "Geçersiz refresh token"));
    }

    // Yeni access token oluştur
    const newAccessToken = signAccessToken({ id: user._id, role: user.role });

    res.status(200).json(
      new ApiResponse(200, "Token yenilendi", {
        accessToken: newAccessToken,
      })
    );
  } catch (error) {
    return next(new ApiError(401, "Geçersiz refresh token"));
  }
});

// Çıkış
const logout = asyncHandler(async (req, res, next) => {
  const { refreshToken } = req.body;
  const userId = req.user.id;

  if (refreshToken) {
    // Refresh token'ı kaldır
    await User.findByIdAndUpdate(userId, {
      $pull: { refreshTokens: refreshToken },
    });
  }

  res.status(200).json(new ApiResponse(200, "Çıkış başarılı"));
});

module.exports = {
  register,
  login,
  refresh,
  logout,
  verifyEmail,
  sendVerificationEmail,
};
