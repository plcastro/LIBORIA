import React from "react";
import { useNavigate } from "react-router-dom";
import { Button, Row, Col } from "antd";
import BookBackground from "../../assets/book-background.png";
import { Grid } from "antd";

const Home = () => {
  const { useBreakpoint } = Grid;
  const screens = useBreakpoint();

  let fontSize = "70px"; // default
  if (screens.md) fontSize = "60px";
  else if (screens.sm) fontSize = "45px";
  else fontSize = "42px"; //

  const navigate = useNavigate();
  return (
    <>
      <Row
        style={{
          backgroundImage: `url(${BookBackground})`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center center",
          backgroundSize: "cover",
          width: "100%",
          height: "100vh",
          minHeight: "300px",
        }}
      >
        <Col
          xs={{ span: 22, offset: 1 }}
          sm={{ span: 20, offset: 2 }}
          md={{ span: 14, offset: 2 }}
          lg={{ span: 12, offset: 2 }}
          xl={{ span: 10, offset: 2 }}
          style={{ color: "white", alignContent: "center" }}
        >
          <h1 style={{ color: "white", fontSize }}>
            FIND BOOKS THAT MATCH YOUR INTERESTS{" "}
          </h1>
          <p style={{ marginBottom: "50px" }}>
            Liboria makes it easy to discover books that match your interests.
          </p>

          <Button
            color="default"
            variant="outlined"
            size="large"
            onClick={() => navigate("/login")}
          >
            Get Started
          </Button>
        </Col>
      </Row>
      <Row
        justify="center"
        align="middle"
        style={{ margin: "50px 0", minHeight: "100vh" }}
      >
        <h1>Available Books:</h1>
        {/* Dito ilalagay yung available books component */}
      </Row>
    </>
  );
};
export default Home;
