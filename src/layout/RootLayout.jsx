import React from "react";
import Navbar from "../components/NavBar/Navbar";
import { Outlet } from "react-router-dom";
import FooterComp from "../components/FooterComp/FooterComp"; // import default, not {}

export const RootLayout = () => {
  return (
    <div className="layout">
      <Navbar />

      {/* content grows to push footer down */}
      <main className="content">
        <Outlet />
      </main>

      <FooterComp />
    </div>
  );
};
