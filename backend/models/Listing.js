const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    text: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

const bookingSchema = new mongoose.Schema(
  {
    renterId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    listerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "completed", "cancelled"],
      default: "pending",
    },
    messages: [messageSchema],
    renterFeedback: {
      rating: { type: Number, min: 1, max: 5 },
      comment: { type: String, trim: true },
    },
    listerFeedback: {
      rating: { type: Number, min: 1, max: 5 },
      comment: { type: String, trim: true },
    },
  },
  { timestamps: true }
);

const listingSchema = new mongoose.Schema(
  {
    userID: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    rent: { type: Number, required: true },

    station: { type: String, required: true },
    line: { type: String, required: true },
    area: { type: String, required: true },

    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
      country: { type: String, default: "India" },
    },

    image: { type: String, required: true },
    bedrooms: { type: Number, default: 1 },
    bathrooms: { type: Number, default: 1 },
    amenities: { type: [String], default: [] },

    bookings: [bookingSchema],
  },
  { timestamps: true }
);

listingSchema.index({ station: 1, line: 1, area: 1 });
listingSchema.index({ rent: 1 });

module.exports = mongoose.model("Listing", listingSchema);
