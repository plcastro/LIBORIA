import React from "react";
import Sidebar from "../components/NavBar/SideBar";
import { Outlet } from "react-router-dom";

export const DashboardLayout = () => {
  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-content">
        <Outlet />
      </main>
    </div>
  );
};
