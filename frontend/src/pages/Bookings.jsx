import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/Bookings.css";

const Bookings = ({ currentUser = {} }) => {
  const userRole = currentUser.role || "renting";
  const [bookings, setBookings] = useState([]);
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

  const handleMessage = (bookingId) => {
    navigate(`/messages`);
  };

  return (
    <div className="bookings-container">
      <h2>Your Bookings</h2>
      {bookings.length === 0 ? (
        <p>No bookings yet.</p>
      ) : (
        <div className="booking-grid">
          {bookings.map((booking) => {
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
              default:
                statusColor = "black";
            }

            return (
              <div className="booking-card" key={booking._id}>
                {booking.listingId.image && (
                  <img
                    src={`http://localhost:5000${booking.listingId.image}`}
                    alt={booking.listingId.title}
                    className="booking-image"
                  />
                )}
                <div className="booking-info">
                  <h3>{booking.listingId.title}</h3>
                  <p>{booking.listingId.address}</p>

                  {userRole === "listing" && booking.renterId && (
                    <p>Renter: {booking.renterId.name}</p>
                  )}

                  <p style={{ color: statusColor, fontWeight: "bold" }}>
                    Status: {capitalizedStatus}
                  </p>

                  {userRole === "listing" && booking.status === "pending" && (
                    <div className="booking-buttons">
                      <button onClick={() => handleStatusChange(booking._id, "approved")}>
                        Approve
                      </button>
                      <button onClick={() => handleStatusChange(booking._id, "rejected")}>
                        Reject
                      </button>
                    </div>
                  )}

                  <button onClick={() => handleMessage(booking._id)}>Message</button>
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
