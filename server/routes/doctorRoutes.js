const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const validate = require("../middlewares/validate");

const { getMyClocks, createDoctor, getAllDoctors, getDoctorById, deleteDoctor, updateDoctor, getDoctorsBySpeciality, getDoctorReviews, getDoctorsByMaxRating, setDoctorSchedule, addHealthHistory, getMyDoctorProfile, addUnavailableDate } = require("../controllers/doctorController");

const { auth, authorizeRoles } = require("../middlewares/auth");

// Yeni doktor oluştur
/**
 * @swagger
 * /api/doctors:
 *   post:
 *     summary: Yeni doktor oluşturur
 *     tags: [Doctor]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user:
 *                 type: string
 *                 description: Kullanıcı ID'si
 *               speciality:
 *                 type: string
 *                 description: Branş
 *               clocks:
 *                 type: object
 *                 description: Haftalık çalışma saatleri
 *     responses:
 *       201:
 *         description: Doktor başarıyla oluşturuldu
 */
router.post(
  "/",
  [
    body("user")
      .notEmpty()
      .withMessage("Kullanıcı ID zorunlu")
      .isMongoId()
      .withMessage("Geçerli kullanıcı ID girin"),
    body("speciality")
      .notEmpty()
      .withMessage("Branş zorunlu")
      .isLength({ min: 3 })
      .withMessage("Branş en az 3 karakter olmalı")
      .matches(/^[a-zA-ZğüşöçıİĞÜŞÖÇ ]+$/)
      .withMessage("Branş sadece harf ve boşluk içerebilir"),
    body("clocks").custom((clocks) => {
      if (typeof clocks !== "object" || !clocks)
        throw new Error("Çalışma saatleri zorunlu");
      const days = [
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
        "sunday",
      ];
      for (const day of days) {
        if (clocks[day]) {
          const { start, end } = clocks[day];
          if (
            !/^([01]\d|2[0-3]):([0-5]\d)$/.test(start) ||
            !/^([01]\d|2[0-3]):([0-5]\d)$/.test(end)
          ) {
            throw new Error(`${day} için saat formatı HH:mm olmalı`);
          }
          if (start >= end) {
            throw new Error(
              `${day} için başlangıç saati bitiş saatinden önce olmalı`
            );
          }
        }
      }
      return true;
    }),
  ],
  validate,
  auth,
  authorizeRoles("admin", "doctor"), // veya uygun rol
  createDoctor // controller fonksiyonun adı
);


// İzin ekleme rotası (me/schedule civarına ekleyebilirsin)
router.post("/me/unavailable", auth, authorizeRoles('doctor'), addUnavailableDate);

// Branşa göre doktorları getir
/**
 * @swagger
 * /api/doctors:
 *   get:
 *     summary: Branşa göre doktorları listeler
 *     tags: [Doctor]
 *     parameters:
 *       - in: query
 *         name: speciality
 *         schema:
 *           type: string
 *         required: false
 *         description: Branş adı (isteğe bağlı)
 *     responses:
 *       200:
 *         description: Doktor listesi
 */
router.get("/", getDoctorsBySpeciality); // /api/doctors?speciality=Kardiyoloji

// Sağlık geçmişi ekle
/**
 * @swagger
 * /api/doctors/health-history:
 *   post:
 *     summary: Hastaya sağlık geçmişi ekler
 *     tags: [Doctor]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               patientId:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Sağlık geçmişi başarıyla eklendi
 */
router.post(
  "/health-history",
  auth,
  authorizeRoles("doctor"),
  addHealthHistory
);


// En yüksek puanlı doktorlar
/**
 * @swagger
 * /api/doctors/max-rating:
 *   get:
 *     summary: En yüksek puanlı doktorları getirir
 *     tags: [Doctor]
 *     responses:
 *       200:
 *         description: En yüksek puanlı doktorlar listelendi
 */
router.get("/max-rating", getDoctorsByMaxRating);



router.get('/me', auth, authorizeRoles('doctor'), getMyDoctorProfile);

// Doktor kendi çalışma saatini günceller

/**
 * @swagger
 * /api/doctors/me/schedule:
 *   put:
 *     summary: Doktor kendi çalışma saatini günceller
 *     tags: [Doctor]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               clocks:
 *                 type: object
 *     responses:
 *       200:
 *         description: Çalışma saatleri güncellendi
 */
router.put("/me/schedule", auth, authorizeRoles('doctor'), setDoctorSchedule);


// Doktor sil
/**
 * @swagger
 * /api/doctors/{id}:
 *   delete:
 *     summary: Doktoru siler
 *     tags: [Doctor]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Doktor ID'si
 *     responses:
 *       200:
 *         description: Doktor başarıyla silindi
 */
router.delete("/:id", deleteDoctor);
// Doktor güncelle
/**
 * @swagger
 * /api/doctors/{id}:
 *   put:
 *     summary: Doktoru günceller
 *     tags: [Doctor]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Doktor ID'si
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               speciality:
 *                 type: string
 *               clocks:
 *                 type: object
 *     responses:
 *       200:
 *         description: Doktor başarıyla güncellendi
 */
router.put("/:id", updateDoctor);
// Doktorun yorumları
/**
 * @swagger
 * /api/doctors/{id}/reviews:
 *   get:
 *     summary: Doktorun yorumlarını getirir
 *     tags: [Doctor]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Doktor ID'si
 *     responses:
 *       200:
 *         description: Doktorun yorumları listelendi
 */
router.get("/:id/reviews", getDoctorReviews);




// Doktor detayları
/**
 * @swagger
 * /api/doctors/{id}:
 *   get:
 *     summary: Doktor detaylarını getirir
 *     tags: [Doctor]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Doktor ID'si
 *     responses:
 *       200:
 *         description: Doktor detayları
 */
router.get("/:id", getDoctorById);








module.exports = router;
