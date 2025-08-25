const { body } = require("express-validator");

const registerValidation = [
  body("name")
    .notEmpty()
    .withMessage("İsim zorunlu")
    .isLength({ min: 2, max: 50 })
    .withMessage("İsim 2-50 karakter arasında olmalı"),
  body("email").isEmail().withMessage("Geçerli email giriniz").normalizeEmail(),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Şifre en az 6 karakter olmalı")
    .matches(/^(?=.*[a-zğüşıöç])(?=.*[A-ZĞÜŞİÖÇ])(?=.*\d)/)
    .withMessage(
      "Şifre en az bir küçük harf, bir büyük harf ve bir rakam içermelidir"
    ),
];

const loginValidation = [
  body("email").isEmail().withMessage("Geçerli email giriniz").normalizeEmail(),
  body("password").notEmpty().withMessage("Şifre zorunlu"),
];

const refreshValidation = [
  body("refreshToken").notEmpty().withMessage("Refresh token zorunlu"),
];

module.exports = {
  registerValidation,
  loginValidation,
  refreshValidation,
};
