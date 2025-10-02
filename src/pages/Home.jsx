import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "antd";

export const Home = () => {
  const navigate = useNavigate();
  return (
    <>
      <header className="hero-section">
        <div className="hero-text">
          <h1 id="hero-title">FIND BOOKS THAT MATCH YOUR INTERESTS </h1>
          <p id="hero-desc">
            Liboria makes it easy to discover books that match your interests.
            From academic resources to novels and beyond, Liboria connects you
            with titles tailored to your preferences-helping you find your next
            great read quickly and effortlessly.
          </p>

          <Button
            color="default"
            variant="outlined"
            size="large"
            onClick={() => navigate("/login")}
          >
            Get Started
          </Button>
        </div>
      </header>
      <div className="home-container">
        <h1>Available Books:</h1>
        {/* Dito ilalagay yung available books component */}
      </div>
    </>
  );
};
