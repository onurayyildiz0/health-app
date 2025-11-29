const User = require("../models/User");
const bcrypt = require("bcryptjs");
const Doctor = require("../models/Doctor");

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

// Role göre kullanıcıları getir
const getUsersByRole = async (req, res) => {
  try {
    const { role } = req.params;

    // Geçerli rol kontrolü
    const validRoles = ['admin', 'doctor', 'patient'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        message: "Geçersiz rol. Geçerli roller: admin, doctor, patient"
      });
    }

    const users = await User.find({ role });
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

// Get pending doctors (awaiting approval)
const getPendingDoctors = async (req, res) => {
  try {
    const pendingDoctors = await User.find({
      role: 'doctor',
      isDoctorApproved: false
    }).select('name email createdAt doctorDocuments');

    res.status(200).json(pendingDoctors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı." });
    }
    // Eğer silinen kullanıcı doktor ise, ona bağlı Doctor kaydını da sil
    if (user.role === "doctor") {
      await Doctor.deleteOne({ user: user._id });
    }
    res.status(200).json({ message: "Kullanıcı başarıyla silindi." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createAdmin,
  getAllUsers,
  getUsersByRole,
  approveDoctor,
  getPendingDoctors,
  deleteUser,
};
