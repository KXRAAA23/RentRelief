import React from "react";
import { Link } from "react-router-dom";
import "../styles/ListingDashboard.css"; 

function ListingDashboard() {
  return (
    <div className="listing-dashboard">
      <h2>Welcome to Your Listing Dashboard</h2>

      <Link to="/add-listing" className="add-listing-btn">
        <button>+ Add New Listing</button>
      </Link>
    </div>
  );
}

export default ListingDashboard;
