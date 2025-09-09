const mongoose = require("mongoose");

// 🔹 Reusable rating schema
const ratingSchema = new mongoose.Schema(
  {
    fromUser: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true },
    score: { type: Number, min: 1, max: 5, required: true },
    review: { type: String, trim: true, maxlength: 500 }
  },
  { timestamps: true }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["renting", "listing", "admin"], required: true },
    age: { type: Number, min: 18, max: 100 },
    gender: {type: String, enum: ["male", "female", "non-binary", "other", "prefer not to say"], default: "prefer not to say"},
    isVerified: { type: Boolean, default: false },
    verificationMethod: {type: String, enum: ["email", "id_document", "manual_review", null], default: null},
    badge: {type: String, enum: ["none", "basic", "trusted", "premium"], default: "none"},
    documents: {docType: { type: String },docUrl: { type: String }, status: {type: String, enum: ["pending", "approved", "rejected"], default: "pending"}},
    otp: { type: String },
    otpExpiry: { type: Date },
    ratings: [ratingSchema],
    averageRating: { type: Number, default: 0 },
    totalRatings: { type: Number, default: 0 }
  },
  { timestamps: true }
);

userSchema.methods.updateRatingStats = function () {
  if (this.ratings.length === 0) {
    this.averageRating = 0;
    this.totalRatings = 0;
  } else {
    this.totalRatings = this.ratings.length;
    this.averageRating =
      this.ratings.reduce((sum, r) => sum + r.score, 0) / this.totalRatings;
  }
  return this.save();
};

module.exports = mongoose.model("User", userSchema);
