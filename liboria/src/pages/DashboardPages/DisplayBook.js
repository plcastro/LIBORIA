import React, { useState, useEffect } from "react";
import { SearchOutlined, PlusOutlined } from "@ant-design/icons";
import { Input, Row, Col, Button, Table, message, Card } from "antd";
import AddBookModal from "../../components/Modal/AddBookModal";
import EditBookModal from "../../components/Modal/EditBookModal";
import DeleteBookModal from "../../components/Modal/DeleteBookModal";
import BorrowBookModal from "../../components/Modal/BorrowBookModal";

const DisplayBook = () => {
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [borrowModalOpen, setBorrowModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
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
  const handleDeleteBook = (book) => {
    setSelectedBook(book);
    setDeleteModalOpen(true);
  };
  // Update book

  const handleUpdateBook = (book) => {
    setSelectedBook(book);
    setEditModalOpen(true);
  };

  // After adding a book
  const handleBookCreated = () => {
    fetchBooks();
    setAddModalOpen(false);
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleBorrow = (book) => {
    setSelectedBook(book);
    setBorrowModalOpen(true);
  };

  const columns = [
    {
      title: "_",
      dataIndex: "image",
      key: "image",
      width: 70,
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
              style={{ color: "#3a5eff", marginRight: 16 }} // add margin to the right
            >
              Borrow
            </a>
            <a
              onClick={() => handleUpdateBook(record)}
              style={{ color: "#000000ff", marginRight: 16 }}
            >
              Edit
            </a>
            <a
              onClick={() => handleDeleteBook(record)}
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
      <Card>
        <Row align="middle" justify="space-between">
          <Col xs={24} sm={12} md={10} lg={5}>
            <Input
              prefix={<SearchOutlined />}
              placeholder="Search book"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              style={{ height: 40 }}
            />
          </Col>

          <Col>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              style={{
                backgroundColor: "#1600a3",
                border: "none",
                height: 40,
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
            y: books.length > 10 ? 600 : undefined,
            x: "max-content",
          }}
        />

        <AddBookModal
          modal2Open={addModalOpen}
          setModal2Open={setAddModalOpen}
          onBookCreated={handleBookCreated}
        />

        {/* Edit Book */}
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
            onDelete={async (bookId) => {
              const response = await fetch(
                `http://localhost:8000/api/books/${bookId}`,
                {
                  method: "DELETE",
                }
              );
              if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Failed to delete book");
              }
              fetchBooks();
            }}
          />
        )}
      </Card>
    </>
  );
};

export default DisplayBook;
