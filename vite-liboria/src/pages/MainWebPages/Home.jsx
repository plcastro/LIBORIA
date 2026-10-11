import React from "react";
import { useNavigate } from "react-router-dom";
import { Button, Divider } from "@mui/material";
import BookBackground from "../../assets/book-background.png";
import bookshelf from "../../assets/bookshelf-black.png";
import "../../App.css";

const Home = () => {
  const navigate = useNavigate();

  return (
    <>
      {/* HERO SECTION */}
      <section
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${BookBackground})`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center center",
          backgroundSize: "cover",
          width: "100%",
          minHeight: "70vh",
          boxSizing: "border-box",
          overflowX: "hidden",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-start",
          padding: "10%",
        }}
      >
        <h1
          style={{
            color: "white",
            fontSize: "clamp(28px, 5vw, 60px)",
            fontWeight: "bolder",
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
            color: "white",
          }}
        >
          Liboria makes it easy to discover books that match your interests.
        </p>

        <Button
          onClick={() => navigate("/login")}
          style={{
            backgroundColor: "white",
            color: "black",
            fontWeight: "bold",
          }}
        >
          Get Started
        </Button>
      </section>

      <section
        style={{
          padding: "5%",
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(min(100%, 320px), 1fr))",
          alignItems: "center",
          gap: "32px",
        }}
      >
        <div style={{ padding: "5%" }}>
          <h3
            style={{
              fontSize: "clamp(24px, 4vw, 40px)",
              textAlign: "center",
            }}
          >
            ABOUT US
          </h3>

          <p
            style={{
              textAlign: "justify",
              fontSize: "clamp(14px, 2vw, 18px)",
              lineHeight: 1.7,
            }}
          >
            Welcome to <strong>Liboria</strong>, your digital library designed
            for readers of all ages and interests. From trending titles to
            heart-fluttering romance novels and magical kids’ stories, Liboria
            brings the joy of reading into one easy-to-use platform.
            <br />
            <br />
            We believe books are for sharing, not just storing. Liboria works as
            a borrowing-based eLibrary, giving you the freedom to explore more
            books without limits—anytime, anywhere.
          </p>
        </div>

        <div style={{ minWidth: 0 }}>
          <img
            src={bookshelf}
            alt="Black bookshelf"
            style={{
              display: "block",
              width: "100%",
              maxHeight: "50vh",
              objectFit: "cover",
              boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
            }}
          />
        </div>
      </section>

      {/* MISSION AND VISION SECTION */}
      <section
        style={{
          margin: "80px auto",
          padding: "0 10%",
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
          gap: "32px",
          alignItems: "start",
        }}
      >
        <div>
          <Divider>
            <h2 style={{ fontSize: "clamp(24px, 4vw, 40px)" }}>MISSION</h2>
          </Divider>

          <p
            style={{
              textAlign: "justify",
              fontSize: "clamp(14px, 2vw, 18px)",
              lineHeight: 1.7,
            }}
          >
            At Liboria, our mission is simple: to make reading more accessible,
            enjoyable, and affordable for everyone. We combine the spirit of a
            traditional library with the convenience of the digital world.
          </p>
        </div>

        <div>
          <Divider>
            <h2 style={{ fontSize: "clamp(24px, 4vw, 40px)" }}>VISION</h2>
          </Divider>

          <p
            style={{
              textAlign: "justify",
              fontSize: "clamp(14px, 2vw, 18px)",
              lineHeight: 1.7,
            }}
          >
            Our vision is to build a connected community of readers who believe
            in the power of sharing stories—because every book borrowed is a new
            world discovered.
          </p>
        </div>
      </section>

      {/* CONTACT / ABOUT SECTION */}
      <section
        style={{
          margin: "80px auto",
          padding: "0 10%",
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr)",
          justifyItems: "center",
        }}
      >
        <div style={{ width: "100%", minWidth: 0 }}>
          <Divider>
            <h2 style={{ fontSize: "clamp(24px, 4vw, 40px)" }}>
              Let's Talk Books
            </h2>
          </Divider>

          <p
            style={{
              textAlign: "justify",
              fontSize: "clamp(14px, 2vw, 18px)",
              lineHeight: 1.7,
            }}
          >
            At Liboria, we believe every reader is part of our story. Whether
            you’re looking for your next great read, need help borrowing a book,
            or simply want to share your thoughts, we’re here to listen. Our
            team loves hearing from fellow book lovers—because your ideas,
            questions, and feedback help us grow and make Liboria even better.
          </p>
        </div>
      </section>
    </>
  );
};

export default Home;
