const Doctor = require("../models/Doctor");
const Review = require("../models/Review");
const User = require("../models/User"); // User modelini ekliyoruz



const createDoctor = async (req, res) => {
  try {
    // Kullanıcının "doctor" rolüne sahip olup olmadığını kontrol et
    const user = await User.findById(req.user.id);
    if (!user || user.role !== "doctor") {
      return res.status(400).json({
        message:
          "Sadece 'doctor' rolüne sahip kullanıcılar doktor olarak eklenebilir.",
      });
    }

    if (!user.isDoctorApproved) {
      return res
        .status(403)
        .json({ message: "Doktor henüz admin tarafından onaylanmadı." });
    }

    const doctor = new Doctor({
      user: req.user.id, // User'ın _id'si
      speciality: req.body.speciality,
      clocks: req.body.clocks,
    });
    await doctor.save();
    res.status(201).json(doctor);
  } catch (error) {
    res.status(500).json({ message: "Error creating doctor", error });
    console.log(error);
  }
};

/*const getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find();
    res.status(200).json(doctors);
  } catch (error) {
    res.status(500).json({ message: "Error fetching doctors", error });
  }
};*/

const getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id).populate("user");
    if (!doctor) {
      return res.status(404).json({ msg: "Doktor bulunamadı" });
    }
    res.json(doctor);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

const deleteDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndDelete(req.params.id);
    if (!doctor) {
      return res.status(404).json({ message: "Doktor bulunamadı" });
    }
    res.json({ message: "Doktor başarıyla silindi." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      {
        user: req.body.user,
        speciality: req.body.speciality,
        clocks: req.body.clocks,
      },
      { new: true }
    );
    if (!doctor) {
      return res.status(404).json({ message: "Doktor bulunamadı" });
    }
    res.json({ message: "Doktor başarıyla güncellendi", doctor });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//Get /api/doctors?speciality=kardiyoloji gibi

const getDoctorsBySpeciality = async (req, res) => {
  try {
    const { speciality, sort, page = 1, limit = 12, search, minRating } = req.query;

    // Filtreleme
    const filter = {};
    if (speciality) filter.speciality = speciality;

    // Arama (isim veya branş)
    let aggregatePipeline = [
      { $match: filter },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' }
    ];
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      aggregatePipeline.push({
        $match: {
          $or: [
            { 'user.name': { $regex: searchRegex } },
            { speciality: { $regex: searchRegex } }
          ]
        }
      });
    }
    // Sıralama
    if (sort === 'asc') aggregatePipeline.push({ $sort: { 'user.name': 1 } });
    else if (sort === 'desc') aggregatePipeline.push({ $sort: { 'user.name': -1 } });
    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    aggregatePipeline.push({ $skip: skip }, { $limit: limitNum });
    // Toplam sayı (arama ile uyumlu)
    const countPipeline = [...aggregatePipeline];
    countPipeline.pop(); // limit
    countPipeline.pop(); // skip
    countPipeline.push({ $count: 'total' });
    const [totalResult] = await Doctor.aggregate(countPipeline);
    const total = totalResult ? totalResult.total : 0;
    // Doktorları getir
    const doctors = await Doctor.aggregate(aggregatePipeline);
    res.status(200).json({
      doctors,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
        limit: limitNum
      }
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Doktorlar alınırken bir hata oluştu.", error });
  }
};

const getDoctorReviews = async (req, res) => {
  try {
    const doctorId = req.params.id;

    // Değerlendirmeleri al
    const reviews = await Review.find({ doctor: doctorId }).sort({
      rating: -1,
    });

    // Ortalama puan ve değerlendirme sayısını hesapla
    const totalReviews = reviews.length;
    const averageRating =
      totalReviews > 0
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
        : 0;

    res.status(200).json({
      reviews,
      totalReviews,
      averageRating: averageRating.toFixed(1), // Ondalıklı sayı formatı
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Değerlendirmeler alınırken bir hata oluştu.", error });
  }
};

const getDoctorsByMaxRating = async (req, res) => {
  try {
    const doctorRatings = await Review.aggregate([
      {
        $group: {
          _id: "$doctor",
          maxRating: { $max: "$rating" },
        },
      },
      {
        $lookup: {
          from: "doctors",
          localField: "_id",
          foreignField: "_id",
          as: "doctor",
        },
      },
      {
        $sort: { maxRating: -1 },
      },
    ]);

    res.status(200).json(doctorRatings.map((item) => item.doctor[0]));
  } catch (error) {
    res
      .status(500)
      .json({ message: "Doktorlar sıralanırken bir hata oluştu.", error });
  }
};

const setDoctorSchedule = async (req, res) => {
  try {
    const { clocks } = req.body;

    const doctor = await Doctor.findOneAndUpdate(
      { user: req.user.id },
      { clocks },
      { new: true }
    );

    if (!doctor) {
      return res.status(404).json({ message: "Doktor bulunamadı." });
    }

    res
      .status(200)
      .json({ message: "Çalışma saatleri başarıyla güncellendi.", doctor });
  } catch (error) {
    res.status(500).json({
      message: "Çalışma saatleri güncellenirken bir hata oluştu.",
      error,
    });
  }
};

const addHealthHistory = async (req, res) => {
  const patientId = req.body.patientId; // Doktor, hastanın id'sini body'den göndermeli
  const { diagnosis, treatment, notes } = req.body;
  await User.findByIdAndUpdate(
    patientId, // HASTANIN id'si!
    { $push: { healthHistory: { diagnosis, treatment, notes } } },
    { new: true }
  );
  res.json({ success: true, message: "Sağlık geçmişi eklendi." });
};

module.exports = {
  createDoctor,
  //getAllDoctors,
  getDoctorById,
  deleteDoctor,
  updateDoctor,
  getDoctorsBySpeciality,
  getDoctorReviews,
  getDoctorsByMaxRating,
  setDoctorSchedule,
  addHealthHistory,
};
