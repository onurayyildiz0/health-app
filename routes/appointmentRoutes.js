const express = require("express");
const router = express.Router();
const {
  createAppointment,
  getAppointmentDetails,
  cancelAppointment,
  getDoctorAppointments,
} = require("../controllers/appointmentController");

const { auth, authorizeRoles } = require("../middlewares/auth");

// Randevu oluşturma rotası
router.post("/", createAppointment);
router.get("/:id", auth, getAppointmentDetails); // Randevu detaylarını görüntüleme
router.delete("/:id", auth, cancelAppointment); // Randevu iptal etme
router.get("/doctor", auth, authorizeRoles("doctor"), getDoctorAppointments); // Doktorun randevularını listeleme yönetmesiden kastı ne

module.exports = router;
