const express = require("express");
const router = express.Router();

const {
  createDoctor,
  getAllDoctors,
  getDoctorById,
  deleteDoctor,
  updateDoctor,
  getDoctorsBySpeciality,
  getDoctorReviews,
  getDoctorsByMaxRating,
  setDoctorSchedule,
} = require("../controllers/doctorController");

const { auth } = require("../middlewares/auth");

router.post("/", auth, createDoctor);
router.get("/", getDoctorsBySpeciality); // /api/doctors?speciality=Kardiyoloji
router.get("/max-rating", getDoctorsByMaxRating);
router.get("/:id", getDoctorById);
router.delete("/:id", deleteDoctor);
router.put("/:id", updateDoctor);
router.get("/:id/reviews", getDoctorReviews);
router.put("/me/schedule", setDoctorSchedule);

module.exports = router;
