import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Sidebar.css";

function Sidebar({ setAuthToken }) {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");
  const name = localStorage.getItem("name");

  const handleLogout = () => {
    localStorage.clear();
    setAuthToken(null);     
    navigate("/");
  };

  if (!role) return null;

  return (
    <div className="sidebar">
      <h3 className="sidebar-title">RentRelief</h3>
      <p className="sidebar-user">Hello, {name || "User"}</p>

      <nav className="sidebar-links">
        <Link to="/">🏠 Home</Link>
        {role === "listing" && (
          <>
            <Link to="/listing/dashboard">📋 Dashboard</Link>
            <Link to="/add-listing">➕ Add Listing</Link>
          </>
        )}
        {role === "renting" && (
          <Link to="/renting/dashboard">🔍 Browse Listings</Link>
        )}
        <button onClick={handleLogout} className="sidebar-logout">
          🚪 Logout
        </button>
      </nav>
    </div>
  );
}

export default Sidebar;
