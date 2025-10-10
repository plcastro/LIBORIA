import logo_dark from "../../assets/liboria white.png";
import React, { useState, useEffect } from "react";
import {
  UserOutlined,
  BookOutlined,
  ArrowLeftOutlined,
  ContactsOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";
import { Menu } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import BookIcon from "../../assets/books.png";
import ReturnIcon from "../../assets/return.png";

const SideBar = ({ setPage }) => {
  const navigate = useNavigate();
  const [current, setCurrent] = useState("");
  const location = useLocation();

  const user = JSON.parse(localStorage.getItem("currentUser")) || {};
  const items = [
    {
      key: "sub1",
      label: "Book Management",
      icon: <BookOutlined />,
      children: [
        {
          key: "1",
          label: "Books",
          path: "/dashboard/view/books",
          icon: (
            <img src={BookIcon} alt="Books" style={{ width: 18, height: 18 }} />
          ),
        },
        {
          key: "2",
          label: "Return Book",
          path: "/dashboard/view/return",
          icon: (
            <img
              src={ReturnIcon}
              alt="Books"
              style={{ width: 18, height: 18 }}
            />
          ),
        },
        {
          key: "3",
          label: "View Records",
          path: "/dashboard/view/records",
          icon: <UnorderedListOutlined />,
        },
      ],
    },
    {
      key: "sub2",
      label: "User Management",
      icon: <UserOutlined />,
      children: [
        ...(user.account_type == "admin"
          ? [
              {
                key: "4",
                label: "View Staff",
                path: "/dashboard/view/staff",
                icon: <UnorderedListOutlined />,
              },
            ]
          : []),
        {
          key: "5",
          label: "My Profile",
          path: "/dashboard/view/profile",
          icon: <ContactsOutlined />,
        },
      ],
    },
  ];

  useEffect(() => {
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
      localStorage.removeItem("currentUser");
      navigate("/home");
    }
  };

  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        backgroundColor: "#001529",
        color: "white",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          fontSize: "clamp(12px, 1.8vw, 16px)",
        }}
      >
        <div
          style={{
            textAlign: "left",
            padding: "10px",
          }}
        >
          <img
            src={logo_dark}
            alt="Logo"
            style={{
              maxWidth: "200px",
              width: "100%",
              margin: "0",
              padding: 0,
            }}
          />
          <h3 className="profile-name">{user.name || "John Doe"}</h3>
          <p className="profile-role" color="#585757ff">
            {user.account_type || "Librarian"}
          </p>
        </div>

        <Menu
          theme="dark"
          mode="inline"
          onClick={onClick}
          defaultOpenKeys={["sub1"]}
          selectedKeys={[current]}
          items={items}
          style={{
            flex: 1,
            borderInline: "none",
            backgroundColor: "#001529",
          }}
        />
      </div>

      <Menu
        theme="dark"
        mode="inline"
        onClick={onClick}
        style={{
          borderInline: "none",
          backgroundColor: "#001529",
          fontSize: "clamp(12px, 1.8vw, 16px)",
        }}
      >
        <Menu.Item key="logout" icon={<ArrowLeftOutlined />}>
          Log out
        </Menu.Item>
      </Menu>
    </div>
  );
};

export default SideBar;
