import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "./login.css";

const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Load saved credentials when the component mounts
  useEffect(() => {
    const savedUsername = localStorage.getItem("rememberedUsername");
    const savedPassword = localStorage.getItem("rememberedPassword");
    const savedRememberMe =
      localStorage.getItem("rememberMe") === "true";

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
      localStorage.setItem("rememberMe", "false");
      localStorage.removeItem("rememberedUsername");
      localStorage.removeItem("rememberedPassword");
    } else {
      localStorage.setItem("rememberMe", "true");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.username.trim() || !formData.password.trim()) {
      setError("Username and password are required.");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:8000/api/users/login",
        {
          username: formData.username.trim(),
          password: formData.password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const user = response.data.user;

      if (!user) {
        setError("Login failed: user information was not returned.");
        return;
      }

      // Save the logged-in user
      sessionStorage.setItem("currentUser", JSON.stringify(user));

      // Remember username and password if selected
      if (rememberMe) {
        localStorage.setItem(
          "rememberedUsername",
          formData.username.trim()
        );
        localStorage.setItem(
          "rememberedPassword",
          formData.password
        );
        localStorage.setItem("rememberMe", "true");
      } else {
        localStorage.removeItem("rememberedUsername");
        localStorage.removeItem("rememberedPassword");
        localStorage.setItem("rememberMe", "false");
      }

      // Redirect based on account type
      if (user.account_type === "student") {
        navigate("/student/dashboard");
      } else if (user.account_type === "librarian") {
        navigate("/dashboard/view/borrow");
      } else {
        sessionStorage.removeItem("currentUser");
        setError(
          "Unrecognized account type. Please contact the administrator."
        );
      }
    } catch (err) {
      console.error("Login error:", err);
      console.log("Status:", err.response?.status);
      console.log("Backend response:", err.response?.data);

      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Login failed. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-content">
        <h1 className="title">Login</h1>
        <p className="subtitle">
          Please enter your credentials to log in
        </p>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              placeholder="Enter your username"
              value={formData.username}
              onChange={handleInputChange}
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleInputChange}
              autoComplete="current-password"
            />
          </div>

          <div className="remember-forgot">
            <div className="remember-me">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={handleRememberMeChange}
              />
              <label htmlFor="remember">Remember me</label>
            </div>

            <Link to="/forgot" className="forgot-password">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            className="login-btn"
            disabled={loading}
          >
            {loading ? "Logging in..." : "LOGIN"}
          </button>

          {error && (
            <div className="error" style={{ color: "red" }}>
              {error}
            </div>
          )}

          <div className="signup-link">
            Don't have an account?{" "}
            <Link to="/signup">Sign up here</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;

