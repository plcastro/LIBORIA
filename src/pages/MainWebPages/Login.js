import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import "./login.css";

export const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [id]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch('http://localhost:8000/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store user data in localStorage including account_type
        localStorage.setItem('currentUser', JSON.stringify(data.user));
        
        // Check user role and navigate accordingly
        if (data.user.account_type === 'admin') {
          // Admin goes to admin dashboard
          navigate("/dashboard");
        } else if (data.user.account_type === 'librarian') {
          // Librarian goes to librarian dashboard
          navigate("/dashboard");
        } else {
          // Default fallback
          navigate("/dashboard");
        }
        
      } else {
        setError(data.error || "Login failed");
      }
    } catch (error) {
      console.error('Login error:', error);
      setError("Network error. Please try again.");
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
              <input type="checkbox" id="remember" />
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

          {error && <div className="error">{error}</div>}

          <div className="signup-link">
            Don't have an account? <Link to="/signup">Sign up here</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;