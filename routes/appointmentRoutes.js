const express = require("express");
const router = express.Router();
const { createAppointment } = require("../controllers/appointmentController");

// Randevu oluşturma rotası
router.post("/", createAppointment);

module.exports = router;
