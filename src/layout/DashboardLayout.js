import React, { useState } from "react";
import Sidebar from "../components/NavBar/SideBar";
import { Outlet } from "react-router-dom";

export const DashboardLayout = () => {
  const [page, setPage] = useState("Show Books"); // shared state for topNav title

  return (
    <div className="dashboard-layout">
      <Sidebar setPage={setPage} />{" "}
      {/* pass down function para ma-update title */}
      <div className="main-content">
        <div className="topNav">
          <span>{page}</span>
        </div>
        <main className="dashboard-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
