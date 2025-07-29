import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Navbar.css";

function Navbar() {
  const name = localStorage.getItem("name");
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
    window.location.reload();
  };

  return (
    <nav className="navbar">
      <Link to="/" className="logo-link">
        <img src="/rentrelieflogo.png" alt="RentRelief Logo" className="logo-image" />
        <span className="logo-text">RENT RELIEF</span>
      </Link>

      <div className="navbar-right">
        {name ? (
          <>
            <span className="navbar-user">Hi, {name}</span>
            <button onClick={handleLogout} className="logout-button">Logout</button>
          </>
        ) : (
          <Link to="/login" className="nav-link">Login</Link>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
