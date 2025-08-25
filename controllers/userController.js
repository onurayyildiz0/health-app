const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { generateAccessToken, generateRefreshToken } = require("../utils/jwt");

// Kullanıcı kaydı
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    // Email benzersiz mi kontrolü
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Bu email ile kayıtlı kullanıcı var." });
    }

    // Rol kontrolü
    if (!["doctor", "patient"].includes(role)) {
      return res.status(400).json({
        message: "Geçersiz rol. Sadece 'doctor' veya 'patient' olabilir.",
      });
    }

    // Şifreyi hashle
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role,
    });
    await user.save();

    const accessToken = generateAccessToken({ id: user._id, role: user.role });
    const refreshToken = generateRefreshToken({
      id: user._id,
      role: user.role,
    });

    user.refreshTokens.push(refreshToken);
    await user.save();

    res.status(201).json({
      accessToken,
      refreshToken,
      user: { id: user._id, name: user.name, role: user.role },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Kayıt sırasında bir hata oluştu.", error });
  }
};

// kullanıcı girişi
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı." });
    }

    //şifre doğrulama
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Geçersiz şifre. " });
    }

    const accessToken = generateAccessToken({ id: user._id, role: user.role });
    const refreshToken = generateRefreshToken({
      id: user._id,
      role: user.role,
    });

    user.refreshTokens.push(refreshToken);
    await user.save();

    res.status(200).json({
      accessToken,
      refreshToken,
      user: { id: user._id, name: user.name, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ message: "Giriş sırasında bir hata oluştu", error });
    console.log(error);
  }
};

const refreshToken = async (req, res) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ message: "Token bulunamadı." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Yeni token oluştur
    const newToken = jwt.sign(
      { id: decoded.id, role: decoded.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({ token: newToken });
  } catch (error) {
    res.status(401).json({ message: "Token yenileme başarısız.", error });
  }
};

const blacklist = []; // Geçici bir liste, Redis gibi bir sistemde saklanabilir

const logoutUser = (req, res) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (token) {
      blacklist.push(token); // Token'ı blacklist'e ekle
      res.status(200).json({ message: "Başarıyla çıkış yapıldı." });
    } else {
      res.status(400).json({ message: "Token bulunamadı." });
    }
  } catch (error) {
    console.log(error);
  }
};

//profil görüntüleme
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password"); //şifreyi döndürme
    if (!user) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı." });
    }
    res.status(200).json(user);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Profil alınırken bir hata oluştu.", error });
  }
};

// Kullanıcı profilini güncelleme
const updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı." });
    }

    // Güncellenebilir alanlar
    if (name) user.name = name;
    if (email) user.email = email;

    await user.save();

    res.status(200).json({ message: "Profil başarıyla güncellendi.", user });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Profil güncellenirken bir hata oluştu.", error });
  }
};

module.exports = {
  registerUser,
  getProfile,
  loginUser,
  refreshToken,
  logoutUser,
  updateProfile,
};
