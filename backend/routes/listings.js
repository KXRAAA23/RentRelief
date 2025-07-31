const express = require("express");
const router = express.Router();
const Listing = require("../models/Listing");
const multer = require("multer");
const path = require("path");
const mongoose = require("mongoose");
const verifyToken = require("../middleware/verifyToken");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); 
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

router.post('/', verifyToken, upload.single('image'), async (req, res) => {
  try {
    const userID = req.user.id;

    const { title, description, rent, state, city } = req.body;
    const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

    const newListing = new Listing({
      title,
      description,
      rent,
      state,
      city,
      image: imagePath,
      userID: userID, 
    });

    await newListing.save();
    res.status(201).json({ message: 'Listing created successfully', listing: newListing });
  } catch (error) {
    console.error("❌ Error creating listing:", error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


router.get("/my", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const listings = await Listing.find({ userID: userId });
    res.json(listings);
  } catch (err) {
    console.error("Error fetching listings:", err);
    res.status(500).json({ error: "Server error" });
  }
});

router.get('/user/:userID', async (req, res) => {
  const { userID } = req.params;

  if (!mongoose.Types.ObjectId.isValid(userID)) {
    return res.status(400).json({ error: 'Invalid user ID' });
  }

  try {
    const listings = await Listing.find({ userID: new mongoose.Types.ObjectId(userID) });
    res.json(listings);
  } catch (error) {
    console.error('Error fetching user listings:', error);
    res.status(500).json({ error: 'Server error while fetching listings' });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const updatedListing = await Listing.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedListing);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await Listing.findByIdAndDelete(req.params.id);
    res.json({ message: "Listing deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
