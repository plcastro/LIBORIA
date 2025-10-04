import React from "react";
import { Card, Divider, Button, Row, Col, Avatar } from "antd";
import { EditOutlined, UserOutlined } from "@ant-design/icons";
const ProfilePage = () => {
  return (
    <div>
      <Card
        style={{
          width: "90%",
          height: "100%",
          margin: "auto",
          padding: "20px",
        }}
      >
        <Row>
          <Col
            lg={{ span: 10 }}
            md={{ span: 24 }}
            sm={{ span: 24 }}
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              margin: "auto",
              gap: "20px",
            }}
          >
            <Avatar size={128} icon={<UserOutlined />} />
            <p>Lololololol</p>
            <Button color="default" variant="solid" icon={<EditOutlined />}>
              Edit Profile
            </Button>
          </Col>
          <Col
            lg={{ span: 12 }}
            md={{ span: 24 }}
            sm={{ span: 24 }}
            style={{
              display: "flex",
              flexDirection: "column", // stack vertically
              gap: "10px",
            }}
          >
            <Divider>Personal Information</Divider>
            <p>Name: John Doe</p>
            <p>Contact #: 09123456789</p>
            <p>Email: john.doe@gmail.com</p>
            <p>Date Joined: October 3, 2025</p>
            <p>Role: Librarian</p>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default ProfilePage;
