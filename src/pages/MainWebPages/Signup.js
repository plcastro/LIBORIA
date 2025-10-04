import React from "react";
import "./login.css";
import { Link } from "react-router-dom";
export const Signup = () => {
  return (
    <div className="signup-container">
      <div className="signup-content">
        <h1 className="title">Sign Up</h1>
        <p className="subtitle">Please provide your information to sign up</p>

        <form className="signup-form">
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input type="text" id="name" placeholder="Enter your full name" />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input type="email" id="email" placeholder="Enter your email" />
          </div>

          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input type="text" id="username" placeholder="Enter username" />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              placeholder="Create a password"
              minLength={8}
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmpassword">Confirm Password</label>
            <input
              type="password"
              id="confirm"
              placeholder="Confirm password"
              minLength={8}
            />
          </div>

          <Link to="/login" className="recovery-btn">
            SIGN UP
          </Link>
          <div className="signup-link">
            Already have an account? <Link to="/login">Log in</Link>
          </div>
        </form>
      </div>
    </div>
  );
};
