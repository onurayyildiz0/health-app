const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

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
    const { name, email, avatar } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı." });
    }

    // Güncellenebilir alanlar
    if (name) user.name = name;
    if (email) user.email = email;
    if (avatar !== undefined) user.avatar = avatar;

    await user.save();

    res.status(200).json({ message: "Profil başarıyla güncellendi.", user });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Profil güncellenirken bir hata oluştu.", error });
  }
};

const getFavoriteDoctors = async (req, res) => {
  const user = await User.findById(req.user.id).populate({
    path: "favorites",
    populate: {
      path: "user",
      select: "name email avatar"
    }
  });
  if (!user) {
    return res
      .status(404)
      .json({ success: false, message: "Kullanıcı bulunamadı." });
  }
  res.json({ favorites: user.favorites });
};

const addFavoriteDoctor = async (req, res) => {
  const userId = req.user.id;
  const doctorId = req.body.doctorId;
  await User.findByIdAndUpdate(
    userId,
    { $addToSet: { favorites: doctorId } },
    { new: true }
  );
  res.json({ success: true, message: "Favori doktora eklendi." });
};

const removeFavoriteDoctor = async (req, res) => {
  const userId = req.user.id;
  const doctorId = req.params.doctorId;
  await User.findByIdAndUpdate(
    userId,
    { $pull: { favorites: doctorId } },
    { new: true }
  );
  res.json({ success: true, message: "Favori doktor kaldırıldı." });
};

const getHealthHistory = async (req, res) => {
  const user = await User.findById(req.user.id);
  res.json({ healthHistory: user.healthHistory });
};

module.exports = {
  getProfile,
  addFavoriteDoctor,
  removeFavoriteDoctor,
  getFavoriteDoctors,

  getHealthHistory,
  updateProfile,
};
