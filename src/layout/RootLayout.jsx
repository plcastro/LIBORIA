import React from "react";
import Navbar from "../components/NavBar/Navbar";
import { Outlet } from "react-router-dom";

export const RootLayout = () => {
  return (
    <div>
      <Navbar />
      <div className="container"></div>
      <Outlet />
    </div>
  );
};
