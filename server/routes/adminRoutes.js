const express = require("express");
const {
  createAdmin,
  getAllUsers,
  approveDoctor,
} = require("../controllers/adminController");
const { auth, authorizeRoles } = require("../middlewares/auth");

const router = express.Router();

// Yeni admin oluştur
/**
 * @swagger
 * /api/admin/create-admin:
 *   post:
 *     summary: Yeni admin oluşturur
 *     tags: [Admin]
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
 *       201:
 *         description: Admin başarıyla oluşturuldu
 */
router.post("/create-admin", auth, authorizeRoles("admin"), createAdmin);

// Tüm kullanıcıları getir
/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Tüm kullanıcıları listeler
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Kullanıcı listesi
 */
router.get("/users", auth, authorizeRoles("admin"), getAllUsers);

// Doktor onayla
/**
 * @swagger
 * /api/admin/approve-doctor/{id}:
 *   patch:
 *     summary: Doktoru onaylar
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Onaylanacak doktorun ID'si
 *     responses:
 *       200:
 *         description: Doktor başarıyla onaylandı
 */
router.patch(
  "/approve-doctor/:id",
  auth,
  authorizeRoles("admin"),
  approveDoctor
);
module.exports = router;
