const express = require("express");
const {
  createAdmin,
  getAllUsers,
  getUsersByRole,
  approveDoctor,
  getPendingDoctors,
  deleteUser
} = require("../controllers/adminController");
const { auth, authorizeRoles } = require("../middlewares/auth");
const path = require("path");
const fs = require("fs");

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

// Role göre kullanıcıları getir
/**
 * @swagger
 * /api/admin/users/role/{role}:
 *   get:
 *     summary: Belirtilen role sahip kullanıcıları getirir
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: role
 *         schema:
 *           type: string
 *           enum: [admin, doctor, patient]
 *         required: true
 *         description: Filtrelenecek kullanıcı rolü
 *     responses:
 *       200:
 *         description: Filtrelenmiş kullanıcı listesi
 */
router.get("/users/role/:role", auth, authorizeRoles("admin"), getUsersByRole);

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

// Kullanıcı sil (admin)
/**
 * @swagger
 * /api/admin/users/{id}:
 *   delete:
 *     summary: Kullanıcıyı siler
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Silinecek kullanıcının ID'si
 *     responses:
 *       200:
 *         description: Kullanıcı başarıyla silindi
 *       404:
 *         description: Kullanıcı bulunamadı
 */
router.delete("/users/:id", auth, authorizeRoles("admin"), deleteUser);

// Bekleyen doktorları getir
/**
 * @swagger
 * /api/admin/pending-doctors:
 *   get:
 *     summary: Onay bekleyen doktorları listeler
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Bekleyen doktor listesi
 */
router.get("/pending-doctors", auth, authorizeRoles("admin"), getPendingDoctors);

// Doktor belgesi indir
/**
 * @swagger
 * /api/admin/doctor-document/{userId}:
 *   get:
 *     summary: Doktorun yüklediği belgeyi indirir
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: Belgesi indirilecek doktorun kullanıcı ID'si
 *     responses:
 *       200:
 *         description: PDF dosyası indirilir
 *       404:
 *         description: Belge bulunamadı
 */
router.get("/doctor-document/:userId", auth, authorizeRoles("admin"), async (req, res) => {
  try {
    const User = require("../models/User");
    const user = await User.findById(req.params.userId);

    if (!user || !user.doctorDocuments) {
      return res.status(404).json({ message: "Belge bulunamadı" });
    }

    const filePath = path.resolve(user.doctorDocuments);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "Dosya sistemde bulunamadı" });
    }

    res.download(filePath);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
