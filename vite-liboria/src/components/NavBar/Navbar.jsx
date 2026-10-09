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
      <NavLink to="/home">
        <li>Home</li>
      </NavLink>

      <NavLink to="/login">
        <li>Login</li>
      </NavLink>
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

          <Drawer anchor="right" open={open} onClose={handleClose}>
            <div style={{ width: 250, padding: "16px" }}>
              <img
                src={logo_dark}
                alt="Logo"
                style={{
                  width: "200px",
                  maxWidth: "100%",
                  marginBottom: "20px",
                }}
              />

              <Menu
                open={true}
                onClose={handleClose}
                anchorEl={null}
                variant="selectedMenu"
                sx={{
                  position: "static",
                  "& .MuiPaper-root": {
                    position: "static",
                    boxShadow: "none",
                  },
                }}
              >
                <MenuItem component={NavLink} to="/home" onClick={handleClose}>
                  Home
                </MenuItem>

                <MenuItem component={NavLink} to="/login" onClick={handleClose}>
                  Login
                </MenuItem>
              </Menu>
            </div>
          </Drawer>
        </>
      )}
    </nav>
  );
};

export default Navbar;
