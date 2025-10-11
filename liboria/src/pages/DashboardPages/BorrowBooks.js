import React, { useState, useEffect } from "react";
import { Table, Tag, Input } from "antd";
import BorrowBookModal from "../../components/Modal/BorrowBookModal";
import dayjs from "dayjs";
const BorrowBooks = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null); // <- selected book
  const [availableBooks, setAvailableBooks] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleBorrow = (record) => {
    setSelectedRecord({
      book_title: record.title, // modal expects book_title
      author_name: record.author_name,
      due_date: dayjs().add(7, "day"), // set default due date 7 days later
      name: "",
      year_level: "",
      course: "",
    });
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedRecord(null); // reset after closing
  };

  const handleSubmit = (values) => {
    console.log("Borrowed Book:", values);
    handleModalClose();
  };

  const handleBorrowedBookLoad = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("http://localhost:8000/api/books");
      const data = await response.json();
      if (response.ok) {
        setAvailableBooks(data);
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

  const filteredData = availableBooks.filter((record) =>
    Object.values(record).some(
      (value) =>
        typeof value === "string" &&
        value.toLowerCase().includes(searchText.toLowerCase())
    )
  );

  const columns = [
    { title: "Book ID", dataIndex: "book_id", key: "book_id" },
    { title: "Author Name", dataIndex: "author_name", key: "author_name" },
    { title: "Book Title", dataIndex: "title", key: "title" },
    { title: "Category", dataIndex: "category", key: "category" },
    { title: "Total Copies", dataIndex: "total_copies", key: "total_copies" },
    {
      title: "Availability",
      key: "availability",
      render: (_, record) => (
        <div>
          <span>{record.available_copies} copies </span>
          <Tag color={record.available_copies > 0 ? "green" : "red"}>
            {record.available_copies > 0 ? "Available" : "Not Available"}
          </Tag>
        </div>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <a onClick={() => handleBorrow(record)} style={{ color: "#3a5effff" }}>
          Borrow
        </a>
      ),
    },
  ];

  return (
    <>
      <Input
        type="search"
        placeholder="Search data"
        onChange={(e) => setSearchText(e.target.value)}
        style={{ width: 200, height: 40, marginBottom: 20 }}
      />
      <Table
        columns={columns.map((col) => ({ ...col, width: col.width || 150 }))}
        dataSource={filteredData}
        rowKey="book_id"
        pagination={false}
        scroll={{
          y: filteredData.length > 10 ? 650 : undefined,
          x: "max-content",
        }}
        loading={loading}
        style={{ tableLayout: "fixed" }}
      />
      <BorrowBookModal
        open={isModalOpen}
        onClose={handleModalClose}
        onSubmit={handleSubmit}
        initialValues={selectedRecord} // <- pass selected book here
      />
      {error && <p style={{ color: "red" }}>{error}</p>}
    </>
  );
};

export default BorrowBooks;
