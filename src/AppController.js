import { BrowserRouter, Routes, Route } from "react-router-dom";
import RootLayout from "./layout/RootLayout";
import DashboardLayout from "./layout/DashboardLayout";
import Home from "./pages/MainWebPages/Home";
import Login from "./pages/MainWebPages/Login";
import Signup from "./pages/MainWebPages/Signup";
import Reset from "./pages/MainWebPages/Reset";
import Forgot from "./pages/MainWebPages/Forgot";

import Contact from "./pages/MainWebPages/Contact";
import NotFound from "./pages/MainWebPages/NotFound";
import DisplayBook from "./pages/DashboardPages/DisplayBook";
import ReturnBooks from "./pages/DashboardPages/ReturnBooks";
import ViewRecords from "./pages/DashboardPages/ViewRecords";
import ProfilePage from "./pages/DashboardPages/ProfilePage";

export default function AppController() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<RootLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<Signup />} />
          <Route path="reset" element={<Reset />} />
          <Route path="forgot" element={<Forgot />} />
          <Route path="contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route path="show/books" element={<DisplayBook />} />
          <Route path="return" element={<ReturnBooks />} />
          <Route path="show/records" element={<ViewRecords />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
