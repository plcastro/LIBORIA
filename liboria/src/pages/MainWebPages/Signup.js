import React, { useState } from "react";
import "./login.css";
import { Link, useNavigate } from "react-router-dom";
import { message } from "antd";
import axios from "axios";

export const Signup = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    account_type: "student", // Default to student for new registrations
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [id]: value,
    }));
  };

  const validate = () => {
    if (
      !formData.name ||
      !formData.email ||
      !formData.username ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      setError("All fields are required.");
      return false;
    }
    if (formData.name.length > 50) {
      setError("Name must be up to 50 characters.");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError("Invalid email format.");
      return false;
    }
    if (formData.username.length < 8) {
      setError("Username must be at least 8 characters.");
      return false;
    }
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!validate()) return;

    setLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:8000/api/users/",
        {
          name: formData.name,
          email: formData.email,
          username: formData.username,
          password: formData.password,
          account_type: "student",
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      const data = response.data;

      if (response.status >= 200 && response.status < 300) {
        messageApi.success("Registration successful! Please login.");
        navigate("/login");
      } else {
      }
    } catch (error) {
      console.error("Registration error:", error);
      setError(
        error.response?.data?.error || "Network error. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {contextHolder}
      <div className="signup-container">
        <div className="signup-content">
          <h1 className="title">Sign Up</h1>
          <p className="subtitle">Please provide your information to sign up</p>

          <form className="signup-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input
                type="text"
                id="name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleInputChange}
                maxLength={50}
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                placeholder="Enter username"
                value={formData.username}
                onChange={handleInputChange}
                minLength={8}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleInputChange}
                minLength={8}
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                placeholder="Confirm password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                minLength={8}
              />
            </div>

            <button type="submit" className="recovery-btn" disabled={loading}>
              {loading ? "Signing up..." : "SIGN UP"}
            </button>
            {error && (
              <div className="error" style={{ color: "red" }}>
                {error}
              </div>
            )}

            <div className="signup-link">
              Already have an account? <Link to="/login">Log in</Link>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default Signup;
