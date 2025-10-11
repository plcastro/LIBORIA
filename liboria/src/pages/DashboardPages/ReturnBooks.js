import React, { useState, useEffect } from "react";
import { Table, Tag, Input, Card } from "antd";
import ReturnBookModal from "../../components/Modal/ReturnBookModal";

const REASONS = [
  { label: "Late Return", value: "Late Return" },
  { label: "Damaged", value: "Damaged" },
  { label: "Lost", value: "Lost" },
];

const ReturnBooks = () => {
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

  const handleSubmit = (values) => {
    console.log("Return submitted:", values);
  };

  // Load borrowed books from API
  const handleBorrowedBookLoad = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("http://localhost:8000/api/borrowed-books");
      const data = await response.json();
      if (response.ok) {
        setBorrowedBooks(data);
      } else {
        setError(data.error || "Failed to load borrowed books");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleBorrowedBookLoad();
  }, []);

  // Filter based on search
  const filteredData = borrowedBooks.filter((record) =>
    Object.values(record).some(
      (value) =>
        typeof value === "string" &&
        value.toLowerCase().includes(searchText.toLowerCase())
    )
  );

  const columns = [
    {
      title: "ID",
      dataIndex: "borrow_id",
      key: "borrow_id",
    },
    {
      title: "Borrower Name",
      dataIndex: "borrower_name",
      key: "borrower_name",
      render: (_, record) => `${record.first_name} ${record.last_name}`,
    },
    {
      title: "Book Title",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Date Borrowed",
      dataIndex: "date_borrowed",
      key: "date_borrowed",
    },
    {
      title: "Due Date",
      dataIndex: "due_date",
      key: "due_date",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === "borrowed" ? "green" : "volcano"}>{status}</Tag>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <a onClick={() => handleReturn(record)} style={{ color: "red" }}>
          Return
        </a>
      ),
    },
  ];

  return (
    <>
      <Card>
        <Input
          type="search"
          placeholder="Search data"
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
        <ReturnBookModal
          open={isModalOpen}
          onClose={handleModalClose}
          onSubmit={handleSubmit}
          initialValues={selectedRecord}
          REASONS={REASONS}
        />
        {error && <p style={{ color: "red" }}>{error}</p>}
      </Card>
    </>
  );
};

export default ReturnBooks;
