import React from "react";
import { Divider, Col, Row } from "antd";
import numoabuilding from "../assets/NU MOA building.png";
import "../App.css";
export const Contact = () => {
  return (
    <>
      <Row justify="center" align="middle">
        <Col span={18}>
          <Divider>
            <h2>CONTACT</h2>
          </Divider>
          <img src={numoabuilding} alt="NU MOA Building" width="100%" />
        </Col>
      </Row>
      <Row justify="center" align="middle" style={{ marginBottom: "100px" }}>
        <Col span={18}>
          <p>
            At Liboria, we believe every reader is part of our story. Whether
            you’re looking for your next great read, need help borrowing a book,
            or simply want to share your thoughts, we’re here to listen. Our
            team loves hearing from fellow book lovers—because your ideas,
            questions, and feedback help us grow and make Liboria even better.
            Don’t be shy—drop us a message and let’s keep the love for reading
            alive together!
          </p>
          <br />

          <br />
          <Divider>
            <h2>CONTACT US</h2>
          </Divider>
          <p>
            <strong>Email:</strong> liboria@gmail.com <br />
            <strong>Phone:</strong> +63 09564569912 <br />
            <strong>Address:</strong> NU Building, Coral Way Street, Mall of
            Asia Complex, Pasay City 1300
          </p>
          <br />
        </Col>
      </Row>
    </>
  );
};
