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
const { register, login, refresh, logout, verifyEmail } = authController;

// Kayıt
/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Yeni kullanıcı kaydı
 *     tags: [Auth]
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
 *               role:
 *                 type: string
 *                 enum: [patient, doctor, admin]
 *     responses:
 *       201:
 *         description: Kayıt başarılı. Lütfen e-postanızı doğrulayın.
 */
router.post("/register", registerValidation, validate, register);

// Giriş
/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Kullanıcı girişi
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Giriş başarılı
 */

router.post("/login", loginValidation, validate, login);

// Token yenileme
/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Access token yenileme
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Yeni access token döner
 */
router.post("/refresh", refreshValidation, validate, refresh);

// Çıkış (korumalı route, refresh token ile çıkış)
/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Kullanıcı çıkışı
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Çıkış başarılı
 */
router.post("/logout", auth, logout);

// E-posta doğrulama
/**
 * @swagger
 * /api/auth/verify/{token}:
 *   get:
 *     summary: E-posta doğrulama
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: token
 *         schema:
 *           type: string
 *         required: true
 *         description: Doğrulama tokenı
 *     responses:
 *       200:
 *         description: E-posta başarıyla doğrulandı
 */
router.get("/verify/:token", verifyEmail);

module.exports = router;
