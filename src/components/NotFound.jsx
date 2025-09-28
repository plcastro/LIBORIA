import React from "react";
import { useNavigate } from "react-router-dom";
import "./NotFound.css";
const NotFound = () => {
  const navigate = useNavigate();
  return (
    <div>
      <div className="errorContainer">
        <h1 id="errorMessage">404 | Page Not Found</h1>
        <button onClick={() => navigate("/")}>Go To Homepage</button>
      </div>
    </div>
  );
};

export default NotFound;
