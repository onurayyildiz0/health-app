const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema({
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
    required: true,
  },
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  date: { type: Date, required: true },
  start: { type: String, required: true },
  status: {
    type: String,
    enum: ["booked", "cancelled", "completed"],
    default: "booked",
  },
  notes: String,
  createdAt: { type: Date, default: Date.now },
  reminderSent: { type: Boolean, default: false },
});

module.exports = mongoose.model("Appointment", appointmentSchema);
