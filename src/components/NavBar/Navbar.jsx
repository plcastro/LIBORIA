import React from "react";
import "./Navbar.css";
import logo_dark from "../../assets/liboria black.png";
import { Link } from "react-router-dom";
const Navbar = () => {
  return (
    <nav>
      <img src={logo_dark} alt="" />
      <ul>
        <Link to="/">
          <li>Login</li>
        </Link>
        <Link to="/books">
          <li>Books</li>
        </Link>
        <Link to="/about">
          <li>About</li>
        </Link>
        <Link to="/contact">
          <li>Contact</li>
        </Link>
      </ul>
    </nav>
  );
};

export default Navbar;
