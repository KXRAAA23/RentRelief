import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../App.css";

function Landing() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (token && role) {
      setUser({ role });
    }
  }, []);

  const sampleListings = [
    {
      id: 1,
      title: "Cozy PG near Churchgate",
      city: "Mumbai",
      rent: 20000,
      image: "/images/churchgate.png",
    },
    {
      id: 2,
      title: "Shared Flat near Pune University",
      city: "Pune",
      rent: 10000,
      image: "/images/pune.png",
    },
    {
      id: 3,
      title: "Single Room in Andheri West",
      city: "Mumbai",
      rent: 12000,
      image: "/images/andheri.png",
    },
  ];

  return (
    <>
      <div className="container">
        <h2>Find Short-Term Stays Easily</h2>

        {!user && (
          <div style={{ marginBottom: "1.5rem" }}>
            <Link to="/login">
              <button style={{ marginRight: "1rem" }}>Login</button>
            </Link>
            <Link to="/register">
              <button>Register</button>
            </Link>
          </div>
        )}

        {user?.role === "listing" && (
          <div style={{ marginBottom: "1.5rem" }}>
            <Link to="/listing/dashboard">
              <button style={{ marginRight: "1rem" }}>Go to Dashboard</button>
            </Link>
            <Link to="/add-listing">
              <button>Add New Listing</button>
            </Link>
          </div>
        )}

        {user?.role === "renting" && (
          <div style={{ marginBottom: "1.5rem" }}>
            <Link to="/renting/dashboard">
              <button>Browse Listings</button>
            </Link>
          </div>
        )}

        <div className="card-grid">
          {sampleListings.map((listing) => (
            <div key={listing.id} className="card">
              <img
                src={listing.image}
                alt={listing.title}
                style={{
                  width: "100%",
                  height: "180px",
                  objectFit: "cover",
                  borderTopLeftRadius: "8px",
                  borderTopRightRadius: "8px",
                }}
              />
              <div style={{ padding: "0.75rem" }}>
                <h3>{listing.title}</h3>
                <p>City: {listing.city}</p>
                <p>Rent: ₹{listing.rent}/month</p>
                <Link to={`/listing/${listing.id}`}>
                  <button
                    style={{
                      marginTop: "0.75rem",
                      backgroundColor: "#007bff",
                      color: "white",
                      padding: "0.5rem 1rem",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                    }}
                  >
                    View Details
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default Landing;
