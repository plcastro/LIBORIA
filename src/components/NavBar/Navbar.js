import React from "react";
import "./Navbar.css";
import logo_dark from "../../assets/liboria black.png";
import { NavLink } from "react-router-dom";
const Navbar = () => {
  return (
    <nav>
      <img src={logo_dark} alt="" />
      <ul>
        <NavLink to="/">
          <li>Home</li>
        </NavLink>
        <NavLink to="/login">
          <li>Login</li>
        </NavLink>
        <NavLink to="/books">
          <li>Books</li>
        </NavLink>
        <NavLink to="/about">
          <li>About</li>
        </NavLink>
        <NavLink to="/contact">
          <li>Contact</li>
        </NavLink>
      </ul>
    </nav>
  );
};

export default Navbar;
