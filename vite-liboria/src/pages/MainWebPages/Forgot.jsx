import React, { useState } from "react";
import "./login.css";
import { API_BASE_URL } from "../../utils/API_BASE";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import axios from "axios";
import { TextField, Link, Button } from "@mui/material";

const Forgot = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [tokenStatus, setTokenStatus] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);

  // Controls which card is displayed
  const [showTokenCard, setShowTokenCard] = useState(false);

  const validate = () => {
    if (!email.trim()) {
      setError("Email is required.");
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
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
        API_BASE_URL + "/api/users/forgot-password",
        { email: email.trim().toLowerCase() },
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      // Only show the token verification card if the backend
      // confirms that the account exists.
      if (response.data.accountExists === true) {
        setShowTokenCard(true);
      } else {
        setShowTokenCard(false);
        setError("No account was found with that email address.");
      }

      if (response.data.resetLink) {
        console.log("Test reset link:", response.data.resetLink);
      }
    } catch (err) {
      setShowTokenCard(false);
      setError(err.response?.data?.error || "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmToken = async (e) => {
    e.preventDefault();
    setTokenStatus("");

    if (!resetToken.trim()) {
      setTokenStatus("Please enter your reset token.");
      return;
    }

    setConfirmLoading(true);

    try {
      await axios.post(
        API_BASE_URL + "/api/users/verify-reset-token",
        { token: resetToken.trim() },
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      setTokenStatus("OTP Verified! Redirecting to password reset...");

      setTimeout(() => {
        navigate(`/reset/${encodeURIComponent(resetToken.trim())}`);
      }, 0);
    } catch (err) {
      setTokenStatus(
        err.response?.data?.error || "Network error. Please try again.",
      );
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleBack = () => {
    setShowTokenCard(false);
    setResetToken("");
    setTokenStatus("");
    setError("");
    setMessage("");
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-content">
        {!showTokenCard ? (
          <>
            <h1 className="title">Forgot Password</h1>

            <p className="subtitle">Please provide your email to proceed</p>

            <form className="forgot-password-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <TextField
                  fullWidth
                  type="email"
                  id="email"
                  label="Email Address"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {error && <div className="error">{error}</div>}

              <div className="w-full !mt-2">
                <Button
                  type="submit"
                  disabled={loading}
                  size="large"
                  variant="contained"
                  className="!w-full !bg-black"
                >
                  {loading ? "Sending..." : "EMAIL ME A RECOVERY LINK"}
                </Button>
              </div>

              <div className="signup-link" style={{ marginTop: "20px" }}>
                Remembered your password?{" "}
                <Link component={RouterLink} to="/login">
                  Log in
                </Link>
              </div>
            </form>
          </>
        ) : (
          <>
            <h1 className="title">Verify OTP</h1>

            <p className="subtitle">
              Enter the OTP associated with your recovery request.
            </p>

            {message && <div className="info">{message}</div>}

            <form
              className="forgot-password-form"
              onSubmit={handleConfirmToken}
            >
              <div className="form-group">
                <TextField
                  fullWidth
                  type="text"
                  id="resetToken"
                  label="Enter OTP"
                  value={resetToken}
                  onChange={(e) => setResetToken(e.target.value)}
                  required
                />
              </div>

              {tokenStatus && <div className="info">{tokenStatus}</div>}

              <div className="w-full !mt-2">
                <Button
                  type="submit"
                  disabled={confirmLoading || !resetToken.trim()}
                  size="large"
                  variant="contained"
                  className="!w-full !bg-black !text-white"
                >
                  {confirmLoading ? "Checking..." : "SUBMIT OTP"}
                </Button>
              </div>

              <div className="signup-link" style={{ marginTop: "20px" }}>
                Remembered your password?{" "}
                <Link component={RouterLink} to="/login">
                  Log in
                </Link>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default Forgot;
