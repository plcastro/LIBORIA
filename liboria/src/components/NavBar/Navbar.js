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
              <img src={logo_dark} alt="Logo" style={{ width: "200px" }} />
            }
            placement="right"
            onClose={() => setOpen(false)}
            open={open}
          >
            <Menu mode="vertical" onClick={() => setOpen(false)}>
              <Menu.Item key="1">
                <NavLink to="/home">Home</NavLink>
              </Menu.Item>
              <Menu.Item key="2">
                <NavLink to="/login">Login</NavLink>
              </Menu.Item>
            </Menu>
          </Drawer>
        </>
      )}
    </nav>
  );
};

export default Navbar;
