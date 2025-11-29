const express = require("express");
const { body, param } = require("express-validator");
const validate = require("../middlewares/validate");
const router = express.Router();
const {
  createAppointment,
  getAppointmentDetails,
  cancelAppointment,
  getDoctorAppointments,
  getPatientAppointments,
  updateAppointmentStatus,
} = require("../controllers/appointmentController");

const { auth, authorizeRoles } = require("../middlewares/auth");

// Yeni randevu oluştur
/**
 * @swagger
 * /api/appointments:
 *   post:
 *     summary: Yeni randevu oluşturur
 *     tags: [Appointment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               doctor:
 *                 type: string
 *                 description: Doktorun MongoDB ID'si
 *               date:
 *                 type: string
 *                 format: date-time
 *                 description: Randevu tarihi (ISO 8601)
 *               start:
 *                 type: string
 *                 description: Başlangıç saati (HH:mm)
 *               end:
 *                 type: string
 *                 description: Bitiş saati (HH:mm)
 *               notes:
 *                 type: string
 *                 description: Not (isteğe bağlı)
 *     responses:
 *       201:
 *         description: Randevu başarıyla oluşturuldu
 */
router.post(
  "/",
  [
    body("doctor")
      .notEmpty()
      .withMessage("Doktor ID zorunlu")
      .isMongoId()
      .withMessage("Geçerli doktor ID girin"),
    body("date")
      .notEmpty()
      .withMessage("Tarih zorunlu")
      .isISO8601()
      .withMessage("Geçerli tarih formatı girin"),
    body("start")
      .notEmpty()
      .withMessage("Başlangıç saati zorunlu")
      .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
      .withMessage("Saat formatı HH:mm olmalı"),
    body("end")
      .notEmpty()
      .withMessage("Bitiş saati zorunlu")
      .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
      .withMessage("Saat formatı HH:mm olmalı"),
    body("notes")
      .optional()
      .isLength({ max: 200 })
      .withMessage("Not en fazla 200 karakter olmalı"),
  ],
  validate,
  auth,
  authorizeRoles("patient"),
  createAppointment
);

// Doktorun randevularını getir
/**
 * @swagger
 * /api/appointments/doctor:
 *   get:
 *     summary: Doktorun tüm randevularını getirir
 *     tags: [Appointment]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Doktorun randevuları listelendi
 */
router.get("/doctor", auth, authorizeRoles("doctor"), getDoctorAppointments);

// Hastanın randevularını getir (Patient)
/**
 * @swagger
 * /api/appointments/patient:
 *   get:
 *     summary: Hastanın tüm randevularını getirir
 *     tags: [Appointment]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Hastanın randevuları listelendi
 */
router.get("/patient", auth, authorizeRoles("patient"), getPatientAppointments);

// Randevu detaylarını getir
/**
 * @swagger
 * /api/appointments/{id}:
 *   get:
 *     summary: Randevu detaylarını getirir
 *     tags: [Appointment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Randevu ID'si
 *     responses:
 *       200:
 *         description: Randevu detayları
 */
router.get("/:id", auth, getAppointmentDetails);

// Randevu iptal et
/**
 * @swagger
 * /api/appointments/{id}/cancel:
 *   patch:
 *     summary: Randevuyu iptal eder
 *     tags: [Appointment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Randevu ID'si
 *     responses:
 *       200:
 *         description: Randevu başarıyla iptal edildi
 */
router.patch(
  "/:id/cancel",
  [
    param("id")
      .notEmpty()
      .withMessage("Randevu ID zorunlu")
      .isMongoId()
      .withMessage("Geçerli randevu ID girin"),
  ],
  validate,
  auth,
  cancelAppointment
);

// Doktor randevu durumunu günceller (completed/cancelled)
router.patch(
  "/:id/status",
  [
    param("id")
      .notEmpty()
      .withMessage("Randevu ID zorunlu")
      .isMongoId()
      .withMessage("Geçerli randevu ID girin"),
    body("status")
      .notEmpty()
      .withMessage("Durum zorunlu")
      .isIn(["booked", "completed", "cancelled"])
      .withMessage("Geçerli durum değerleri: booked, completed, cancelled"),
  ],
  validate,
  auth,
  authorizeRoles("doctor"),
  updateAppointmentStatus
);

module.exports = router;
