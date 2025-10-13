import React, { useState, useEffect } from "react";
import { Table, Button, Space, message } from "antd";
import { EditOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import StaffModal from "../../components/Modal/StaffModal";

const StaffList = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Get current logged-in user
  const currentUserId = JSON.parse(localStorage.getItem("currentUser"))?.userid;
  const loadAllStaff = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://localhost:8000/api/users"); // GET all users
      const result = await res.json();
      if (res.ok) {
        setData(result);
      } else {
        setError(result.error || "Failed to load staff");
      }
    } catch (err) {
      console.error(err);
      setError("Network error");
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

  const handleAddStaff = async () => {
    setModalMode("add");
    setSelectedStaff(null);
    setModalVisible(true);
  };

  const handleSaveNewStaff = (values) => {
    const newStaff = {
      key: (data.length + 1).toString(),
      name: values.name,
      email: values.email,
      username: values.username,
      password: values.password,
      account_type: values.account_type,
    };
    setData((prev) => [...prev, newStaff]);
  };

  const handleEdit = async (record) => {
    try {
      const res = await fetch(
        `http://localhost:8000/api/users/` + record.userid
      );
      const userData = await res.json();
      if (res.ok) {
        setSelectedStaff(userData);
        setModalMode("edit");
        setModalVisible(true);
      } else {
        messageApi.error("Failed to load user details");
      }
    } catch (err) {
      console.error(err);
      message.error("Network error");
    }
  };

  const handleSaveEdit = (updatedValues) => {
    setData((prev) =>
      prev.map((item) =>
        item.key === selectedStaff.key ? { ...item, ...updatedValues } : item
      )
    );
  };

  const handleDelete = (record) => {
    setModalMode("delete");
    setSelectedStaff(record);
    setModalVisible(true);
  };

  const handleConfirmDelete = (record) => {
    setData((prev) => prev.filter((record) => record.userid !== record.userid));
    message.success("Staff deleted successfully!");
  };

  const handleSave = (values) => {
    if (modalMode === "add") {
      handleSaveNewStaff(values);
    } else if (modalMode === "edit") {
      handleSaveEdit(values);
    } else if (modalMode === "delete") {
      handleConfirmDelete(values);
    }
    loadAllStaff();
  };

  const columns = [
    { title: "User ID", dataIndex: "userid", key: "userid" },
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Role", dataIndex: "account_type", key: "account_type" },
    { title: "Username", dataIndex: "username", key: "username" },
    {
      title: "Action",
      key: "action",
      width: 150,
      render: (_, record) => {
        const isCurrentUser = record.userid === currentUserId; // disable if logged-in user
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
              disabled={isCurrentUser} // disable for logged-in user
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
    <div>
      {contextHolder}
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={handleAddStaff}
        style={{
          position: "fixed",
          bottom: "20px",
          right: "40px",
          backgroundColor: "black",
          color: "#fff",
          width: 200,
          height: 40,
          fontWeight: 500,
          borderRadius: "6px",
        }}
      >
        Add Staff
      </Button>
      <Table
        columns={columns}
        dataSource={data}
        pagination={false}
        scroll={{
          y: data.length > 10 ? 650 : undefined, // vertical scroll
          x: "max-content", // horizontal scroll
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
    </div>
  );
};

export default StaffList;
