import logo_dark from "../../assets/liboria white.png";
import React, { useState, useEffect } from "react";
import {
  UserOutlined,
  BookOutlined,
  ArrowLeftOutlined,
  ContactsOutlined,
} from "@ant-design/icons";
import { Menu } from "antd";
import { useNavigate, useLocation } from "react-router-dom";

const items = [
  {
    key: "sub1",
    label: "Book Management",
    icon: <BookOutlined />,
    children: [
      { key: "1", label: "Books", path: "/dashboard/view/books" },
      { key: "2", label: "Return Book", path: "/dashboard/view/return" },
      { key: "3", label: "View Records", path: "/dashboard/view/records" },
    ],
  },
  {
    key: "sub2",
    label: "User Management",
    icon: <UserOutlined />,
    children: [
      {
        key: "4",
        label: "View Staff",
        path: "/dashboard/view/staff",
        icon: <ContactsOutlined />,
      },
      { key: "5", label: "My Profile", path: "/dashboard/view/profile" },
    ],
  },
];

const SideBar = ({ setPage }) => {
  const navigate = useNavigate();
  const location = useLocation(); // pang detect ng path
  const [current, setCurrent] = useState("");

  useEffect(() => {
    //kapag nirefresh di siya babalik sa first page ng dashboard kung hindi iyon ang current page
    if (location.pathname.includes("/dashboard/view/books")) setCurrent("1");
    else if (location.pathname.includes("/dashboard/view/return"))
      setCurrent("2");
    else if (location.pathname.includes("/dashboard/view/records"))
      setCurrent("3");
    else if (location.pathname.includes("/dashboard/view/staff"))
      setCurrent("4");
    else if (location.pathname.includes("/dashboard/view/profile"))
      setCurrent("5");
    else setCurrent("");
  }, [location.pathname]);

  const onClick = (e) => {
    setCurrent(e.key);

    if (e.key === "1") {
      setPage("Show Books");
      navigate("/dashboard/view/books");
    } else if (e.key === "2") {
      setPage("Return Book");
      navigate("/dashboard/view/return");
    } else if (e.key === "3") {
      setPage("View Records");
      navigate("/dashboard/view/records");
    } else if (e.key === "4") {
      setPage("View Staff");
      navigate("/dashboard/view/staff");
    } else if (e.key === "5") {
      setPage("My Profile");
      navigate("/dashboard/view/profile");
    } else if (e.key === "logout") {
      navigate("/home");
    }
  };

  return (
    <div
      className="sidebar"
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        height: "100vh",
        backgroundColor: "#001529",
      }}
    >
      <div className="sidebar-top">
        <div
          className="profile-section"
          style={{
            margin: "20px 10px",
          }}
        >
          <img
            src={logo_dark}
            alt="Logo"
            className="sidebar-logo"
            style={{
              margin: "20px 0",
              width: "80%",
            }}
          />
          <h3 className="profile-name">John Doe</h3>
          <p className="profile-role" color="#585757ff">
            Librarian
          </p>
        </div>
        <hr />
        <Menu
          theme="dark"
          onClick={onClick}
          defaultOpenKeys={["sub1"]}
          selectedKeys={[current]}
          mode="inline"
          style={{ flex: "auto" }}
          items={items}
        />
      </div>

      <div
        className="sidebar-bottom"
        style={{
          margin: "10px 0 20px",
          display: "block",
        }}
      >
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
