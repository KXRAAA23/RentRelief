import { useState, useEffect } from "react";
import axios from "axios";
import "../styles/Profile.css";

const ProfilePage = () => {
  const [user, setUser] = useState({
    name: "",
    email: "",
    age: "",
    gender: "",
    isVerified: false,
    verificationMethod: "",
    badge: "none",
    documents: null, // single object now
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [file, setFile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const { data } = await axios.get("http://localhost:5000/api/users/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(data);
        setLoading(false);
      } catch (err) {
        setMessage("Error fetching profile");
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser({ ...user, [name]: name === "age" ? Number(value) : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.put(
        "http://localhost:5000/api/users/profile",
        user,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUser(data);
      setMessage("Profile updated successfully!");
    } catch {
      setMessage("Error updating profile");
    }
  };

  const handleVerifyEmail = async () => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.put(
        "http://localhost:5000/api/users/profile",
        { verificationMethod: "email" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUser(data);
      setMessage("Email verified successfully!");
    } catch {
      setMessage("Error verifying email");
    }
  };

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleUploadDocument = async () => {
    if (!file) return setMessage("Please select a file first.");
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", "id_document");

    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.post(
        "http://localhost:5000/api/users/upload-document",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setUser(data);
      setFile(null);
      setMessage("Document uploaded! Waiting for admin approval.");
    } catch {
      setMessage("Error uploading document");
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="profile-container">
      <h2>
        Edit Profile{" "}
        {user.isVerified && user.badge !== "none" && (
          <span className={`badge badge-${user.badge}`}>
            {user.badge.toUpperCase()}
          </span>
        )}
      </h2>

      {message && <p>{message}</p>}

      <form onSubmit={handleSubmit}>
        <input type="text" name="name" value={user.name || ""} onChange={handleChange} placeholder="Name" />
        <input type="email" name="email" value={user.email || ""} onChange={handleChange} placeholder="Email" />
        <input type="number" name="age" value={user.age || ""} onChange={handleChange} placeholder="Age" min="18" max="100" />
        <select name="gender" value={user.gender || ""} onChange={handleChange}>
          <option value="">Select gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="non-binary">Non-binary</option>
          <option value="other">Other</option>
          <option value="prefer not to say">Prefer not to say</option>
        </select>
        <button type="submit">Save Changes</button>
      </form>

      {!user.isVerified && (
        <button onClick={handleVerifyEmail} className="verify-button">
          Verify Email
        </button>
      )}

      <div className="documents-section">
        <h3>Verification Document</h3>

        {user.documents ? (
          <div className="document-status">
            {user.documents.status === "approved" ? (
              <span className={`badge badge-${user.badge}`}>
                {user.badge.toUpperCase()}
              </span>
            ) : (
              <span className={`badge badge-${user.documents.status}`}>
                {user.documents.status.toUpperCase()}
              </span>
            )}
          </div>
        ) : (
          <p>No document uploaded yet.</p>
        )}

        {/* Show upload only if no document or not approved */}
        {(!user.documents || user.documents.status !== "approved") && (
          <>
            <input type="file" onChange={handleFileChange} />
            <button onClick={handleUploadDocument}>Upload Document</button>
          </>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
