import Table from "../../components/MuiTable.jsx";
import { useEffect, useMemo, useState } from "react";
import axios from "../../api";
import { Alert, Card, Empty, Skeleton, Tag, Typography } from "antd";
import "./StudentBorrowings.css";


const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString();
};

const StudentBorrowings = () => {
  const [records, setRecords] = useState([]);
  const [requests, setRequests] = useState([]);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let active = true;

    const loadData = async () => {
      try {
        setLoading(true);
        setError("");
        setNotice("");

        const storedUser = JSON.parse(
          sessionStorage.getItem("currentUser") || "null",
        );

        if (!storedUser?._id) {
          setError("Your session was not found. Please log in again.");
          return;
        }

        const [borrowersResult, borrowingsResult, booksResult, requestsResult] =
          await Promise.allSettled([
            axios.get(`/borrowers`),
            axios.get(`/borrowed-books`),
            axios.get(`/books`),
            axios.get(`/borrow-requests/student/${storedUser._id}`),
          ]);

        if (!active) return;

        for (const [label, result] of [["borrowers", borrowersResult], ["loans", borrowingsResult], ["books", booksResult], ["requests", requestsResult]]) {
          if (result.status === "rejected") console.error(`Unable to load ${label}:`, result.reason.response?.status, result.reason.response?.data || result.reason);
        }
        if (borrowingsResult.status === "fulfilled") {
          const data = borrowingsResult.value.data;
          setRecords(Array.isArray(data) ? data : data.borrowings || data.borrowedBooks || []);
        }
        if (requestsResult.status === "fulfilled") setRequests(requestsResult.value.data);
        if (booksResult.status === "fulfilled") {
          const data = booksResult.value.data;
          setBooks(Array.isArray(data) ? data : data.books || []);
        }
        if (borrowingsResult.status !== "fulfilled" && requestsResult.status !== "fulfilled") {
          setError("Unable to load your loans and borrow requests from the server.");
        } else if (borrowingsResult.status !== "fulfilled") {
          setError("Unable to load your borrowing history.");
        } else if (requestsResult.status !== "fulfilled") {
          setError("Unable to load your borrow requests.");
        }
        if (borrowersResult.status === "fulfilled") {
          const data = borrowersResult.value.data;
          const borrowers = Array.isArray(data) ? data : data.borrowers || [];
          const matches = borrowers.filter((borrower) => String(borrower.user_id) === String(storedUser._id));
          if (matches.length !== 1) setNotice(matches.length > 1
            ? "Multiple borrower records are linked to your account. Please contact the librarian."
            : "Your borrower record could not be linked. Please contact the librarian.");
        }
      } catch (err) {
        console.error("Student borrowing history error:", err);

        if (active) {
          setError(
            err.response?.data?.message ||
              "Something went wrong loading your borrowing history.",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadData();

    return () => {
      active = false;
    };
  }, []);

  const bookById = useMemo(
    () => new Map(books.map((book) => [String(book.book_id), book])),
    [books],
  );

  const columns = [
    {
      title: "Book",
      key: "book",
      render: (_, record) => {
        const book = bookById.get(String(record.book_id));

        return book?.title || `Book #${record.book_id ?? "—"}`;
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
      render: (status, record) => {
        const normalized = String(status || "").toLowerCase();

        const overdueByDate =
          record.due_date &&
          !Number.isNaN(new Date(record.due_date).getTime()) &&
          new Date(record.due_date).setHours(0, 0, 0, 0) <
            new Date().setHours(0, 0, 0, 0) &&
          ["borrowed", "overdue"].includes(normalized);

        if (overdueByDate || normalized === "overdue") {
          return <Tag color="error">Overdue</Tag>;
        }

        if (normalized === "borrowed") {
          return <Tag color="processing">Borrowed</Tag>;
        }

        if (normalized === "returned") {
          return <Tag color="success">Returned</Tag>;
        }

        if (normalized === "lost") {
          return <Tag color="warning">Lost</Tag>;
        }

        return <Tag>{status || "Unknown"}</Tag>;
      },
    },
  ];

  if (loading) {
    return (
      <div className="student-borrowings">
        <Skeleton active paragraph={{ rows: 8 }} />
      </div>
    );
  }

  return (
    <div className="student-borrowings">
      <div className="student-borrowings-heading">
        <Typography.Title level={2}>My Borrowings</Typography.Title>
        <Typography.Paragraph>
          View your current loans and borrowing history.
        </Typography.Paragraph>
      </div>

      {error && (
        <Alert
          type="error"
          showIcon
          message={error}
          className="student-borrowings-alert"
        />
      )}

      {notice && (
        <Alert
          type="info"
          showIcon
          message="Borrowing records unavailable"
          description={notice}
          className="student-borrowings-alert"
        />
      )}

      <Card className="student-borrowings-card" title="Borrow Requests">
        {requests.length === 0 ? <Empty description="No borrow requests to display" /> : (
          <Table
            rowKey="request_id"
            dataSource={requests}
            pagination={{ pageSize: 8 }}
            columns={[
              { title: "Book", dataIndex: "book_title", key: "book_title", render: (title, request) => title || `Book #${request.book_id}` },
              { title: "Requested", dataIndex: "requested_at", key: "requested_at", render: formatDate },
              { title: "Status", dataIndex: "status", key: "status", render: (status) => <Tag color={status === "Approved" ? "success" : status === "Rejected" ? "error" : "processing"}>{status}</Tag> },
              { title: "Reason", dataIndex: "rejection_reason", key: "rejection_reason", render: (reason) => reason || "—" },
            ]}
          />
        )}
      </Card>

      <Card className="student-borrowings-card" title="Borrowing History">
        {records.length === 0 ? (
          <Empty description="No borrowing records to display" />
        ) : (
          <Table
            rowKey={(record) =>
              record.borrow_id ??
              record._id ??
              `${record.borrower_id}-${record.book_id}-${record.date_borrowed}`
            }
            columns={columns}
            dataSource={[...records].sort(
              (a, b) =>
                new Date(b.date_borrowed || 0) - new Date(a.date_borrowed || 0),
            )}
            pagination={{ pageSize: 8, responsive: true }}
            scroll={{ x: 550 }}
          />
        )}
      </Card>
    </div>
  );
};

export default StudentBorrowings;
