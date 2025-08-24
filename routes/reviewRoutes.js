const express = require("express");
const {
  addReview,
  getReviews,
  deleteReview,
} = require("../controllers/reviewController");

const { auth, authorizeRoles } = require("../middlewares/auth");
const router = express.Router();

router.post("/", auth, authorizeRoles("patient"), addReview); // Değerlendirme ekleme
router.get("/:doctorId", auth, getReviews); // Değerlendirmeleri listeleme
router.delete("/:id", auth, deleteReview); // Değerlendirme silme
module.exports = router;
