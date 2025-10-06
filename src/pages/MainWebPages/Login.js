import React from "react";
import { useNavigate, Link } from "react-router-dom";
import "./login.css";
const Login = () => {
  const navigate = useNavigate();
  return (
    <div className="login-container">
      <div className="login-content">
        <h1 className="title">Login</h1>
        <p className="subtitle">Please enter your credentials to log in</p>

        <form className="login-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              placeholder="Enter your username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              placeholder="Enter your password"
            />
          </div>

          <div className="remember-forgot">
            <div className="remember-me">
              <input type="checkbox" id="remember" />
              <label htmlFor="remember">Remember me</label>
            </div>
            <a href="forgot" className="forgot-password">
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            className="login-btn"
            onClick={() => navigate("/dashboard/show/books")}
          >
            LOGIN
          </button>

          <div className="signup-link">
            Don't have an account? <Link to="/signup">Sign up here</Link>
          </div>
        </form>
      </div>
    </div>
  );
};
export default Login;
