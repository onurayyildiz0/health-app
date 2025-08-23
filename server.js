const express = require("express");
const mongoose = require("mongoose");
const doctorRoutes = require("./routes/doctorRoutes");
const userRoutes = require("./routes/userRoutes");
const appointmenRoutes = require("./routes/appointmentRoutes");

require("dotenv").config();

const app = express();
app.use(express.json());
app.use("/api/doctors", doctorRoutes);
app.use("/api/users", userRoutes);
app.use("/api/appointments", appointmenRoutes);

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
});
