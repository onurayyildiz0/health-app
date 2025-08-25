const express = require("express");
const { getProfile, updateProfile } = require("../controllers/userController");

const { auth } = require("../middlewares/auth");
const router = express.Router();

router.get("/me", auth, getProfile); // Kullanıcı profilini görüntüleme
router.put("/me", auth, updateProfile); // Kullanıcı profilini güncelleme

module.exports = router;
