const express = require("express");
const { body, param } = require("express-validator");
const validate = require("../middlewares/validate");
const router = express.Router();
const {
  createAppointment,
  getAppointmentDetails,
  cancelAppointment,
  getDoctorAppointments,
} = require("../controllers/appointmentController");

const { auth, authorizeRoles } = require("../middlewares/auth");

router.post(
  "/",
  [
    body("doctor")
      .notEmpty()
      .withMessage("Doktor ID zorunlu")
      .isMongoId()
      .withMessage("Geçerli doktor ID girin"),
    body("date")
      .notEmpty()
      .withMessage("Tarih zorunlu")
      .isISO8601()
      .withMessage("Geçerli tarih formatı girin"),
    body("start")
      .notEmpty()
      .withMessage("Başlangıç saati zorunlu")
      .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
      .withMessage("Saat formatı HH:mm olmalı"),
    body("end")
      .notEmpty()
      .withMessage("Bitiş saati zorunlu")
      .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
      .withMessage("Saat formatı HH:mm olmalı"),
    body("notes")
      .optional()
      .isLength({ max: 200 })
      .withMessage("Not en fazla 200 karakter olmalı"),
  ],
  validate,
  auth,
  authorizeRoles("patient"),
  createAppointment
);
router.get("/doctor", auth, authorizeRoles("doctor"), getDoctorAppointments);
router.get("/:id", auth, getAppointmentDetails);

router.patch(
  "/:id/cancel",
  [
    param("id")
      .notEmpty()
      .withMessage("Randevu ID zorunlu")
      .isMongoId()
      .withMessage("Geçerli randevu ID girin"),
  ],
  validate,
  auth,
  cancelAppointment
);

module.exports = router;
