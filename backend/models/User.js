const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["renting", "listing","admin"], required: true },

    age: { type: Number, min: 18, max: 100 }, 
    gender: { 
      type: String, 
      enum: ["male", "female", "non-binary", "other" , "prefer not to say"], 
      default: "prefer not to say" 
    },

    isVerified: { type: Boolean, default: false },
    verificationMethod: { 
      type: String, 
      enum: ["email", "id_document", "manual_review", null], 
      default: null 
    },

    badge: {
      type: String,
      enum: ["none", "basic", "trusted", "premium"],
      default: "none"
    },

    documents:
      {
        docType: { type: String }, 
        docUrl: { type: String }, 
        status: { 
          type: String, 
          enum: ["pending", "approved", "rejected"], 
          default: "pending" 
        }
      },

    otp: { type: String },
    otpExpiry: { type: Date }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
