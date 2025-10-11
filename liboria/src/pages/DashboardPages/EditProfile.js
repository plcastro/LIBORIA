import React, { useState, useEffect } from "react";
import { SearchOutlined, PlusOutlined } from "@ant-design/icons";
import { Input, Row, Col, Button, Table, message } from "antd";
import AddBookModal from "../../components/Modal/AddBookModal";
import EditBookModal from "../../components/Modal/EditBookModal";

const DisplayBook = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);

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
  const onSearch = async () => {
    if (!searchValue.trim()) return fetchBooks();

    try {
      const response = await fetch(
        `http://localhost:8000/api/books/search?q=${encodeURIComponent(
          searchValue
        )}`
      );
      if (!response.ok) throw new Error("Search failed");
      const data = await response.json();
      setBooks(data);
      message.success(`Found ${data.length} books matching "${searchValue}"`);
    } catch (error) {
      console.error(error);
      message.error("Search failed");
    }
  };

  // Delete a book
  const deleteBook = async (bookId) => {
    try {
      const response = await fetch(
        `http://localhost:8000/api/books/${bookId}`,
        { method: "DELETE" }
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

  // Handle add and edit success
  const handleBookUpdated = () => {
    fetchBooks();
    setEditModalOpen(false);
  };
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

  const handleEdit = (record) => {
    setSelectedBook(record);
    setEditModalOpen(true);
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
        <div style={{ display: "flex", gap: "12px" }}>
          <a onClick={() => handleBorrow(record)} style={{ color: "#3a5eff" }}>
            Borrow
          </a>
          <a onClick={() => handleEdit(record)} style={{ color: "#3aff4a" }}>
            Edit
          </a>
          <a onClick={() => deleteBook(record.id)} style={{ color: "#ff3a3a" }}>
            Delete
          </a>
        </div>
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
            onPressEnter={onSearch}
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

      <h2 style={{ fontSize: "clamp(24px, 4vw, 40px)" }}>Books</h2>

      <Table
        columns={columns}
        dataSource={books}
        rowKey="id"
        loading={loading}
        pagination={false}
        scroll={{
          y: books.length > 10 ? 650 : undefined,
          x: "max-content",
        }}
      />

      <AddBookModal
        modal2Open={modalOpen}
        setModal2Open={setModalOpen}
        onBookCreated={handleBookCreated}
      />

      {selectedBook && (
        <EditBookModal
          modalOpen={editModalOpen}
          setModalOpen={setEditModalOpen}
          book={selectedBook}
          onBookUpdated={handleBookUpdated}
        />
      )}
    </>
  );
};

export default DisplayBook;
