import React, { useState } from "react";
import Sidebar from "../components/NavBar/SideBar";
import { Outlet } from "react-router-dom";
import { Flex, Layout } from "antd";
const { Header, Sider, Content } = Layout;

const headerStyle = {
  height: "48px",
  fontSize: "34px",
  backgroundColor: "white",
  boxShadow: "0 2px 8px #0000007c",
  fontWeight: "500",
  display: "flex",
  marginLeft: "20%",
  justifyContent: "center",
  alignItems: "center",
};
const layoutStyle = {
  display: "flex",
  flexDirection: "row",
  minHeight: "100vh",
};
const contentStyle = {
  display: "flex",
  flexDirection: "column",
  width: "80%",
  marginLeft: "20%",
  padding: "20px 5%",
};
const siderStyle = {
  zIndex: "1",
  backgroundColor: "#001529",
  minHeight: "100vh",
  position: "fixed",
  color: "white",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
};

export const DashboardLayout = () => {
  const [page, setPage] = useState("Show Books");

  return (
    <Flex gap="middle" wrap>
      <Layout style={layoutStyle}>
        <Sider width={"20%"} style={siderStyle}>
          <Sidebar setPage={setPage} />{" "}
        </Sider>
        <Layout>
          <Header style={headerStyle}>
            <span>{page}</span>
          </Header>
          <Content style={contentStyle}>
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    </Flex>
  );
};
