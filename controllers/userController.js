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
  getProfile,

  updateProfile,
};
