import React from "react";
import "./login.css";
import { Link } from "react-router-dom";
const Forgot = () => {
  return (
    <div className="forgot-password-container">
      <div className="forgot-password-content">
        <h1 className="title">Forgot Password</h1>
        <p className="subtitle">Please provide your email to proceed</p>

        <form className="forgot-password-form">
          <div className="form-group">
            <input type="email" id="email" placeholder="Enter email" />
          </div>

          <Link to="/reset" className="recovery-btn">
            EMAIL ME A RECOVERY LINK
          </Link>
        </form>
      </div>
    </div>
  );
};
export default Forgot;
