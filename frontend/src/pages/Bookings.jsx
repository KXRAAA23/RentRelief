import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/Bookings.css";

const Bookings = ({ currentUser = {} }) => {
  const userRole = currentUser.role || "renting";
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState("all");
  const [feedback, setFeedback] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const baseURL = "http://localhost:5000";
        const url =
          userRole === "listing"
            ? `${baseURL}/api/bookings/owner`
            : `${baseURL}/api/bookings`;
        const res = await axios.get(url, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setBookings(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchBookings();
  }, [userRole]);

  const handleStatusChange = async (bookingId, status) => {
    try {
      const baseURL = "http://localhost:5000";
      await axios.put(
        `${baseURL}/api/bookings/${bookingId}/status`,
        { status },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      setBookings((prev) =>
        prev.map((b) => (b._id === bookingId ? { ...b, status } : b))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancelBooking = async (bookingId) => {
  if (!window.confirm("Are you sure you want to cancel this booking?")) return;

  try {
    const baseURL = "http://localhost:5000";
    await axios.put(
      `${baseURL}/api/bookings/${bookingId}/cancel`,
      {},
      { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
    );

    setBookings((prev) =>
      prev.map((b) =>
        b._id === bookingId ? { ...b, status: "cancelled" } : b
      )
    );
  } catch (err) {
    console.error(err);
    alert("Failed to cancel booking");
  }
};

  const handleMessage = (bookingId) => {
    navigate(`/messages`);
  };

  const handleFeedbackSubmit = async (bookingId) => {
    try {
      const baseURL = "http://localhost:5000";
      const { rating, comment } = feedback[bookingId] || {};
      if (!rating) {
        alert("Please select a rating.");
        return;
      }
      const type = userRole === "listing" ? "owner" : "renter";
      await axios.put(
        `${baseURL}/api/bookings/${bookingId}/feedback`,
        { rating, comment, type },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      alert("Feedback submitted!");
    } catch (err) {
      console.error(err);
      alert("Failed to submit feedback");
    }
  };

  const filteredBookings =
    filter === "all"
      ? bookings
      : bookings.filter((b) => b.status === filter);

  return (
    <div className="bookings-container">
      <h2>Your Bookings</h2>

      <div className="booking-filter">
        <label>Filter by Status: </label>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {filteredBookings.length === 0 ? (
        <p>No bookings found for this filter.</p>
      ) : (
        <div className="booking-grid">
          {filteredBookings.map((booking) => {
            const capitalizedStatus =
              booking.status.charAt(0).toUpperCase() + booking.status.slice(1);

            let statusColor = "";
            switch (booking.status) {
              case "approved":
                statusColor = "green";
                break;
              case "rejected":
                statusColor = "red";
                break;
              case "pending":
                statusColor = "orange";
                break;
              case "completed":
                statusColor = "blue";
                break;
              case "cancelled":
                statusColor = "gray";
                break;
              default:
                statusColor = "black";
            }

            return (
              <div className="booking-card" key={booking._id}>
                {booking.listing?.image ? (
                  <img
                    src={`http://localhost:5000${booking.listing.image}`}
                    alt={booking.listing?.title || "Listing"}
                    className="booking-image"
                  />
                ) : (
                  <img
                    src="/placeholder.jpg"
                    alt="Listing unavailable"
                    className="booking-image"
                  />
                )}

                <div className="booking-info">
                  <h3>{booking.listing?.title || "Listing removed"}</h3>
                  <p>{booking.listing?.station || "Station unavailable"}</p>

                  {userRole === "listing" && booking.renterId?.name && (
                    <p>Renter: {booking.renterId.name}</p>
                  )}

                  <p style={{ color: statusColor, fontWeight: "bold" }}>
                    Status: {capitalizedStatus}
                  </p>

                  {userRole === "listing" && (
                    <div className="booking-buttons">
                      {booking.status === "pending" && (
                        <>
                          <button
                            onClick={() =>
                              handleStatusChange(booking._id, "approved")
                            }
                          >
                            Approve
                          </button>
                          <button
                            onClick={() =>
                              handleStatusChange(booking._id, "rejected")
                            }
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {booking.status === "approved" && (
                        <button
                          onClick={() =>
                            handleStatusChange(booking._id, "completed")
                          }
                        >
                          Mark as Completed
                        </button>
                      )}
                    </div>
                  )}

                  {(userRole === "renting" || userRole === "listing") &&
                    (booking.status === "pending" || booking.status === "approved") && (
                      <button
                        onClick={() => handleCancelBooking(booking._id)}
                      >
                        Cancel Booking
                      </button>
                    )}
                  <button onClick={() => handleMessage(booking._id)}>Message</button>

                  {booking.status === "completed" && (
                    <div style={{ marginTop: "10px", fontWeight: "bold", color: "blue" }}>
                      Booking completed. Leave feedback below.

                      {userRole === "renting" && (
                        <>
                          {booking.renterFeedback ? (
                            <div className="feedback-display">
                              <p>
                                <strong>Your Review:</strong> {booking.renterFeedback.comment}
                              </p>
                              <p>⭐ {booking.renterFeedback.rating}</p>
                            </div>
                          ) : (
                            <div className="feedback-form">
                              <select
                                value={feedback[booking._id]?.rating || ""}
                                onChange={(e) =>
                                  setFeedback((prev) => ({
                                    ...prev,
                                    [booking._id]: {
                                      ...prev[booking._id],
                                      rating: Number(e.target.value),
                                    },
                                  }))
                                }
                              >
                                <option value="">Select Rating</option>
                                <option value="1">⭐</option>
                                <option value="2">⭐⭐</option>
                                <option value="3">⭐⭐⭐</option>
                                <option value="4">⭐⭐⭐⭐</option>
                                <option value="5">⭐⭐⭐⭐⭐</option>
                              </select>
                              <input
                                type="text"
                                placeholder="Leave a comment about the property"
                                value={feedback[booking._id]?.comment || ""}
                                onChange={(e) =>
                                  setFeedback((prev) => ({
                                    ...prev,
                                    [booking._id]: {
                                      ...prev[booking._id],
                                      comment: e.target.value,
                                    },
                                  }))
                                }
                              />
                              <button onClick={() => handleFeedbackSubmit(booking._id)}>
                                Submit Review
                              </button>
                            </div>
                          )}
                        </>
                      )}

                      {userRole === "listing" && (
                        <>
                          {booking.listerFeedback ? (
                            <div className="feedback-display">
                              <p>
                                <strong>Your Feedback about Renter:</strong>{" "}
                                {booking.listerFeedback.comment}
                              </p>
                              <p>⭐ {booking.listerFeedback.rating}</p>
                            </div>
                          ) : (
                            <div className="feedback-form">
                              <select
                                value={feedback[booking._id]?.rating || ""}
                                onChange={(e) =>
                                  setFeedback((prev) => ({
                                    ...prev,
                                    [booking._id]: {
                                      ...prev[booking._id],
                                      rating: Number(e.target.value),
                                    },
                                  }))
                                }
                              >
                                <option value="">Select Rating</option>
                                <option value="1">⭐</option>
                                <option value="2">⭐⭐</option>
                                <option value="3">⭐⭐⭐</option>
                                <option value="4">⭐⭐⭐⭐</option>
                                <option value="5">⭐⭐⭐⭐⭐</option>
                              </select>
                              <input
                                type="text"
                                placeholder="Leave a comment about the renter"
                                value={feedback[booking._id]?.comment || ""}
                                onChange={(e) =>
                                  setFeedback((prev) => ({
                                    ...prev,
                                    [booking._id]: {
                                      ...prev[booking._id],
                                      comment: e.target.value,
                                    },
                                  }))
                                }
                              />
                              <button onClick={() => handleFeedbackSubmit(booking._id)}>
                                Submit Feedback
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Bookings;
