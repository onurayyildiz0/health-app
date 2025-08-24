const express = require("express");
const { createAdmin, getAllUsers } = require("../controllers/adminController");
const { auth, authorizeRoles } = require("../middlewares/auth");

const router = express.Router();

// Sadece adminlerin erişebileceği rotalar
router.post("/create-admin", auth, authorizeRoles("admin"), createAdmin);
router.get("/users", auth, authorizeRoles("admin"), getAllUsers);

module.exports = router;
