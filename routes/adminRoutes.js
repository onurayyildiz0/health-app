const express = require("express");
const {
  createAdmin,
  getAllUsers,
  approveDoctor,
} = require("../controllers/adminController");
const { auth, authorizeRoles } = require("../middlewares/auth");

const router = express.Router();

// Sadece adminlerin erişebileceği rotalar
router.post("/create-admin", auth, authorizeRoles("admin"), createAdmin);
router.get("/users", auth, authorizeRoles("admin"), getAllUsers);
router.patch(
  "/approve-doctor/:id",
  auth,
  authorizeRoles("admin"),
  approveDoctor
);

module.exports = router;
