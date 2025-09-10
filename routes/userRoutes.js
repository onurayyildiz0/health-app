const express = require("express");
const {
  getProfile,
  updateProfile,
  addFavoriteDoctor,
  removeFavoriteDoctor,
  getFavoriteDoctors,
  getHealthHistory,
} = require("../controllers/userController");

const { auth, authorizeRoles } = require("../middlewares/auth");
const router = express.Router();

router.get("/me", auth, getProfile); // Kullanıcı profilini görüntüleme
router.put("/me", auth, updateProfile); // Kullanıcı profilini güncelleme

router.post(
  "/favorites/add",
  auth,
  authorizeRoles("patient"),
  addFavoriteDoctor
);
router.delete(
  "/favorites/:doctorId",
  auth,
  authorizeRoles("patient"),
  removeFavoriteDoctor
);
router.get("/favorites", auth, authorizeRoles("patient"), getFavoriteDoctors);

router.get(
  "/health-history",
  auth,
  authorizeRoles("patient"),
  getHealthHistory
);

module.exports = router;
