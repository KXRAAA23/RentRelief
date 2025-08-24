import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/EditListing.css";

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

function EditListing() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    rent: "",
    bedrooms: 1,
    bathrooms: 1,
    line: "",
    area: "",
    station: "",
    amenities: []
  });
  const [stationsList, setStationsList] = useState([]);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Fetch existing listing
  useEffect(() => {
    const fetchListing = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/listings/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });
        const data = res.data;

        // Determine line and area from city
        let line = "", area = "";
        for (const l in linesData) {
          for (const a in linesData[l]) {
            if (linesData[l][a].includes(data.station)) {
              line = l;
              area = a;
              break;
            }
          }
          if (line && area) break;
        }

        setFormData({
          title: data.title || "",
          description: data.description || "",
          rent: data.rent || "",
          bedrooms: data.bedrooms || 1,
          bathrooms: data.bathrooms || 1,
          line,
          area,
          station: data.station || "",
          amenities: data.amenities || []
        });

        if (data.image) setImagePreview(`http://localhost:5000${data.image}`);
      } catch (err) {
        console.error("Failed to fetch listing:", err.message);
      }
    };
    fetchListing();
  }, [id]);

  // Update stations list when line or area changes
  useEffect(() => {
    if (formData.line && formData.area) setStationsList(linesData[formData.line][formData.area]);
    else setStationsList([]);
  }, [formData.line, formData.area]);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    if (type === "checkbox") {
      setFormData(prev => ({
        ...prev,
        amenities: checked
          ? [...prev.amenities, value]
          : prev.amenities.filter(a => a !== value)
      }));
    } else if (type === "file") {
      if (files && files[0]) {
        setImage(files[0]);
        setImagePreview(URL.createObjectURL(files[0]));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        ...(name === "line" ? { area: "", station: "" } : {}),
        ...(name === "area" ? { station: "" } : {})
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = new FormData();
      payload.append("title", formData.title);
      payload.append("description", formData.description);
      payload.append("rent", formData.rent);
      payload.append("bedrooms", formData.bedrooms);
      payload.append("bathrooms", formData.bathrooms);
      payload.append("state", "Maharashtra");
      payload.append("station", formData.station);
      payload.append("line", formData.line);
      payload.append("area", formData.area);
      if (image) payload.append("image", image);
      formData.amenities.forEach(a => payload.append("amenities[]", a));

      await axios.put(`http://localhost:5000/api/listings/${id}`, payload, {
        headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${localStorage.getItem("token")}` }
      });

      alert("Listing updated successfully!");
      navigate("/listing/dashboard");
    } catch (err) {
      console.error("Update failed:", err.response?.data || err.message);
      alert("Update failed");
    }
  };

  return (
    <div className="edit-listing">
  <h2>Edit Listing</h2>
  <form onSubmit={handleSubmit} encType="multipart/form-data">
    
    <label>Title</label>
    <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="Title" required />

    <label>Description</label>
    <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Description" required />

    <label>Rent (₹)</label>
    <input type="number" name="rent" value={formData.rent} onChange={handleChange} placeholder="Rent" required />

    <label>Bedrooms</label>
    <input type="number" name="bedrooms" value={formData.bedrooms} onChange={handleChange} min={1} max={5} required />

    <label>Bathrooms</label>
    <input type="number" name="bathrooms" value={formData.bathrooms} onChange={handleChange} min={1} max={5} required />

    <label>Line</label>
    <select name="line" value={formData.line} onChange={handleChange}>
      <option value="">Select Line</option>
      {Object.keys(linesData).map(l => <option key={l} value={l}>{l}</option>)}
    </select>

    <label>Area</label>
    <select name="area" value={formData.area} onChange={handleChange} disabled={!formData.line}>
      <option value="">Select Area</option>
      {formData.line && Object.keys(linesData[formData.line]).map(a => <option key={a} value={a}>{a}</option>)}
    </select>

    <label>Station</label>
    <select name="station" value={formData.station} onChange={handleChange} disabled={!formData.area}>
      <option value="">Select Station</option>
      {stationsList.map(s => <option key={s} value={s}>{s}</option>)}
    </select>

    <label>Amenities</label>
    <div className="amenities-checkboxes">
      {amenitiesOptions.map(a => (
        <label key={a}>
          <input type="checkbox" value={a} checked={formData.amenities.includes(a)} onChange={handleChange} /> {a}
        </label>
      ))}
    </div>

    <label>Upload Image</label>
    <input type="file" accept="image/*" onChange={handleChange} />
    {imagePreview && <img src={imagePreview} alt="Preview" width="200" style={{ marginTop: "1rem", borderRadius: "8px" }} />}

    <button type="submit">Update Listing</button>
  </form>
</div>

  );
}

export default EditListing;
