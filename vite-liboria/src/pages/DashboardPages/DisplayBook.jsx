import React, { useState, useEffect } from "react";
import axios from "axios";
import { SearchOutlined, PlusOutlined } from "../../components/MuiAntIcons";
import { Input, Row, Col, Button, Table, message, Card } from "../../components/muiAntdCompat";
import AddBookModal from "../../components/Modal/AddBookModal";
import EditBookModal from "../../components/Modal/EditBookModal";
import DeleteBookModal from "../../components/Modal/DeleteBookModal";
import BorrowBookModal from "../../components/Modal/BorrowBookModal";
import "../../App.css";
const topOptions = [
  { label: "topLeft", value: "topLeft" },
  { label: "topCenter", value: "topCenter" },
  { label: "topRight", value: "topRight" },
  { label: "none", value: "none" },
];
const bottomOptions = [
  { label: "bottomLeft", value: "bottomLeft" },
  { label: "bottomCenter", value: "bottomCenter" },
  { label: "bottomRight", value: "bottomRight" },
  { label: "none", value: "none" },
];

const DisplayBook = () => {
  const [top, setTop] = useState("topLeft");
  const [bottom, setBottom] = useState("bottomRight");
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
      const { data } = await axios.get("http://localhost:8000/api/books");
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
      const { data } = await axios.get(
        `http://localhost:8000/api/books/search?q=${encodeURIComponent(query)}`
      );
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
      await axios.delete(`http://localhost:8000/api/books/${book.book_id}`);

      setBooks((prev) => prev.filter((b) => b.book_id !== book.book_id));
      setFilteredBooks((prev) =>
        prev.filter((b) => b.book_id !== book.book_id)
      );
      messageApi.success("Book deleted successfully");
    } catch (err) {
      console.error(err);
      message.error(err.response?.data?.error || err.message);
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
    messageApi.success("Book added successfully");
  };

  const handleBookUpdated = () => {
    fetchBooks();
    setEditModalOpen(false);
    messageApi.success("Book updated successfully");
  };

  const handleBookBorrowed = () => {
    fetchBooks(); // Refresh to update available copies
    setBorrowModalOpen(false);
    messageApi.success("Book borrowed successfully");
  };

  const columns = [
    {
      title: "_",
      dataIndex: "image",
      key: "image",
      width: 150,
      render: (_, record) => (
        <img
          src={record.image || "https://via.placeholder.com/60"}
          alt={record.title}
          style={{
            width: 100,
            height: 140,
            objectFit: "cover",
            borderRadius: 4,
          }}
        />
      ),
    },
    {
      title: "Author Name",
      dataIndex: "author_name",
      key: "author_name",
      width: 200,
    },
    {
      title: "Book Title",
      dataIndex: "title",
      key: "title",
      width: 250,
      render: (_, record) => (
        <span style={{ whiteSpace: "normal", wordBreak: "break-word" }}>
          {record.title}
        </span>
      ),
    },
    { title: "Category", dataIndex: "category", key: "category", width: 150 },
    {
      title: "Total Copies",
      dataIndex: "total_copies",
      key: "total_copies",
      align: "center",
      width: 150,
    },
    {
      title: "Available Copies",
      key: "available_copies",
      align: "center",
      width: 150,
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
      align: "center",
      render: (_, record) => (
        <div>
          <Button
            onClick={() => {
              if (record.available_copies === 0) return;
              handleBorrow(record);
            }}
            style={{
              width: "max-content",
              color: "#fff",
              backgroundColor:
                record.available_copies === 0 ? "#999" : "#009148ff",
              marginRight: 16,
              cursor: record.available_copies === 0 ? "not-allowed" : "pointer",
            }}
          >
            {record.available_copies === 0 ? "Unavailable" : "Borrow"}
          </Button>
          <Button
            onClick={() => handleUpdateBook(record)}
            style={{
              width: "max-content",
              backgroundColor: "#002ae6ff",
              color: "#fff",
              marginRight: 16,
              cursor: "pointer",
            }}
          >
            Edit
          </Button>
          <Button
            onClick={() => handleDeleteBook(record)}
            style={{
              width: "max-content",
              color: "#fff",
              backgroundColor: "#ff4d4f",
              cursor: "pointer",
            }}
          >
            Delete
          </Button>
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
          pagination={{
            position: ["bottomRight"],
            pageSize: 3,
          }}
          scroll={{
            y: 550,
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
