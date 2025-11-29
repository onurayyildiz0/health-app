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
  // Eğer doktor ise speciality bilgisini de al
  const speciality = req.body.speciality;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new ApiError(400, "Bu email adresi zaten kayıtlı"));
    }

    // Check if doctor and document is provided
    if (role === 'doctor' && !req.file) {
      return next(new ApiError(400, "Doktor hesabı için belge yüklemesi zorunludur"));
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString("hex");

    const userData = {
      name,
      email,
      password: hashedPassword,
      role,
      isVerified: false,
      verificationToken,
    };

    // Add document path if doctor
    if (role === 'doctor' && req.file) {
      userData.doctorDocuments = req.file.path;
    }

    const user = await User.create(userData);

    // Eğer doktor ise Doctor tablosuna da ekle
    if (role === 'doctor' && speciality) {
      const Doctor = require("../models/Doctor");
      await Doctor.create({ user: user._id, speciality });
    }

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

  // Doktor onay kontrolü
  if (user.role === "doctor" && !user.isDoctorApproved) {
    return next(
      new ApiError(403, "Hesabınız henüz admin tarafından onaylanmamış. Lütfen onay bekleyin.")
    );
  }

  // Token'lar oluştur
  const payload = { id: user._id, role: user.role };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  // ✅ Eski refresh token'ları temizle (sadece son 3 tanesini tut)
  if (user.refreshTokens.length >= 3) {
    user.refreshTokens = user.refreshTokens.slice(-2); // Son 2 token'ı tut
  }

  // Yeni refresh token'ı ekle
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
  try {
    const { refreshToken } = req.body;
    const userId = req.user?.id;

    if (userId && refreshToken) {
      // Refresh token'ı kaldır
      await User.findByIdAndUpdate(userId, {
        $pull: { refreshTokens: refreshToken },
      });
    }

    res.status(200).json(new ApiResponse(200, "Çıkış başarılı"));
  } catch (error) {
    // Logout her zaman başarılı sayılır (frontend localStorage temizler)
    res.status(200).json(new ApiResponse(200, "Çıkış başarılı"));
  }
});

// Şifre sıfırlama isteği
const forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return next(new ApiError(404, "Bu email ile kayıtlı kullanıcı bulunamadı"));
  }

  // Reset token oluştur
  const resetToken = crypto.randomBytes(32).toString("hex");

  // Token'ı hash'le ve veritabanına kaydet
  user.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // Token 1 saat geçerli
  user.resetPasswordExpire = Date.now() + 60 * 60 * 1000;
  await user.save();

  // Reset URL oluştur
  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

  // Email gönder
  const message = `
    <h2>Şifre Sıfırlama İsteği</h2>
    <p>Şifrenizi sıfırlamak için aşağıdaki linke tıklayın:</p>
    <a href="${resetUrl}" style="display:inline-block;padding:10px 20px;background:#1890ff;color:white;text-decoration:none;border-radius:5px;">Şifremi Sıfırla</a>
    <p>Bu link 1 saat geçerlidir.</p>
    <p>Eğer bu isteği siz yapmadıysanız, bu emaili görmezden gelebilirsiniz.</p>
  `;

  try {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    await sgMail.send({
      to: user.email,
      from: process.env.SENDGRID_FROM_EMAIL || "healtysystemapp@gmail.com",
      subject: "Şifre Sıfırlama",
      html: message,
    });

    res.status(200).json(
      new ApiResponse(200, "Şifre sıfırlama linki email adresinize gönderildi")
    );
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    logger.error("Email gönderme hatası:", error);
    return next(new ApiError(500, "Email gönderilemedi"));
  }
});

// Şifreyi sıfırla
const resetPassword = asyncHandler(async (req, res, next) => {
  const { token } = req.params;
  const { password } = req.body;

  // Token'ı hash'le
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  // Kullanıcıyı bul ve token geçerliliğini kontrol et
  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ApiError(400, "Geçersiz veya süresi dolmuş token"));
  }

  // Yeni şifreyi hashle ve kaydet
  user.password = await bcrypt.hash(password, 10);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  res.status(200).json(
    new ApiResponse(200, "Şifreniz başarıyla sıfırlandı. Giriş yapabilirsiniz.")
  );
});

module.exports = {
  register,
  login,
  refresh,
  logout,
  verifyEmail,
  sendVerificationEmail,
  forgotPassword,
  resetPassword,
};