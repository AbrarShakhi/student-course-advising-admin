import MAIN_URL from "../../../misc/api";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import "../../styles/auth.css";

const Login = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const API_URL = MAIN_URL + "/admin/login";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!formData.username || !formData.password) {
      setError("Username and password are required.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },

        credentials: "include",
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        console.log("Login successful!");

        navigate("/admin");
      } else {
        const errorData = await response.json();
        setError(
          errorData.msg || "Login failed. Please check your credentials."
        );
      }
    } catch (err) {
      console.error("Network error during login:", err);
      setError("Could not connect to the server. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="form-wrapper">
        <div className="form-content">
          <h2 className="title">Admin Login</h2>
          <p className="subtitle">
            Enter your credentials to access the admin panel.
          </p>
          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                name="username"
                type="text"
                value={formData.username}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <button
              type="submit"
              className={`login-button ${loading ? "loading" : ""}`}
              disabled={loading}
            >
              {loading ? "Logging In..." : "Log In"}
            </button>
          </form>
        </div>
      </div>

      <div className="img-wrapper"></div>
    </div>
  );
};

export default Login;
