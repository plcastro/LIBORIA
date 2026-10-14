import Button from "../components/MuiButton.jsx";
import { useEffect, useState } from "react";
import Sidebar from "../components/NavBar/SideBar";
import { Outlet, useLocation } from "react-router-dom";
import { Layout, Drawer, Grid } from "antd";
import { MenuOutlined } from "@ant-design/icons";

const { Header, Sider, Content } = Layout;
const { useBreakpoint } = Grid;

const headerStyle = {
  height: "48px",
  fontSize: 24,
  backgroundColor: "white",
  boxShadow: "0 2px 8px #0000007c",
  fontWeight: "500",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

const contentStyle = {
  padding: "20px 5%",
};

const siderStyle = {
  backgroundColor: "#000000",
  color: "#fff",
  minHeight: "100vh",
  position: "fixed",
  left: 0,
  top: 0,
  bottom: 0,
  zIndex: 5,
};

const DashboardLayout = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const screens = useBreakpoint();
  const isTablet = !screens.lg;
  useEffect(() => {
    Promise.resolve().then(() => setOpen(false));
  }, [location.pathname]);

  const pageMap = {
    "/dashboard/view/borrow": "Borrow Books",
    "/dashboard/view/requests": "Borrow Requests",
    "/dashboard/view/return": "Return Books",
    "/dashboard/view/records": "View Records",
    "/dashboard/view/staff": "List of Users",
    "/dashboard/view/profile": "Profile",
    "/dashboard/edit/profile": "Edit Profile",
  };
  const page = pageMap[location.pathname] || "Dashboard";

  return (
    <Layout style={{ minHeight: "100vh", overflow: "hidden" }}>
      {isTablet ? (
        <Drawer
          placement="left"
          onClick={() => setOpen((prev) => !prev)}
          open={open}
          size={300}
          styles={{
            header: {
              display: "none",
            },
            body: {
              padding: 0,
              backgroundColor: "#001529",
            },
            content: {
              backgroundColor: "#001529",
            },
          }}
        >
          <Sidebar />
        </Drawer>
      ) : (
        <Sider width="15%" style={siderStyle}>
          <Sidebar />
        </Sider>
      )}

      <Layout
        style={{
          marginLeft: isTablet ? 0 : "15%",
          width: isTablet ? "100%" : "85%",
          overflowX: "hidden",
        }}
      >
        <Header
          style={{
            ...headerStyle,
            position: "relative",
          }}
        >
          {isTablet && (
            <Button
              type="text"
              icon={
                <MenuOutlined
                  style={{
                    fontSize: 16,
                    color: open ? "white" : "black",
                  }}
                />
              }
              onClick={() => setOpen(true)}
              style={{
                position: "absolute",
                left: 10,
                top: "50%",
                transform: "translateY(-50%)",
                zIndex: 10,
                background: open ? "#001529" : "white",
                borderRadius: 8,
              }}
            />
          )}

          {page}
        </Header>

        <Content style={contentStyle}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default DashboardLayout;
