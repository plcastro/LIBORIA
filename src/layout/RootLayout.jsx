import React from "react";
import Navbar from "../components/NavBar/Navbar";
import { Outlet } from "react-router-dom";
import FooterComp from "../components/FooterComp/FooterComp"; // import default, not {}

export const RootLayout = () => {
  return (
    <div className="layout">
      <Navbar />

      <main className="content">
        <Outlet />
      </main>
      <footer>
        <FooterComp />
      </footer>
    </div>
  );
};
