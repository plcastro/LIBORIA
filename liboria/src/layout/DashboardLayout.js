import React, { useState } from "react";
import Sidebar from "../components/NavBar/SideBar";
import { Outlet } from "react-router-dom";
import { Layout, Button, Drawer, Grid } from "antd";
import { MenuOutlined } from "@ant-design/icons";

const { Header, Sider, Content } = Layout;
const { useBreakpoint } = Grid;

const headerStyle = {
  height: "48px",
  fontSize: "clamp(27px, 4vw, 32px)",
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
  backgroundColor: "#001529",
  color: "#fff",
  minHeight: "100vh",
  position: "fixed",
  left: 0,
  top: 0,
  bottom: 0,
  zIndex: 5,
};

const DashboardLayout = () => {
  const [page, setPage] = useState("Show Books");
  const [open, setOpen] = useState(false);
  const screens = useBreakpoint();
  const isTablet = !screens.lg;

  return (
    <Layout style={{ minHeight: "100vh", overflow: "hidden" }}>
      {isTablet ? (
        <>
          <Button
            type="text"
            icon={
              <MenuOutlined style={{ fontSize: "clamp(12px, 1.8vw, 16px)" }} />
            }
            onClick={() => setOpen(true)}
            style={{
              position: "fixed",
              top: "-10px",
              left: "10px",
              zIndex: 1000,
              background: "white",
              borderRadius: "8px",
            }}
          />
          <Drawer
            placement="left"
            onClose={() => setOpen(false)}
            open={open}
            width="300px"
            bodyStyle={{ padding: 0 }}
            style={{
              backgroundColor: "#001529",
              color: "white",
            }}
          >
            <Sidebar setPage={setPage} />
          </Drawer>
        </>
      ) : (
        <Sider width="15%" style={siderStyle}>
          <Sidebar setPage={setPage} />
        </Sider>
      )}

      <Layout
        style={{
          marginLeft: isTablet ? 0 : "15%",
          width: isTablet ? "100%" : "85%",
          overflowX: "hidden",
        }}
      >
        <Header style={headerStyle}>{page}</Header>
        <Content style={contentStyle}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default DashboardLayout;
