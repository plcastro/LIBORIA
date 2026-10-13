import { useEffect, useState } from "react";
import { Menu } from "antd";
import { Button } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import {
  MenuBook as BookIcon,
  Person as PersonIcon,
  ArrowBack as ArrowLeftIcon,
  FormatListBulleted as ListIcon,
  Contacts as ContactsIcon,
  KeyboardReturn as ReturnBookIcon,
} from "@mui/icons-material";
import axios from "../../api";
import logo_dark from "../../assets/liboria white.png";
const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [current, setCurrent] = useState("");
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem("currentUser") || "{}");
    } catch {
      return {};
    }
  });

  const currentUserId = (() => {
    try {
      return JSON.parse(sessionStorage.getItem("currentUser") || "{}")?._id;
    } catch (error) {
      console.error("Failed to parse currentUser:", error);
      return null;
    }
  })();

  const fetchUserInfo = async (id) => {
    if (!id) return;

    try {
      const { data } = await axios.get(`/users/${id}`);

      setUser(data);
    } catch (err) {
      console.error("Failed to fetch user info:");
      console.error("URL:", err.config?.url);
      console.error("Status:", err.response?.status);
      console.error("Response:", err.response?.data);
      console.error("Message:", err.message);
    }
  };

  useEffect(() => {
    Promise.resolve().then(() => fetchUserInfo(currentUserId));

    const handleUserUpdate = (e) => {
      setUser(e.detail);
    };

    window.addEventListener("userUpdated", handleUserUpdate);

    return () => {
      window.removeEventListener("userUpdated", handleUserUpdate);
    };
  }, [currentUserId]);

  // Update selected menu based on the current path
  const selectedCurrent = location.pathname.includes("/dashboard/view/borrow") ? "1"
    : location.pathname.includes("/dashboard/view/return") ? "2"
    : location.pathname.includes("/dashboard/view/records") ? "3"
    : location.pathname.includes("/dashboard/view/staff") ? "4"
    : location.pathname.includes("/dashboard/view/profile") ? "5" : current;

  const onClickMenu = ({ key }) => {
    setCurrent(key);

    switch (key) {
      case "1":
        navigate("/dashboard/view/borrow");
        break;
      case "2":
        navigate("/dashboard/view/return");
        break;
      case "3":
        navigate("/dashboard/view/records");
        break;
      case "4":
        navigate("/dashboard/view/staff");
        break;
      case "5":
        navigate("/dashboard/view/profile");
        break;
      default:
        break;
    }
  };

  const onLogout = async () => {
    try {
      await axios.post("/users/logout");
    } finally {
      sessionStorage.removeItem("currentUser");
      navigate("/home");
    }
  };

  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#000000",
        color: "white",
      }}
    >
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "10px", textAlign: "left" }}>
          <img
            src={logo_dark}
            alt="Liboria Logo"
            style={{
              maxWidth: "200px",
              width: "100%",
              marginTop: 50,
            }}
          />

          <h3 style={{ margin: "20px 0 10px" }}>{user.name}</h3>

          <p
            style={{
              color: "#ccc",
              margin: "10px 0",
              fontSize: "14px",
            }}
          >
            {user.account_type}
          </p>
        </div>

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedCurrent]}
          defaultOpenKeys={["sub1", "sub2"]}
          onClick={onClickMenu}
          style={{
            flex: 1,
            borderInline: "none",
            backgroundColor: "#000000",
          }}
          items={[
            {
              key: "sub1",
              label: "Book Management",
              icon: <BookIcon />,
              children: [
                {
                  key: "1",
                  label: "Borrow Books",
                  icon: <BookIcon sx={{ fontSize: 18 }} />,
                },
                {
                  key: "2",
                  label: "Return Book",
                  icon: <ReturnBookIcon sx={{ fontSize: 18 }} />,
                },
                {
                  key: "3",
                  label: "View Records",
                  icon: <ListIcon />,
                },
              ],
            },
            {
              key: "sub2",
              label: "User Management",
              icon: <PersonIcon />,
              children: [
                ...(user.account_type !== "librarian"
                  ? [
                      {
                        key: "4",
                        label: "View Users",
                        icon: <ListIcon />,
                      },
                    ]
                  : []),
                {
                  key: "5",
                  label: "My Profile",
                  icon: <ContactsIcon />,
                },
              ],
            },
          ]}
        />
      </div>

      <div style={{ padding: "10px" }}>
        <Button
          variant="contained"
          startIcon={<ArrowLeftIcon />}
          onClick={onLogout}
          sx={{
            backgroundColor: "#06233d",
            maxWidth: 300,
            width: "100%",
            textTransform: "none",
            "&:hover": {
              backgroundColor: "#0a3458",
            },
          }}
        >
          Log Out
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
