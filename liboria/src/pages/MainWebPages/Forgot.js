import React, { useState } from "react";
import "./login.css";
import { Link } from "react-router-dom";

const Forgot = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

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
      const response = await fetch(
        "http://localhost:8000/api/forgot-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        setMessage("Recovery email sent. Please check your inbox.");
      } else {
        setError(data.error || "Email not found.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
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
          <div className="signup-link">
            Remembered your password? <Link to="/login">Log in</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Forgot;
