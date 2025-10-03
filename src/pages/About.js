import React from "react";
import bookshelf from "../assets/bookshelf-black.png";
import "../App.css";
import { Divider, Col, Row } from "antd";
export const About = () => {
  return (
    <>
      <Row justify="center" align="middle">
        <Col span={18}>
          <Divider>
            <h2>ABOUT US</h2>
          </Divider>
          <img src={bookshelf} alt="bookshelf black" width="100%" />
        </Col>
      </Row>
      <Row justify="center" align="middle" style={{ marginBottom: "100px" }}>
        <Col span={18}>
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
          <br />
          <Divider>
            <h2>MISSION AND VISION</h2>
          </Divider>
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
          <br />
        </Col>
      </Row>
    </>
  );
};
