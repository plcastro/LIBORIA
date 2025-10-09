import React from "react";
import { useNavigate } from "react-router-dom";
import { Button, Row, Col, Divider } from "antd";
import BookBackground from "../../assets/book-background.png";
import bookshelf from "../../assets/bookshelf-black.png";
import "../../App.css";
const Home = () => {
  const navigate = useNavigate();
  return (
    <>
      <Row
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2)), url(${BookBackground})`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center center",
          backgroundSize: "cover",
          width: "100%",
          height: "100vh",
          overflowX: "hidden",
        }}
      >
        <Col
          xs={{ span: 22, offset: 1 }}
          sm={{ span: 20, offset: 2 }}
          md={{ span: 14, offset: 2 }}
          lg={{ span: 12, offset: 2 }}
          style={{
            color: "white",
            alignContent: "center",
            margin: "0 10%",
          }}
        >
          <h1 style={{ color: "white", fontSize: "clamp(32px, 70px, 90px)" }}>
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
        style={{ margin: "50px 0", padding: " 0 10%" }}
      >
        <Divider>
          <h2 style={{ fontSize: "clamp (32px, 42px, 50px)" }}>ABOUT US</h2>
        </Divider>
        <Col
          lg={{ span: 12 }}
          md={{ span: 20 }}
          sm={{ span: 24 }}
          xs={{ span: 24 }}
          style={{ padding: "0 20px" }}
        >
          <img
            src={bookshelf}
            alt="bookshelf black"
            style={{
              width: "100%",
              height: "auto",
              maxHeight: "400px",
              minHeight: "250px",
              objectFit: "cover",
            }}
          />
        </Col>
        <Col
          lg={{ span: 12 }}
          md={{ span: 20 }}
          sm={{ span: 24 }}
          xs={{ span: 24 }}
          style={{
            display: "flex",
            alignContent: "flex-start",
          }}
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
      <Row
        justify="center"
        align="middle"
        style={{ margin: "100px 0", padding: " 0 10%" }}
      >
        <Col lg={{ span: 24 }} sm={{ span: 20 }} xs={{ span: 20 }}>
          <Divider>
            <h2 style={{ fontSize: "clamp (32px, 42px, 50px)" }}>
              MISSION AND VISION
            </h2>
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
