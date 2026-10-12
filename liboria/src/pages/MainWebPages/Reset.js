import React, { useState, useEffect } from "react";
import "./login.css";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
const Reset = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [currentPassword, setCurrentPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [tokenValid, setTokenValid] = useState(false);

  // Verify token when component loads
  useEffect(() => {
    if (token) {
      verifyToken(token);
    }
  }, [token]);

  const verifyToken = async (token) => {
    try {
      const response = await axios.post(
        "http://localhost:8000/api/users/verify-reset-token",
        { token },
        { headers: { "Content-Type": "application/json" } },
      );

      const data = response.data;

      if (response.status >= 200 && response.status < 300) {
        setTokenValid(true);
        // Note: Your backend needs to return currentPassword for this to work
        // If it doesn't, we'll rely on server-side validation
        if (data.currentPassword) {
          setCurrentPassword(data.currentPassword);
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || "Network error. Please try again.");
      setTokenValid(false);
    }
  };

  const validate = () => {
    if (!formData.newPassword || !formData.confirmPassword) {
      setError("Both fields are required.");
      return false;
    }
    if (formData.newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return false;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return false;
    }
    // Only validate if we have the current password from the backend
    if (currentPassword && formData.newPassword === currentPassword) {
      setError("New password cannot be the same as your current password.");
      return false;
    }
    return true; // Fixed: removed duplicate return statement
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    // Only run client-side validation if we have currentPassword
    if (currentPassword && !validate()) return;

    setLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:8000/api/users/reset-password",
        {
          token: token,
          newPassword: formData.newPassword,
        },
        { headers: { "Content-Type": "application/json" } },
      );

      const data = response.data;

      if (response.status >= 200 && response.status < 300) {
        setMessage("Password reset successfully! Redirecting to login...");
        setTimeout(() => navigate("/login"), 2000);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error;
      if (
        errorMessage &&
        (errorMessage.includes("same as current") ||
          errorMessage.includes("cannot be the same"))
      ) {
        setError("New password cannot be the same as your current password.");
      } else {
        setError(errorMessage || "Network error. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Show error if token is invalid
  if (token && !tokenValid) {
    return (
      <div className="reset-password-container">
        <div className="reset-password-content">
          <h1 className="title">Invalid Reset Link</h1>
          <p className="subtitle">
            This password reset link is invalid or has expired.
          </p>
          {error && <div className="error">{error}</div>}
          <div className="signup-link">
            <Link to="/forgot-password">Request a new reset link</Link> or{" "}
            <Link to="/login">Return to login</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="reset-password-container">
      <div className="reset-password-content">
        <h1 className="title">Reset Password</h1>
        <p className="subtitle">Enter your new password</p>

        <form className="reset-password-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="password"
              id="newPassword"
              placeholder="New password"
              value={formData.newPassword}
              onChange={(e) =>
                setFormData({ ...formData, newPassword: e.target.value })
              }
              minLength={8}
              required
            />
          </div>

          <div className="form-group">
            <input
              type="password"
              id="confirmPassword"
              placeholder="Confirm new password"
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData({ ...formData, confirmPassword: e.target.value })
              }
              minLength={8}
              required
            />
          </div>

          <button
            type="submit"
            className="recovery-btn"
            disabled={loading || !tokenValid}
          >
            {loading ? "Resetting..." : "RESET PASSWORD"}
          </button>

          {error && <div className="error">{error}</div>}
          {message && <div className="info">{message}</div>}

          <div className="signup-link">
            <Link to="/login">Back to Login</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Reset;
