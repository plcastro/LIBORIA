import React, { useState, useEffect } from "react";
import { SearchOutlined, PlusOutlined } from "@ant-design/icons";
import { Input, Row, Col, Button, Table, message, Card } from "antd";
import AddBookModal from "../../components/Modal/AddBookModal";
import EditBookModal from "../../components/Modal/EditBookModal";
import DeleteBookModal from "../../components/Modal/DeleteBookModal";
import BorrowBookModal from "../../components/Modal/BorrowBookModal";

const DisplayBook = () => {
  const [messageApi, contextHolder] = message.useMessage();
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

  // Search books
  const handleSearch = async (query) => {
    if (!query) {
      fetchBooks();
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:8000/api/books/search?q=${encodeURIComponent(query)}`
      );
      if (!res.ok) throw new Error("Failed to search books");
      const data = await res.json();
      setFilteredBooks(data);
    } catch (err) {
      console.error(err);
      message.error("Failed to search books");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  // Filter books on search
  useEffect(() => {
    if (!searchValue) {
      setFilteredBooks(books);
    } else {
      const filtered = books.filter((book) =>
        Object.values(book).some(
          (value) =>
            typeof value === "string" &&
            value.toLowerCase().includes(searchValue.toLowerCase())
        )
      );
      setFilteredBooks(filtered);
    }
  }, [searchValue, books]);

  // Open delete modal
  const handleDeleteBook = (book) => {
    setSelectedBook(book);
    setDeleteModalOpen(true);
  };

  // Confirm delete
  const handleConfirmDelete = async (book) => {
    try {
      const res = await fetch(
        `http://localhost:8000/api/books/${book.book_id}`,
        {
          method: "DELETE",
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to delete book");
      }

      setBooks((prev) => prev.filter((b) => b.book_id !== book.book_id));
      setFilteredBooks((prev) =>
        prev.filter((b) => b.book_id !== book.book_id)
      );
      message.success("Book deleted successfully");
    } catch (err) {
      console.error(err);
      message.error(err.message);
    } finally {
      setDeleteModalOpen(false);
    }
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
    message.success("Book added successfully");
  };

  const handleBookUpdated = () => {
    fetchBooks();
    setEditModalOpen(false);
    message.success("Book updated successfully");
  };

  const handleBookBorrowed = () => {
    fetchBooks(); // Refresh to update available copies
    setBorrowModalOpen(false);
    message.success("Book borrowed successfully");
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
    {
      title: "Book Title",
      dataIndex: "title",
      key: "title",
      width: 200,
      render: (_, record) => (
        <span style={{ whiteSpace: "normal", wordBreak: "break-word" }}>
          {record.title}
        </span>
      ),
    },
    { title: "Category", dataIndex: "category", key: "category" },
    {
      title: "Total Copies",
      dataIndex: "total_copies",
      key: "total_copies",
      align: "center",
    },
    {
      title: "Available Copies",
      key: "available_copies",
      align: "center",
      render: (_, record) => (
        <span
          style={{
            color: record.available_copies === 0 ? "#ff4d4f" : "#52c41a",
            fontWeight: record.available_copies === 0 ? "bold" : "normal",
          }}
        >
          {record.available_copies}
        </span>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <div>
          <a
            onClick={() => {
              if (record.available_copies === 0) return;
              handleBorrow(record);
            }}
            style={{
              color: record.available_copies === 0 ? "#999" : "#0c7236ff",
              marginRight: 16,
              cursor: record.available_copies === 0 ? "not-allowed" : "pointer",
              fontWeight: record.available_copies === 0 ? "normal" : "bold",
            }}
          >
            {record.available_copies === 0 ? "Unavailable" : "Borrow"}
          </a>
          <a
            onClick={() => handleUpdateBook(record)}
            style={{ color: "#1890ff", marginRight: 16, cursor: "pointer" }}
          >
            Edit
          </a>
          <a
            onClick={() => handleDeleteBook(record)}
            style={{ color: "#ff4d4f", cursor: "pointer" }}
          >
            Delete
          </a>
        </div>
      ),
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
              prefix={<SearchOutlined />}
              placeholder="Search book"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              style={{ height: 40, marginBottom: 5 }}
            />
          </Col>

          <Col xs={24} sm={12} md={10} lg={5}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              style={{
                margin: 0,
                backgroundColor: "#1600a3",
                border: "none",
                height: 40,
                width: "100%",
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
          scroll={{
            y: books.length > 10 ? "70vh" : undefined,
            x: "max-content",
          }}
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
    </>
  );
};

export default DisplayBook;
