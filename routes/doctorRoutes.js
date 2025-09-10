const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const validate = require("../middlewares/validate");

const {
  createDoctor,
  getAllDoctors,
  getDoctorById,
  deleteDoctor,
  updateDoctor,
  getDoctorsBySpeciality,
  getDoctorReviews,
  getDoctorsByMaxRating,
  setDoctorSchedule,
  addHealthHistory,
} = require("../controllers/doctorController");

const { auth, authorizeRoles } = require("../middlewares/auth");

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
router.get("/", getDoctorsBySpeciality); // /api/doctors?speciality=Kardiyoloji
router.get("/max-rating", getDoctorsByMaxRating);
router.get("/:id", getDoctorById);
router.delete("/:id", deleteDoctor);
router.put("/:id", updateDoctor);
router.get("/:id/reviews", getDoctorReviews);
router.put("/me/schedule", setDoctorSchedule);
router.post(
  "/health-history",
  auth,
  authorizeRoles("doctor"),
  addHealthHistory
);

module.exports = router;
