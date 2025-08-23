const User = require("../models/User");
const bcrypt = require("bcryptjs");

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
    // Şifreyi hashle
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role,
    });
    await user.save();
    res.status(201).json({ message: "Kullanıcı başarıyla oluşturuldu.", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Tüm kullanıcıları (hasta ve doktor) getiren API fonksiyonu
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerUser,
  getAllUsers,
};
