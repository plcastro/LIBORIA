import React, { useState, useEffect } from "react";
import { SearchOutlined, PlusOutlined } from "@ant-design/icons";
import { Input, Row, Col, Button, Card, message, Spin } from "antd";
import AddBookModal from "../../components/Modal/AddBookModal";

const { Meta } = Card;

const DisplayBook = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  // Fetch all books on component mount
  const fetchBooks = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:8000/api/books");
      if (!response.ok) {
        throw new Error("Failed to fetch books");
      }
      const data = await response.json();
      setBooks(data);
    } catch (error) {
      console.error("Error fetching books:", error);
      message.error("Failed to load books");
    } finally {
      setLoading(false);
    }
  };

  // Search books
  const onSearch = async () => {
    if (!searchValue.trim()) {
      fetchBooks(); // If search is empty, fetch all books
      return;
    }

    setSearchLoading(true);
    try {
      const response = await fetch(
        `http://localhost:8000/api/books/search?q=${encodeURIComponent(
          searchValue
        )}`
      );
      if (!response.ok) {
        throw new Error("Search failed");
      }
      const data = await response.json();
      setBooks(data);
      message.success(`Found ${data.length} books matching "${searchValue}"`);
    } catch (error) {
      console.error("Error searching books:", error);
      message.error("Search failed");
    } finally {
      setSearchLoading(false);
    }
  };

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
        fetchBooks(); // Refresh the list
      } else {
        const data = await response.json();
        message.error(data.error || "Failed to delete book");
      }
    } catch (error) {
      console.error("Error deleting book:", error);
      message.error("Failed to delete book");
    }
  };

  // Handle book creation from modal
  const handleBookCreated = () => {
    fetchBooks(); // Refresh the list after adding a new book
    setModalOpen(false);
  };

  useEffect(() => {
    fetchBooks();
  }, []);
  return (
    <>
      <Row
        align="top"
        justify="space-between"
        style={{
          display: "flex",
          margin: 0,
          padding: 0,
          height: "fit-content",
          maxHeight: 40,
        }}
      >
        {/* Search Input */}
        <Col xs={24} sm={8} md={8} lg={8} align="top">
          <Input
            type="search"
            placeholder="Search book"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            style={{
              maxWidth: "425px",
              width: "100%",
              height: "40px",
              marginBottom: "10px",
            }}
          />
        </Col>
        <Col
          xs={24}
          sm={6}
          md={8}
          lg={8}
          style={{
            maxWidth: "425px",
            width: "100%",
            height: "40px",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
          }}
        >
          <Button
            type="primary"
            style={{
              backgroundColor: "#1600a3ff",
              color: "#fff",
              margin: 0,
              padding: 0,
              height: "40px",
              fontWeight: 500,
            }}
            icon={<PlusOutlined style={{ fontSize: 16, color: "#fff" }} />}
            onClick={() => setModalOpen(true)}
          >
            Add Book
          </Button>
        </Col>
      </Row>

      <Row>
        <h2 style={{ fontSize: "clamp(24px, 4vw, 40px)" }}>Books</h2>
      </Row>
      <Row>{/* Mapping ng books */}</Row>

      <AddBookModal modal2Open={modalOpen} setModal2Open={setModalOpen} />
    </>
  );
};

export default DisplayBook;
