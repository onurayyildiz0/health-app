const User = require("../models/User");
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

  // Email kontrolü
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new ApiError(400, "Bu email adresi zaten kayıtlı"));
  }

  // Kullanıcı oluştur
  const user = await User.create({
    name,
    email,
    password,
    role,
  });

  // Token'lar oluştur
  const payload = { id: user._id, role: user.role };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  // Refresh token'ı kaydet
  user.refreshTokens.push(refreshToken);
  await user.save();

  res.status(201).json(
    new ApiResponse(201, "Kayıt başarılı", {
      user,
      tokens: {
        accessToken,
        refreshToken,
      },
    })
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
};
