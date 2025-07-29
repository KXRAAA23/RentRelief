const mongoose = require("mongoose");

const listingSchema = new mongoose.Schema({
  title: String,
  description: String,
  rent: Number,
  state: String,
  city: String,
  image: String, 
});

module.exports = mongoose.model("Listing", listingSchema);
