import React from "react";
import Navbar from "../components/NavBar/Navbar";
import { Layout } from "antd";
import { Outlet, useLocation } from "react-router-dom";
import FooterComp from "../components/FooterComp/FooterComp";

const { Header, Footer, Content } = Layout;

const RootLayout = () => {
  const location = useLocation();
  const showFooter = location.pathname === "/home";

  return (
    <Layout
      style={{
        minHeight: "100vh",
        width: "100%",
        overflowX: "hidden",
      }}
    >
      <Header
        style={{
          color: "#fff",
          height: 64,
          lineHeight: "64px",
          padding: 0,
        }}
      >
        <Navbar />
      </Header>

      <Content
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          minHeight: 0,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Outlet />
      </Content>

      {showFooter && (
        <Footer
          style={{
            backgroundColor: "black",
            color: "white",
            padding: "50px 10%",
            width: "100%",
            boxSizing: "border-box",
          }}
        >
          <FooterComp />
        </Footer>
      )}
    </Layout>
  );
};

export default RootLayout;
