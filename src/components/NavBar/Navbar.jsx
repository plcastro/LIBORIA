import React from "react";
import "./Navbar.css";

const Navbar = () => {
  return (
    <nav>
      <h1>Library Management System</h1>
      <ul>
        <li>
          <a href="">Home</a>
        </li>
        <li>
          <a href="">Library</a>
        </li>
        <li>
          <a href="">Search</a>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
