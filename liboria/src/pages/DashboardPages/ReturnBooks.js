import React, { useState, useEffect } from "react";
import { Table, Tag, Input, Card, message, Button } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import ReturnBookModal from "../../components/Modal/ReturnBookModal";

const REASONS = [
  { label: "None", value: "None" },
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

  const handleSubmitReturn = async (values) => {
    try {
      const returnData = {
        borrow_id: selectedRecord.borrow_id,
        violation: values.violation,
        penalty: values.penalty || 0,
        amount_paid: values.amount_paid || 0
      };

      const res = await fetch("http://localhost:8000/returned-books", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(returnData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to return book");
      }

      message.success("Book returned successfully!");
      handleModalClose();
      fetchBorrowedBooks(); // Refresh the list
    } catch (err) {
      console.error("Return error:", err);
      message.error(err.message);
    }
  };

  // Load borrowed books from API
  const fetchBorrowedBooks = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("http://localhost:8000/borrowed-books");
      if (!response.ok) throw new Error("Failed to fetch borrowed books");
      
      const data = await response.json();
      // Filter only active borrowed books (status = 'borrowed')
      const activeBorrows = data.filter(book => book.status === 'borrowed');
      setBorrowedBooks(activeBorrows);
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.message);
      message.error("Failed to load borrowed books");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBorrowedBooks();
  }, []);

  // Filter based on search
  const filteredData = borrowedBooks.filter((record) =>
    Object.values(record).some(
      (value) =>
        typeof value === "string" &&
        value.toLowerCase().includes(searchText.toLowerCase())
    )
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'borrowed': return 'blue';
      case 'overdue': return 'red';
      case 'returned': return 'green';
      default: return 'default';
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
      render: (date) => new Date(date).toLocaleDateString()
    },
    {
      title: "Due Date",
      dataIndex: "due_date",
      key: "due_date",
      width: 120,
      render: (date) => new Date(date).toLocaleDateString()
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
            color: "#52c41a",
            padding: 0,
            fontWeight: 'bold'
          }}
        >
          Return
        </Button>
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
