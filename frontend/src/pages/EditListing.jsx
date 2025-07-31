import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/EditListing.css"; // Optional

function EditListing() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listingData, setListingData] = useState({
    title: "",
    description: "",
    rent: "",
    city: "",
    state: "",
  });

  useEffect(() => {
    fetchListing();
  }, []);

  const fetchListing = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/listings/${id}`);
      setListingData(res.data);
    } catch (err) {
      console.error("Failed to fetch listing:", err.message);
    }
  };

  const handleChange = (e) => {
    setListingData({
      ...listingData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5000/listings/${id}`, listingData);
      alert("Listing updated successfully!");
      navigate("/listing-dashboard");
    } catch (err) {
      console.error("Update failed:", err.message);
    }
  };

  return (
    <div className="edit-listing">
      <h2>Edit Listing</h2>
      <form onSubmit={handleSubmit} className="edit-listing-form">
        <input
          type="text"
          name="title"
          placeholder="Title"
          value={listingData.title}
          onChange={handleChange}
          required
        />
        <textarea
          name="description"
          placeholder="Description"
          value={listingData.description}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="rent"
          placeholder="Rent"
          value={listingData.rent}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="city"
          placeholder="City"
          value={listingData.city}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="state"
          placeholder="State"
          value={listingData.state}
          onChange={handleChange}
          required
        />
        <button type="submit">Update Listing</button>
      </form>
    </div>
  );
}

export default EditListing;
