const express = require("express");
const router = express.Router();
const Listing = require("../models/Listing");
const multer = require("multer");
const path = require("path");
const verifyToken = require("../middleware/verifyToken");

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// ----------------- CREATE LISTING -----------------
router.post("/", verifyToken, upload.single("image"), async (req, res) => {
  try {
    const userID = req.user.id;
    const { title, description, rent, station, line, area, bedrooms, bathrooms } = req.body;

    let amenities = [];
    if (req.body["amenities[]"]) {
      amenities = Array.isArray(req.body["amenities[]"])
        ? req.body["amenities[]"]
        : [req.body["amenities[]"]];
    }

    const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

    const newListing = new Listing({
      title,
      description,
      rent,
      station,
      line,
      area,
      bedrooms: bedrooms || 1,
      bathrooms: bathrooms || 1,
      amenities,
      image: imagePath,
      userID,
    });

    await newListing.save();
    res.status(201).json({ message: "Listing created successfully", listing: newListing });
  } catch (err) {
    console.error("Error creating listing:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ----------------- GET MY LISTINGS -----------------
router.get("/my", verifyToken, async (req, res) => {
  try {
    const listings = await Listing.find({ userID: req.user.id });
    res.json(listings);
  } catch (err) {
    console.error("Failed to fetch user's listings:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});


// ----------------- SEARCH LISTINGS -----------------
router.get("/search", async (req, res) => {
  try {
    const { line, area, station, minRent, maxRent, bedrooms, bathrooms, amenities } = req.query;
    const query = {};

    // Line, Area, Station
    if (line) query.line = line;
    if (area) query.area = area;
    if (station) query.station = station; // if city = station in schema

    // Rent range
    if (minRent || maxRent) query.rent = {};
    if (minRent) query.rent.$gte = Number(minRent);
    if (maxRent) query.rent.$lte = Number(maxRent);

    // Bedrooms >= selected
    if (bedrooms) query.bedrooms = { $gte: Number(bedrooms) };

    // Bathrooms >= selected
    if (bathrooms) query.bathrooms = { $gte: Number(bathrooms) };

    // Amenities
    if (amenities) {
      const amenitiesArray = Array.isArray(amenities)
        ? amenities
        : amenities.split(",");
      query.amenities = { $all: amenitiesArray };
    }

    const listings = await Listing.find(query);
    res.json(listings);
  } catch (err) {
    console.error("Error searching listings:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ----------------- GET LISTING BY ID -----------------
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ error: "Listing not found" });

    // Remove ownership check here — anyone logged in can view
    res.json(listing);
  } catch (err) {
    console.error("Error fetching listing by ID:", err);
    res.status(500).json({ error: "Server error" });
  }
});


// ----------------- UPDATE LISTING -----------------
router.put("/:id", verifyToken, upload.single("image"), async (req, res) => {
  try {
    const updateData = { ...req.body };

    // Only update amenities if provided
    if (req.body["amenities[]"]) {
      updateData.amenities = Array.isArray(req.body["amenities[]"])
        ? req.body["amenities[]"]
        : [req.body["amenities[]"]];
    }

    // Update image if uploaded
    if (req.file) updateData.image = `/uploads/${req.file.filename}`;

    const updatedListing = await Listing.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    res.json({ message: "Listing updated successfully", listing: updatedListing });
  } catch (err) {
    console.error("Error updating listing:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ----------------- DELETE LISTING -----------------
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    await Listing.findByIdAndDelete(req.params.id);
    res.json({ message: "Listing deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
