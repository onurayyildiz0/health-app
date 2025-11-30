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

const approveDoctor = async (req, res) => {
  try {
    // req.params.id burada Onaylanacak "User"ın ID'si olmalı
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isDoctorApproved: true },
      { new: true }
    );
    
    if (!user) {
        return res.status(404).json({ message: "Kullanıcı bulunamadı" });
    }

    res.json({ message: "Doktor onaylandı", user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// Get pending doctors (awaiting approval)
const getPendingDoctors = async (req, res) => {
  try {
    // 1. Önce onayı olmayan (isDoctorApproved: false) ve rolü doctor olan KULLANICILARI bul
    const unapprovedUsers = await User.find({
      role: 'doctor',
      isDoctorApproved: false
    }).select('_id'); // Sadece ID'lerini al

    // ID'leri bir listeye çevir
    const userIds = unapprovedUsers.map(u => u._id);

    // 2. Şimdi bu User ID'lerine sahip olan DOKTOR profillerini bul
    // ve user bilgilerini (isim, email, avatar vs.) içine göm (populate)
    const pendingDoctors = await Doctor.find({
      user: { $in: userIds }
    })
    .populate('user', 'name email avatar doctorDocuments createdAt'); 

    // Frontend'e şu formatta gider:
    // [
    //   { _id: "docId", speciality: "Kardiyoloji", user: { name: "Ahmet", email: "..." } }
    // ]
    
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
