import React from "react";

import logo_light from "../../assets/liboria white.png";
import { Col, Row } from "antd";

const FooterComp = () => {
  return (
    <footer className="footer">
      <Row>
        <img src={logo_light} alt="Liboria Logo" style={{ width: "200px" }} />
      </Row>
      <Row align="middle" justify="space-between">
        <Col xs={22} sm={22} md={12} lg={12} style={{ margin: "20px 0" }}>
          <p>
            Discover, read, and enjoy books <br />
            anywhere life takes you.
          </p>
        </Col>

        <Col
          xs={22}
          sm={22}
          md={12}
          lg={{ span: 6, offset: 2 }}
          style={{ margin: "20px 0" }}
        >
          <p>
            <strong>PHONE:</strong> +63 09564569912
          </p>
          <p>
            <strong>EMAIL:</strong>{" "}
            <a href="mailto:liboria@gmail.com" style={{ color: "white" }}>
              liboria@gmail.com
            </a>
          </p>
          <p>
            <strong>ADDRESS:</strong> Coral Way, Pasay City
          </p>
        </Col>
      </Row>

      <hr />

      <Row justify="center">
        <Col span={24} style={{ textAlign: "left" }}>
          <p>©2025 Liboria. All rights reserved.</p>
        </Col>
      </Row>
    </footer>
  );
};

export default FooterComp;
