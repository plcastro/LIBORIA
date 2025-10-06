import React from "react";
import { useNavigate } from "react-router-dom";
import { Button, Row, Col, Grid, Divider } from "antd";
import BookBackground from "../../assets/book-background.png";
import bookshelf from "../../assets/bookshelf-black.png";

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
          lg={{ span: 10, offset: 2 }}
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
      <Row justify="center" align="middle">
        <Divider>
          <h2>ABOUT US</h2>
        </Divider>
        <Col
          lg={{ span: 8 }}
          md={{ span: 10 }}
          sm={{ span: 18 }}
          xs={{ span: 22 }}
        >
          <img
            src={bookshelf}
            alt="bookshelf black"
            width="100%"
            height="350px"
            alignContent="center"
            style={{ objectFit: "Cover" }}
          />
        </Col>
        <Col
          lg={{ span: 9, offset: 1 }}
          md={{ span: 12, offset: 1 }}
          sm={{ span: 18 }}
          xs={{ span: 22 }}
          style={{ display: "flex", alignContent: "flex-start" }}
        >
          <p style={{ textAlign: "justify" }}>
            Welcome to <strong>Liboria</strong>, your digital library designed
            for readers of all ages and interests. From the hottest trending
            titles and heart-fluttering romance novels, to magical kids’
            stories, edge-of-your-seat thrillers, and essential textbooks,
            Liboria brings the joy of reading into one easy-to-use platform.{" "}
            <br /> <br />
            We believe books are for sharing, not just storing. That’s why
            Liboria works as a borrowing-based eLibrary, giving you the freedom
            to explore more books without limits—anytime, anywhere.
          </p>
        </Col>
      </Row>
      <Row justify="center" align="middle">
        <Col sm={{ span: 18 }} xs={{ span: 22 }}>
          <Divider>
            <h2>MISSION AND VISION</h2>
          </Divider>
          <p style={{ textAlign: "justify" }}>
            At Liboria, our mission is simple: to make reading more accessible,
            enjoyable, and affordable for everyone. We combine the spirit of a
            traditional library with the convenience of the digital world, so
            that every reader can find stories that inspire, knowledge that
            empowers, and adventures that spark the imagination.
            <br /> <br />
            Our vision is to build a connected community of readers who believe
            in the power of sharing stories—because every book borrowed is a new
            world discovered.
          </p>
        </Col>
      </Row>
    </>
  );
};
export default Home;
