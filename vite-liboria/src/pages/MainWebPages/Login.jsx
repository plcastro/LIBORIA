import React from "react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import "./login.css";
import "../../App.css";
import {
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Checkbox,
  FormGroup,
  FormControlLabel,
  Link,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleClickShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  useEffect(() => {
    const savedUsername = localStorage.getItem("rememberedUsername");
    const savedPassword = localStorage.getItem("rememberedPassword");
    const savedRememberMe = localStorage.getItem("rememberMe") === "true";

    if (savedRememberMe && savedUsername) {
      setFormData({
        username: savedUsername,
        password: savedPassword || "",
      });
      setRememberMe(true);
    }
  }, []);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [id]: value,
    }));
  };

  const handleRememberMeChange = (e) => {
    const isChecked = e.target.checked;
    setRememberMe(isChecked);

    if (!isChecked) {
      localStorage.setItem("rememberMe", "false"); // triggers other tabs
      sessionStorage.removeItem("rememberedUsername");
      sessionStorage.removeItem("rememberedPassword");
    } else {
      localStorage.setItem("rememberMe", "true");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Prevent empty fields
    if (!formData.username.trim() || !formData.password.trim()) {
      setError("Username and password are required");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:8000/api/users/login",
        {
          username: formData.username.trim(),
          password: formData.password.trim(),
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      const data = response.data;

      if (response.status >= 200 && response.status < 300) {
        sessionStorage.setItem("currentUser", JSON.stringify(data.user));

        if (rememberMe) {
          sessionStorage.setItem(
            "rememberedUsername",
            formData.username.trim(),
          );
          sessionStorage.setItem(
            "rememberedPassword",
            formData.password.trim(),
          );
          localStorage.setItem("rememberMe", "true");
        } else {
          sessionStorage.removeItem("rememberedUsername");
          sessionStorage.removeItem("rememberedPassword");
          localStorage.removeItem("rememberMe");
        }

        navigate("/dashboard/view/borrow");
      }
    } catch (err) {
      console.error("Login error:", err);

      console.log("Status:", err.response?.status);
      console.log("Backend response:", err.response?.data);

      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Login failed. Please check your credentials.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-content">
        <h1 className="title">Login</h1>
        <p className="subtitle">Please enter your credentials to log in</p>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <TextField
              type="text"
              id="username"
              label="Username"
              variant="outlined"
              value={formData.username}
              onChange={handleInputChange}
              autoComplete="username"
              className="!w-full"
            />
          </div>

          <div className="form-group">
            <TextField
              type={showPassword ? "text" : "password"}
              id="password"
              label="Password"
              variant="outlined"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleInputChange}
              autoComplete="current-password"
              fullWidth
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                        onClick={handleClickShowPassword}
                        edge="end"
                        size="small"
                        sx={{
                          padding: "4px",
                          width: "32px",
                          height: "32px",
                        }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
          </div>

          <div className="flex w-full items-center">
            <div className="flex-1">
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      size="small"
                      checked={rememberMe}
                      onChange={handleRememberMeChange}
                      sx={{ padding: "4px", mr: 0.5 }}
                    />
                  }
                  label="Remember me"
                  sx={{
                    "& .MuiFormControlLabel-label": {
                      fontSize: "14px",
                    },
                    margin: 0,
                    whiteSpace: "nowrap",
                  }}
                />
              </FormGroup>
            </div>

            <div className="flex flex-1 justify-end">
              <Link
                variant="text"
                size="small"
                onClick={() => navigate("/forgot")}
                className="forgot-password !text-gray-500"
                sx={{
                  fontSize: "14px",
                  textTransform: "none",
                  minWidth: 0,
                  padding: "4px 0",
                  whiteSpace: "nowrap",
                }}
              >
                Forgot password?
              </Link>
            </div>
          </div>
          <div className="w-full !mt-2">
            <Button
              type="submit"
              disabled={loading}
              size="large"
              variant="contained"
              className="!w-full !bg-black"
            >
              {loading ? "Logging in..." : "LOGIN"}
            </Button>
          </div>
          {error && <div className="error text-red-700">{error}</div>}

          <div className="signup-link">
            Don't have an account? <Link to="/signup">Sign up here</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
