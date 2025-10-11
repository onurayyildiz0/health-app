const User = require("../models/User");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
//const nodemailer = require("nodemailer");
const sgMail = require("@sendgrid/mail");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");
const logger = require("../config/logger");
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

  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  const msg = {
    to: userEmail,
    from: "healtysystemapp@gmail.com", // SendGrid'de doğruladığınız e-posta adresi
    subject: subject || "Hesap Doğrulama",
    // E-postanın metin versiyonu (HTML desteklemeyen istemciler için)
    text: text || `Hesabınızı doğrulamak için lütfen aşağıdaki linke tıklayın: ${process.env.APP_URL}/api/auth/verify/${token}`,
    // E-postanın güzel görünen HTML versiyonu
    html:
      text ||
      `<strong>Hesabınızı doğrulamak için şu linke tıklayın:</strong> <a href="${process.env.APP_URL}/api/auth/verify/${token}">Doğrulama Linki</a>`,
  };

  try {
    await sgMail.send(msg);
    console.log(`E-posta başarıyla ${userEmail} adresine gönderildi.`);
  } catch (error) {
    // Hata olursa konsola detaylı bir şekilde yazdırıyoruz
    console.error("SendGrid e-posta gönderme hatası:", error);
    if (error.response) {
      console.error(error.response.body);
    }
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