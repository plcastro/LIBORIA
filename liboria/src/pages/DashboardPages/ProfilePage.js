import React, { useState } from "react";
import { Card, Divider, Button, Row, Col, Avatar } from "antd";
import { EditOutlined, UserOutlined } from "@ant-design/icons";
import EditProfile from "./EditProfile";

const ProfilePage = () => {
  const user = JSON.parse(localStorage.getItem("currentUser")) || {
    username: "John Doe",
    name: "John Doe",
    email: "john.doe@gmail.com",
    role: "Librarian",
  };

  const [profile, setProfile] = useState(user);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleProfileUpdate = (updatedData) => {
    setProfile(updatedData);
    localStorage.setItem("currentUser", JSON.stringify(updatedData));
    setIsModalOpen(false);
  };

  const rowStyle = {
    width: "100%",
    margin: "auto",
  };

  return (
    <>
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
                <p style={{ marginTop: "20px" }}>
                  {user.username || "John Doe"}
                </p>
              </Col>
            </Row>
            <Row style={{ rowStyle, textAlign: "left" }}>
              <Divider>Personal Information</Divider>
              <Col>
                <p>Name: {user.name || "John Doe"}</p>
                <br />
                <p>Email: {user.email || "john.doe@gmail.com"}</p>
                <br />
                <p>Role: {user.account_type || "Librarian"}</p>
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
                  onClick={() => setIsModalOpen(true)}
                >
                  Edit Profile
                </Button>
              </Col>
            </Row>
          </Row>
        </Card>
      </div>
      <EditProfile
        initialData={profile}
        isVisible={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleProfileUpdate}
      />
    </>
  );
};

export default ProfilePage;
