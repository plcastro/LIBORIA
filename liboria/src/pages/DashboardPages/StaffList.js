import React, { useState, useEffect } from "react";
import { Table, Button, Space, message, Row, Col, Input, Card } from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import axios from "axios";
import StaffModal from "../../components/Modal/StaffModal";

const StaffList = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchText, setSearchText] = useState("");

  const currentUserId = JSON.parse(
    localStorage.getItem("currentUser") || "{}"
  )?._id;

  const loadAllStaff = async () => {
    setLoading(true);
    setError("");

    try {
      const { data: result } = await axios.get(
        "http://localhost:8000/api/users"
      );

      if (Array.isArray(result)) {
        setData(
          result.map((item) => ({
            ...item,
            key: item._id,
          }))
        );
      } else {
        setError(result?.error || "Failed to load staff");
      }
    } catch (err) {
      console.error("Error loading staff:", err);
      setError("Network error. Failed to load staff.");
      messageApi.error("Failed to load staff.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllStaff();
  }, []);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [selectedStaff, setSelectedStaff] = useState(null);

  const handleAddStaff = () => {
    setModalMode("add");
    setSelectedStaff(null);
    setModalVisible(true);
  };

  const handleEdit = async (record) => {
    try {
      const { data: userData } = await axios.get(
        `http://localhost:8000/api/users/${record._id}`
      );

      setSelectedStaff(userData);
      setModalMode("edit");
      setModalVisible(true);
    } catch (err) {
      console.error("Error fetching staff details:", err);

      messageApi.error(
        err.response?.data?.error ||
          "Network error. Unable to load staff details."
      );
    }
  };

  const handleDelete = (record) => {
    setModalMode("delete");
    setSelectedStaff(record);
    setModalVisible(true);
  };

  const handleSave = () => {
    loadAllStaff();
  };

  // Search staff
  const filteredData = data.filter((item) => {
    if (!searchText) return true;

    const text = searchText.toLowerCase();

    return (
      item.name?.toLowerCase().includes(text) ||
      item.email?.toLowerCase().includes(text) ||
      item.username?.toLowerCase().includes(text) ||
      item.account_type?.toLowerCase().includes(text)
    );
  });

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Role",
      dataIndex: "account_type",
      key: "account_type",
    },
    {
      title: "Username",
      dataIndex: "username",
      key: "username",
    },
    {
      title: "Action",
      key: "action",
      width: 150,
      render: (_, record) => {
        const isCurrentUser = record._id === currentUserId;

        return (
          <Space size="small">
            <Button
              type="primary"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
              style={{
                backgroundColor: "black",
                height: "30px",
                color: "white",
                border: "none",
                maxWidth: "100px",
              }}
            >
              Edit
            </Button>

            <Button
              danger
              size="small"
              icon={<DeleteOutlined />}
              disabled={isCurrentUser}
              onClick={() => handleDelete(record)}
              style={{
                backgroundColor: isCurrentUser ? "#ccc" : "#ff4d4f",
                height: "30px",
                color: "white",
                border: "none",
                maxWidth: "100px",
                cursor: isCurrentUser ? "not-allowed" : "pointer",
              }}
            >
              Delete
            </Button>
          </Space>
        );
      },
    },
  ];

  return (
    <>
      {contextHolder}

      <Card>
        <Row
          align="stretch"
          justify="space-between"
          style={{ marginBottom: 12 }}
        >
          <Col xs={24} sm={12} md={10} lg={5}>
            <Input
              type="search"
              placeholder="Search data"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{
                maxWidth: 300,
                width: "100%",
                height: "40px",
                marginBottom: 5,
              }}
            />
          </Col>

          <Col xs={24} sm={12} md={10} lg={4}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddStaff}
              style={{
                width: "100%",
                margin: 0,
                backgroundColor: "#1600a3",
                border: "none",
                height: 40,
                fontWeight: 500,
              }}
            >
              Add Staff
            </Button>
          </Col>
        </Row>

        {error && (
          <div
            role="alert"
            style={{
              color: "#ff4d4f",
              marginBottom: 12,
            }}
          >
            {error}
            <Button type="link" onClick={loadAllStaff} disabled={loading}>
              Retry
            </Button>
          </div>
        )}

        <Table
          columns={columns}
          dataSource={filteredData}
          loading={loading}
          pagination={false}
          locale={{
            emptyText: error ? "Unable to load staff" : "No staff found",
          }}
          scroll={{
            y: filteredData.length > 10 ? 650 : undefined,
            x: "max-content",
          }}
        />

        <StaffModal
          isVisible={modalVisible}
          mode={modalMode}
          onClose={() => setModalVisible(false)}
          onSave={handleSave}
          selectedStaff={selectedStaff}
          currentUserId={currentUserId}
        />
      </Card>
    </>
  );
};

export default StaffList;
