import Table from "../../components/MuiTable.jsx";
import React, { useEffect, useMemo, useState } from "react";
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

        const [borrowersResult, borrowingsResult, booksResult] =
          await Promise.allSettled([
            axios.get(`/borrowers`),
            axios.get(`/borrowed-books`),
            axios.get(`/books`),
          ]);

        if (!active) return;

        if (
          borrowersResult.status !== "fulfilled" ||
          borrowingsResult.status !== "fulfilled"
        ) {
          setError("Unable to load borrowing records from the server.");
          return;
        }

        const borrowersData = borrowersResult.value.data;
        const borrowingData = borrowingsResult.value.data;
        const booksData =
          booksResult.status === "fulfilled" ? booksResult.value.data : [];

        const borrowers = Array.isArray(borrowersData)
          ? borrowersData
          : borrowersData.borrowers || [];

        const allRecords = Array.isArray(borrowingData)
          ? borrowingData
          : borrowingData.borrowings || borrowingData.borrowedBooks || [];

        const allBooks = Array.isArray(booksData)
          ? booksData
          : booksData.books || [];

        setBooks(allBooks);

        // Match only a unique borrower record.
        // Name matching is temporary; a stable account-to-borrower
        // relationship is safer and should replace this when available.

        const userId = String(storedUser._id);

        const matches = borrowers.filter(
          (borrower) => String(borrower.user_id || "") === userId,
        );

        if (matches.length !== 1) {
          setRecords([]);
          setNotice(
            matches.length > 1
              ? "Multiple borrower records are linked to your account. Please contact the librarian."
              : "Your account is not linked to a borrower record yet. Please contact the librarian.",
          );
          return;
        }

        const borrowerId = matches[0].borrower_id;

        const personalRecords = allRecords.filter(
          (record) => String(record.borrower_id) === String(borrowerId),
        );

        setRecords(personalRecords);
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
