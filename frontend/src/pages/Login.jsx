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
      } else {
        navigate("/renting/dashboard");
      }
    } catch {
      setError("Something went wrong. Try again.");
    }
  };

  return (
    <div className="login-container">
      <h2>Login to RentRelief</h2>
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
        <button type="submit" className="login-button">Login</button>
        {error && <p className="login-error">{error}</p>}
        <p>
          New user?{" "}
          <a href="/register" className="login-link">
            Register here
          </a>
        </p>
      </form>
    </div>
  );
}

export default Login;
