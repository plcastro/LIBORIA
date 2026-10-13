
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Alert,
  Avatar,
  Card,
  Col,
  Empty,
  Input,
  Row,
  Select,
  Skeleton,
  Tag,
  Typography,
} from "antd";
import {
  BookOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import "./StudentBook.css";

const API = "http://localhost:8000/api";

const StudentBooks = () => {
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const loadBooks = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await axios.get(`${API}/books`);
        const data = response.data;

        const list = Array.isArray(data)
          ? data
          : Array.isArray(data.books)
          ? data.books
          : [];

        if (active) setBooks(list);
      } catch (err) {
        console.error("Unable to load books:", err);

        if (active) {
          setError(
            err.response?.data?.message ||
              "Unable to load books. Please try again."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadBooks();

    return () => {
      active = false;
    };
  }, []);

  const categories = useMemo(
    () =>
      [...new Set(books.map((book) => book.category).filter(Boolean))].sort(),
    [books]
  );

  const filteredBooks = useMemo(() => {
    const query = search.trim().toLowerCase();

    return books.filter((book) => {
      const matchesSearch = [
        book.title,
        book.author,
        book.category,
        book.isbn,
      ].some((value) =>
        String(value || "").toLowerCase().includes(query)
      );

      const matchesCategory =
        category === "all" || book.category === category;

      return matchesSearch && matchesCategory;
    });
  }, [books, search, category]);

  return (
    <div className="student-books">
      <div className="student-books-heading">
        <Typography.Title level={2}>Browse Books</Typography.Title>
        <Typography.Paragraph>
          Explore the library catalog and find your next read.
        </Typography.Paragraph>
      </div>

      {error && (
        <Alert
          className="student-books-error"
          type="error"
          showIcon
          message={error}
        />
      )}

      <Row gutter={[12, 12]} className="student-books-filters">
        <Col xs={24} md={16}>
          <Input
            size="large"
            allowClear
            prefix={<SearchOutlined />}
            placeholder="Search title, author, category, or ISBN"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </Col>

        <Col xs={24} md={8}>
          <Select
            size="large"
            className="student-books-category"
            value={category}
            onChange={setCategory}
            options={[
              { label: "All Categories", value: "all" },
              ...categories.map((item) => ({
                label: item,
                value: item,
              })),
            ]}
          />
        </Col>
      </Row>

      {loading ? (
        <Skeleton active paragraph={{ rows: 8 }} />
      ) : filteredBooks.length === 0 ? (
        <Empty
          className="student-books-empty"
          description="No books found"
        />
      ) : (
        <>
          <Typography.Text type="secondary">
            {filteredBooks.length} book(s) found
          </Typography.Text>

          <Row gutter={[16, 16]} className="student-books-grid">
            {filteredBooks.map((book, index) => {
              const id = book.book_id ?? book._id ?? index;
              const available = Number(book.available_copies);
              const hasAvailability =
                book.available_copies !== undefined &&
                book.available_copies !== null &&
                Number.isFinite(available);

              return (
                <Col xs={24} sm={12} lg={8} xl={6} key={id}>
                  <Card
                    hoverable
                    className="student-book-card"
                    cover={
                      book.image ? (
                        <img
                          className="student-book-cover"
                          src={book.image}
                          alt={book.title || "Book cover"}
                        />
                      ) : (
                        <div className="student-book-cover-placeholder">
                          <Avatar
                            size={88}
                            shape="square"
                            icon={<BookOutlined />}
                          />
                        </div>
                      )
                    }
                  >
                    <Card.Meta
                      title={book.title || "Untitled"}
                      description={
                        <div>
                          <Typography.Paragraph
                            ellipsis={{ rows: 2 }}
                            className="student-book-author"
                          >
                            {book.author || "Author unavailable"}
                          </Typography.Paragraph>

                          {book.category && (
                            <Tag color="blue">{book.category}</Tag>
                          )}

                          <div className="student-book-availability">
                            {hasAvailability ? (
                              <Tag color={available > 0 ? "success" : "error"}>
                                {available > 0
                                  ? `${available} available`
                                  : "Unavailable"}
                              </Tag>
                            ) : (
                              <Tag>Availability not listed</Tag>
                            )}
                          </div>
                        </div>
                      }
                    />
                  </Card>
                </Col>
              );
            })}
          </Row>
        </>
      )}
    </div>
  );
};

export default StudentBooks;
