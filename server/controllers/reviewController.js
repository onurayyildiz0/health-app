const mongoose = require("mongoose"); // Aggregation için gerekli
const Review = require("../models/Review");
const Doctor = require("../models/Doctor");

// YARDIMCI FONKSİYON: Doktorun ortalama puanını ve yorum sayısını hesaplar
const updateDoctorStats = async (doctorId) => {
  try {
    const stats = await Review.aggregate([
      {
        $match: { doctor: new mongoose.Types.ObjectId(doctorId) },
      },
      {
        $group: {
          _id: "$doctor",
          nRating: { $sum: 1 }, // Toplam yorum sayısı
          avgRating: { $avg: "$rating" }, // Puan ortalaması
        },
      },
    ]);

    // Eğer yorum varsa hesaplanan değerleri, yoksa 0 değerlerini kaydet
    if (stats.length > 0) {
      await Doctor.findByIdAndUpdate(doctorId, {
        rating: stats[0].avgRating,
        reviewCount: stats[0].nRating,
      });
    } else {
      // Hiç yorum kalmadıysa (son yorum silindiyse)
      await Doctor.findByIdAndUpdate(doctorId, {
        rating: 0,
        reviewCount: 0,
      });
    }
  } catch (error) {
    console.error("Doktor puanı güncellenirken hata:", error);
  }
};

// Değerlendirme ekleme
const addReview = async (req, res) => {
  try {
    const { doctorId, rating, comment } = req.body;

    // Aynı hasta aynı doktora birden fazla değerlendirme yapamaz
    const existingReview = await Review.findOne({
      doctor: doctorId,
      patient: req.user.id,
    });

    if (existingReview) {
      return res
        .status(400)
        .json({ message: "Bu doktora zaten değerlendirme yaptınız." });
    }

    // Yeni değerlendirme oluştur
    const review = new Review({
      doctor: doctorId,
      patient: req.user.id,
      rating,
      comment,
    });

    await review.save();

    // *** BURASI EKLENDİ: Puanı hesapla ve Doktora kaydet ***
    await updateDoctorStats(doctorId);

    res
      .status(201)
      .json({ message: "Değerlendirme başarıyla eklendi.", review });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Değerlendirme eklenirken bir hata oluştu.", error });
  }
};

// Değerlendirmeleri listeleme
const getReviews = async (req, res) => {
  try {
    const doctorId = req.params.doctorId;

    const reviews = await Review.find({ doctor: doctorId })
      .populate("patient", "name email avatar") // Avatarı da çekmek isteyebilirsin frontendde kullanıyorsun
      .sort({ createdAt: -1 });

    res.status(200).json(reviews);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Değerlendirmeler alınırken bir hata oluştu.", error });
  }
};

// Değerlendirme silme
const deleteReview = async (req, res) => {
  try {
    const reviewId = req.params.id;

    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({ message: "Değerlendirme bulunamadı." });
    }

    // Silmeden önce doctorId'yi alalım ki sonra puanı güncelleyebilelim
    const doctorId = review.doctor;

    // Değerlendirmeyi sadece hasta veya admin silebilir
    if (
      review.patient.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ message: "Bu değerlendirmeyi silme yetkiniz yok." });
    }

    await review.deleteOne();

    // *** BURASI EKLENDİ: Silindikten sonra puanı tekrar hesapla ***
    await updateDoctorStats(doctorId);

    res.status(200).json({ message: "Değerlendirme başarıyla silindi." });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Değerlendirme silinirken bir hata oluştu.", error });
  }
};

module.exports = {
  addReview,
  getReviews,
  deleteReview,
  
};