import React, { useState, useEffect } from "react";
import "./login.css";
import { useParams, useNavigate, Link } from "react-router-dom";

const Reset = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
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
      const response = await fetch(
        "http://localhost:8000/api/users/verify-reset-token",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setTokenValid(true);
      } else {
        setError(data.error || "Invalid or expired reset token");
        setTokenValid(false);
      }
    } catch {
      setError("Network error. Please try again.");
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
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    if (!validate()) return;

    setLoading(true);
    try {
      // Use the correct endpoint: /api/users/reset-password
      const response = await fetch(
        "http://localhost:8000/api/users/reset-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token: token,
            newPassword: formData.newPassword,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMessage("Password reset successfully! Redirecting to login...");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        setError(data.error || "Failed to reset password.");
      }
    } catch {
      setError("Network error. Please try again.");
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
