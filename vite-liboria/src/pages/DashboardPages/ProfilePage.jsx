import React, { useState, useEffect } from "react";
import { Card, Divider, Button, Row, Col, Avatar, message } from "antd";
import { EditOutlined, UserOutlined } from "@ant-design/icons";
import EditProfile from "./EditProfile";
import axios from "axios";
import { API_BASE_URL } from "../../utils/API_BASE";
const ProfilePage = () => {
  const [user, setUser] = useState({});

  const currentUserId = JSON.parse(sessionStorage.getItem("currentUser"))?._id;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchUserInfo = async (_id) => {
    if (!_id) return;
    try {
      const { data } = await axios.get(`${API_BASE_URL}/api/users/${_id}`);
      setUser(data);
    } catch (err) {
      console.error(err);
      message.error("Failed to load user info");
    }
  };

  useEffect(() => {
    fetchUserInfo(currentUserId);

    // Listen for user updates
    const handleUserUpdate = (e) => {
      setUser(e.detail);
    };

    window.addEventListener("userUpdated", handleUserUpdate);

    return () => {
      window.removeEventListener("userUpdated", handleUserUpdate);
    };
  }, [currentUserId]);

  return (
    <>
      <Card
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          maxWidth: "450px",
          width: "100%",
          margin: "3% auto",
          boxShadow: "0 5px 15px rgba(0, 0, 0, 0.34)",
        }}
      >
        <Row style={{ textAlign: "center", marginBottom: "20px" }}>
          <Col span={24}>
            <Avatar size={128} icon={<UserOutlined />} />
            <p style={{ marginTop: "20px" }}>{user.username}</p>
          </Col>
        </Row>

        <Divider>Personal Information</Divider>
        <Row style={{ textAlign: "left" }}>
          <Col>
            <p>
              <strong>Name:</strong> {user.name}
            </p>
            <p>
              <strong>Email:</strong> {user.email}
            </p>
            <p>
              <strong>Role:</strong> {user.account_type}
            </p>
          </Col>
        </Row>

        <Row justify="center" style={{ marginTop: "20px" }}>
          <Col span={24} style={{ textAlign: "center" }}>
            <Button
              icon={<EditOutlined />}
              style={{
                width: "100%",
                backgroundColor: "#000",
                color: "#fff",
              }}
              onClick={() => setIsModalOpen(true)}
            >
              Change Password
            </Button>
          </Col>
        </Row>
      </Card>

      <EditProfile
        initialData={user}
        isVisible={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={fetchUserInfo} // refresh after saving
      />
    </>
  );
};

export default ProfilePage;
