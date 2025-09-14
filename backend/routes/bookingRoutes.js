const express = require("express");
const router = express.Router();
const Listing = require("../models/Listing");
const verifyToken = require("../middleware/verifyToken");
const mongoose = require("mongoose");

router.post("/", verifyToken, async (req, res) => {
  try {
    const { listingId, startDate, endDate, message } = req.body;

    if (!listingId || !startDate || !endDate) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const listing = await Listing.findById(listingId);
    if (!listing) return res.status(404).json({ message: "Listing not found" });

    const booking = {
      _id: new mongoose.Types.ObjectId(),
      renterId: req.user.id,
      listerId: listing.userID,
      startDate,
      endDate,
      status: "pending",
      messages: [
        {
          sender: req.user.id,
          text: message || "I'd like to book this listing",
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    listing.bookings.push(booking);
    await listing.save();

    res.status(201).json(booking);
  } catch (error) {
    console.error("Error creating booking:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/:id/messages", verifyToken, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: "Message text is required" });

    const listing = await Listing.findOne({ "bookings._id": req.params.id });
    if (!listing) return res.status(404).json({ message: "Booking not found" });

    const booking = listing.bookings.id(req.params.id);
    if (booking.status !== "approved") {
      return res.status(403).json({ message: "You can only chat on approved bookings" });
    }

    const newMessage = { sender: req.user.id, text, timestamp: new Date() };
    booking.messages.push(newMessage);
    booking.updatedAt = new Date();

    await listing.save();
    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/:id/messages", verifyToken, async (req, res) => {
  try {
    const listing = await Listing.findOne({ "bookings._id": req.params.id }).populate("bookings.messages.sender", "name email");
    if (!listing) return res.status(404).json({ message: "Booking not found" });

    const booking = listing.bookings.id(req.params.id);
    res.json(booking.messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/", verifyToken, async (req, res) => {
  try {
    const listings = await Listing.find({ "bookings.renterId": req.user.id }).populate("userID", "name email");
    let bookings = [];
    listings.forEach(listing => {
      const userBookings = listing.bookings.filter(b => b.renterId.toString() === req.user.id);
      bookings = bookings.concat(userBookings.map(b => ({ ...b.toObject(), listing })));
    });

    res.json(bookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/:id/status", verifyToken, async (req, res) => {
  try {
    const { status } = req.body;
    if (!["approved", "rejected", "completed"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const listing = await Listing.findOne({ "bookings._id": req.params.id });
    if (!listing) return res.status(404).json({ message: "Booking not found" });

    const booking = listing.bookings.id(req.params.id);

    if (listing.userID.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    booking.status = status;
    booking.updatedAt = new Date();
    await listing.save();

    res.json({ message: `Booking ${status}`, booking });
  } catch (error) {
    console.error("Error updating booking status:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/owner", verifyToken, async (req, res) => {
  try {
    const listings = await Listing.find({ userID: req.user.id });
    let bookings = [];
    listings.forEach(listing => {
      bookings = bookings.concat(listing.bookings.map(b => ({ ...b.toObject(), listing })));
    });

    res.json(bookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
  } catch (error) {
    console.error("Error fetching owner bookings:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/approved", verifyToken, async (req, res) => {
  try {
    const listings = await Listing.find({ "bookings.renterId": req.user.id, "bookings.status": "approved" });
    let bookings = [];
    listings.forEach(listing => {
      const userBookings = listing.bookings.filter(b => b.renterId.toString() === req.user.id && b.status === "approved");
      bookings = bookings.concat(userBookings.map(b => ({ ...b.toObject(), listing })));
    });

    res.json(bookings);
  } catch (error) {
    console.error("Error fetching approved bookings:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/listing/:listingId", verifyToken, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.listingId);
    if (!listing) return res.status(404).json({ message: "Listing not found" });
    if (listing.userID.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const bookings = listing.bookings.filter(b => b.status === "approved");
    res.json(bookings);
  } catch (err) {
    console.error("Error fetching listing bookings:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/history", verifyToken, async (req, res) => {
  try {
    const listings = await Listing.find({ $or: [{ userID: req.user.id }, { "bookings.renterId": req.user.id }] });
    let bookings = [];
    listings.forEach(listing => {
      bookings = bookings.concat(listing.bookings.map(b => ({ ...b.toObject(), listing })));
    });

    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id/feedback", verifyToken, async (req, res) => {
  try {
    const { rating, comment, type } = req.body;
    const listing = await Listing.findOne({ "bookings._id": req.params.id });
    if (!listing) return res.status(404).json({ message: "Booking not found" });

    const booking = listing.bookings.id(req.params.id);
    if (booking.status !== "completed") {
      return res.status(400).json({ message: "Feedback allowed only after completion" });
    }

    if (type === "renter") {
      if (booking.renterFeedback?.rating) return res.status(400).json({ message: "Already left feedback" });
      booking.renterFeedback = { rating, comment };
    } else if (type === "owner") {
      if (booking.listerFeedback?.rating) return res.status(400).json({ message: "Already left feedback" });
      booking.listerFeedback = { rating, comment };
    } else {
      return res.status(400).json({ message: "Invalid feedback type" });
    }

    booking.updatedAt = new Date();
    await listing.save();

    res.json({ message: "Feedback submitted", booking });
  } catch (err) {
    console.error("Error submitting feedback:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/:id/cancel", verifyToken, async (req, res) => {
  try {
    const bookingId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({ message: "Invalid booking ID" });
    }

    const listing = await Listing.findOne({ "bookings._id": bookingId });
    if (!listing) return res.status(404).json({ message: "Booking not found" });

    const booking = listing.bookings.id(bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found in listing" });

    if (
      booking.renterId.toString() !== req.user.id &&
      listing.userID.toString() !== req.user.id
    ) {
      return res.status(403).json({ message: "Not authorized to cancel this booking" });
    }

    if (booking.status === "completed" || booking.status === "rejected") {
      return res.status(400).json({ message: "Cannot cancel completed or rejected booking" });
    }

    booking.status = "cancelled";
    booking.updatedAt = new Date();

    await listing.save();

    return res.json({ message: "Booking cancelled successfully", booking });
  } catch (err) {
    console.error("Error cancelling booking:", err);
    return res.status(500).json({ message: "Server error while cancelling booking" });
  }
});

module.exports = router;