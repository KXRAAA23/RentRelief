const mongoose = require("mongoose");

const listingSchema = new mongoose.Schema({
  userID: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true},
  description: { type: String, required: true},
  rent: { type: Number, required: true },
  state: { type: String, required: true},
  city: { type: String, required: true},
  image: { type: String, required: true}, 
});

module.exports = mongoose.model("Listing", listingSchema);
