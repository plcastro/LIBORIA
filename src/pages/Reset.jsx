import React from "react";
import "./accounts.css";
import { Link } from "react-router-dom";
export const Reset = () => {
    return (
        <div className="reset-password-container">
            <div className="reset-password-content">
                <h1>Reset Password</h1>
                <p className="subtitle">Please enter your new password</p>

                <form className="reset-password-form">
                    <div className="form-group">
                        <label htmlFor="new-password">New Password</label>
                        <input
                            type="password"
                            id="new-password"
                            placeholder="Enter your new password"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirm-password">Confirm Password</label>
                        <input
                            type="password"
                            id="confirm-password"
                            placeholder="Confirm your new password"
                        />
                    </div>

                    <Link to="/login" className="recovery-btn">
                        RESET PASSWORD
                    </Link>
                </form>
            </div>
        </div>
    );
};