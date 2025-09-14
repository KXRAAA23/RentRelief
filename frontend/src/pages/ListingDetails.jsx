import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../styles/ListingDetails.css";

function ListingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [listing, setListing] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [reviews, setReviews] = useState([]); 
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const userId = localStorage.getItem("userId");
  const userRole = localStorage.getItem("role"); 

  const isOwner = listing?.userID === userId;

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/listings/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        setListing(res.data);

        if (userRole === "owner") {
          setBookings(res.data.bookings || []);
        }

        const propertyReviews = res.data.bookings
          .filter(b => b.status === "completed" && b.renterFeedback?.rating)
          .map(b => ({
            rating: b.renterFeedback.rating,
            comment: b.renterFeedback.comment,
            renterName: b.renterId?.name || "Anonymous",
          }));

        setReviews(propertyReviews);
      } catch (err) {
        console.error(
          "Error fetching listing details:",
          err.response?.data || err.message
        );
      }
    };

    fetchListing();
  }, [id, userRole]);


  const handleBookNow = async () => {
    if (!startDate || !endDate) {
      alert("Please select start and end dates.");
      return;
    }

    try {
      const bookingData = {
        listingId: id,
        renterId: userId,
        startDate,
        endDate,
        message: "I'd like to book this listing.",
      };

      await axios.post("http://localhost:5000/api/bookings", bookingData, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      alert("Booking request sent!");
      navigate("/bookings");
    } catch (err) {
      console.error(
        "Error creating booking:",
        err.response?.data || err.message
      );
      alert(
        "Failed to create booking: " +
          (err.response?.data?.message || err.message)
      );
    }
  };

  if (!listing) return <p>Loading...</p>;

  return (
    <div className="listing-details-container">
      <div className="listing-info-section">
        <div className="listing-image">
          {listing.image && (
            <img src={`http://localhost:5000${listing.image}`} alt="listing" />
          )}
        </div>

        <div className="listing-info">
          <h2>{listing.title}</h2>
          <p className="description">{listing.description}</p>
          <div className="meta">
            <p><strong>Rent:</strong> ₹{listing.rent}/month</p>
            <p><strong>Location:</strong> {listing.station}, {listing.area}</p>

            {/* 🏠 Full Address */}
            {listing.address && (
              <p>
                <strong>Address:</strong>{" "}
                {listing.address.street ? `${listing.address.street}, ` : ""}
                {listing.address.city ? `${listing.address.city}, ` : ""}
                {listing.address.state ? `${listing.address.state}, ` : ""}
                {listing.address.pincode ? `${listing.address.pincode}, ` : ""}
                {listing.address.country || "India"}
              </p>
            )}

            <p><strong>Bedrooms:</strong> {listing.bedrooms}</p>
            <p><strong>Bathrooms:</strong> {listing.bathrooms}</p>
          </div>

          {reviews.length > 0 && (
            <div className="reviews-section">
              <h3>Reviews</h3>
              {reviews.map((review, index) => (
                <div key={index} className="review-card">
                  <p><strong>{review.renterName}</strong></p>
                  <p>⭐ {review.rating}</p>
                  <p>{review.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="listing-action-section">
        {!isOwner && userRole === "renting" && (
          <div className="booking-form">
            <h3>Book this property</h3>
            <div className="date-picker">
              <label>Start Date:</label>
              <DatePicker
                selected={startDate}
                onChange={(date) => setStartDate(date)}
                minDate={new Date()}
                placeholderText="Select start date"
              />
            </div>
            <div className="date-picker">
              <label>End Date:</label>
              <DatePicker
                selected={endDate}
                onChange={(date) => setEndDate(date)}
                minDate={startDate || new Date()}
                placeholderText="Select end date"
              />
            </div>
            <button className="book-btn" onClick={handleBookNow}>
              Book Now
            </button>
          </div>
        )}

        {isOwner && bookings.length > 0 && (
          <div className="bookings-section">
            <h3>Bookings for this listing</h3>
            {bookings.map((b) => (
              <div className="booking-card" key={b._id}>
                <p><strong>Renter:</strong> {b.renterId?.name || b.renterName}</p>
                <p>
                  <strong>Dates:</strong> {new Date(b.startDate).toLocaleDateString()} -{" "}
                  {new Date(b.endDate).toLocaleDateString()}
                </p>
                <p><strong>Status:</strong> {b.status}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ListingDetails;
