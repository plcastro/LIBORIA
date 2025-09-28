import React from "react";
import Navbar from "../components/NavBar/Navbar";
import { Outlet } from "react-router-dom";

export const RootLayout = () => {
  return (
    <div>
      <Navbar />
      <div className="container">
        <h1>Welcome to Liboria</h1>
      </div>
      <Outlet />
    </div>
  );
};
