import React, { useState, useEffect } from "react";
import { SearchOutlined, PlusOutlined } from "@ant-design/icons";
import { Input, Row, Col, Button, Table, message } from "antd";
import AddBookModal from "../../components/Modal/AddBookModal";

const DisplayBook = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  // Fetch all books
  const fetchBooks = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:8000/api/books");
      if (!response.ok) throw new Error("Failed to fetch books");
      const data = await response.json();
      setBooks(data);
    } catch (error) {
      console.error(error);
      message.error("Failed to load books");
    } finally {
      setLoading(false);
    }
  };

  // Search books
  useEffect(() => {
    // Filter books whenever searchValue or books change
    const filtered = books.filter((record) =>
      Object.values(record).some(
        (value) =>
          typeof value === "string" &&
          value.toLowerCase().includes(searchValue.toLowerCase())
      )
    );
    setFilteredBooks(filtered);
  }, [searchValue, books]);

  // Delete a book
  const deleteBook = async (bookId) => {
    try {
      const response = await fetch(
        `http://localhost:8000/api/books/${bookId}`,
        {
          method: "DELETE",
        }
      );
      if (response.ok) {
        message.success("Book deleted successfully");
        fetchBooks();
      } else {
        const data = await response.json();
        message.error(data.error || "Failed to delete book");
      }
    } catch (error) {
      console.error(error);
      message.error("Failed to delete book");
    }
  };

  // After adding a book
  const handleBookCreated = () => {
    fetchBooks();
    setModalOpen(false);
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleBorrow = (record) => {
    message.info(`Borrow clicked for: ${record.title}`);
  };

  const columns = [
    {
      title: "Image",
      dataIndex: "image",
      key: "image",
      render: (text, record) => (
        <img
          src={record.image ? record.image : "https://via.placeholder.com/60"}
          alt={record.title}
          style={{
            width: "60px",
            height: "80px",
            objectFit: "cover",
            borderRadius: "4px",
          }}
        />
      ),
    },
    { title: "Author Name", dataIndex: "author_name", key: "author_name" },
    { title: "Book Title", dataIndex: "title", key: "title" },
    { title: "Category", dataIndex: "category", key: "category" },
    { title: "Total Copies", dataIndex: "total_copies", key: "total_copies" },
    {
      title: "Available Copies",
      key: "available_copies",
      render: (_, record) => <span>{record.available_copies} copies</span>,
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <>
          <div>
            <a
              onClick={() => handleBorrow(record)}
              style={{ color: "#3a5eff" }}
            >
              Borrow
            </a>
            <a
              onClick={() => deleteBook(record)}
              style={{ color: "#00910cff" }}
            >
              Edit
            </a>
            <a
              onClick={() => deleteBook(record)}
              style={{ color: "#ff3a3aff" }}
            >
              Delete
            </a>
          </div>
        </>
      ),
    },
  ];

  return (
    <>
      <Row
        align="middle"
        justify="space-between"
        style={{
          marginBottom: "15px",
        }}
      >
        <Col xs={24} sm={12} md={10}>
          <Input
            prefix={<SearchOutlined />}
            placeholder="Search book"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            style={{ height: "40px" }}
          />
        </Col>

        <Col>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            style={{
              backgroundColor: "#1600a3",
              border: "none",
              height: "40px",
              fontWeight: 500,
            }}
            onClick={() => setModalOpen(true)}
          >
            Add Book
          </Button>
        </Col>
      </Row>

      <Table
        columns={columns}
        dataSource={filteredBooks}
        rowKey="id"
        loading={loading}
        pagination={false}
        scroll={{
          y: books.length > 10 ? 600 : undefined,
          x: "max-content",
        }}
      />

      <AddBookModal
        modal2Open={modalOpen}
        setModal2Open={setModalOpen}
        onBookCreated={handleBookCreated}
      />
    </>
  );
};

export default DisplayBook;
