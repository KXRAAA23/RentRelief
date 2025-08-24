const mongoose = require("mongoose");

const listingSchema = new mongoose.Schema({
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
});

module.exports = mongoose.model("Listing", listingSchema);
