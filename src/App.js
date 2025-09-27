import logo from "./logo.svg";
import "./App.css";
import LoginForm from "./components/Form/Login";
import Navbar from "./components/NavBar/Navbar";

function App() {
  return (
    <div className="container">
      <Navbar />
      <div className="content">
        <div className="left">
          <img src="/img/library image.jpg" alt="Library" />
        </div>
        <div className="right">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}

export default App;
