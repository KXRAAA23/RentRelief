const express = require("express");
const router = express.Router();
const Listing = require("../models/Listing");
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); 
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

router.post("/add", upload.single("image"), async (req, res) => {
  try {
    const { title, description, rent, state, city } = req.body;

    const wordCount = description.trim().split(/\s+/).length;
    if (wordCount < 20) {
      return res.status(400).json({ error: "Description must be at least 20 words." });
    }

    const imagePath = req.file ? req.file.filename : "";

    const newListing = new Listing({
      title,
      description,
      rent,
      state,
      city,
      image: imagePath,
    });

    await newListing.save();
    res.status(201).json({ message: "Listing added successfully!" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
