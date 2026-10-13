import Table from "../../components/MuiTable.jsx";
import Button from "../../components/MuiButton.jsx";
import React, { useState, useEffect } from "react";
import { Tag, Input, Card, message } from "antd";
import { ReloadOutlined, SearchOutlined } from "@ant-design/icons";
import ReturnBookModal from "../../components/Modal/ReturnBookModal";
import axios from "../../api";
const REASONS = [
  { label: "Late Return", value: "Late Return" },
  { label: "Damaged", value: "Damaged" },
  { label: "Lost", value: "Lost" },
];

const ReturnBooks = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleReturn = (record) => {
    setSelectedRecord(record);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedRecord(null);
  };

  // ✅ Fetch borrowed books list (only display logic)
  const fetchBorrowedBooks = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.get("/borrowed-books");
      const activeBorrows = data.filter((book) => book.status === "Borrowed");
      setBorrowedBooks(activeBorrows);
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.message);
      messageApi.error("Failed to load borrowed books");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBorrowedBooks();
  }, []);

  //Filter search
  const filteredData = borrowedBooks.filter((record) =>
    Object.values(record).some(
      (value) =>
        typeof value === "string" &&
        value.toLowerCase().includes(searchText.toLowerCase()),
    ),
  );

  const getStatusColor = (status) => {
    switch (status) {
      case "Borrowed":
        return "blue";
      case "Overdue":
        return "red";
      case "Returned":
        return "green";
      default:
        return "default";
    }
  };

  const columns = [
    {
      title: "Borrow ID",
      dataIndex: "borrow_id",
      key: "borrow_id",
      width: 100,
    },
    {
      title: "Borrower Name",
      dataIndex: "borrower_name",
      key: "borrower_name",
      width: 150,
    },
    {
      title: "Book Title",
      dataIndex: "title",
      key: "title",
      width: 200,
      render: (text) => (
        <span style={{ whiteSpace: "normal", wordBreak: "break-word" }}>
          {text}
        </span>
      ),
    },
    {
      title: "Author",
      dataIndex: "author_name",
      key: "author_name",
      width: 150,
    },
    {
      title: "Date Borrowed",
      dataIndex: "date_borrowed",
      key: "date_borrowed",
      width: 120,
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Due Date",
      dataIndex: "due_date",
      key: "due_date",
      width: 120,
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {status?.charAt(0).toUpperCase() + status?.slice(1)}
        </Tag>
      ),
    },
    {
      title: "Action",
      key: "action",
      width: 100,
      render: (_, record) => (
        <Button
          type="link"
          onClick={() => handleReturn(record)}
          style={{
            backgroundColor: "#009148ff",
            color: "#fff",
            width: "100%",
          }}
        >
          Return
        </Button>
      ),
    },
  ];

  return (
    <>
      {contextHolder}
      <Card>
        <Input
          type="search"
          placeholder="Search data"
          prefix={<SearchOutlined />}
          onChange={(e) => setSearchText(e.target.value)}
          style={{
            maxWidth: 300,
            width: "100%",
            height: "40px",
            marginBottom: "20px",
          }}
        />

        <Table
          columns={columns.map((col) => ({ ...col, width: col.width || 150 }))}
          dataSource={filteredData}
          rowKey="borrow_id"
          pagination={false}
          scroll={{
            y: filteredData.length > 10 ? 650 : undefined,
            x: "max-content",
          }}
          loading={loading}
          style={{ tableLayout: "fixed" }}
        />

        {/* Modal handles the return process */}
        <ReturnBookModal
          open={isModalOpen}
          onClose={handleModalClose}
          initialValues={selectedRecord}
          REASONS={REASONS}
        />

        {error && <p style={{ color: "red" }}>{error}</p>}
      </Card>
    </>
  );
};

export default ReturnBooks;
