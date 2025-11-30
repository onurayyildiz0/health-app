const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  speciality: {
    type: String,
    required: true,
  },
  clocks: {
    monday: { start: { type: String, default: "" }, end: { type: String, default: "" } },
    tuesday: { start: { type: String, default: "" }, end: { type: String, default: "" } },
    wednesday: { start: { type: String, default: "" }, end: { type: String, default: "" } },
    thursday: { start: { type: String, default: "" }, end: { type: String, default: "" } },
    friday: { start: { type: String, default: "" }, end: { type: String, default: "" } },
    saturday: { start: { type: String, default: "" }, end: { type: String, default: "" } },
    sunday: { start: { type: String, default: "" }, end: { type: String, default: "" } },
  },
  unavailableDates: [
    {
      startDate: { type: Date, required: true }, // Örn: 2025-01-01
      endDate: { type: Date, required: true },   // Örn: 2025-01-15
      reason: { type: String, default: "İzinli" } // Örn: Yıllık İzin, Kongre vb.
    }
  ],
  rating: {
        type: Number,
        default: 0
    },
    reviewCount: {
        type: Number,
        default: 0
    },
});

module.exports = mongoose.model("Doctor", doctorSchema);
