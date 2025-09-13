const { body } = require("express-validator");

const createAppointmentValidation = [
  body("doctorId").notEmpty().withMessage("Doktor ID zorunlu"),
  body("date")
    .notEmpty()
    .withMessage("Randevu tarihi zorunlu")
    .isISO8601()
    .withMessage("Geçerli tarih giriniz"),
  body("reason")
    .optional()
    .isLength({ max: 200 })
    .withMessage("Açıklama en fazla 200 karakter olabilir"),
];

const cancelAppointmentValidation = [
  body("appointmentId").notEmpty().withMessage("Randevu ID zorunlu"),
];

module.exports = { createAppointmentValidation, cancelAppointmentValidation };
