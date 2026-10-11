import React, { useState, useEffect } from "react";
import { Card, Divider, Button, Row, Col, Avatar, message } from "antd";
import { EditOutlined, UserOutlined } from "@ant-design/icons";
import EditProfile from "./EditProfile";

const ProfilePage = () => {
  const [user, setUser] = useState({});

  const currentUserId = JSON.parse(localStorage.getItem("currentUser"))?._id;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchUserInfo = async (_id) => {
    if (!_id) {
      console.error(
        "No _id found in localStorage:",
        localStorage.getItem("currentUser"),
      );
      message.error("User ID not found. Please log in again.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`http://localhost:8000/api/users/${_id}`);

      console.log("Requested user ID:", _id);
      console.log("Response status:", res.status);

      const data = await res.json();
      console.log("User data:", data);

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch user info");
      }
      console.log("Fetched user data:", data);
      setUser(data);
    } catch (err) {
      console.error("Fetch user error:", err);
      message.error("Failed to load user info");
    } finally {
      setLoading(false);
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
