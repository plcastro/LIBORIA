import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "antd";
import notfoundimg from "../assets/Book_torn page.png";
import "./NotFound.css";

const NotFound = () => {
  const navigate = useNavigate();
  const pathname = window.location.pathname;

  // Determine button text
  const backPageText = pathname.startsWith("/dashboard")
    ? "Go Back"
    : "Go Back to Home";

  const goBackToPrevPage = () => {
    if (pathname.startsWith("/dashboard")) {
      navigate("/dashboard/show/books");
    } else {
      navigate("/");
    }
  };

  return (
    <div className="first-row">
      <img src={notfoundimg} alt="Book Torn Page" />
      <h1 id="errorMessage">404 | OOPS! PAGE NOT FOUND</h1>
      <p>Sorry, the page that you were looking for doesn't exist.</p>
      <Button color="default" variant="solid" onClick={goBackToPrevPage}>
        {backPageText}
      </Button>
    </div>
  );
};

export default NotFound;
