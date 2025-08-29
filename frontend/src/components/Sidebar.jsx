import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaHome, FaList, FaPlus, FaSearch, FaSignOutAlt, FaClipboardList, FaEnvelope, FaUser } from "react-icons/fa";
import "../styles/Sidebar.css";
import logo from "../assets/rentrelieflogo.png";

function Sidebar({ setAuthToken }) {
  const [collapsed, setCollapsed] = useState(false);
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
    <div className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      <button className="sidebar-toggle" onClick={() => setCollapsed(!collapsed)}>
        <img src={logo} alt="RentRelief Logo" className="sidebar-logo" />
      </button>

      {!collapsed && (
        <>
          <h3 className="sidebar-title">RentRelief</h3>
          <p className="sidebar-user">Hello, {name || "User"}</p>
        </>
      )}

      <nav className="sidebar-links">
        <Link to="/"><FaHome /> <span>Home</span></Link>

        {role === "listing" && (
          <>
            <Link to="/profile"><FaUser /> <span>Profile</span></Link>
            <Link to="/listing/dashboard"><FaList /> <span>Dashboard</span></Link>
            <Link to="/add-listing"><FaPlus /> <span>Add Listing</span></Link>
            <Link to="/bookings"><FaClipboardList /> <span>Bookings</span></Link>
            <Link to="/messages"><FaEnvelope /> <span>Messages</span></Link> 
          </>
        )}

        {role === "renting" && (
          <>
            <Link to="/profile"><FaUser /> <span>Profile</span></Link>
            <Link to="/renting/dashboard"><FaSearch /> <span>Browse</span></Link>
            <Link to="/bookings"><FaClipboardList /> <span>My Bookings</span></Link>
            <Link to="/messages"><FaEnvelope /> <span>Messages</span></Link> 
          </>
        )}

        {role === "admin" && (
          <>
            <Link to="/approval"><FaUser /> <span>Approval</span></Link>
          </>
        )}

        <button onClick={handleLogout} className="sidebar-logout">
          <FaSignOutAlt /> <span>Logout</span>
        </button>
      </nav>
    </div>
  );
}

export default Sidebar;
