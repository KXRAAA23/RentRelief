const express = require("express");
const User = require("../models/User");
const verifyToken = require("../middleware/verifyToken");
const router = express.Router();

const verifyAdmin = async (req, res, next) => {
  if (req.user.role !== "admin") return res.status(403).json({ message: "Access denied" });
  next();
};

router.get("/pending-verifications", verifyToken, async (req, res) => {
  try {
    const users = await User.find({
      "documents.status": "pending"
    }).select("-password");

    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/verify-document/:userId", verifyToken, async (req, res) => {
  const { userId } = req.params;
  const { action } = req.body; 

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.documents) return res.status(404).json({ message: "Document not found" });

    user.documents.status = action === "approve" ? "approved" : "rejected";

    if (action === "approve") user.badge = "trusted";

    await user.save();
    res.json({ message: "Document updated", documents: user.documents });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});



module.exports = router;
