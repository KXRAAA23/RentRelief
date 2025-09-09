const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    text: String,
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
      enum: ["pending", "approved", "rejected", "completed","cancelled"],
      default: "pending",
    },
    messages: [messageSchema],
    renterFeedback: {
      rating: Number,
      comment: String,
    },
    listerFeedback: {
      rating: Number,
      comment: String,
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
    image: { type: String, required: true },
    bedrooms: { type: Number, default: 1 },
    bathrooms: { type: Number, default: 1 },
    amenities: { type: [String], default: [] },

    bookings: [bookingSchema],
  },
  { timestamps: true } 
);

module.exports = mongoose.model("Listing", listingSchema);
