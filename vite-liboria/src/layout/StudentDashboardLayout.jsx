import React, { useEffect, useState } from "react";
import { Layout, Menu, Button, Drawer, Grid, Typography } from "antd";
import {
  DashboardOutlined,
  BookOutlined,
  ReadOutlined,
  UserOutlined,
  LogoutOutlined,
  MenuOutlined,
} from "@ant-design/icons";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import "./StudentDashboardLayout.css";

const { Sider, Header, Content } = Layout;
const { useBreakpoint } = Grid;

const StudentDashboardLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const storedUser = JSON.parse(
        sessionStorage.getItem("currentUser") || "null",
      );
      setUser(storedUser);
    } catch {
      setUser(null);
    }
  }, []);

  const menuItems = [
    {
      key: "/student/dashboard",
      icon: <DashboardOutlined />,
      label: "Overview",
    },
    {
      key: "/student/books",
      icon: <BookOutlined />,
      label: "Browse Books",
    },
    {
      key: "/student/borrowings",
      icon: <ReadOutlined />,
      label: "My Borrowings",
    },
    {
      key: "/student/profile",
      icon: <UserOutlined />,
      label: "My Profile",
    },
  ];

  const selectedKey =
    menuItems.find(
      (item) =>
        location.pathname === item.key ||
        location.pathname.startsWith(`${item.key}/`),
    )?.key || "/student/dashboard";

  const goTo = (path) => {
    navigate(path);
    setDrawerOpen(false);
  };

  const logout = () => {
    sessionStorage.removeItem("currentUser");
    navigate("/home", { replace: true });
  };

  const sidebarContent = (
    <>
      <div className="student-logo">
        <img src={require("../assets/liboria white.png")} alt="LIBORIA" />
      </div>

      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[selectedKey]}
        items={menuItems}
        onClick={({ key }) => goTo(key)}
      />

      <div className="student-logout">
        <Button block type="text" icon={<LogoutOutlined />} onClick={logout}>
          Log Out
        </Button>
      </div>
    </>
  );

  const pageTitles = {
    "/student/dashboard": "Dashboard Overview",
    "/student/books": "Browse Books",
    "/student/borrowings": "My Borrowings",
    "/student/profile": "My Profile",
  };

  const pageTitle = pageTitles[location.pathname] || "Student Dashboard";

  return (
    <Layout className="student-layout">
      {!isMobile && (
        <Sider width={245} theme="dark" className="student-sider">
          {sidebarContent}
        </Sider>
      )}

      <Layout className="student-main">
        <Header className="student-header">
          {isMobile && (
            <Button
              type="text"
              icon={<MenuOutlined />}
              onClick={() => setDrawerOpen(true)}
              aria-label="Open navigation"
            />
          )}

          <Typography.Title level={3}>{pageTitle}</Typography.Title>

          <Typography.Text className="student-header-user">
            {user?.name || user?.username || "Student"}
          </Typography.Text>
        </Header>

        <Content className="student-content">
          <Outlet />
        </Content>
        <Drawer
          title="LIBORIA"
          placement="left"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          width={260}
          styles={{ body: { padding: 0, background: "#001529" } }}
        >
          {sidebarContent}
        </Drawer>
      </Layout>
    </Layout>
  );
};

export default StudentDashboardLayout;
