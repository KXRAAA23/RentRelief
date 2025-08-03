import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/EditListing.css";

const stateCityMap = {
  Maharashtra: ["Mumbai", "Pune", "Nagpur"],
  Gujarat: ["Ahmedabad", "Surat", "Vadodara"],
  Karnataka: ["Bengaluru", "Mysore", "Mangalore"],
};

function EditListing() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listingData, setListingData] = useState({
    title: "",
    description: "",
    rent: "",
    state: "",
    city: "",
  });
  const [imagePreview, setImagePreview] = useState(null);

useEffect(() => {
  const fetchListing = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/listings/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setListingData(res.data);
      if (res.data.image) {
        setImagePreview(`http://localhost:5000${res.data.image}`);
      }
    } catch (err) {
      console.error("Failed to fetch listing:", err.message);
    }
  };

  fetchListing();
}, [id]);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setListingData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `http://localhost:5000/api/listings/${id}`,
        listingData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      alert("Listing updated successfully!");
      navigate("/listing/dashboard");
    } catch (err) {
      console.error("Update failed:", err.message);
      alert("Update failed");
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

        <label>State:</label>
        <select
          name="state"
          value={listingData.state}
          onChange={(e) => {
            handleChange(e);
            setListingData((prev) => ({ ...prev, city: "" }));
          }}
          required
        >
          <option value="">Select State</option>
          {Object.keys(stateCityMap).map((state) => (
            <option key={state} value={state}>
              {state}
            </option>
          ))}
        </select>

        <label>City:</label>
        <select
          name="city"
          value={listingData.city}
          onChange={handleChange}
          disabled={!listingData.state}
          required
        >
          <option value="">Select City</option>
          {listingData.state &&
            stateCityMap[listingData.state].map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
        </select>

        {imagePreview && (
          <img
            src={imagePreview}
            alt="Preview"
            style={{
              width: "200px",
              height: "150px",
              objectFit: "cover",
              marginTop: "1rem",
              borderRadius: "8px",
            }}
          />
        )}

        <button type="submit">Update Listing</button>
      </form>
    </div>
  );
}

export default EditListing;
