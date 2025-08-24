const express = require("express");
const router = express.Router();
const Message = require("../models/Messages");
const Booking = require("../models/Booking");
const verifyToken = require("../middleware/verifyToken");

router.post("/", verifyToken, async (req, res) => {
  try {
    const { bookingId, text, receiverId } = req.body;
    if (!bookingId || !text || !receiverId) {
      return res.status(400).json({ message: "Booking ID, text, and receiver are required" });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking || booking.status !== "approved") {
      return res.status(403).json({ message: "You can only send messages for approved bookings" });
    }

    const newMessage = new Message({
      booking: bookingId,
      sender: req.user.id,
      receiver: receiverId,
      text,
    });

    await newMessage.save();
    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/booking/:bookingId", verifyToken, async (req, res) => {
  try {
    const messages = await Message.find({ booking: req.params.bookingId })
      .populate("sender", "name email")
      .populate("receiver", "name email")
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/messages/owner
router.get("/owner", verifyToken, async (req, res) => {
  try {
    // Get all listings by this owner
    const listings = await Listing.find({ userID: req.user.id }).select("_id");
    const listingIds = listings.map((l) => l._id);

    // Get approved bookings for these listings
    const bookings = await Booking.find({ 
      listingId: { $in: listingIds },
      status: "approved"
    }).select("_id");

    const bookingIds = bookings.map((b) => b._id);

    // Fetch messages for those bookings
    const messages = await Message.find({ booking: { $in: bookingIds } })
      .populate("sender", "name email")
      .populate("receiver", "name email")
      .populate("booking", "listingId")
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
