const User = require("../models/User");
const bcrypt = require("bcryptjs");

// Sadece adminlerin erişebileceği admin oluşturma fonksiyonu
const createAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Email kontrolü
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Bu email zaten kayıtlı." });
    }

    // Şifreyi hashle
    const hashedPassword = await bcrypt.hash(password, 10);

    // Admin kullanıcı oluştur
    const admin = new User({
      name,
      email,
      password: hashedPassword,
      role: "admin", // Rolü doğrudan "admin" olarak belirliyoruz
    });

    await admin.save();

    res.status(201).json({ message: "Admin kullanıcı başarıyla oluşturuldu." });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Admin oluşturulurken bir hata oluştu.", error });
  }
};

// Tüm kullanıcıları listeleme (sadece adminler erişebilir)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const approveDoctor = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isDoctorApproved: true },
      { new: true }
    );
    if (!user) return next(new ApiError(404, "Kullanıcı bulunamadı"));
    res.json({ message: "Doktor onaylandı", user });
  } catch (err) {
    next(err);
  }
};
module.exports = { createAdmin, getAllUsers, approveDoctor };

module.exports = {
  createAdmin,
  getAllUsers,
  approveDoctor,
};
