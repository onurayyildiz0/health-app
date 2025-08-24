const express = require("express");
const {
  registerUser,
  loginUser,
  refreshToken,
  logoutUser,
  getProfile,
  updateProfile,
} = require("../controllers/userController");

const { auth } = require("../middlewares/auth");
const router = express.Router();

router.post("/register", registerUser); // Kullanıcı kaydı
router.post("/login", loginUser); // Kullanıcı girişi
router.post("/refresh-token", refreshToken); // Token yenileme
router.post("/logout", logoutUser); // Çıkış işlemi
router.get("/me", auth, getProfile); // Kullanıcı profilini görüntüleme
router.put("/me", auth, updateProfile); // Kullanıcı profilini güncelleme

module.exports = router;
