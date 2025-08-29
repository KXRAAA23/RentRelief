const express = require("express");
const User = require("../models/User");
const verifyToken = require("../middleware/verifyToken");
const multer = require("multer");
const router = express.Router();

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "documents/"); // save files to the documents folder
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// Upload verification document
router.post("/upload-document", verifyToken, upload.single("file"), async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Single document object
    const document = {
      docType: req.body.type || "id_document",
      docUrl: `/documents/${req.file.filename}`,
      status: "pending",
    };

    // Assign directly since it's no longer an array
    user.documents = document;

    await user.save();
    res.json(user);
  } catch (err) {
    console.error("UPLOAD DOCUMENT ERROR:", err);
    res.status(500).json({ message: "Document upload failed" });
  }
});


// Get profile
router.get("/profile", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Update profile (name, email, age, gender, verification)
router.put("/profile", verifyToken, async (req, res) => {
  try {
    const { name, email, age, gender, verificationMethod } = req.body;

    const updates = {};
    if (name) updates.name = name;

    if (email) {
      const existingUser = await User.findOne({ email });
      if (existingUser && existingUser._id.toString() !== req.user.id) {
        return res.status(400).json({ message: "Email already in use" });
      }
      updates.email = email;
    }

    if (age !== undefined) {
      if (typeof age !== "number" || age <= 0) {
        return res.status(400).json({ message: "Age must be a positive number" });
      }
      updates.age = age;
    }

    if (gender) {
      const allowedGenders = ["male", "female", "other"];
      if (!allowedGenders.includes(gender.toLowerCase())) {
        return res.status(400).json({ message: "Invalid gender value" });
      }
      updates.gender = gender.toLowerCase();
    }

    // Verification logic
    if (verificationMethod) {
      updates.isVerified = true;
      updates.verificationMethod = verificationMethod;

      switch (verificationMethod) {
        case "email":
          updates.badge = "basic";
          break;
        case "id_document":
          updates.badge = "trusted";
          break;
        case "manual_review":
          updates.badge = "premium";
          break;
        default:
          updates.badge = "none";
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) return res.status(404).json({ message: "User not found" });

    res.json(updatedUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/submit-verification", verifyToken, async (req, res) => {
  try {
    const { document } = req.body; 

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        pendingVerification: true,
        document: document,
        verificationMethod: "manual_review",
      },
      { new: true }
    );

    res.json({ message: "Verification request submitted", user: updatedUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;