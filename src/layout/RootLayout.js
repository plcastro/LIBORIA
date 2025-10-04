import React from "react";
import Navbar from "../components/NavBar/Navbar";
import { Flex, Layout } from "antd";
import { Outlet } from "react-router-dom";
import FooterComp from "../components/FooterComp/FooterComp";
const { Header, Footer, Content } = Layout;

const headerStyle = {
  color: "#fff",
  height: 64,
  paddingInline: 48,
  lineHeight: "64px",
};
const layoutStyle = {
  display: "flex",
  flexDirection: "column",
  minHeight: "100vh",
};
const footerStyle = {
  backgroundColor: "black",
  color: "white",
  padding: "50px 10%",
  width: "100%",
  marginTop: "50px",
};
const contentStyle = {
  display: "flex",
  flexDirection: "column",
  minHeight: "100vh",
  gap: "10px",
  alignItems: "center",
  justifyContent: "center",
};

export const RootLayout = () => {
  return (
    <Flex gap="middle" wrap>
      <Layout style={layoutStyle}>
        <Header style={headerStyle}>
          <Navbar />
        </Header>
        <Content style={contentStyle}>
          <Outlet />
        </Content>
        <Footer style={footerStyle}>
          <FooterComp />
        </Footer>
      </Layout>
    </Flex>
  );
};
