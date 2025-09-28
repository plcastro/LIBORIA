import "./App.css";
import {
  Routes,
  Route,
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
} from "react-router-dom";
import { Home } from "./pages/Home";
import { Login } from "./pages/Login";
import { Signup } from "./pages/Signup";
import { RootLayout } from "./layout/RootLayout";
import { Books } from "./pages/Books";
import { About } from "./pages/About";
import { Contact } from "./pages/Contact";
function App() {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/" element={<RootLayout />}>
        <Route index element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/books" element={<Books />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/signup" element={<Signup />} />
      </Route>
    )
  );
  return <RouterProvider router={router} />;
}

export default App;
