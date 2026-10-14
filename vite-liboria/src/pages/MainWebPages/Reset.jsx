import { useState, useEffect } from "react";
import "./login.css";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../../api";
import {
  Button,
  TextField,
  Link,
  InputAdornment,
  IconButton,
} from "@mui/material";

import { Visibility, VisibilityOff } from "@mui/icons-material";

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
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (!token) return;
    let active = true;
    axios
      .post("/users/verify-reset-token", { token })
      .then(({ data }) => {
        if (!active) return;
        setTokenValid(true);
        if (data.currentPassword) setCurrentPassword(data.currentPassword);
      })
      .catch((err) => {
        if (!active) return;
        setError(
          err.response?.data?.error || "Network error. Please try again.",
        );
        setTokenValid(false);
      });
    return () => {
      active = false;
    };
  }, [token]);

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

    if (currentPassword && formData.newPassword === currentPassword) {
      setError("New password cannot be the same as your current password.");
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
        "/users/reset-password",
        {
          token: token,
          newPassword: formData.newPassword,
        },
        { headers: { "Content-Type": "application/json" } },
      );

      if (response.status >= 200 && response.status < 300) {
        setMessage("Password reset successfully! Redirecting to login...");
        setTimeout(() => navigate("/login"), 3000);
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
            <TextField
              fullWidth
              type={showNewPassword ? "text" : "password"}
              id="newPassword"
              label="New Password"
              variant="outlined"
              placeholder="Enter your new password"
              value={formData.newPassword}
              onChange={(e) =>
                setFormData({ ...formData, newPassword: e.target.value })
              }
              autoComplete="new-password"
              slotProps={{
                htmlInput: {
                  minLength: 8,
                },
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label={
                          showNewPassword ? "Hide password" : "Show password"
                        }
                        onClick={() => setShowNewPassword((prev) => !prev)}
                        edge="end"
                        size="small"
                        sx={{ padding: "4px", width: "32px", height: "32px" }}
                      >
                        {showNewPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
              required
            />
          </div>

          <div className="form-group">
            <TextField
              fullWidth
              type={showConfirmPassword ? "text" : "password"}
              id="confirmPassword"
              label="Confirm New Password"
              variant="outlined"
              placeholder="Re-enter your new password"
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData({ ...formData, confirmPassword: e.target.value })
              }
              autoComplete="new-password"
              slotProps={{
                htmlInput: {
                  minLength: 8,
                },
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label={
                          showConfirmPassword
                            ? "Hide password"
                            : "Show password"
                        }
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                        edge="end"
                        size="small"
                        sx={{ padding: "4px", width: "32px", height: "32px" }}
                      >
                        {showConfirmPassword ? (
                          <VisibilityOff />
                        ) : (
                          <Visibility />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
              required
            />
          </div>

          <div className="w-full !mt-2">
            <Button
              type="submit"
              disabled={loading || !tokenValid}
              size="large"
              variant="contained"
              className="!w-full !bg-black"
            >
              {loading ? "Resetting..." : "RESET PASSWORD"}
            </Button>
          </div>

          {error && <div className="error">{error}</div>}
          {message && <div className="info">{message}</div>}

          <div className="signup-link">
            <Link onClick={() => navigate("/login")}>Back to Login</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Reset;
