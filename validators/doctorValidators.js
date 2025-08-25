const { body } = require("express-validator");

const createDoctorValidation = [
  body("name")
    .notEmpty()
    .withMessage("Doktor adı zorunlu")
    .isLength({ min: 2, max: 50 })
    .withMessage("Ad 2-50 karakter olmalı"),
  body("email").isEmail().withMessage("Geçerli email giriniz").normalizeEmail(),
  body("specialty").notEmpty().withMessage("Uzmanlık alanı zorunlu"),
  body("phone")
    .optional()
    .isMobilePhone("tr-TR")
    .withMessage("Geçerli telefon numarası giriniz"),
];

module.exports = { createDoctorValidation };
