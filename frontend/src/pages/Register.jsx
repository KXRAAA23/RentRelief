import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Login.css";

function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "listing" });
  const [otp, setOtp] = useState("");
  const [userId, setUserId] = useState(""); 
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role === "listing") navigate("/listing/dashboard");
    else if (role === "renting") navigate("/renting/dashboard");
  }, [navigate]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) return setError(data.message || "Registration failed");

      setUserId(data.userId); 
      setShowOtpInput(true);
    } catch {
      setError("Something went wrong. Try again.");
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("http://localhost:5000/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, otp }), 
      });

      const data = await res.json();
      if (!res.ok) return setError(data.message || "OTP verification failed");

      navigate("/login");
    } catch {
      setError("Something went wrong. Try again.");
    }
  };

  return (
    <div className="login-page">
      <div className="login-left">
        <div className="overlay">
          <h1>Join RentRelief</h1>
          <p>Sign up to list or find rentals effortlessly.</p>
        </div>
      </div>

      <div className="login-right">
        <div className="login-form-container">
          <h2>{showOtpInput ? "Verify OTP" : "Create Account"}</h2>

          {!showOtpInput ? (
            <form onSubmit={handleSubmit} className="login-form">
              <input type="text" placeholder="Full Name" name="name" value={form.name} onChange={handleChange} className="login-input" required />
              <input type="email" placeholder="Email" name="email" value={form.email} onChange={handleChange} className="login-input" required />
              <input type="password" placeholder="Password" name="password" value={form.password} onChange={handleChange} className="login-input" required />
              <select name="role" value={form.role} onChange={handleChange} className="login-input">
                <option value="listing">Listing</option>
                <option value="renting">Renting</option>
              </select>
              <button type="submit" className="login-button">Sign up</button>
              {error && <p className="login-error">{error}</p>}
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="login-form">
              <input type="text" placeholder="Enter OTP" value={otp} onChange={(e) => setOtp(e.target.value)} className="login-input" required />
              <button type="submit" className="login-button">Verify OTP</button>
              {error && <p className="login-error">{error}</p>}
            </form>
          )}

          {!showOtpInput && (
            <div className="login-links">
              <p>Already have an account? <a href="/login" className="login-link">Sign in</a></p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Register;
