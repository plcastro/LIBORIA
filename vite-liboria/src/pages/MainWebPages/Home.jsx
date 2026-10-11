import React from "react";
import { useNavigate } from "react-router-dom";
import { Button, Row, Col, Divider } from "../../components/muiAntdCompat";
import BookBackground from "../../assets/book-background.png";
import bookshelf from "../../assets/bookshelf-black.png";
import "../../App.css";

const Home = () => {
  const navigate = useNavigate();

  return (
    <>
      {/* HERO SECTION */}
      <Row
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${BookBackground})`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center center",
          backgroundSize: "cover",
          width: "100%",
          height: "100vh",
          overflowX: "hidden",
          display: "flex",
          alignItems: "center",
          padding: "10%",
        }}
      >
        <Col
          xs={{ span: 22, offset: 1 }}
          sm={{ span: 20, offset: 2 }}
          md={{ span: 14, offset: 2 }}
          lg={{ span: 10, offset: 3 }}
          style={{
            color: "white",
            textAlign: "left",
          }}
        >
          <h1
            style={{
              color: "white",
              fontSize: "clamp(28px, 5vw, 60px)",
              fontWeight: "600",
              lineHeight: "1.2",
            }}
          >
            FIND BOOKS THAT MATCH YOUR INTERESTS
          </h1>

          <p
            style={{
              marginBottom: "20px",
              fontSize: "clamp(14px, 2vw, 18px)",
              maxWidth: "500px",
            }}
          >
            Liboria makes it easy to discover books that match your interests.
          </p>

          <Button
            type="default"
            size="large"
            onClick={() => navigate("/login")}
            style={{
              backgroundColor: "white",
              color: "black",
            }}
          >
            Get Started
          </Button>
        </Col>
      </Row>

      <Row
        justify="center"
        align="middle"
        style={{
          flexDirection: "row",
          alignContent: "center",
        }}
      >
        <Col lg={12} md={12} sm={24} xs={24}>
          <h2
            style={{
              fontSize: "clamp(24px, 4vw, 40px)",
              textAlign: "center",
            }}
          >
            ABOUT US
          </h2>
          <p
            style={{
              textAlign: "justify",
              fontSize: "clamp(14px, 2vw, 18px)",
            }}
          >
            Welcome to <strong>Liboria</strong>, your digital library designed
            for readers of all ages and interests. From trending titles to
            heart-fluttering romance novels and magical kids’ stories, Liboria
            brings the joy of reading into one easy-to-use platform. <br />
            <br />
            We believe books are for sharing, not just storing. Liboria works as
            a borrowing-based eLibrary, giving you the freedom to explore more
            books without limits—anytime, anywhere.
          </p>
        </Col>

        <Col lg={12} md={12} sm={24} xs={24}>
          <img
            src={bookshelf}
            alt="bookshelf black"
            style={{
              width: "100%",
              height: "50vh",
              objectFit: "cover",
              boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
            }}
          />
        </Col>
      </Row>

      <Row
        justify="center"
        align="middle"
        style={{
          margin: "80px auto",
          padding: "0 10%",
          display: "flex",
          alignContent: "center",
          justifyContent: "space-between",
        }}
      >
        <Col span={24}>
          <Divider>
            <h2 style={{ fontSize: "clamp(24px, 4vw, 40px)" }}>MISSION</h2>
          </Divider>
          <p
            style={{ textAlign: "justify", fontSize: "clamp(14px, 2vw, 18px)" }}
          >
            At Liboria, our mission is simple: to make reading more accessible,
            enjoyable, and affordable for everyone. We combine the spirit of a
            traditional library with the convenience of the digital world.
            <br />
          </p>
          <Divider>
            <h2 style={{ fontSize: "clamp(24px, 4vw, 40px)" }}>VISION</h2>
          </Divider>
          <p>
            Our vision is to build a connected community of readers who believe
            in the power of sharing stories—because every book borrowed is a new
            world discovered.
          </p>
        </Col>
      </Row>

      <Row
        justify="center"
        align="middle"
        style={{
          margin: "80px auto",
          padding: "0 10%",
          display: "flex",
          alignContent: "center",
          justifyContent: "space-between",
        }}
      >
        <Col span={24}>
          <Divider>
            <h2 style={{ fontSize: "clamp(24px, 4vw, 40px)" }}>
              Let's Talk Books
            </h2>
          </Divider>
          <p
            style={{ textAlign: "justify", fontSize: "clamp(14px, 2vw, 18px)" }}
          >
            At Liboria, we believe every reader is part of our story. Whether
            you’re looking for your next great read, need help borrowing a book,
            or simply want to share your thoughts, we’re here to listen. Our
            team loves hearing from fellow book lovers—because your ideas,
            questions, and feedback help us grow and make Liboria even better.
          </p>
        </Col>
      </Row>
    </>
  );
};

export default Home;
