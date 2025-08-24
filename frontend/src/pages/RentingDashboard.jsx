import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/RentingDashboard.css";

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

const amenitiesList = ["Furnished", "AC", "Parking", "Lift", "Power Backup"];

function RentingDashboard() {
  const [listings, setListings] = useState([]);
  const [selectedLine, setSelectedLine] = useState("");
  const [selectedArea, setSelectedArea] = useState("");
  const [selectedStation, setSelectedStation] = useState("");
  const [stationsList, setStationsList] = useState([]);

  const [minRent, setMinRent] = useState(1000);
  const [maxRent, setMaxRent] = useState(200000);
  const [bedrooms, setBedrooms] = useState(0);
  const [bathrooms, setBathrooms] = useState(0);
  const [selectedAmenities, setSelectedAmenities] = useState([]);

  const [loading, setLoading] = useState(false);

  // Update stations list when line/area change
  useEffect(() => {
    if (selectedLine && selectedArea) {
      setStationsList(linesData[selectedLine][selectedArea]);
    } else {
      setStationsList([]);
    }
    setSelectedStation("");
  }, [selectedLine, selectedArea]);

  // Fetch listings (with optional filters)
  const fetchListings = async (filters = {}) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/listings/search", {
        params: filters,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setListings(res.data);
    } catch (err) {
      console.error("Error fetching listings:", err);
    } finally {
      setLoading(false);
    }
  };

  // Load all listings initially
  useEffect(() => {
    fetchListings();
  }, []);

  const applyFilters = () => {
  const params = {
    line: selectedLine || undefined,
    area: selectedArea || undefined,
    station: selectedStation || undefined,
    minRent,
    maxRent,
    bedrooms: bedrooms > 0 ? bedrooms : undefined,
    bathrooms: bathrooms > 0 ? bathrooms : undefined,
    amenities: selectedAmenities.length > 0 ? selectedAmenities.join(",") : undefined,
  };
  fetchListings(params);
};

  // Reset filters
  const clearFilters = () => {
    setSelectedLine("");
    setSelectedArea("");
    setSelectedStation("");
    setMinRent(1000);
    setMaxRent(200000);
    setBedrooms(0);
    setBathrooms(0);
    setSelectedAmenities([]);
    fetchListings(); // reload all
  };

  return (
    <div className="renting-dashboard">
      <h2>Available Rentals</h2>

      <div className="filters">
        {/* Line */}
        <select
          value={selectedLine}
          onChange={(e) => {
            setSelectedLine(e.target.value);
            setSelectedArea("");
            setSelectedStation("");
          }}
        >
          <option value="">All Lines</option>
          {Object.keys(linesData).map((line) => (
            <option key={line} value={line}>
              {line}
            </option>
          ))}
        </select>

        {/* Area */}
        <select
          value={selectedArea}
          onChange={(e) => {
            setSelectedArea(e.target.value);
            setSelectedStation("");
          }}
          disabled={!selectedLine}
        >
          <option value="">All Areas</option>
          {selectedLine &&
            Object.keys(linesData[selectedLine]).map((area) => (
              <option key={area} value={area}>
                {area}
              </option>
            ))}
        </select>

        {/* Station */}
        <select
          value={selectedStation}
          onChange={(e) => setSelectedStation(e.target.value)}
          disabled={!selectedArea}
        >
          <option value="">All Stations</option>
          {stationsList.map((station) => (
            <option key={station} value={station}>
              {station}
            </option>
          ))}
        </select>

        {/* Rent sliders */}
        <div>
          <label>Min Rent: ₹{minRent}</label>
          <input
            type="range"
            min="1000"
            max="200000"
            step="1000"
            value={minRent}
            onChange={(e) => setMinRent(Number(e.target.value))}
          />
        </div>
        <div>
          <label>Max Rent: ₹{maxRent}</label>
          <input
            type="range"
            min="1000"
            max="200000"
            step="1000"
            value={maxRent}
            onChange={(e) => setMaxRent(Number(e.target.value))}
          />
        </div>

        {/* Bedrooms */}
        <div>
          <label>Bedrooms: {bedrooms}+ </label>
          <input
            type="range"
            min="0"
            max="5"
            step="1"
            value={bedrooms}
            onChange={(e) => setBedrooms(Number(e.target.value))}
          />
        </div>

        {/* Bathrooms */}
        <div>
          <label>Bathrooms: {bathrooms}+ </label>
          <input
            type="range"
            min="0"
            max="5"
            step="1"
            value={bathrooms}
            onChange={(e) => setBathrooms(Number(e.target.value))}
          />
        </div>

        {/* Amenities */}
        <div className="amenities-filters">
          <label>Amenities:</label>
          {amenitiesList.map((amenity) => (
            <label key={amenity}>
              <input
                type="checkbox"
                value={amenity}
                checked={selectedAmenities.includes(amenity)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedAmenities([...selectedAmenities, amenity]);
                  } else {
                    setSelectedAmenities(
                      selectedAmenities.filter((a) => a !== amenity)
                    );
                  }
                }}
              />
              {amenity}
            </label>
          ))}
        </div>

        <button onClick={applyFilters} className="apply-filters-btn">
          Apply Filters
        </button>
        <button onClick={clearFilters} className="clear-filters-btn">
          Clear Filters
        </button>
      </div>

      <div className="listing-grid">
        {loading ? (
          <p>Loading...</p>
        ) : listings.length === 0 ? (
          <p>No listings found.</p>
        ) : (
          listings.map((listing) => (
            <div className="listing-card" key={listing._id}>
              {listing.image && (
                <img
                  src={`http://localhost:5000${listing.image}`}
                  alt="Listing"
                />
              )}
              <h3>{listing.title}</h3>
              <p>₹{listing.rent} / month</p>
              <p>
                Bedrooms: {listing.bedrooms} | Bathrooms: {listing.bathrooms}
              </p>
              {listing.amenities.length > 0 && (
                <p>Amenities: {listing.amenities.join(", ")}</p>
              )}
              <p>
                Line: {listing.line} | Area: {listing.area} | Station:{" "}
                {listing.station}
              </p>

              <button
                onClick={() =>
                  (window.location.href = `/listing/${listing._id}`)
                }
              >
                View/Book
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default RentingDashboard;
