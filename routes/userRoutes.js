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

// Kullanıcı profilini görüntüleme
/**
 * @swagger
 * /api/users/me:
 *   get:
 *     summary: Kullanıcı profilini getirir
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Kullanıcı profili
 */
router.get("/me", auth, getProfile);

// Kullanıcı profilini güncelleme
/**
 * @swagger
 * /api/users/me:
 *   put:
 *     summary: Kullanıcı profilini günceller
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profil başarıyla güncellendi
 */
router.put("/me", auth, updateProfile);

// Favori doktora ekle
/**
 * @swagger
 * /api/users/favorites/add:
 *   post:
 *     summary: Favori doktora ekler
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               doctorId:
 *                 type: string
 *                 description: Doktorun ID'si
 *     responses:
 *       200:
 *         description: Favori doktor eklendi
 */
router.post(
  "/favorites/add",
  auth,
  authorizeRoles("patient"),
  addFavoriteDoctor
);

// Favori doktoru sil
/**
 * @swagger
 * /api/users/favorites/{doctorId}:
 *   delete:
 *     summary: Favori doktoru siler
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: doctorId
 *         schema:
 *           type: string
 *         required: true
 *         description: Doktorun ID'si
 *     responses:
 *       200:
 *         description: Favori doktor silindi
 */
router.delete(
  "/favorites/:doctorId",
  auth,
  authorizeRoles("patient"),
  removeFavoriteDoctor
);

// Favori doktorları getir
/**
 * @swagger
 * /api/users/favorites:
 *   get:
 *     summary: Favori doktorları getirir
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Favori doktorlar listesi
 */
router.get("/favorites", auth, authorizeRoles("patient"), getFavoriteDoctors);

// Sağlık geçmişi getir
/**
 * @swagger
 * /api/users/health-history:
 *   get:
 *     summary: Kullanıcının sağlık geçmişini getirir
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sağlık geçmişi listesi
 */
router.get(
  "/health-history",
  auth,
  authorizeRoles("patient"),
  getHealthHistory
);

module.exports = router;
