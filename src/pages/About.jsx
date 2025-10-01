import React from "react";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { Button } from "antd";
import bookshelf from "../assets/bookshelf-black.png";
import "./styles.css";
import { useNavigate } from "react-router-dom";

export const About = () => {
  const navigate = useNavigate();

  return (
    <div>
      <div className="about-content">
        {/* <Button
          icon={<ArrowLeftOutlined />}
          style={{ border: 0, width: "150px" }}
          onClick={() => navigate("/")}
        >
          Back
        </Button> */}
        <main>
          <h2>ABOUT US</h2>
          <img src={bookshelf} alt="bookshelf black" width="100%" />
          <p>
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
          <br />
          <hr />
          <br />
          <h2>Mission & Vision</h2>
          <p>
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
          <hr />
        </main>
      </div>
    </div>
  );
};
