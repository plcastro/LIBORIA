import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../utils/API_BASE";
import {
  Alert,
  Avatar,
  Card,
  Col,
  Empty,
  Row,
  Skeleton,
  Space,
  Statistic,
  Table,
  Tag,
  Typography,
} from "antd";
import {
  BookOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  ReadOutlined,
  UserOutlined,
} from "@ant-design/icons";
import "./StudentDashboard.css";

const API = API_BASE_URL + "/api";

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString();
};

const StudentDashboard = () => {
  const [user, setUser] = useState(null);
  const [borrowings, setBorrowings] = useState([]);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [linkNotice, setLinkNotice] = useState("");

  useEffect(() => {
    let active = true;

    const loadDashboard = async () => {
      setLoading(true);
      setError("");
      setLinkNotice("");

      try {
        const storedUser = JSON.parse(
          sessionStorage.getItem("currentUser") || "null",
        );

        if (!storedUser?._id) {
          if (active) {
            setError("Your login session was not found. Please log in again.");
          }
          return;
        }

        const [userResult, borrowersResult, borrowingResult, booksResult] =
          await Promise.allSettled([
            axios.get(`${API}/users/${storedUser._id}`),
            axios.get(`${API}/borrowers`),
            axios.get(`${API}/borrowed-books`),
            axios.get(`${API}/books`),
          ]);

        if (!active) return;

        // Load the logged-in user's information.
        const apiUser =
          userResult.status === "fulfilled"
            ? userResult.value.data
            : storedUser;

        const normalizedUser = apiUser?.user || apiUser;

        setUser(normalizedUser);

        // Store borrowing records locally before filtering.
        let fetchedBorrowings = [];

        if (borrowingResult.status === "fulfilled") {
          const data = borrowingResult.value.data;

          fetchedBorrowings = Array.isArray(data) ? data : [];
        } else {
          setError(
            "Borrowing records could not be loaded. Check your backend API.",
          );
        }

        // Load the book catalog for displaying book titles.
        if (booksResult.status === "fulfilled") {
          const data = booksResult.value.data;

          setBooks(Array.isArray(data) ? data : []);
        }

        // Match the current user to exactly one borrower record.
        if (borrowersResult.status === "fulfilled") {
          const data = borrowersResult.value.data;
          const borrowers = Array.isArray(data) ? data : [];

          const userName = String(normalizedUser?.name || "")
            .trim()
            .toLowerCase();

          const matchingBorrowers = borrowers.filter(
            (borrower) =>
              String(borrower.name || "")
                .trim()
                .toLowerCase() === userName,
          );

          if (!userName || matchingBorrowers.length !== 1) {
            setBorrowings([]);

            setLinkNotice(
              matchingBorrowers.length > 1
                ? "Several borrower records have your name. Personal borrowing totals are hidden until your account is linked uniquely."
                : "Your account is not uniquely linked to a borrower record yet. Personal borrowing totals are hidden rather than guessed.",
            );
          } else {
            const borrower = matchingBorrowers[0];

            const personalRecords = fetchedBorrowings.filter(
              (record) =>
                String(record.borrower_id) === String(borrower.borrower_id),
            );

            setBorrowings(personalRecords);
            setLinkNotice("");
          }
        } else {
          setBorrowings([]);

          setLinkNotice(
            "Borrower information could not be loaded. Personal borrowing totals are unavailable.",
          );
        }
      } catch (err) {
        console.error("Student dashboard error:", err);

        if (active) {
          setError(
            err.response?.data?.message ||
              "Unable to load your dashboard. Please try again.",
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      active = false;
    };
  }, []);

  // Map book IDs to book information.
  const bookById = useMemo(() => {
    return new Map(books.map((book) => [String(book.book_id), book]));
  }, [books]);

  // Currently borrowed books.
  const activeBorrowings = useMemo(() => {
    return borrowings.filter((record) =>
      ["borrowed", "overdue"].includes(
        String(record.status || "").toLowerCase(),
      ),
    );
  }, [borrowings]);

  // Books whose due date has passed and which are not returned.
  const overdueBorrowings = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return activeBorrowings.filter((record) => {
      if (!record.due_date) return false;

      const dueDate = new Date(record.due_date);

      return !Number.isNaN(dueDate.getTime()) && dueDate < today;
    });
  }, [activeBorrowings]);

  // Completed borrowing records.
  const returnedCount = useMemo(() => {
    return borrowings.filter((record) =>
      ["returned", "lost"].includes(String(record.status || "").toLowerCase()),
    ).length;
  }, [borrowings]);

  const recentColumns = [
    {
      title: "Book",
      key: "book",
      render: (_, record) => {
        const book = bookById.get(String(record.book_id));

        return (
          <Space>
            {book?.image ? (
              <img
                className="student-book-thumb"
                src={book.image}
                alt={book.title || "Book cover"}
              />
            ) : (
              <Avatar shape="square" icon={<BookOutlined />} />
            )}

            <Typography.Text strong>
              {book?.title || `Book #${record.book_id ?? "—"}`}
            </Typography.Text>
          </Space>
        );
      },
    },
    {
      title: "Date Borrowed",
      dataIndex: "date_borrowed",
      key: "date_borrowed",
      render: formatDate,
      responsive: ["sm"],
    },
    {
      title: "Due Date",
      dataIndex: "due_date",
      key: "due_date",
      render: formatDate,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const value = String(status || "Unknown");
        const normalized = value.toLowerCase();

        let color = "default";

        if (normalized === "borrowed") {
          color = "processing";
        } else if (normalized === "returned") {
          color = "success";
        } else if (normalized === "overdue") {
          color = "error";
        } else if (normalized === "lost") {
          color = "warning";
        }

        return <Tag color={color}>{value}</Tag>;
      },
    },
  ];

  if (loading) {
    return (
      <div className="student-dashboard">
        <Skeleton active paragraph={{ rows: 8 }} />
      </div>
    );
  }

  return (
    <div className="student-dashboard">
      {/* Welcome section */}
      <div className="student-welcome">
        <div>
          <Typography.Title level={2}>
            Welcome{user?.name ? `, ${user.name}` : ""}!
          </Typography.Title>

          <Typography.Paragraph>
            Here is an overview of your library activity.
          </Typography.Paragraph>
        </div>

        <Avatar size={56} icon={<UserOutlined />} />
      </div>

      {/* Error message */}
      {error && (
        <Alert
          type="error"
          showIcon
          message="Dashboard data issue"
          description={error}
          style={{ marginBottom: 20 }}
        />
      )}

      {/* Account-to-borrower linking notice */}
      {linkNotice && (
        <Alert
          type="info"
          showIcon
          message="Personal borrowing summary"
          description={linkNotice}
          style={{ marginBottom: 20 }}
        />
      )}

      {/* Statistics */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} xl={6}>
          <Card className="student-stat-card">
            <Statistic
              title="Currently Borrowed"
              value={activeBorrowings.length}
              prefix={<ReadOutlined />}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} xl={6}>
          <Card className="student-stat-card">
            <Statistic
              title="Overdue Books"
              value={overdueBorrowings.length}
              prefix={<ExclamationCircleOutlined />}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} xl={6}>
          <Card className="student-stat-card">
            <Statistic
              title="Returned / Closed"
              value={returnedCount}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} xl={6}>
          <Card className="student-stat-card">
            <Statistic
              title="Total Borrowing Records"
              value={borrowings.length}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Recent borrowing activity */}
      <Card
        className="student-recent-card"
        title="Recent Borrowing Activity"
        extra={<BookOutlined />}
      >
        {borrowings.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="No linked borrowing records to display"
          />
        ) : (
          <Table
            rowKey={(record) =>
              record.borrow_id ??
              record._id ??
              `${record.borrower_id}-${record.book_id}-${record.date_borrowed}`
            }
            columns={recentColumns}
            dataSource={[...borrowings].sort(
              (a, b) =>
                new Date(b.date_borrowed || 0) - new Date(a.date_borrowed || 0),
            )}
            pagination={{
              pageSize: 5,
              responsive: true,
            }}
            scroll={{ x: 600 }}
          />
        )}
      </Card>
    </div>
  );
};

export default StudentDashboard;
