import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import RootLayout from "./layout/RootLayout";
import DashboardLayout from "./layout/DashboardLayout";
import Home from "./pages/MainWebPages/Home";
import Login from "./pages/MainWebPages/Login";
import Signup from "./pages/MainWebPages/Signup";
import Reset from "./pages/MainWebPages/Reset";
import Forgot from "./pages/MainWebPages/Forgot";

import NotFound from "./pages/MainWebPages/NotFound";
import DisplayBook from "./pages/DashboardPages/DisplayBook";
import ReturnBooks from "./pages/DashboardPages/ReturnBooks";
import ViewRecords from "./pages/DashboardPages/ViewRecords";
import StaffList from "./pages/DashboardPages/StaffList";
import ProfilePage from "./pages/DashboardPages/ProfilePage";

export default function App() {
  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === "rememberMe" && event.newValue === "false") {
        localStorage.removeItem("currentUser");
        window.location.href = "/login";
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />

        <Route path="/home" element={<RootLayout />}>
          <Route index element={<Home />} />
        </Route>

        <Route path="/" element={<RootLayout />}>
          <Route path="login" element={<Login />} />
          <Route path="forgot" element={<Forgot />} />
          <Route path="signup" element={<Signup />} />
          <Route path="reset/:token" element={<Reset />} />
        </Route>

        <Route path="*" element={<NotFound />} />

        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route path="view/borrow" element={<DisplayBook />} />
          <Route path="view/return" element={<ReturnBooks />} />
          <Route path="view/records" element={<ViewRecords />} />
          <Route path="view/staff" element={<StaffList />} />
          <Route path="view/profile" element={<ProfilePage />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
