import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "antd";
import notfoundimg from "../assets/Book_torn page.png";
import "./NotFound.css";
const NotFound = () => {
  const navigate = useNavigate();
  return (
    <div>
      <div className="first-row">
        <img src={notfoundimg} alt="Book Torn Page" />
        <h1 id="errorMessage">404 | OOPS! PAGE NOT FOUND</h1>
        <p>Sorry, the page that you were looking for doesn't exist.</p>
        <Button color="default" variant="solid" onClick={() => navigate("/")}>
          Return to Home
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
