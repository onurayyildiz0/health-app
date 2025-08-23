const Doctor = require("../models/Doctor");
const Review = require("../models/Review");
const User = require("../models/User"); // User modelini ekliyoruz

const createDoctor = async (req, res) => {
  try {
    // Kullanıcının "doctor" rolüne sahip olup olmadığını kontrol et
    const user = await User.findById(req.body.user);
    if (!user || user.role !== "doctor") {
      return res.status(400).json({
        message:
          "Sadece 'doctor' rolüne sahip kullanıcılar doktor olarak eklenebilir.",
      });
    }

    const doctor = new Doctor({
      user: req.body.user, // User'ın _id'si
      speciality: req.body.speciality,
      clocks: req.body.clocks,
    });
    await doctor.save();
    res.status(201).json(doctor);
  } catch (error) {
    res.status(500).json({ message: "Error creating doctor", error });
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
    const speciality = req.query.speciality;
    const doctors = await Doctor.find(
      speciality ? { speciality } : {}
    ).populate("user");
    res.status(200).json(doctors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getDoctorReviews = async (req, res) => {
  try {
    const doctorId = req.params.id;
    const reviews = await Review.find({ doctor: doctorId }).sort({
      rating: -1,
    });
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getDoctorsByMaxRating = async (req, res) => {
  try {
    // Tüm doktorları çek
    const doctors = await Doctor.find();
    // Her doktorun en yüksek puanlı review'unu bul
    const doctorRatings = await Promise.all(
      doctors.map(async (doctor) => {
        const maxReview = await Review.find({ doctor: doctor._id })
          .sort({ rating: -1 })
          .limit(1);
        return {
          doctor,
          maxRating: maxReview[0] ? maxReview[0].rating : 0,
        };
      })
    );
    // Doktorları en yüksek puana göre sırala
    doctorRatings.sort((a, b) => b.maxRating - a.maxRating);
    // Sadece doktorları döndür
    res.status(200).json(doctorRatings.map((item) => item.doctor));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
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
};
