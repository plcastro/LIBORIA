import React, { useState } from "react";
import "./Navbar.css";
import { NavLink } from "react-router-dom";
import logo_dark from "../../assets/liboria black.png";

import {
  Drawer,
  IconButton,
  Menu,
  MenuItem,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { MenuOutlined } from "../MuiAntIcons";

const Navbar = () => {
  const [open, setOpen] = useState(false);

  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));

  const handleClose = () => {
    setOpen(false);
  };

  const menuItems = (
    <ul className="nav-links">
      <li>
        <NavLink to="/home">Home</NavLink>
      </li>
      <li>
        <NavLink to="/login">Login</NavLink>
      </li>
    </ul>
  );

  return (
    <nav className="navbar">
      <img src={logo_dark} alt="Logo" className="logo" />

      {isDesktop ? (
        menuItems
      ) : (
        <>
          <IconButton
            aria-label="Open navigation menu"
            onClick={() => setOpen(true)}
            sx={{ color: "black" }}
          >
            <MenuOutlined sx={{ fontSize: 24 }} />
          </IconButton>

          <Drawer
            anchor="right"
            open={open}
            onClose={handleClose}
            PaperProps={{
              sx: {
                width: 260,
                maxWidth: "85vw",
                boxSizing: "border-box",
                padding: "24px 20px",
                backgroundColor: "#fff",
                boxShadow: "-4px 0 20px rgba(0, 0, 0, 0.12)",
              },
            }}
          >
            <div className="mobile-drawer-header">
              <img
                src={logo_dark}
                alt="Liboria Logo"
                className="mobile-drawer-logo"
              />

              <IconButton
                aria-label="Close navigation menu"
                onClick={handleClose}
                sx={{ color: "black" }}
              >
                <span style={{ fontSize: "24px", lineHeight: 1 }}>&times;</span>
              </IconButton>
            </div>

            <div className="mobile-drawer-divider" />

            <ul className="nav-links mobile-nav-links">
              <li>
                <NavLink to="/home" onClick={handleClose}>
                  Home
                </NavLink>
              </li>

              <li>
                <NavLink to="/login" onClick={handleClose}>
                  Login
                </NavLink>
              </li>
            </ul>
          </Drawer>
        </>
      )}
    </nav>
  );
};

export default Navbar;
