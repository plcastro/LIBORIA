import Table from "../../components/MuiTable.jsx";
import { useEffect, useMemo, useState } from "react";
import axios from "../../api";
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
  const [requests, setRequests] = useState([]);
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

        const [
          userResult,
          borrowersResult,
          borrowingResult,
          booksResult,
          requestsResult,
        ] = await Promise.allSettled([
          axios.get(`/users/${storedUser._id}`),
          axios.get(`/borrowers`),
          axios.get(`/borrowed-books`),
          axios.get(`/books`),
          axios.get(`/borrow-requests/student/${storedUser._id}`),
        ]);

        if (!active) return;

        const apiUser =
          userResult.status === "fulfilled"
            ? userResult.value.data
            : storedUser;

        const normalizedUser = apiUser?.user || apiUser;

        setUser(normalizedUser);
        for (const [label, result] of [
          ["user", userResult],
          ["borrowers", borrowersResult],
          ["loans", borrowingResult],
          ["books", booksResult],
          ["requests", requestsResult],
        ]) {
          if (result.status === "rejected")
            console.error(
              `Unable to load ${label}:`,
              result.reason.response?.status,
              result.reason.response?.data || result.reason,
            );
        }
        if (requestsResult.status === "fulfilled")
          setRequests(requestsResult.value.data);
        if (borrowingResult.status === "fulfilled") {
          const data = borrowingResult.value.data;
          setBorrowings(
            Array.isArray(data)
              ? data
              : data.borrowings || data.borrowedBooks || [],
          );
        }
        if (booksResult.status === "fulfilled") {
          const data = booksResult.value.data;
          setBooks(Array.isArray(data) ? data : data.books || []);
        }
        if (
          borrowingResult.status !== "fulfilled" &&
          requestsResult.status !== "fulfilled"
        ) {
          setError("Unable to load your loans and borrow requests.");
        } else if (borrowingResult.status !== "fulfilled") {
          setError("Unable to load your borrowing history.");
        } else if (requestsResult.status !== "fulfilled") {
          setError("Unable to load your borrow requests.");
        }
        if (borrowersResult.status === "fulfilled") {
          const data = borrowersResult.value.data;
          const borrowers = Array.isArray(data) ? data : data.borrowers || [];
          const matches = borrowers.filter(
            (borrower) => String(borrower.user_id) === String(storedUser._id),
          );
          if (matches.length !== 1)
            setLinkNotice(
              matches.length > 1
                ? "Multiple borrower records are linked to your account. Please contact the librarian."
                : "Your borrower record could not be linked. Please contact the librarian.",
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

  const bookById = useMemo(() => {
    return new Map(books.map((book) => [String(book.book_id), book]));
  }, [books]);

  const activeBorrowings = useMemo(() => {
    return borrowings.filter((record) =>
      ["borrowed", "overdue"].includes(
        String(record.status || "").toLowerCase(),
      ),
    );
  }, [borrowings]);

  const overdueBorrowings = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return activeBorrowings.filter((record) => {
      if (String(record.status || "").toLowerCase() === "overdue") return true;
      if (!record.due_date) return false;

      const dueDate = new Date(record.due_date);

      return (
        String(record.status || "").toLowerCase() === "overdue" ||
        (!Number.isNaN(dueDate.getTime()) && dueDate < today)
      );
    });
  }, [activeBorrowings]);

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
            Welcome
            {user?.name || user?.username
              ? `, ${user.name || user.username}`
              : ""}
            !
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
        title={`Recent Borrow Requests (${requests.filter((request) => request.status === "Pending").length} pending)`}
      >
        {requests.length === 0 ? (
          <Empty description="No borrow requests to display" />
        ) : (
          <Table
            rowKey="request_id"
            dataSource={requests}
            pagination={{ pageSize: 5 }}
            columns={[
              {
                title: "Book",
                dataIndex: "book_title",
                key: "book_title",
                render: (title, request) => title || `Book #${request.book_id}`,
              },
              {
                title: "Requested",
                dataIndex: "requested_at",
                key: "requested_at",
                render: formatDate,
              },
              {
                title: "Status",
                dataIndex: "status",
                key: "status",
                render: (status) => (
                  <Tag
                    color={
                      status === "Approved"
                        ? "success"
                        : status === "Rejected"
                          ? "error"
                          : "processing"
                    }
                  >
                    {status}
                  </Tag>
                ),
              },
              {
                title: "Reason",
                dataIndex: "rejection_reason",
                key: "rejection_reason",
                render: (reason) => reason || "—",
              },
            ]}
          />
        )}
      </Card>
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
