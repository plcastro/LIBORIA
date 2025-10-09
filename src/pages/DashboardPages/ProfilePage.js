import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Card, Divider, Button, Row, Col, Avatar } from "antd";
import { EditOutlined, UserOutlined } from "@ant-design/icons";
import EditProfile from "./EditProfile";

const sampleData = {
  username: "johndoe",
  fullname: "John Doe",
  email: "johndoe@gmail.com",
  role: "Librarian",
};
const ProfilePage = () => {
  const [profile, setProfile] = useState(sampleData);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleProfileUpdate = (updatedData) => {
    setProfile(updatedData);
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
                <p style={{ marginTop: "20px" }}>{profile.username}</p>
              </Col>
            </Row>
            <Row style={{ rowStyle, textAlign: "left" }}>
              <Divider>Personal Information</Divider>
              <Col>
                {" "}
                <p>Name: {profile.fullname}</p>
                <br />
                <p>Email: {profile.email}</p>
                <br />
                <p>Role: {profile.role}</p>
                <br />
                <p>Password: *********</p>
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
