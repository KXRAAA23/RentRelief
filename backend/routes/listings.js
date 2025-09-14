const express = require("express");
const router = express.Router();
const Listing = require("../models/Listing");
const multer = require("multer");
const path = require("path");
const verifyToken = require("../middleware/verifyToken");

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

/**
 * Create a new listing
 */
router.post("/", verifyToken, upload.single("image"), async (req, res) => {
  try {
    const userID = req.user.id;
    const {
      title,
      description,
      rent,
      station,
      line,
      area,
      bedrooms,
      bathrooms,
      // 👇 address fields
      street,
      city,
      state,
      pincode,
      country,
    } = req.body;

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
      // 🏠 save full address
      address: {
        street,
        city,
        state,
        pincode,
        country: country || "India",
      },
    });

    await newListing.save();
    res.status(201).json({ message: "Listing created successfully", listing: newListing });
  } catch (err) {
    console.error("Error creating listing:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * Get listings for logged-in user
 */
router.get("/my", verifyToken, async (req, res) => {
  try {
    const listings = await Listing.find({ userID: req.user.id });
    res.json(listings);
  } catch (err) {
    console.error("Failed to fetch user's listings:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * Search listings
 */
router.get("/search", async (req, res) => {
  try {
    const {
      line,
      area,
      station,
      minRent,
      maxRent,
      bedrooms,
      bathrooms,
      amenities,
      // 👇 optional address filters
      city,
      state,
      pincode,
    } = req.query;

    const query = {};

    if (line) query.line = line;
    if (area) query.area = area;
    if (station) query.station = station;

    if (city) query["address.city"] = city;
    if (state) query["address.state"] = state;
    if (pincode) query["address.pincode"] = pincode;

    if (minRent || maxRent) query.rent = {};
    if (minRent) query.rent.$gte = Number(minRent);
    if (maxRent) query.rent.$lte = Number(maxRent);

    if (bedrooms) query.bedrooms = { $gte: Number(bedrooms) };
    if (bathrooms) query.bathrooms = { $gte: Number(bathrooms) };

    if (amenities) {
      let amenitiesArray = [];
      if (Array.isArray(amenities)) {
        amenitiesArray = amenities;
      } else if (typeof amenities === "string") {
        amenitiesArray = amenities.split(",").map((a) => a.trim());
      }
      if (amenitiesArray.length > 0) query.amenities = { $all: amenitiesArray };
    }

    const listings = await Listing.find(query);
    res.json(listings);
  } catch (err) {
    console.error("Error searching listings:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * Get listing by ID
 */
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id)
      .populate("userID", "name email")
      .populate("bookings.renterId", "name email");

    if (!listing) return res.status(404).json({ message: "Listing not found" });

    res.json(listing);
  } catch (err) {
    console.error("Error fetching listing:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * Update listing
 */
router.put("/:id", verifyToken, upload.single("image"), async (req, res) => {
  try {
    const updateData = { ...req.body };

    if (req.body["amenities[]"]) {
      updateData.amenities = Array.isArray(req.body["amenities[]"])
        ? req.body["amenities[]"]
        : [req.body["amenities[]"]];
    }

    if (req.file) updateData.image = `/uploads/${req.file.filename}`;

    // ensure address is nested properly
    if (req.body.street || req.body.city || req.body.state || req.body.pincode || req.body.country) {
      updateData.address = {
        street: req.body.street,
        city: req.body.city,
        state: req.body.state,
        pincode: req.body.pincode,
        country: req.body.country || "India",
      };
    }

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

/**
 * Delete listing
 */
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    await Listing.findByIdAndDelete(req.params.id);
    res.json({ message: "Listing deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
