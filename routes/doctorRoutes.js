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
} = require("../controllers/doctorController");

router.post("/", createDoctor);
router.get("/", getDoctorsBySpeciality); // /api/doctors?speciality=Kardiyoloji
router.get("/max-rating", getDoctorsByMaxRating);
router.get("/:id", getDoctorById);
router.delete("/:id", deleteDoctor);
router.put("/:id", updateDoctor);
router.get("/:id/reviews", getDoctorReviews);

module.exports = router;
