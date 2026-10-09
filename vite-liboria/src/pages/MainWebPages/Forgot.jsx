import React, { useState } from "react";
import axios from "axios";
import "./login.css";
import { Link, useNavigate } from "react-router-dom";

const Forgot = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [tokenStatus, setTokenStatus] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const validate = () => {
    if (!email) {
      setError("Email is required.");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Invalid email format.");
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
      const response = await axios.post(
        "http://localhost:8000/api/users/forgot-password",
        { email },
        { headers: { "Content-Type": "application/json" } }
      );

      const data = response.data;

      if (response.status >= 200 && response.status < 300) {
        setMessage(data.message);

        // If you want to see the test link in console for debugging:
        if (data.resetLink) {
          console.log("Test reset link (not shown to user):", data.resetLink);
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmToken = async () => {
    setTokenStatus("");
    setConfirmLoading(true);
    try {
      // Use the correct endpoint: verify-reset-token (not confirm-reset-token)
      const response = await axios.post(
        "http://localhost:8000/api/users/verify-reset-token",
        { token: resetToken },
        { headers: { "Content-Type": "application/json" } }
      );

      const data = response.data;

      if (response.status >= 200 && response.status < 300) {
        setTokenStatus("Token confirmed! You may now reset your password.");
        // Navigate to reset password page with the token
        setTimeout(() => {
          navigate(`/reset/${resetToken}`);
        }, 1500);
      }
    } catch (err) {
      setTokenStatus(
        err.response?.data?.error || "Network error. Please try again."
      );
    } finally {
      setConfirmLoading(false);
    }
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-content">
        <h1 className="title">Forgot Password</h1>
        <p className="subtitle">Please provide your email to proceed</p>

        <form className="forgot-password-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="email"
              id="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <button type="submit" className="recovery-btn" disabled={loading}>
            {loading ? "Sending..." : "EMAIL ME A RECOVERY LINK"}
          </button>
          {error && <div className="error">{error}</div>}
          {message && <div className="info">{message}</div>}

          {/* Reset token input and confirm button */}
          <div
            className="form-group"
            style={{ display: "flex", alignItems: "center", marginTop: "20px" }}
          >
            <input
              type="text"
              id="resetToken"
              placeholder="Enter reset token"
              value={resetToken}
              onChange={(e) => setResetToken(e.target.value)}
              className="token-input"
            />
            <button
              type="button"
              className="token-confirm-btn"
              style={{ color: "#fff" }}
              onClick={handleConfirmToken}
              disabled={confirmLoading || !resetToken || !email}
            >
              {confirmLoading ? "Checking..." : "Confirm"}
            </button>
          </div>
          {tokenStatus && <div className="info">{tokenStatus}</div>}

          <div className="signup-link" style={{ marginTop: "20px" }}>
            Remembered your password? <Link to="/login">Log in</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Forgot;
