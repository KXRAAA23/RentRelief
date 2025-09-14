import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/AddListing.css";

const linesData = {
 Western: {
    "Mumbai City": ["Churchgate","Marine Lines","Charni Road","Grant Road","Mumbai Central","Mahalaxmi","Lower Parel","Prabhadevi","Dadar"],
    Suburban: ["Matunga Road","Mahim","Bandra","Khar Road","Santacruz","Vile Parle","Andheri","Jogeshwari","Goregaon","Malad","Kandivli","Borivali","Dahisar","Mira Road","Bhayandar","Nalasopara","Vasai Road","Virar"]
  },
  Central: {
    "Mumbai City": ["CST","Masjid","Sandhurst Road","Byculla","Chinchpokli","Currey Road","Parel","Dadar","Matunga"],
    Suburban: ["Mulund","Bhandup","Kanjurmarg","Vikhroli","Ghatkopar","Vidyavihar","Kurla","Dombivli","Thane","Kalyan"]
  },
  Harbour: {
    "Mumbai City": ["CST","Masjid","Sandhurst Road","Dockyard Road","Reay Road","Cotton Green","Sewri","Wadala Road","GTB Nagar","Chunabhatti","Kurla"],
    Suburban: ["Tilak Nagar","Chembur","Govandi","Mankhurd","Vashi","Nerul","Belapur CBD","Kharghar","Panvel"]
  }
};

const amenitiesOptions = ["Furnished", "AC", "Parking", "Lift", "Power Backup"];

function AddListing() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    rent: "",
    bedrooms: 1,
    bathrooms: 1,
    line: "",
    area: "",
    station: "",
    amenities: [],
    // 🏠 new address fields
    street: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
  });
  const [stationsList, setStationsList] = useState([]);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    if (formData.line && formData.area) {
      setStationsList(linesData[formData.line][formData.area]);
    } else {
      setStationsList([]);
    }
    setFormData((prev) => ({ ...prev, station: "" }));
  }, [formData.line, formData.area]);

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        amenities: checked
          ? [...prev.amenities, value]
          : prev.amenities.filter((a) => a !== value),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        ...(name === "line" ? { area: "", station: "" } : {}),
        ...(name === "area" ? { station: "" } : {}),
      }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = new FormData();

    // append all fields including new address
    for (const key of [
      "title",
      "description",
      "rent",
      "bedrooms",
      "bathrooms",
      "line",
      "area",
      "station",
      "street",
      "city",
      "state",
      "pincode",
      "country"
    ]) {
      payload.append(key, formData[key]);
    }

    if (image) payload.append("image", image);
    formData.amenities.forEach((a) => payload.append("amenities[]", a));

    try {
      const res = await axios.post("http://localhost:5000/api/listings", payload, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      alert("Listing added!");
      console.log(res.data);
    } catch (err) {
      console.error(err.response?.data || err.message);
      alert("Something went wrong.");
    }
  };

  return (
    <div className="add-listing">
      <h2>Add Listing</h2>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        
        <label>Title</label>
        <input type="text" name="title" value={formData.title} onChange={handleChange} required />

        <label>Description</label>
        <textarea name="description" value={formData.description} onChange={handleChange} required />

        <label>Rent (₹)</label>
        <input type="number" name="rent" value={formData.rent} onChange={handleChange} required />

        <label>Bedrooms</label>
        <input type="number" name="bedrooms" value={formData.bedrooms} onChange={handleChange} min={1} required />

        <label>Bathrooms</label>
        <input type="number" name="bathrooms" value={formData.bathrooms} onChange={handleChange} min={1} required />

        {/* Address fields */}
        <h3>Address</h3>
        <label>Street</label>
        <input type="text" name="street" value={formData.street} onChange={handleChange} required />

        <label>City</label>
        <input type="text" name="city" value={formData.city} onChange={handleChange} required />

        <label>State</label>
        <input type="text" name="state" value={formData.state} onChange={handleChange} required />

        <label>Pincode</label>
        <input type="text" name="pincode" value={formData.pincode} onChange={handleChange} required />

        <label>Country</label>
        <input type="text" name="country" value={formData.country} onChange={handleChange} />

        {/* Filters (line, area, station) */}
        <label>Line</label>
        <select name="line" value={formData.line} onChange={handleChange}>
          <option value="">Select Line</option>
          {Object.keys(linesData).map((l) => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>

        <label>Area</label>
        <select name="area" value={formData.area} onChange={handleChange} disabled={!formData.line}>
          <option value="">Select Area</option>
          {formData.line && Object.keys(linesData[formData.line]).map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>

        <label>Station</label>
        <select name="station" value={formData.station} onChange={handleChange} disabled={!formData.area}>
          <option value="">Select Station</option>
          {stationsList.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        {/* Amenities */}
        <label>Amenities</label>
        <div className="amenities-checkboxes">
          {amenitiesOptions.map((a) => (
            <label key={a}>
              <input
                type="checkbox"
                value={a}
                checked={formData.amenities.includes(a)}
                onChange={handleChange}
              />
              {a}
            </label>
          ))}
        </div>

        {/* Image */}
        <label>Upload Image</label>
        <input type="file" onChange={handleImageChange} />
        {preview && (
          <img src={preview} alt="preview" width="200" style={{ marginTop: "1rem", borderRadius: "8px" }} />
        )}

        <button type="submit">Add Listing</button>
      </form>
    </div>
  );
}

export default AddListing;
