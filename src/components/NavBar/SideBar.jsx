import "./SideBar.css";
import logo_dark from "../../assets/liboria white.png";
import React, { useState, useEffect } from "react";
import {
  AppstoreOutlined,
  MailOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import { Menu } from "antd";
import { useNavigate, useLocation } from "react-router-dom";

const items = [
  {
    key: "sub1",
    label: "Book Management",
    icon: <MailOutlined />,
    children: [
      { key: "1", label: "Show Books", path: "/dashboard/show/books" },
      { key: "2", label: "Borrow a Book", path: "/dashboard/borrow" },
      { key: "3", label: "Return a Book", path: "/dashboard/return" },
    ],
  },
  {
    key: "sub2",
    label: "User Management",
    icon: <AppstoreOutlined />,
    children: [
      { key: "5", label: "Borrower Information", path: "/dashboard/borrowers" },
      { key: "6", label: "My Account", path: "/dashboard/account" },
    ],
  },
];

const SideBar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const getKeyByPath = (pathname) =>
    items
      .flatMap((menu) => menu.children || [])
      .find((child) => child.path === pathname)?.key || "1";

  const [current, setCurrent] = useState(getKeyByPath(location.pathname));
  const [page, setPage] = useState(
    items
      .flatMap((menu) => menu.children || [])
      .find((child) => child.key === current)?.label || "Show Books"
  );

  // Update current key and page text when route changes
  useEffect(() => {
    const newKey = getKeyByPath(location.pathname);
    setCurrent(newKey);
    setPage(
      items
        .flatMap((menu) => menu.children || [])
        .find((child) => child.key === newKey)?.label || "Show Books"
    );
  }, [location.pathname]);

  const onClick = (e) => {
    if (e.key === "logout") {
      navigate("/");
      return;
    }

    const selectedItem = items
      .flatMap((menu) => menu.children || [])
      .find((child) => child.key === e.key);

    if (selectedItem) {
      setCurrent(e.key);
      setPage(selectedItem.label);
      if (selectedItem.path) {
        navigate(selectedItem.path);
      }
    }
  };

  return (
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

        <div className="sidebar-bottom">
          <Menu theme="dark" mode="inline" onClick={onClick}>
            <Menu.Item key="logout" icon={<ArrowLeftOutlined />}>
              Log out
            </Menu.Item>
          </Menu>
        </div>
      </div>
    </div>
  );
};

export default SideBar;
