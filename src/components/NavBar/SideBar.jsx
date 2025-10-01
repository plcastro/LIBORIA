import "./SideBar.css";
import logo_dark from "../../assets/liboria white.png";
import React, { useState } from "react";
import {
  AppstoreOutlined,
  MailOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import { Menu } from "antd";
import { useNavigate } from "react-router-dom";

const items = [
  {
    key: "sub1",
    label: "Book Management",
    icon: <MailOutlined />,
    children: [
      { key: "1", label: "Show Books" },
      { key: "2", label: "Borrow a Book" },
      { key: "3", label: "Return a Book" },
    ],
  },
  {
    key: "sub2",
    label: "User Management",
    icon: <AppstoreOutlined />,
    children: [
      { key: "5", label: "Borrower Information" },
      { key: "6", label: "My Account" },
    ],
  },
];

const SideBar = () => {
  const [current, setCurrent] = useState("1");
  const [page, setPage] = useState("Show Books");
  const navigate = useNavigate();

  const onClick = (e) => {
    console.log("click ", e);
    setCurrent(e.key);

    if (e.key === "logout") {
      navigate("/");
      return;
    }

    const selectedItem = items
      .flatMap((menu) => menu.children || [])
      .find((child) => child.key === e.key);

    if (selectedItem) {
      setPage(selectedItem.label);
    }
  };

  return (
    <>
      <div className="dashboard-layout">
        <div className="topNav">{page}</div>
        <div className="sidebar">
          <div className="sidebar-top">
            <div className="profile-section">
              <img src={logo_dark} alt="Logo" className="sidebar-logo" />
              <h3 className="profile-name">John Doe</h3>
              <p className="profile-role">Librarian</p>
            </div>
            <hr />
            <Menu
              theme="dark"
              onClick={onClick}
              defaultOpenKeys={["sub1"]}
              selectedKeys={[current]}
              mode="inline"
              style={{ width: 256 }}
              items={items}
            />
          </div>

          {/* Logout at the bottom */}
          <div className="sidebar-bottom">
            <Menu theme="dark" mode="inline" onClick={onClick}>
              <Menu.Item key="logout" icon={<ArrowLeftOutlined />}>
                Log out
              </Menu.Item>
            </Menu>
          </div>
        </div>
      </div>
    </>
  );
};

export default SideBar;
