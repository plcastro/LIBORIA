import React from "react";
import { Card, Divider, Button, Row, Col, Avatar } from "antd";
import { EditOutlined, UserOutlined } from "@ant-design/icons";
const ProfilePage = () => {
  const rowStyle = {
    width: "100%",
    margin: "auto",
  };
  return (
    <div style={{ margin: "5% auto" }}>
      <Card
        style={{
          maxWidth: "450px",
          width: "90%",
          height: "100%",
          margin: "auto",
          boxShadow: "0 5px 15px rgba(0, 0, 0, 0.34)",
        }}
      >
        <Row>
          <Row style={{ margin: "auto", textAlign: "center" }}>
            <Col span={24}>
              <Avatar size={128} icon={<UserOutlined />} />
              <p>John Doe</p>
            </Col>
          </Row>
          <Row style={{ rowStyle, textAlign: "left" }}>
            <Divider>Personal Information</Divider>
            <Col>
              {" "}
              <p>Name: John Doe</p>
              <br />
              <p>Email: john.doe@gmail.com</p>
              <br />
              <p>Role: Librarian</p>
            </Col>
          </Row>
          <Row justify="center" style={rowStyle}>
            <Col lg={24} style={{ textAlign: "center" }}>
              <Button
                icon={<EditOutlined />}
                style={{
                  width: "100%",
                  backgroundColor: "#000",
                  color: "#fff",
                }}
              >
                Edit Profile
              </Button>
            </Col>
          </Row>
        </Row>
      </Card>
    </div>
  );
};

export default ProfilePage;
