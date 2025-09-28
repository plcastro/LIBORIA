import "./App.css";
import {
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
  Route,
} from "react-router-dom";
import { Home } from "./pages/Home";
import { Login } from "./pages/Login";
import { RootLayout } from "./layout/RootLayout";
import { Books } from "./pages/Books";
import { About } from "./pages/About";
import { Contact } from "./pages/Contact";
import NotFound from "./components/NotFound";

function App() {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/" element={<RootLayout />}>
        <Route index element={<Home />} />
        <Route path="login" element={<Login />} />
        <Route path="books" element={<Books />} />
        <Route path="about" element={<About />} />
        <Route path="contact" element={<Contact />} />
        {/* Catch-all for 404 */}
        <Route path="*" element={<NotFound />} />
      </Route>
    )
  );
  return <RouterProvider router={router} />;
}

export default App;
