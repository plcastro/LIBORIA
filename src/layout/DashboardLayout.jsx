import React from "react";
import Sidebar from "../components/NavBar/SideBar";
import { Outlet } from "react-router-dom";

export const DashboardLayout = () => {
  return (
    <div className="layout">
      <Sidebar />

      <main className="content">
        <Outlet />
      </main>
    </div>
  );
};
