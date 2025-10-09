import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import EditProfile from "./pages/DashboardPages/EditProfile";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootLayout />}>
          <Route index path="home" element={<Home />} />
          <Route path="auth/login" element={<Login />} />
          <Route path="signup" element={<Signup />} />
          <Route path="reset" element={<Reset />} />
          <Route path="auth/forgot" element={<Forgot />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index path="view/books" element={<DisplayBook />} />
          <Route path="view/return" element={<ReturnBooks />} />
          <Route path="view/records" element={<ViewRecords />} />
          <Route path="view/staff" element={<StaffList />} />
          <Route path="view/profile" element={<ProfilePage />} />
          <Route path="edit/profile" element={<EditProfile />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
