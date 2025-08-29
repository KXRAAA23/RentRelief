import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Login.css";

function Login({ setAuthToken }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role === "listing") navigate("/listing/dashboard");
    else if (role === "renting") navigate("/renting/dashboard");
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Login failed");
        return;
      }

      setAuthToken(data.token);

      localStorage.setItem("role", data.user.role);
      localStorage.setItem("name", data.user.name);
      localStorage.setItem("user", JSON.stringify(data.user));

      if (data.user.role === "listing") {
        navigate("/listing/dashboard");
      } 
      else if (data.user.role === "renting"){
        navigate("/renting/dashboard");
      }
      else {
        navigate("/");
      }
    } catch {
      setError("Something went wrong. Try again.");
    }
  };

return (
  <div className="login-page">
    <div className="login-left">
      <div className="overlay">
        <h1>Welcome to RentRelief</h1>
        <p>Find and list rentals with ease. Your comfort, our priority.</p>
      </div>
    </div>

    <div className="login-right">
      <div className="login-form-container">
        <h2>Sign in</h2>
        <form onSubmit={handleSubmit} className="login-form">
          <input
            type="email"
            placeholder="Email"
            value={email}
            className="login-input"
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            className="login-input"
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="login-button" href="/">Sign in</button>
          {error && <p className="login-error">{error}</p>}
          <div className="login-links">
            <a href="/forgot-password" className="forgot-link">Forgot your password?</a>
            <p>
              Don’t have an account?{" "}
              <a href="/register" className="login-link">Sign up</a>
            </p>
          </div>
        </form>
      </div>
    </div>
  </div>
);

}

export default Login;
