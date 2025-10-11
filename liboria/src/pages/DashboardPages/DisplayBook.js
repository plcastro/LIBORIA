import React, { useState, useEffect } from "react";
import { SearchOutlined, PlusOutlined } from "@ant-design/icons";
import { Input, Row, Col, Button, Table, message, Card } from "antd";
import AddBookModal from "../../components/Modal/AddBookModal";
import EditBookModal from "../../components/Modal/EditBookModal";
import DeleteBookModal from "../../components/Modal/DeleteBookModal";
import BorrowBookModal from "../../components/Modal/BorrowBookModal";

const DisplayBook = () => {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [loading, setLoading] = useState(false);

  const [selectedBook, setSelectedBook] = useState(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [borrowModalOpen, setBorrowModalOpen] = useState(false);

  // Fetch all books
  const fetchBooks = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/books");
      if (!res.ok) throw new Error("Failed to fetch books");
      const data = await res.json();
      setBooks(data);
    } catch (err) {
      console.error(err);
      message.error("Failed to load books");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  // Filter books on search
  useEffect(() => {
    const filtered = books.filter((book) =>
      Object.values(book).some(
        (value) =>
          typeof value === "string" &&
          value.toLowerCase().includes(searchValue.toLowerCase())
      )
    );
    setFilteredBooks(filtered);
  }, [searchValue, books]);

  // Open delete modal
  const handleDeleteBook = (book) => {
    setSelectedBook(book);
    setDeleteModalOpen(true);
  };

  // Confirm delete
  const handleConfirmDelete = (book) => {
    setBooks((prev) => prev.filter((b) => b.book_id !== book.book_id));
    setFilteredBooks((prev) => prev.filter((b) => b.book_id !== book.book_id));
    setDeleteModalOpen(false);
  };

  const handleUpdateBook = (book) => {
    setSelectedBook(book);
    setEditModalOpen(true);
  };

  const handleBorrow = (book) => {
    setSelectedBook(book);
    setBorrowModalOpen(true);
  };

  const handleBookCreated = () => {
    fetchBooks();
    setAddModalOpen(false);
  };

  const columns = [
    {
      title: "_",
      dataIndex: "image",
      key: "image",
      width: 70,
      render: (_, record) => (
        <img
          src={record.image || "https://via.placeholder.com/60"}
          alt={record.title}
          style={{ width: 60, height: 80, objectFit: "cover", borderRadius: 4 }}
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
        <div>
          <a
            onClick={() => handleBorrow(record)}
            style={{ color: "#3a5eff", marginRight: 16 }}
          >
            Borrow
          </a>
          <a
            onClick={() => handleUpdateBook(record)}
            style={{ color: "#000", marginRight: 16 }}
          >
            Edit
          </a>
          <a
            onClick={() => handleDeleteBook(record)}
            style={{ color: "#ff3a3a" }}
          >
            Delete
          </a>
        </div>
      ),
    },
  ];

  return (
    <Card>
      <Row align="middle" justify="space-between">
        <Col xs={24} sm={12} md={10} lg={5}>
          <Input
            prefix={<SearchOutlined />}
            placeholder="Search book"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            style={{ height: 40, marginBottom: 12 }}
          />
        </Col>

        <Col xs={24} sm={12} md={10} lg={5}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            style={{
              backgroundColor: "#1600a3",
              border: "none",
              height: 40,
              width: "100%",
              marginBottom: 12,
              fontWeight: 500,
            }}
            onClick={() => setAddModalOpen(true)}
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
        scroll={{ y: books.length > 10 ? 600 : undefined, x: "max-content" }}
      />

      <AddBookModal
        modal2Open={addModalOpen}
        setModal2Open={setAddModalOpen}
        onBookCreated={handleBookCreated}
      />

      {selectedBook && (
        <EditBookModal
          modalOpen={editModalOpen}
          setModalOpen={setEditModalOpen}
          book={selectedBook}
          onBookUpdated={handleUpdateBook}
        />
      )}

      {selectedBook && (
        <BorrowBookModal
          open={borrowModalOpen}
          onClose={() => setBorrowModalOpen(false)}
          initialValues={{ ...selectedBook, book_title: selectedBook.title }}
          onSubmit={(data) => {
            message.success(`Borrowed: ${data.book_title}`);
            setBorrowModalOpen(false);
          }}
        />
      )}

      {selectedBook && (
        <DeleteBookModal
          open={deleteModalOpen}
          setOpen={setDeleteModalOpen}
          book={selectedBook}
          onDelete={handleConfirmDelete}
        />
      )}
    </Card>
  );
};

export default DisplayBook;
