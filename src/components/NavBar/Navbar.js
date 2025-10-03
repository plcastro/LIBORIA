import React, { useState } from "react";
import "./Navbar.css";
import logo_dark from "../../assets/liboria black.png";
import { NavLink } from "react-router-dom";
import { Drawer, Button, Grid, Menu } from "antd";
import { MenuOutlined } from "@ant-design/icons";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { useBreakpoint } = Grid;
  const screens = useBreakpoint();

  const menuItems = (
    <ul className="nav-links">
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
  );

  return (
    <nav className="navbar">
      <img src={logo_dark} alt="Logo" className="logo" />

      {/* Desktop Menu */}
      {screens.md ? (
        menuItems
      ) : (
        <>
          <Button
            type="text"
            icon={<MenuOutlined style={{ fontSize: "24px", color: "black" }} />}
            onClick={() => setOpen(true)}
          />
          <Drawer
            title={
              <img src={logo_dark} alt="Logo" style={{ height: "30px" }} />
            }
            placement="right"
            onClose={() => setOpen(false)}
            open={open}
          >
            <Menu mode="vertical" onClick={() => setOpen(false)}>
              <Menu.Item key="1">
                <NavLink to="/">Home</NavLink>
              </Menu.Item>
              <Menu.Item key="2">
                <NavLink to="/login">Login</NavLink>
              </Menu.Item>
              <Menu.Item key="3">
                <NavLink to="/books">Books</NavLink>
              </Menu.Item>
              <Menu.Item key="4">
                <NavLink to="/about">About</NavLink>
              </Menu.Item>
              <Menu.Item key="5">
                <NavLink to="/contact">Contact</NavLink>
              </Menu.Item>
            </Menu>
          </Drawer>
        </>
      )}
    </nav>
  );
};

export default Navbar;
