import "./SideBar.css";
import logo_dark from "../../assets/liboria white.png";
import React, { useState } from "react";
import {
  UserOutlined,
  BookOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import { Menu } from "antd";
import { useNavigate } from "react-router-dom";

const items = [
  {
    key: "sub1",
    label: "Book Management",
    icon: <BookOutlined />,
    children: [
      { key: "1", label: "Books", path: "/dashboard/show/books" },

      { key: "2", label: "Return Book", path: "/dashboard/return" },
      { key: "3", label: "View Records", path: "/dashboard/view/records" },
    ],
  },
  {
    key: "sub2",
    label: "User Management",
    icon: <UserOutlined />,
    children: [
      { key: "4", label: "Borrower List", path: "/dashboard/show/borrowers" },
      { key: "5", label: "My Profile", path: "/dashboard/profile" },
    ],
  },
];

const SideBar = ({ setPage }) => {
  const navigate = useNavigate();
  const [current, setCurrent] = useState("1");

  const onClick = (e) => {
    setCurrent(e.key);

    if (e.key === "1") {
      setPage("Show Books");
      navigate("/dashboard/show/books");
    } else if (e.key === "2") {
      setPage("Return Book");
      navigate("/dashboard/return");
    } else if (e.key === "3") {
      setPage("View Records");
      navigate("/dashboard/view/records");
    } else if (e.key === "4") {
      setPage("Borrower Information");
      navigate("/dashboard/show/borrowers");
    } else if (e.key === "5") {
      setPage("My Profile");
      navigate("/dashboard/profile");
    } else if (e.key === "logout") {
      navigate("/");
    }
  };

  return (
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
          style={{ flex: "auto", width: 256 }}
          items={items}
        />
      </div>

      <div className="sidebar-bottom">
        <Menu theme="dark" mode="inline" onClick={onClick}>
          <Menu.Item key="logout" icon={<ArrowLeftOutlined />}>
            Log out
          </Menu.Item>
        </Menu>
      </div>
    </div>
  );
};

export default SideBar;
