const express = require("express");
const router = express.Router();
const {
  createAppointment,
  getAppointmentDetails,
  cancelAppointment,
  getDoctorAppointments,
} = require("../controllers/appointmentController");

const { auth, authorizeRoles } = require("../middlewares/auth");

router.post("/", auth, authorizeRoles("patient"), createAppointment);
router.get("/doctor", auth, authorizeRoles("doctor"), getDoctorAppointments);
router.get("/:id", auth, getAppointmentDetails);
router.patch("/:id/cancel", auth, cancelAppointment);

module.exports = router;
