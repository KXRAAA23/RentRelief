import React, { useState } from "react";
import "../styles/AddListing.css";
import axios from "axios";

const stateCityMap = {
  Maharashtra: ["Mumbai", "Pune", "Nagpur"],
  Gujarat: ["Ahmedabad", "Surat", "Vadodara"],
  Karnataka: ["Bengaluru", "Mysore", "Mangalore"],
};

function AddListing() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    rent:" ",
    state: "",
    city: "",
  });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "state") {
      setFormData((prev) => ({ ...prev, city: "" }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const validate = () => {
    const wordCount = formData.description.trim().split(/\s+/).length;
    const newErrors = {};

    if (wordCount < 20) {
      newErrors.description = "Description must be at least 20 words.";
    }

    if (!formData.state || !formData.city) {
      newErrors.location = "Please select both state and city.";
    }

    if (!image) {
      newErrors.image = "Please upload an image.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


const handleSubmit = async (e) => {
  e.preventDefault();
  if (!validate()) return;

  const payload = new FormData();
  payload.append("title", formData.title);
  payload.append("description", formData.description);
  payload.append("rent", formData.rent);
  payload.append("state", formData.state);
  payload.append("city", formData.city);
  payload.append("image", image);

  try {
    console.log("Submitting form...");
    const res = await axios.post("http://localhost:5000/api/listings", payload, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${localStorage.getItem("token")}`
      },
    });

    console.log("Listing submitted successfully:", res.data);
    alert("Listing added!");

  } catch (error) {
  console.error("Submission failed:", error.response?.data || error.message);
  alert("Something went wrong. Please try again.");
}
};


  return (
    <div className="form-container">
      <h2>Add New Listing</h2>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <label>
          Title:
          <input
            type="text"
            name="title"
            required
            value={formData.title}
            onChange={handleChange}
          />
        </label>
        <label>
          Monthly Rent (₹):
            <input
              type="number"
              name="rent"
              value={formData.rent || ""}
              onChange={handleChange}
              placeholder="Enter rent amount"
              required
            />
        </label>

        <label>
          Description:
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            placeholder="Enter at least 20 words..."
            required
          ></textarea>
          {errors.description && (
            <p className="error">{errors.description}</p>
          )}
        </label>

        <label>
          State:
          <select name="state" value={formData.state} onChange={handleChange}>
            <option value="">Select State</option>
            {Object.keys(stateCityMap).map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
        </label>

        <label>
          City:
          <select
            name="city"
            value={formData.city}
            onChange={handleChange}
            disabled={!formData.state}
          >
            <option value="">Select City</option>
            {formData.state &&
              stateCityMap[formData.state].map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
          </select>
        </label>
        {errors.location && <p className="error">{errors.location}</p>}

        <label>
          Upload Image:
          <input type="file" accept="image/*" onChange={handleImageChange} />
          {errors.image && <p className="error">{errors.image}</p>}
        </label>

        {preview && (
          <img
            src={preview}
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

        <div className="button-container">
          <button type="submit">Submit Listing</button>
      </div>
      </form>
    </div>
  );
}

export default AddListing;
