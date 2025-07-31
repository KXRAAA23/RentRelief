import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/ListingDashboard.css";

function ListingDashboard() {
  const [listings, setListings] = useState([]);
  const navigate = useNavigate();

useEffect(() => {
  fetchListings();
}, []);

  const fetchListings = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/listings/my",{
        headers:{
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });
      setListings(res.data);
    } catch (err) {
      console.error("Failed to fetch listings:", err.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this listing?")) {
      try {
        await axios.delete(`http://localhost:5000/api/listings/${id}`);
        fetchListings();
      } catch (err) {
        console.error("Delete failed:", err.message);
      }
    }
  };

  return (
    <div className="listing-dashboard">
      <h2>Welcome to Your Listing Dashboard</h2>

      <Link to="/add-listing" className="add-listing-btn">
        <button>+ Add New Listing</button>
      </Link>

      <div className="listing-grid">
        {listings.map((listing) => (
          <div className="listing-card" key={listing._id}>
            {listing.image && (
              <img
                src={`http://localhost:5000${listing.image}`}
                alt="listing"
                  />
            )}
            <h3>{listing.title}</h3>
            <p>Rent: ₹{listing.rent}</p>
            <p>Location: {listing.city}, {listing.state}</p>

            <div className="listing-actions">
              <button onClick={() => navigate(`/edit-listing/${listing._id}`)}>Edit</button>
              <button onClick={() => handleDelete(listing._id)} className="delete-btn">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ListingDashboard;
