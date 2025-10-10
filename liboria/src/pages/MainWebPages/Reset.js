import React, { useState } from "react";
import "./login.css";
import { useParams, useNavigate, Link } from "react-router-dom";

const Reset = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const validate = () => {
    if (!password || !confirmPassword) {
      setError("Both fields are required.");
      return false;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return false;
    }
    if (password !== confirmPassword) {
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
      const response = await fetch(
        `http://localhost:8000/api/reset-password/${token}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        setMessage("Password reset successful! Redirecting to login...");
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

  return (
    <div className="reset-password-container">
      <div className="reset-password-content">
        <h1 className="title">Reset Password</h1>
        <p className="subtitle">Enter your new password</p>
        <form className="reset-password-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="password"
              id="password"
              placeholder="New password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              id="confirmPassword"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <button type="submit" className="recovery-btn" disabled={loading}>
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
