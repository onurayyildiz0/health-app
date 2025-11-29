const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  isVerified: { type: Boolean, default: false },
  verificationToken: { type: String },
  password: { type: String, required: true, select: false },
  role: {
    type: String,
    enum: ["patient", "doctor", "admin"],
    required: true,
  },
  avatar: { type: String },
  createdAt: { type: Date, default: Date.now },
  refreshTokens: [String],
  isDoctorApproved: {
    type: Boolean,
    default: false,
  },
  doctorDocuments: {
    type: String, // Path to uploaded PDF document
  },
  resetPasswordToken: {
    type: String,
  },
  resetPasswordExpire: {
    type: Date,
  },
  favorites: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
    },
  ],
  healthHistory: [
    {
      date: { type: Date, default: Date.now },
      diagnosis: String,
      treatment: String,
      notes: String,
    },
  ],
});

// Şifre karşılaştırma metodu
userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
