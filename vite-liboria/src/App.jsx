import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from './api';

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
import BorrowRequests from "./pages/DashboardPages/BorrowRequests";
import ProfilePage from "./pages/DashboardPages/ProfilePage";

import StudentDashboardLayout from "./layout/StudentDashboardLayout";
import StudentDashboard from "./pages/StudentDashboard/StudentDashboard";
import StudentBooks from "./pages/StudentDashboard/StudentBooks";
import StudentBorrowings from "./pages/StudentDashboard/StudentBorrowings";

function Protected({ role, children }) {
  const [session, setSession] = useState(undefined);
  useEffect(() => {
    let active = true;
    api.get('/users/me').then(({ data }) => {
      if (active) {
        sessionStorage.setItem('currentUser', JSON.stringify(data.user));
        setSession(data.user);
      }
    }).catch(() => { if (active) setSession(null); });
    return () => { active = false; };
  }, []);
  if (session === undefined) return null;
  if (!session) return <Navigate to="/login" replace />;
  if (role === 'librarian' && session.account_type !== 'librarian') return <Navigate to="/student/dashboard" replace />;
  if (role === 'student' && !['student', 'non-librarian'].includes(session.account_type)) return <Navigate to="/dashboard/view/borrow" replace />;
  return children;
}
export default function App() {
  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === "rememberMe" && event.newValue === "false") {
        sessionStorage.removeItem("currentUser");
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

        <Route path="/dashboard" element={<Protected role="librarian"><DashboardLayout /></Protected>}>
          <Route path="view/borrow" element={<DisplayBook />} />
          <Route path="view/return" element={<ReturnBooks />} />
          <Route path="view/records" element={<ViewRecords />} />
          <Route path="view/staff" element={<StaffList />} />
          <Route path="view/requests" element={<BorrowRequests />} />
          <Route path="view/profile" element={<ProfilePage />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        <Route path="/student" element={<Protected role="student"><StudentDashboardLayout /></Protected>}>
          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="books" element={<StudentBooks />} />
          <Route path="borrowings" element={<StudentBorrowings />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="profile/edit" element={<ProfilePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
