const express = require("express");
const {
  addReview,
  getReviews,
  deleteReview,
} = require("../controllers/reviewController");

const { auth, authorizeRoles } = require("../middlewares/auth");
const router = express.Router();

// Değerlendirme ekleme
/**
 * @swagger
 * /api/reviews:
 *   post:
 *     summary: Doktora değerlendirme ekle
 *     tags: [Review]
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
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               comment:
 *                 type: string
 *                 description: Yorum (isteğe bağlı)
 *     responses:
 *       201:
 *         description: Değerlendirme başarıyla eklendi
 */
router.post("/", auth, authorizeRoles("patient"), addReview);
// Değerlendirmeleri listeleme
/**
 * @swagger
 * /api/reviews/{doctorId}:
 *   get:
 *     summary: Doktorun değerlendirmelerini getir
 *     tags: [Review]
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
 *         description: Değerlendirme listesi
 */
router.get("/:doctorId", auth, getReviews);
// Değerlendirme silme
/**
 * @swagger
 * /api/reviews/{id}:
 *   delete:
 *     summary: Değerlendirme sil
 *     tags: [Review]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Değerlendirme ID'si
 *     responses:
 *       200:
 *         description: Değerlendirme başarıyla silindi
 */
router.delete("/:id", auth, deleteReview); // Değerlendirme silme
module.exports = router;
