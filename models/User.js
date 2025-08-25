const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },
  role: {
    type: String,
    enum: ["patient", "doctor", "admin"],
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
  refreshTokens: [String],
  isDoctorApproved: {
    type: Boolean,
    default: false,
  },
});

// Şifre karşılaştırma metodu
userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
