import React from "react";
import "./accounts.css";
import { Link } from "react-router-dom";
export const Forgot = () => {
    return (
    <div className="forgot-password-container">
      <div className="forgot-password-content">
        <h1 className="title">Forgot Password</h1>
        <p className="subtitle">Please provide your email to proceed</p>
        
        <form className="forgot-password-form">
          <div className="form-group">
            <input 
              type="email" 
              id="email" 
              placeholder="Enter email to reset password"
            />
          </div>
          
          <Link to="/reset" className="recovery-btn">
            EMAIL ME A RECOVERY LINK
          </Link>
        </form>
      </div>
    </div>
  );
};
