const express = require("express");
const User = require("../models/User");
const verifyToken = require("../middleware/verifyToken");
const multer = require("multer");
const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "documents/"); 
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});
const upload = multer({ storage });

router.post("/upload-document", verifyToken, upload.single("file"), async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const document = {
      docType: req.body.type || "id_document",
      docUrl: `/documents/${req.file.filename}`,
      status: "pending",
    };

    user.documents = document;

    await user.save();
    res.json(user);
  } catch (err) {
    console.error("UPLOAD DOCUMENT ERROR:", err);
    res.status(500).json({ message: "Document upload failed" });
  }
});


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

router.post("/:id/rate", verifyToken, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const review = {
      fromUser: req.user.id,
      rating,
      comment,
      createdAt: new Date(),
    };

    user.reviews.push(review);

    const totalReviews = user.reviews.length;
    const avgRating =
      user.reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews;

    user.avgRating = avgRating;
    user.totalReviews = totalReviews;

    await user.save();
    res.json({ message: "Review submitted", user });
  } catch (err) {
    console.error("RATE USER ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/:id/ratings", async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("name avgRating totalReviews reviews")
      .populate("reviews.fromUser", "name email");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (err) {
    console.error("GET RATINGS ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;