const express = require("express");
const router = express.Router();
const Booking = require("../models/Booking");
const Listing = require("../models/Listing");
const Message = require("../models/Messages");
const verifyToken = require("../middleware/verifyToken");

router.post("/", verifyToken, async (req, res) => {
  try {
    const { listingId, startDate, endDate, message } = req.body;

    if (!listingId || !startDate || !endDate) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const listing = await Listing.findById(listingId);
    if (!listing) return res.status(404).json({ message: "Listing not found" });

    const booking = new Booking({
      listingId,
      renterId: req.user.id,
      startDate,
      endDate,
      message: message || "",
      status: "pending",
    });

    await booking.save();

    const defaultMessage = new Message({
      booking: booking._id,
      sender: req.user.id,
      receiver: listing.userID,
      text: message || "I'd like to book this listing",
    });

  await defaultMessage.save();

    const populatedBooking = await Booking.findById(booking._id)
      .populate("listingId", "title address image")
      .populate("renterId", "name email");

    res.status(201).json(populatedBooking);
  } catch (error) {
    console.error("Error creating booking:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/", verifyToken, async (req, res) => {
  try {
    const bookings = await Booking.find({ renterId: req.user.id })
      .populate("listingId", "title address image") 
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/:id/status", verifyToken, async (req, res) => {
  try {
    const { status } = req.body;
    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const booking = await Booking.findById(req.params.id).populate("listingId", "userID title address image");
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    if (booking.listingId.userID.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    booking.status = status;
    await booking.save();

    res.json({ message: `Booking ${status}`, booking });
  } catch (error) {
    console.error("Error updating booking status:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/owner", verifyToken, async (req, res) => {
  try {
    const listings = await Listing.find({ userID: req.user.id }).select("_id");

    if (listings.length === 0) return res.json([]);

    const listingIds = listings.map(listing => listing._id);

    const bookings = await Booking.find({ listingId: { $in: listingIds } })
      .populate("listingId", "title station image") 
      .populate("renterId", "name email")
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    console.error("Error fetching owner bookings:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/approved", verifyToken, async (req, res) => {
  try {
    const bookings = await Booking.find({
      renterId: req.user.id,
      status: "approved",
    })
      .populate("listingId", "title station image userID")
      .populate("renterId", "name email");

    res.json(bookings);
  } catch (error) {
    console.error("Error fetching approved bookings:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/listing/:listingId", verifyToken, async (req, res) => {
  try {
    const listingId = req.params.listingId;

    // Verify ownership
    const listing = await Listing.findById(listingId);
    if (!listing) return res.status(404).json({ message: "Listing not found" });
    if (listing.userID.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Fetch approved bookings for this listing
    const bookings = await Booking.find({ listingId, status: "approved" })
      .populate("renterId", "name email")
      .populate("listingId", "title address image");

    res.json(bookings);
  } catch (err) {
    console.error("Error fetching listing bookings:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
