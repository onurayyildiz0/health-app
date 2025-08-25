const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const validate = require("../middlewares/validate");
const {
  registerValidation,
  loginValidation,
  refreshValidation,
} = require("../validators/authValidators");
const { auth } = require("../middlewares/auth");
const { register, login, refresh, logout } = authController;

// Kayıt
router.post("/register", registerValidation, validate, register);

// Giriş
router.post("/login", loginValidation, validate, login);

// Token yenileme
router.post("/refresh", refreshValidation, validate, refresh);

// Çıkış (korumalı route, refresh token ile çıkış)
router.post("/logout", auth, logout);

module.exports = router;
